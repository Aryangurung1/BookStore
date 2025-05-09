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

        private int GetStaffId()
        {
            var staffId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(staffId))
                throw new UnauthorizedAccessException("Staff ID not found");
            return int.Parse(staffId);
        }

        [HttpPost("fulfill-order")]
        public async Task<IActionResult> FulfillOrder([FromBody] ClaimCodeDto dto)
        {
            var staffId = GetStaffId();
            var result = await _staffService.FulfillOrderAsync(dto, staffId);
            return Ok(new { message = result });
        }

        [HttpGet("fulfilled-orders")]
        public async Task<IActionResult> GetFulfilledOrders()
        {
            var orders = await _staffService.GetFulfilledOrdersAsync();
            return Ok(orders);
        }
    }
}
