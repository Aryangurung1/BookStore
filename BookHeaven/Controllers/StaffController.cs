using BookHeaven.DTOs.Staff;
using BookHeaven.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BookHeaven.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Staff")]
    public class StaffController : ControllerBase
    {
        private readonly IStaffService _staffService;

        public StaffController(IStaffService staffService)
        {
            _staffService = staffService;
        }

        [HttpPost("fulfill-order")]
        public async Task<IActionResult> FulfillOrder([FromBody] ClaimCodeDto dto)
        {
            var result = await _staffService.FulfillOrderAsync(dto);
            return Ok(new { message = result });
        }
    }
}
