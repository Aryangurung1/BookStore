using BookHeaven.Data;
using BookHeaven.DTOs.Staff;
using BookHeaven.Models;
using BookHeaven.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BookHeaven.Services
{
    public class StaffService : IStaffService
    {
        private readonly AppDbContext _context;

        public StaffService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<string> FulfillOrderAsync(ClaimCodeDto dto, int staffId)
        {
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Book)
                .FirstOrDefaultAsync(o => o.ClaimCode == dto.ClaimCode);

            if (order == null || order.IsCancelled)
                return "Order not found or has been cancelled.";

            var alreadyProcessed = await _context.ProcessedOrders.AnyAsync(p => p.OrderId == order.OrderId);
            if (alreadyProcessed)
                return "Order has already been fulfilled.";

            // Deduct stock for each book in the order
            foreach (var item in order.OrderItems)
            {
                if (item.Book.StockQuantity < item.Quantity)
                    return $"Not enough stock for {item.Book.Title}.";
                item.Book.StockQuantity -= item.Quantity;
            }

            // Set order status to 'Fulfilled'
            order.Status = "Fulfilled";

            var processed = new ProcessedOrder
            {
                OrderId = order.OrderId,
                StaffId = staffId,
                ProcessedAt = DateTime.UtcNow
            };

            _context.ProcessedOrders.Add(processed);
            await _context.SaveChangesAsync();

            return $"Order #{order.OrderId} fulfilled successfully.";
        }

        public async Task<List<object>> GetFulfilledOrdersAsync()
        {
            var orders = await _context.Orders
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Book)
                .Include(o => o.Member)
                .Where(o => o.Status == "Fulfilled")
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();

            return orders.Select(o => new
            {
                o.OrderId,
                o.OrderDate,
                o.TotalPrice,
                o.Status,
                Member = new {
                    o.Member.MemberId,
                    o.Member.FullName,
                    o.Member.Email
                },
                Items = o.OrderItems.Select(i => new {
                    i.BookId,
                    i.Quantity,
                    i.UnitPrice,
                    Book = new {
                        i.Book.Title,
                        i.Book.Author,
                        i.Book.ISBN,
                        i.Book.Description,
                        i.Book.Genre,
                        i.Book.Language,
                        i.Book.Format,
                        i.Book.Publisher,
                        i.Book.PublicationDate,
                        i.Book.PageCount,
                        i.Book.StockQuantity,
                        i.Book.ImageUrl,
                        i.Book.IsAvailableInLibrary,
                        i.Book.DiscountPercent
                    }
                })
            }).ToList<object>();
        }
    }
}
