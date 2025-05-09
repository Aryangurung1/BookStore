using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using BookHeaven.DTOs.Book;
using BookHeaven.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;

namespace BookHeaven.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BooksController : ControllerBase
    {
        private readonly IBookService _bookService;

        public BooksController(IBookService bookService)
        {
            _bookService = bookService;
        }

        // Public (fetch all books — optional use)
        [HttpGet]
        public async Task<IActionResult> GetAllBooks()
        {
            var books = await _bookService.GetAllBooksAsync();
            return Ok(books);
        }

        // Public (get book by id)
        [HttpGet("{id}")]
        public async Task<IActionResult> GetBook(int id)
        {
            var book = await _bookService.GetBookByIdAsync(id);
            if (book == null)
            {
                return NotFound();
            }
            return Ok(book);
        }

        // Admin Only
        [HttpPost]
        [Authorize(Roles = "Admin")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> CreateBook([FromForm] CreateBookDto dto)
        {
            if (dto.Image == null || dto.Image.Length == 0)
            {
                return BadRequest(new { message = "Image file is required" });
            }

            var book = await _bookService.CreateBookAsync(dto);
            if (book == null)
            {
                return BadRequest(new { message = "Failed to create book" });
            }
            return CreatedAtAction(nameof(GetBook), new { id = book.BookId }, book);
        }
    }
}
