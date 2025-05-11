using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using BookHeaven.DTOs.Book;
using BookHeaven.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using BookHeaven.Data;
using System.Collections.Generic;
using System.Linq;

namespace BookHeaven.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BooksController : ControllerBase
    {
        private readonly IBookService _bookService;
        private readonly ILogger<BooksController> _logger;
        private readonly AppDbContext _context;

        public BooksController(IBookService bookService, ILogger<BooksController> logger, AppDbContext context)
        {
            _bookService = bookService;
            _logger = logger;
            _context = context;
        }

        // Public (fetch all books — optional use)
        [HttpGet]
        public async Task<IActionResult> GetAllBooks([FromQuery] BookQueryParameters query)
        {
            // Merge alternate and main lists for all multi-value filters
            query.Languages = (query.Languages ?? new List<string>()).Concat(query.LanguagesAlt ?? new List<string>()).ToList();
            query.Authors = (query.Authors ?? new List<string>()).Concat(query.AuthorsAlt ?? new List<string>()).ToList();
            query.Genres = (query.Genres ?? new List<string>()).Concat(query.GenresAlt ?? new List<string>()).ToList();
            query.Formats = (query.Formats ?? new List<string>()).Concat(query.FormatsAlt ?? new List<string>()).ToList();
            query.Publishers = (query.Publishers ?? new List<string>()).Concat(query.PublishersAlt ?? new List<string>()).ToList();
            _logger.LogInformation("Languages: {Languages}", string.Join(",", query.Languages ?? new List<string>()));
            _logger.LogInformation("Authors: {Authors}", string.Join(",", query.Authors ?? new List<string>()));
            _logger.LogInformation("Genres: {Genres}", string.Join(",", query.Genres ?? new List<string>()));
            _logger.LogInformation("Formats: {Formats}", string.Join(",", query.Formats ?? new List<string>()));
            _logger.LogInformation("Publishers: {Publishers}", string.Join(",", query.Publishers ?? new List<string>()));
            var books = await _bookService.GetBooksAsync(query);
            var totalCount = await _context.Books.CountAsync();
            
            Response.Headers.Add("X-Total-Count", totalCount.ToString());
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

        // Filter dropdown endpoints
        [HttpGet("authors")]
        public async Task<IActionResult> GetAuthors()
        {
            var authors = await _context.Books.Select(b => b.Author).Distinct().OrderBy(a => a).ToListAsync();
            return Ok(authors);
        }

        [HttpGet("genres")]
        public async Task<IActionResult> GetGenres()
        {
            var genres = await _context.Books.Select(b => b.Genre).Distinct().OrderBy(g => g).ToListAsync();
            return Ok(genres);
        }

        [HttpGet("languages")]
        public async Task<IActionResult> GetLanguages()
        {
            var languages = await _context.Books.Select(b => b.Language).Distinct().OrderBy(l => l).ToListAsync();
            return Ok(languages);
        }

        [HttpGet("formats")]
        public async Task<IActionResult> GetFormats()
        {
            var formats = await _context.Books.Select(b => b.Format).Distinct().OrderBy(f => f).ToListAsync();
            return Ok(formats);
        }

        [HttpGet("publishers")]
        public async Task<IActionResult> GetPublishers()
        {
            var publishers = await _context.Books.Select(b => b.Publisher).Distinct().OrderBy(p => p).ToListAsync();
            return Ok(publishers);
        }
    }
}
