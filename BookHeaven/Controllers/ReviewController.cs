using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BookHeaven.DTOs.Review;
using BookHeaven.Services.Interfaces;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using BookHeaven.Data;
using BookHeaven.Models;

namespace BookHeaven.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReviewController : ControllerBase
    {
        private readonly IReviewService _reviewService;
        private readonly AppDbContext _context;

        public ReviewController(IReviewService reviewService, AppDbContext context)
        {
            _reviewService = reviewService;
            _context = context;
        }

        private int GetMemberId()
        {
            var memberId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(memberId))
            {
                throw new UnauthorizedAccessException("Member ID not found");
            }
            return int.Parse(memberId);
        }

        [HttpGet("can-review/{bookId}")]
        [Authorize(Roles = "Member")]
        public async Task<IActionResult> CanReview(int bookId)
        {
            var memberId = GetMemberId();
            var hasPurchased = await _context.Orders
                .Include(o => o.OrderItems)
                .AnyAsync(o => o.MemberId == memberId
                    && o.Status == "Fulfilled"
                    && !o.IsCancelled
                    && o.OrderItems.Any(i => i.BookId == bookId));
            return Ok(new { canReview = hasPurchased });
        }

        [HttpPost]
        [Authorize(Roles = "Member")]
        public async Task<IActionResult> AddReview([FromBody] CreateReviewDto dto)
        {
            var memberId = GetMemberId();
            // Check for fulfilled order containing the book
            var hasPurchased = await _context.Orders
                .Include(o => o.OrderItems)
                .AnyAsync(o => o.MemberId == memberId
                    && o.Status == "Fulfilled"
                    && !o.IsCancelled
                    && o.OrderItems.Any(i => i.BookId == dto.BookId));
            if (!hasPurchased)
            {
                return BadRequest(new { message = "You can only review books you have purchased and received." });
            }
            // Prevent duplicate review
            var alreadyReviewed = await _context.Reviews.AnyAsync(r => r.MemberId == memberId && r.BookId == dto.BookId);
            if (alreadyReviewed)
            {
                return BadRequest(new { message = "You have already reviewed this book." });
            }
            try
            {
                var review = await _reviewService.AddReviewAsync(memberId, dto);
                return Ok(review);
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPut("{reviewId}")]
        [Authorize(Roles = "Admin,Member")]
        public async Task<IActionResult> EditReview(int reviewId, [FromBody] EditReviewDto dto)
        {
            var memberId = GetMemberId();
            var review = await _context.Reviews.FirstOrDefaultAsync(r => r.ReviewId == reviewId);
            if (review == null)
                return NotFound(new { message = "Review not found." });
            // If member, only allow editing own review
            if (User.IsInRole("Member") && review.MemberId != memberId)
                return Forbid();
            review.Rating = dto.Rating;
            review.Comment = dto.Comment;
            await _context.SaveChangesAsync();
            return Ok(new { message = "Review updated successfully." });
        }

        [AllowAnonymous]
        [HttpGet("book/{bookId}")]
        public async Task<IActionResult> GetReviewsForBook(int bookId)
        {
            try
            {
                var reviews = await _context.Reviews
                    .Include(r => r.Member)
                    .Where(r => r.BookId == bookId)
                    .Select(r => new BookHeaven.DTOs.Review.ReviewDto {
                        ReviewId = r.ReviewId,
                        BookId = r.BookId,
                        BookTitle = r.Book.Title,
                        Rating = r.Rating,
                        Comment = r.Comment,
                        CreatedAt = r.CreatedAt,
                        MemberName = r.Member.FullName,
                        MemberId = r.MemberId
                    })
                    .ToListAsync();
                return Ok(reviews);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }
}