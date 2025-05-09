using BookHeaven.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace BookHeaven.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BroadcastController : ControllerBase
    {
        private readonly IBroadcastService _broadcastService;

        public BroadcastController(IBroadcastService broadcastService)
        {
            _broadcastService = broadcastService;
        }

        [HttpGet("recent")]
        public async Task<IActionResult> GetRecentMessages()
        {
            var messages = await _broadcastService.GetRecentMessagesAsync();
            return Ok(messages);
        }
    }
}