using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BookHeaven.Data;
using BookHeaven.Models;
using BookHeaven.DTOs.Order;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using BookHeaven.Services.Interfaces;

namespace BookHeaven.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IOrderService _orderService;

        public OrdersController(AppDbContext context, IOrderService orderService)
        {
            _context = context;
            _orderService = orderService;
        }

        private int GetMemberId() 
        {
            var memberId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(memberId))
            {
                throw new UnauthorizedAccessException("Member ID not found");
            }
            return int.Parse(memberId);
        }

        [HttpPost]
        [Authorize(Roles = "Member")]
        public async Task<IActionResult> PlaceOrder([FromBody] CreateOrderDto dto)
        {
            try
            {
                var memberId = GetMemberId();
                var order = await _orderService.PlaceOrderAsync(memberId, dto);
                // Clear the cart after successful order
                var cartItems = await _context.CartItems.Where(c => c.MemberId == memberId).ToListAsync();
                _context.CartItems.RemoveRange(cartItems);
                await _context.SaveChangesAsync();
                return Ok(new {
                    message = "Order created successfully",
                    orderId = order.OrderId,
                    totalAmount = order.TotalPrice,
                    claimCode = order.ClaimCode,
                    appliedFivePercentDiscount = order.AppliedFivePercentDiscount,
                    appliedTenPercentDiscount = order.AppliedTenPercentDiscount
                });
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPost("cancel/{orderId}")]
        [Authorize(Roles = "Member")]
        public async Task<IActionResult> CancelOrder(int orderId)
        {
            try
            {
                var memberId = GetMemberId();
                var order = await _context.Orders
                    .FirstOrDefaultAsync(o => o.OrderId == orderId && o.MemberId == memberId);

                if (order == null)
                {
                    return NotFound(new { message = "Order not found" });
                }

                if (order.Status != "Pending")
                {
                    return BadRequest(new { message = "Only pending orders can be cancelled" });
                }

                order.Status = "Cancelled";
                order.IsCancelled = true;
                await _context.SaveChangesAsync();

                return Ok(new { message = "Order cancelled successfully" });
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("my-orders")]
        [Authorize(Roles = "Member")]
        public async Task<IActionResult> MyOrders()
        {
            try
            {
                var memberId = GetMemberId();
                var orders = await _context.Orders
                    .Include(o => o.OrderItems)
                    .ThenInclude(i => i.Book)
                    .Where(o => o.MemberId == memberId)
                    .Select(o => new
                    {
                        o.OrderId,
                        o.OrderDate,
                        totalAmount = o.TotalPrice,
                        o.Status,
                        Items = o.OrderItems.Select(i => new
                        {
                            i.Book.Title,
                            i.Book.Author,
                            i.Book.Price,
                            unitPrice = i.UnitPrice,
                            i.Quantity
                        })
                    })
                    .ToListAsync();

                return Ok(orders);
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("fulfilled-count")]
        [Authorize(Roles = "Member")]
        public async Task<IActionResult> GetFulfilledOrderCount()
        {
            var memberId = GetMemberId();
            var count = await _context.Orders.CountAsync(o => o.MemberId == memberId && o.Status == "Fulfilled" && !o.IsCancelled);
            return Ok(new { fulfilledCount = count });
        }

        [HttpGet("all")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllOrders()
        {
            try
            {
                var orders = await _context.Orders
                    .Include(o => o.OrderItems)
                    .ThenInclude(i => i.Book)
                    .Include(o => o.Member)
                    .Select(o => new
                    {
                        o.OrderId,
                        o.OrderDate,
                        o.TotalPrice,
                        o.Status,
                        o.IsCancelled,
                        o.ClaimCode,
                        o.AppliedFivePercentDiscount,
                        o.AppliedTenPercentDiscount,
                        Member = new
                        {
                            o.Member.MemberId,
                            o.Member.FullName,
                            o.Member.Email
                        },
                        Items = o.OrderItems.Select(i => new
                        {
                            i.Book.Title,
                            i.Book.Author,
                            i.Book.Price,
                            unitPrice = i.UnitPrice,
                            i.Quantity
                        })
                    })
                    .ToListAsync();

                return Ok(orders);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }
}