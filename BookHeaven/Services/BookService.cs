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
using Microsoft.Extensions.Logging;

namespace BookHeaven.Services
{
    public class BookService : IBookService
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _env;
        private readonly ILogger<BookService> _logger;

        public BookService(AppDbContext context, IWebHostEnvironment env, ILogger<BookService> logger)
        {
            _context = context;
            _env = env;
            _logger = logger;
        }

        public async Task<Book?> CreateBookAsync(CreateBookDto dto)
        {
            _logger.LogInformation("Creating book with ISBN: {ISBN}", dto.ISBN);

            if (dto.Image == null || dto.Image.Length == 0)
            {
                throw new ArgumentException("Image file is required");
            }

            // Handle image upload first
            var uploadsFolder = Path.Combine(_env.WebRootPath, "uploads");
            Directory.CreateDirectory(uploadsFolder);

            var uniqueFileName = Guid.NewGuid().ToString() + "_" + dto.Image.FileName;
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                await dto.Image.CopyToAsync(fileStream);
            }

            var imageUrl = "/uploads/" + uniqueFileName;

            var book = new Book
            {
                Title = dto.Title,
                ISBN = dto.ISBN,
                Description = dto.Description,
                Author = dto.Author,
                Genre = dto.Genre,
                Language = dto.Language,
                Format = dto.Format,
                Publisher = dto.Publisher,
                Price = dto.Price,
                PublicationDate = DateTime.SpecifyKind(dto.PublicationDate, DateTimeKind.Utc),
                StockQuantity = dto.StockQuantity,
                IsAvailableInLibrary = dto.IsAvailableInLibrary,
                ImageUrl = imageUrl,
                DiscountPercent = dto.DiscountPercent ?? 0,
                IsAwardWinner = dto.IsAwardWinner,
                IsBestseller = dto.IsBestseller,
                CreatedAt = dto.CreatedAt
            };

            _logger.LogInformation("Created book object with ISBN: {ISBN}", book.ISBN);

