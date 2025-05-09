using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BookHeaven.DTOs.Review;
using BookHeaven.Services.Interfaces;
using System.Security.Claims;

namespace BookHeaven.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReviewController : ControllerBase
    {
        private readonly IReviewService _reviewService;

        public ReviewController(IReviewService reviewService)
        {
            _reviewService = reviewService;
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

        [HttpPost]
        [Authorize(Roles = "Member")]
        public async Task<IActionResult> AddReview(CreateReviewDto dto)
        {
            try
            {
                var review = await _reviewService.AddReviewAsync(GetMemberId(), dto);
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

        [AllowAnonymous]
        [HttpGet("book/{bookId}")]
        public async Task<IActionResult> GetReviewsForBook(int bookId)
        {
            try
            {
                var reviews = await _reviewService.GetReviewsForBookAsync(bookId);
                return Ok(reviews);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }
}