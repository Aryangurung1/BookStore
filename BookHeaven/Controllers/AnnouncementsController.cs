using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BookHeaven.Data;
using BookHeaven.Models;
using BookHeaven.DTOs.Announcement;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace BookHeaven.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AnnouncementsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AnnouncementsController(AppDbContext context)
        {
            _context = context;
        }

        // Admin: Create announcement
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromBody] CreateAnnouncementDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (dto.EndTime <= dto.StartTime)
            {
                return BadRequest(new { message = "End time must be after start time" });
            }

            var announcement = new Announcement
            {
                Title = dto.Title,
                Message = dto.Message,
                StartTime = dto.StartTime,
                EndTime = dto.EndTime,
                Type = dto.Type,
                CreatedAt = DateTime.UtcNow
            };

            _context.Announcements.Add(announcement);
            await _context.SaveChangesAsync();

            return Ok(new AnnouncementDto
            {
                AnnouncementId = announcement.AnnouncementId,
                Title = announcement.Title,
                Message = announcement.Message,
                StartTime = announcement.StartTime,
                EndTime = announcement.EndTime,
                Type = announcement.Type,
                CreatedAt = announcement.CreatedAt
            });
        }

        // Admin: Edit announcement
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Edit(int id, [FromBody] UpdateAnnouncementDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (dto.EndTime <= dto.StartTime)
            {
                return BadRequest(new { message = "End time must be after start time" });
            }

            var announcement = await _context.Announcements.FindAsync(id);
            if (announcement == null)
                return NotFound(new { message = "Announcement not found" });

            announcement.Title = dto.Title;
            announcement.Message = dto.Message;
            announcement.StartTime = dto.StartTime;
            announcement.EndTime = dto.EndTime;
            announcement.Type = dto.Type;
            announcement.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new AnnouncementDto
            {
                AnnouncementId = announcement.AnnouncementId,
                Title = announcement.Title,
                Message = announcement.Message,
                StartTime = announcement.StartTime,
                EndTime = announcement.EndTime,
                Type = announcement.Type,
                CreatedAt = announcement.CreatedAt,
                UpdatedAt = announcement.UpdatedAt
            });
        }

        // Admin: Delete announcement
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var announcement = await _context.Announcements.FindAsync(id);
            if (announcement == null)
                return NotFound(new { message = "Announcement not found" });

            _context.Announcements.Remove(announcement);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Announcement deleted successfully" });
        }

        // Admin: List all announcements
        [HttpGet("all")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAll()
        {
            var announcements = await _context.Announcements
                .OrderByDescending(a => a.CreatedAt)
                .Select(a => new AnnouncementDto
                {
                    AnnouncementId = a.AnnouncementId,
                    Title = a.Title,
                    Message = a.Message,
                    StartTime = a.StartTime,
                    EndTime = a.EndTime,
                    Type = a.Type,
                    CreatedAt = a.CreatedAt,
                    UpdatedAt = a.UpdatedAt
                })
                .ToListAsync();

            return Ok(announcements);
        }

        // Member: Get current announcements
        [HttpGet("active")]
        [AllowAnonymous]
        public async Task<IActionResult> GetActive()
        {
            var now = DateTime.UtcNow;
            var announcements = await _context.Announcements
                .Where(a => a.StartTime <= now && a.EndTime >= now)
                .OrderByDescending(a => a.CreatedAt)
                .Select(a => new AnnouncementDto
                {
                    AnnouncementId = a.AnnouncementId,
                    Title = a.Title,
                    Message = a.Message,
                    StartTime = a.StartTime,
                    EndTime = a.EndTime,
                    Type = a.Type,
                    CreatedAt = a.CreatedAt,
                    UpdatedAt = a.UpdatedAt
                })
                .ToListAsync();

            return Ok(announcements);
        }
    }
} 