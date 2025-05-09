using BookHeaven.Data;
using BookHeaven.DTOs.Announcement;
using BookHeaven.Models;
using BookHeaven.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BookHeaven.Services
{
    public class AnnouncementService : IAnnouncementService
    {
        private readonly AppDbContext _context;

        public AnnouncementService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<AnnouncementDto>> GetActiveAnnouncementsAsync()
        {
            var now = DateTime.UtcNow;
            return await _context.Announcements
                .Where(a => a.StartDate <= now && a.EndDate >= now)
                .Select(a => new AnnouncementDto
                {
                    Id = a.AnnouncementId,
                    Message = a.Message,
                    StartDate = a.StartDate,
                    EndDate = a.EndDate
                })
                .ToListAsync();
        }

        public async Task<AnnouncementDto> CreateAnnouncementAsync(CreateAnnouncementDto dto)
        {
            var entity = new Announcement
            {
                Message = dto.Message,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate
            };
            _context.Announcements.Add(entity);
            await _context.SaveChangesAsync();

            return new AnnouncementDto
            {
                Id = entity.AnnouncementId,
                Message = entity.Message,
                StartDate = entity.StartDate,
                EndDate = entity.EndDate
            };
        }

        public async Task<bool> DeleteAnnouncementAsync(int id)
        {
            var entity = await _context.Announcements.FindAsync(id);
            if (entity == null) return false;
            _context.Announcements.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
