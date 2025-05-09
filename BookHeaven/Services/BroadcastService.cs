using BookHeaven.Data;
using BookHeaven.DTOs.Broadcast;
using BookHeaven.Models;
using BookHeaven.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BookHeaven.Services
{
    public class BroadcastService : IBroadcastService
    {
        private readonly AppDbContext _context;

        public BroadcastService(AppDbContext context)
        {
            _context = context;
        }

        public async Task CreateMessageAsync(string message)
        {
            try
            {
                var broadcast = new BroadcastMessage
                {
                    Message = message,
                    SentAt = DateTime.UtcNow
                };

                _context.BroadcastMessages.Add(broadcast);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                throw new ApplicationException("Failed to create broadcast message.", ex);
            }
        }

        public async Task<List<BroadcastMessageDto>> GetRecentMessagesAsync()
        {
            try
            {
                return await _context.BroadcastMessages
                    .OrderByDescending(m => m.SentAt)
                    .Take(10)
                    .Select(m => new BroadcastMessageDto
                    {
                        Message = m.Message,
                        SentAt = m.SentAt
                    })
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                throw new ApplicationException("Failed to retrieve broadcast messages.", ex);
            }
        }
    }
}