using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Hosting;
using System.IO;
using BookHeaven.Data;
using BookHeaven.DTOs.Book;
using BookHeaven.Models;
using BookHeaven.Services.Interfaces;

namespace BookHeaven.Services
{
    public class BookService : IBookService
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _env;

        public BookService(AppDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        public async Task<Book?> CreateBookAsync(CreateBookDto dto)
        {
            var book = new Book
            {
                Title = dto.Title,
                Description = dto.Description,
                Author = dto.Author,
                Genre = dto.Genre,
                Language = dto.Language,
                Format = dto.Format,
                Publisher = dto.Publisher,
                Price = dto.Price,
                StockQuantity = dto.StockQuantity,
                IsAvailableInLibrary = dto.IsAvailableInLibrary
            };

            if (dto.Image != null && dto.Image.Length > 0)
            {
                var uploadsFolder = Path.Combine(_env.WebRootPath, "uploads");
                Directory.CreateDirectory(uploadsFolder);

                var uniqueFileName = Guid.NewGuid().ToString() + "_" + dto.Image.FileName;
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await dto.Image.CopyToAsync(fileStream);
                }

                book.ImageUrl = "/uploads/" + uniqueFileName;
            }

            _context.Books.Add(book);
            await _context.SaveChangesAsync();

            return book;
        }

        public async Task<BookDto?> GetBookByIdAsync(int bookId)
        {
            var book = await _context.Books
                .Include(b => b.Reviews)
                .FirstOrDefaultAsync(b => b.BookId == bookId);

            if (book == null)
                return null;

            return new BookDto
            {
                BookId = book.BookId,
                Title = book.Title,
                Author = book.Author,
                ISBN = book.ISBN,
                Description = book.Description,
                Price = book.Price,
                Genre = book.Genre,
                Language = book.Language,
                Format = book.Format,
                Publisher = book.Publisher,
                PublicationDate = book.PublicationDate,
                PageCount = book.PageCount,
                StockQuantity = book.StockQuantity,
                ImageUrl = book.ImageUrl,
                AverageRating = book.Reviews.Any() ? book.Reviews.Average(r => r.Rating) : 0
            };
        }

        public async Task<List<BookDto>> GetAllBooksAsync()
        {
            var books = await _context.Books
                .Include(b => b.Reviews)
                .ToListAsync();

            return books.Select(b => new BookDto
            {
                BookId = b.BookId,
                Title = b.Title,
                Author = b.Author,
                ISBN = b.ISBN,
                Description = b.Description,
                Price = b.Price,
                Genre = b.Genre,
                Language = b.Language,
                Format = b.Format,
                Publisher = b.Publisher,
                PublicationDate = b.PublicationDate,
                PageCount = b.PageCount,
                StockQuantity = b.StockQuantity,
                ImageUrl = b.ImageUrl,
                AverageRating = b.Reviews.Any() ? b.Reviews.Average(r => r.Rating) : 0
            }).ToList();
        }

        public async Task<Book?> UpdateBookAsync(int bookId, UpdateBookDto dto)
        {
            var book = await _context.Books.FindAsync(bookId);
            if (book == null)
            {
                return null;
            }

            // Update book properties
            book.Title = dto.Title ?? book.Title;
            book.Description = dto.Description ?? book.Description;
            book.Author = dto.Author ?? book.Author;
            book.Genre = dto.Genre ?? book.Genre;
            book.Language = dto.Language ?? book.Language;
            book.Format = dto.Format ?? book.Format;
            book.Publisher = dto.Publisher ?? book.Publisher;
            book.Price = dto.Price;
            book.StockQuantity = dto.StockQuantity;
            book.IsAvailableInLibrary = dto.IsAvailableInLibrary;

            await _context.SaveChangesAsync();
            return book;
        }

        public async Task<bool> DeleteBookAsync(int bookId)
        {
            var book = await _context.Books.FindAsync(bookId);
            if (book == null)
            {
                return false;
            }

            _context.Books.Remove(book);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<BookDto>> GetBooksAsync(BookQueryParameters query)
        {
            var books = _context.Books.AsQueryable();

            if (!string.IsNullOrEmpty(query.Search))
                books = books.Where(b => b.Title.Contains(query.Search) ||
                                         b.ISBN.Contains(query.Search) ||
                                         b.Description.Contains(query.Search));

            if (!string.IsNullOrEmpty(query.Genre))
                books = books.Where(b => b.Genre == query.Genre);

            if (!string.IsNullOrEmpty(query.Author))
                books = books.Where(b => b.Author == query.Author);

            if (!string.IsNullOrEmpty(query.Language))
                books = books.Where(b => b.Language == query.Language);

            if (!string.IsNullOrEmpty(query.Format))
                books = books.Where(b => b.Format == query.Format);

            if (query.IsOnSale.HasValue)
                books = books.Where(b => b.IsOnSale == query.IsOnSale);

            if (query.MinPrice.HasValue)
                books = books.Where(b => b.Price >= query.MinPrice);

            if (query.MaxPrice.HasValue)
                books = books.Where(b => b.Price <= query.MaxPrice);

            books = query.SortBy switch
            {
                "price" => query.SortDescending ? books.OrderByDescending(b => b.Price) : books.OrderBy(b => b.Price),
                "date" => query.SortDescending ? books.OrderByDescending(b => b.PublicationDate) : books.OrderBy(b => b.PublicationDate),
                "title" => query.SortDescending ? books.OrderByDescending(b => b.Title) : books.OrderBy(b => b.Title),
                _ => books.OrderBy(b => b.Title)
            };

            books = books.Skip((query.Page - 1) * query.PageSize).Take(query.PageSize);

            return await books.Select(b => new BookDto
            {
                BookId = b.BookId,
                Title = b.Title,
                Author = b.Author,
                Genre = b.Genre,
                Price = b.Price,
                Language = b.Language,
                Format = b.Format,
                IsOnSale = b.IsOnSale,
                ImageUrl = b.ImageUrl
            }).ToListAsync();
        }
    }
}