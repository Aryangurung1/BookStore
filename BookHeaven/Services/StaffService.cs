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

        public async Task<string> FulfillOrderAsync(ClaimCodeDto dto)
        {
            var order = await _context.Orders.FirstOrDefaultAsync(o => o.ClaimCode == dto.ClaimCode);

            if (order == null || order.IsCancelled)
                return "Order not found or has been cancelled.";

            var alreadyProcessed = await _context.ProcessedOrders.AnyAsync(p => p.OrderId == order.OrderId);
            if (alreadyProcessed)
                return "Order has already been fulfilled.";

            var processed = new ProcessedOrder
            {
                OrderId = order.OrderId,
                ProcessedAt = DateTime.UtcNow
            };

            _context.ProcessedOrders.Add(processed);
            await _context.SaveChangesAsync();

            return $"Order #{order.OrderId} fulfilled successfully.";
        }
    }
}
