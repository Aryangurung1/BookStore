using BookHeaven.Data;
using BookHeaven.DTOs.Order;
using BookHeaven.Models;
using BookHeaven.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using BookHeaven.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace BookHeaven.Services
{
    public class OrderService : IOrderService
    {
        private readonly AppDbContext _context;
        private readonly IBroadcastService _broadcastService;
        private readonly IEmailService _emailService;
        private readonly IHubContext<OrderHub> _orderHubContext;

        public OrderService(AppDbContext context, IBroadcastService broadcastService, IEmailService emailService, IHubContext<OrderHub> orderHubContext)
        {
            _context = context;
            _broadcastService = broadcastService;
            _emailService = emailService;
            _orderHubContext = orderHubContext;
        }

          public async Task<Order> PlaceOrderAsync(int memberId, CreateOrderDto dto)
        {
            try
            {
                var member = await _context.Members.Include(m => m.Orders).FirstOrDefaultAsync(m => m.MemberId == memberId);
                if (member == null) throw new Exception("Member not found");

                var order = new Order
                {
                    MemberId = memberId,
                    OrderDate = DateTime.UtcNow,
                    IsCancelled = false,
                    ClaimCode = Guid.NewGuid().ToString(),
                    OrderItems = new List<OrderItem>()
                };

                decimal total = 0m;

                foreach (var item in dto.Items)
                {
                    var book = await _context.Books.FindAsync(item.BookId);
                    if (book == null)
                        throw new Exception($"Book not available: {item.BookId}");

                    var unitPrice = book.IsOnSale && book.DiscountPercent.HasValue
                        ? book.Price * (1 - book.DiscountPercent.Value / 100)
                        : book.Price;

                    order.OrderItems.Add(new OrderItem
                    {
                        BookId = book.BookId,
                        Quantity = item.Quantity,
                        UnitPrice = unitPrice
                    });

                    total += unitPrice * item.Quantity;
                }

                if (dto.Items.Count >= 5)
                {
                    total *= 0.95m;
                    order.AppliedFivePercentDiscount = true;
                }

                // Only count fulfilled orders for the 10% discount
                if (member.Orders.Count(o => o.Status == "Fulfilled" && !o.IsCancelled) >= 10)
                {
                    total *= 0.90m;
                    order.AppliedTenPercentDiscount = true;
                }

                order.TotalPrice = total;
                _context.Orders.Add(order);
                await _context.SaveChangesAsync();

                // Send email with claim code and bill
                await _emailService.SendClaimCodeEmailAsync(
                    member.Email,
                    member.FullName,
                    order.ClaimCode,
                    order.TotalPrice
                );

                // Broadcast the order success
                var bookTitles = order.OrderItems.Select(i => _context.Books.FirstOrDefault(b => b.BookId == i.BookId)?.Title).ToList();
                var message = $"New Order Placed! {bookTitles.Count} books ordered: {string.Join(", ", bookTitles)}";
                await _broadcastService.CreateMessageAsync(message);

                // Broadcast to all clients
                var orderTitles = string.Join(", ", order.OrderItems.Select(oi => oi.Book.Title));
                await _orderHubContext.Clients.All.SendAsync("OrderPlaced", $"Someone just ordered: {orderTitles}");

                return order;
            }
            catch (Exception ex)
            {
                throw new ApplicationException("Failed to place order", ex);
            }
        }

        public async Task<bool> CancelOrderAsync(int orderId, int memberId)
        {
            try
            {
                var order = await _context.Orders.FirstOrDefaultAsync(o => o.OrderId == orderId && o.MemberId == memberId);
                if (order == null || order.IsCancelled) return false;
                order.IsCancelled = true;
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                throw new ApplicationException("Failed to cancel order", ex);
            }
        }

        public async Task<List<Order>> GetOrdersByMemberAsync(int memberId)
        {
            try
            {
                return await _context.Orders.Include(o => o.OrderItems).ThenInclude(i => i.Book)
                                            .Where(o => o.MemberId == memberId)
                                            .ToListAsync();
            }
            catch (Exception ex)
            {
                throw new ApplicationException("Failed to retrieve orders", ex);
            }
        }
    }
}