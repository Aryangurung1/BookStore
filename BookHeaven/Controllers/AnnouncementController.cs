using BookHeaven.DTOs.Announcement;
using BookHeaven.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BookHeaven.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AnnouncementController : ControllerBase
    {
        private readonly IAnnouncementService _announcementService;

        public AnnouncementController(IAnnouncementService announcementService)
        {
            _announcementService = announcementService;
        }

        [HttpGet("active")]
        [AllowAnonymous]
        public async Task<IActionResult> GetActiveAnnouncements()
        {
            var list = await _announcementService.GetActiveAnnouncementsAsync();
            return Ok(list);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateAnnouncement([FromBody] CreateAnnouncementDto dto)
        {
            var created = await _announcementService.CreateAnnouncementAsync(dto);
            return Ok(created);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteAnnouncement(int id)
        {
            var result = await _announcementService.DeleteAnnouncementAsync(id);
            return result ? Ok(new { message = "Deleted" }) : NotFound();
        }
    }
}