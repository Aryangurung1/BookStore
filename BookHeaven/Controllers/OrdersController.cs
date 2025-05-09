using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BookHeaven.Data;
using BookHeaven.Models;
using BookHeaven.DTOs.Order;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace BookHeaven.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public OrdersController(AppDbContext context)
        {
            _context = context;
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

                // Validate items exist and are available
                var bookIds = dto.Items.Select(i => i.BookId).ToList();
                var books = await _context.Books
                    .Where(b => bookIds.Contains(b.BookId))
                    .ToDictionaryAsync(b => b.BookId, b => b);

                if (books.Count != bookIds.Count)
                {
                    return BadRequest(new { message = "One or more books not found" });
                }

                // Calculate total amount
                decimal totalAmount = 0;
                var orderItems = new List<OrderItem>();
                foreach (var item in dto.Items)
                {
                    var book = books[item.BookId];
                    totalAmount += book.Price * item.Quantity;
                    orderItems.Add(new OrderItem
                    {
                        BookId = item.BookId,
                        Quantity = item.Quantity,
                        Price = book.Price
                    });
                }

                var order = new Order
                {
                    MemberId = memberId,
                    OrderDate = DateTime.UtcNow,
                    Status = "Pending",
                    TotalAmount = totalAmount,
                    OrderItems = orderItems
                };

                _context.Orders.Add(order);
                await _context.SaveChangesAsync();

                // Clear cart after successful order
                var cartItems = await _context.CartItems
                    .Where(c => c.MemberId == memberId && bookIds.Contains(c.BookId))
                    .ToListAsync();
                _context.CartItems.RemoveRange(cartItems);
                await _context.SaveChangesAsync();

                return Ok(new { 
                    message = "Order created successfully",
                    orderId = order.OrderId,
                    totalAmount = order.TotalAmount
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
                        o.TotalAmount,
                        o.Status,
                        Items = o.OrderItems.Select(i => new
                        {
                            i.Book.Title,
                            i.Book.Author,
                            i.Book.Price,
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
    }
}