using BookHeaven.Data;
using BookHeaven.Models;
using BookHeaven.DTOs.Staff;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;

namespace BookHeaven.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("staffs")]
        public async Task<IActionResult> GetAllStaffs()
        {
            var staffs = await _context.Staffs
                .Select(s => new
                {
                    s.StaffId,
                    s.FullName,
                    s.Email,
                    s.Position
                })
                .ToListAsync();
            return Ok(staffs);
        }

        [HttpPost("staffs")]
        public async Task<IActionResult> AddStaff([FromBody] CreateStaffDto dto)
        {
            if (string.IsNullOrEmpty(dto.Name) || string.IsNullOrEmpty(dto.Email) || 
                string.IsNullOrEmpty(dto.Password) || string.IsNullOrEmpty(dto.Position))
            {
                return BadRequest(new { message = "All fields are required" });
            }

            if (await _context.Staffs.AnyAsync(s => s.Email == dto.Email))
            {
                return BadRequest(new { message = "Email already exists" });
            }

            var staff = new Staff
            {
                FullName = dto.Name,
                Email = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Position = dto.Position,
                ProcessedOrders = new List<ProcessedOrder>()
            };

            _context.Staffs.Add(staff);
            await _context.SaveChangesAsync();
            
            return Ok(new { 
                message = "Staff added successfully",
                staff = new { 
                    staffId = staff.StaffId,
                    fullName = staff.FullName,
                    email = staff.Email,
                    position = staff.Position
                }
            });
        }

        [HttpDelete("staffs/{staffId}")]
        public async Task<IActionResult> DeleteStaff(int staffId)
        {
            var staff = await _context.Staffs.FirstOrDefaultAsync(s => s.StaffId == staffId);
            if (staff == null) return NotFound(new { message = "Staff not found" });
            
            _context.Staffs.Remove(staff);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Staff removed successfully" });
        }

        [HttpGet("members")]
        public async Task<IActionResult> GetAllMembers()
        {
            var members = await _context.Members
                .Select(m => new
                {
                    m.MemberId,
                    m.FullName,
                    m.Email,
                    m.JoinDate
                })
                .ToListAsync();
            return Ok(members);
        }

        [HttpDelete("members/{memberId}")]
        public async Task<IActionResult> DeleteMember(int memberId)
        {
            var member = await _context.Members
                .Include(m => m.Orders)
                .Include(m => m.CartItems)
                .Include(m => m.Reviews)
                .Include(m => m.Bookmarks)
                .FirstOrDefaultAsync(m => m.MemberId == memberId);

            if (member == null) 
                return NotFound(new { message = "Member not found" });
            
            // Delete all associated data
            _context.CartItems.RemoveRange(member.CartItems);
            _context.Reviews.RemoveRange(member.Reviews);
            _context.Bookmarks.RemoveRange(member.Bookmarks);
            
            // For orders, we need to handle the cascade deletion of order items
            foreach (var order in member.Orders)
            {
                var orderItems = await _context.OrderItems
                    .Where(oi => oi.OrderId == order.OrderId)
                    .ToListAsync();
                _context.OrderItems.RemoveRange(orderItems);
            }
            _context.Orders.RemoveRange(member.Orders);
            
            // Finally remove the member
            _context.Members.Remove(member);
            await _context.SaveChangesAsync();
            
            return Ok(new { message = "Member and all associated data removed successfully" });
        }

        [HttpGet("orders")]
        public async Task<IActionResult> GetAllOrders()
        {
            var orders = await _context.Orders
                .Include(o => o.OrderItems)
                .ThenInclude(i => i.Book)
                .ToListAsync();
            return Ok(orders.Select(o => new
            {
                o.OrderId,
                o.MemberId,
                o.OrderDate,
                o.TotalAmount,
                o.Status,
                Items = o.OrderItems.Select(i => new
                {
                    i.BookId,
                    i.Quantity,
                    i.Price,
                    BookTitle = i.Book?.Title
                })
            }));
        }

        [HttpDelete("reviews/{id}")]
        public async Task<IActionResult> DeleteReview(int id)
        {
            var review = await _context.Reviews.FindAsync(id);
            if (review == null) return NotFound(new { message = "Review not found" });
            
            _context.Reviews.Remove(review);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Review deleted successfully" });
        }
    }
}