            try
            {
                _context.Books.Add(book);
                await _context.SaveChangesAsync();
                _logger.LogInformation("Successfully saved book with ISBN: {ISBN}", book.ISBN);
                return book;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving book with ISBN: {ISBN}", book.ISBN);
                // Clean up the uploaded file if save fails
                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath);
                }
                throw;
            }
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
                AverageRating = book.Reviews.Any() ? book.Reviews.Average(r => r.Rating) : 0,
                IsAvailableInLibrary = book.IsAvailableInLibrary,
                IsOnSale = book.IsOnSale,
                DiscountPercent = (int)(book.DiscountPercent ?? 0),
                DiscountStart = book.DiscountStart,
                DiscountEnd = book.DiscountEnd,
                IsAwardWinner = book.IsAwardWinner,
                IsBestseller = book.IsBestseller,
                CreatedAt = book.CreatedAt
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
                AverageRating = b.Reviews.Any() ? b.Reviews.Average(r => r.Rating) : 0,
                IsAvailableInLibrary = b.IsAvailableInLibrary,
                IsOnSale = b.IsOnSale,
                DiscountPercent = (int)(b.DiscountPercent ?? 0),
                DiscountStart = b.DiscountStart,
                DiscountEnd = b.DiscountEnd,
                IsAwardWinner = b.IsAwardWinner,
                IsBestseller = b.IsBestseller,
                CreatedAt = b.CreatedAt
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
            book.DiscountPercent = dto.DiscountPercent ?? 0;
            book.PublicationDate = dto.PublicationDate;
            book.IsOnSale = dto.IsOnSale;
            book.DiscountStart = dto.DiscountStart;
            book.DiscountEnd = dto.DiscountEnd;
            book.IsAwardWinner = dto.IsAwardWinner;
            book.IsBestseller = dto.IsBestseller;
            book.CreatedAt = dto.CreatedAt;

            // Handle image update if provided
            if (dto.Image != null && dto.Image.Length > 0)
            {
                var uploadsFolder = Path.Combine(_env.WebRootPath, "uploads");
                Directory.CreateDirectory(uploadsFolder);

                // Delete old image if exists
                if (!string.IsNullOrEmpty(book.ImageUrl))
                {
                    var oldImagePath = Path.Combine(_env.WebRootPath, book.ImageUrl.TrimStart('/'));
                    if (System.IO.File.Exists(oldImagePath))
                    {
                        System.IO.File.Delete(oldImagePath);
                    }
                }

                // Save new image
                var uniqueFileName = Guid.NewGuid().ToString() + "_" + dto.Image.FileName;
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await dto.Image.CopyToAsync(fileStream);
                }

                book.ImageUrl = "/uploads/" + uniqueFileName;
            }

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
            var books = _context.Books.Include(b => b.Reviews).AsQueryable();

            if (!string.IsNullOrEmpty(query.Search))
            {
                var searchLower = query.Search.ToLower();
                books = books.Where(b => b.Title.ToLower().Contains(searchLower) ||
                                         b.ISBN.ToLower().Contains(searchLower) ||
                                         b.Description.ToLower().Contains(searchLower));
            }

            if (query.Genres != null && query.Genres.Any())
                books = books.Where(b => query.Genres.Select(g => g.ToLower()).Contains(b.Genre.ToLower()));

            if (query.Authors != null && query.Authors.Any())
                books = books.Where(b => query.Authors.Select(a => a.ToLower()).Contains(b.Author.ToLower()));

            if (query.Languages != null && query.Languages.Any())
                books = books.Where(b => query.Languages.Select(l => l.ToLower()).Contains(b.Language.ToLower()));

            if (query.Formats != null && query.Formats.Any())
                books = books.Where(b => query.Formats.Select(f => f.ToLower()).Contains(b.Format.ToLower()));

            if (query.Publishers != null && query.Publishers.Any())
                books = books.Where(b => query.Publishers.Select(p => p.ToLower()).Contains(b.Publisher.ToLower()));

            if (query.IsOnSale.HasValue)
                books = books.Where(b => b.IsOnSale == query.IsOnSale);

            if (query.MinPrice.HasValue)
                books = books.Where(b => b.Price >= query.MinPrice);

            if (query.MaxPrice.HasValue)
                books = books.Where(b => b.Price <= query.MaxPrice);

            if (query.MinRating.HasValue)
                books = books.Where(b => b.Reviews.Any() ? b.Reviews.Average(r => r.Rating) >= query.MinRating : query.MinRating == 0);

            if (query.IsAvailableInLibrary.HasValue)
                books = books.Where(b => b.IsAvailableInLibrary == query.IsAvailableInLibrary);

            if (query.InStock.HasValue)
                books = books.Where(b => query.InStock.Value ? b.StockQuantity > 0 : b.StockQuantity == 0);

            if (query.IsAwardWinner.HasValue && query.IsAwardWinner.Value)
                books = books.Where(b => b.IsAwardWinner);

            if (query.IsBestseller.HasValue && query.IsBestseller.Value)
                books = books.Where(b => b.IsBestseller);

            if (query.NewReleases.HasValue && query.NewReleases.Value)
            {
                var threeMonthsAgo = DateTime.UtcNow.AddMonths(-3);
                books = books.Where(b => b.PublicationDate >= threeMonthsAgo && b.PublicationDate <= DateTime.UtcNow);
            }

            if (query.NewArrivals.HasValue && query.NewArrivals.Value)
            {
                var now = DateTime.UtcNow;
                var firstOfMonth = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
                books = books.Where(b => b.PublicationDate >= firstOfMonth && b.PublicationDate <= now);
            }

            if (query.ComingSoon.HasValue && query.ComingSoon.Value)
            {
                books = books.Where(b => b.PublicationDate > DateTime.UtcNow);
            }

            if (query.Deals.HasValue && query.Deals.Value)
            {
                books = books.Where(b => b.IsOnSale || (b.DiscountPercent ?? 0) > 0);
            }

            // Sorting
            books = query.SortBy switch
            {
                "price" => query.SortDescending ? books.OrderByDescending(b => b.Price) : books.OrderBy(b => b.Price),
                "date" => query.SortDescending ? books.OrderByDescending(b => b.PublicationDate) : books.OrderBy(b => b.PublicationDate),
                "title" => query.SortDescending ? books.OrderByDescending(b => b.Title) : books.OrderBy(b => b.Title),
                "popularity" => query.SortDescending
                    ? books.OrderByDescending(b => b.OrderItems.Sum(oi => oi.Quantity))
                    : books.OrderBy(b => b.OrderItems.Sum(oi => oi.Quantity)),
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
                ImageUrl = b.ImageUrl,
                IsAvailableInLibrary = b.IsAvailableInLibrary,
                DiscountPercent = (int)(b.DiscountPercent ?? 0),
                ISBN = b.ISBN,
                Description = b.Description,
                Publisher = b.Publisher,
                PublicationDate = b.PublicationDate,
                PageCount = b.PageCount,
                StockQuantity = b.StockQuantity,
                AverageRating = b.Reviews.Any() ? b.Reviews.Average(r => r.Rating) : 0,
                DiscountStart = b.DiscountStart,
                DiscountEnd = b.DiscountEnd,
                IsAwardWinner = b.IsAwardWinner,
                IsBestseller = b.IsBestseller,
                CreatedAt = b.CreatedAt
            }).ToListAsync();
        }
    }
}