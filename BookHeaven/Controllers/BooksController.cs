using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using BookHeaven.DTOs.Book;
using BookHeaven.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Logging;

namespace BookHeaven.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BooksController : ControllerBase
    {
        private readonly IBookService _bookService;
        private readonly ILogger<BooksController> _logger;

        public BooksController(IBookService bookService, ILogger<BooksController> logger)
        {
            _bookService = bookService;
            _logger = logger;
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
            _logger.LogInformation("Received book creation request with ISBN: {ISBN}", dto.ISBN);
            _logger.LogInformation("Book details: Title={Title}, Author={Author}, Publisher={Publisher}", 
                dto.Title, dto.Author, dto.Publisher);

            if (dto.Image == null || dto.Image.Length == 0)
            {
                return BadRequest(new { message = "Image file is required" });
            }

            if (string.IsNullOrEmpty(dto.ISBN))
            {
                return BadRequest(new { message = "ISBN is required" });
            }

            var book = await _bookService.CreateBookAsync(dto);
            if (book == null)
            {
                return BadRequest(new { message = "Failed to create book" });
            }
            return CreatedAtAction(nameof(GetBook), new { id = book.BookId }, book);
        }

        // Admin Only
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UpdateBook(int id, [FromForm] UpdateBookDto dto)
        {
            _logger.LogInformation("Received book update request for ID: {Id}", id);

            var book = await _bookService.UpdateBookAsync(id, dto);
            if (book == null)
            {
                return NotFound(new { message = "Book not found" });
            }

            return Ok(book);
        }

        // Admin Only
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteBook(int id)
        {
            _logger.LogInformation("Received book deletion request for ID: {Id}", id);

            var result = await _bookService.DeleteBookAsync(id);
            if (!result)
            {
                return NotFound(new { message = "Book not found" });
            }

            return Ok(new { message = "Book deleted successfully" });
        }
    }
}
