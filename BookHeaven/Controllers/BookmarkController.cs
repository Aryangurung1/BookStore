using BookHeaven.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BookHeaven.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Member")]
    public class BookmarkController : ControllerBase
    {
        private readonly IBookmarkService _bookmarkService;

        public BookmarkController(IBookmarkService bookmarkService)
        {
            _bookmarkService = bookmarkService;
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

        [HttpPost("{bookId}")]
        public async Task<IActionResult> AddBookmark(int bookId)
        {
            try
            {
                await _bookmarkService.AddBookmarkAsync(GetMemberId(), bookId);
                return Ok(new { message = "Book bookmarked." });
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

        [HttpDelete("{bookId}")]
        public async Task<IActionResult> RemoveBookmark(int bookId)
        {
            try
            {
                await _bookmarkService.RemoveBookmarkAsync(GetMemberId(), bookId);
                return Ok(new { message = "Bookmark removed." });
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

        [HttpGet]
        public async Task<IActionResult> GetBookmarks()
        {
            try
            {
                var bookmarks = await _bookmarkService.GetBookmarksAsync(GetMemberId());
                return Ok(bookmarks);
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
    }
}