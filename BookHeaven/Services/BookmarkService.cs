using BookHeaven.Data;
using BookHeaven.DTOs.Bookmark;
using BookHeaven.Models;
using BookHeaven.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BookHeaven.Services
{
    public class BookmarkService : IBookmarkService
    {
        private readonly AppDbContext _context;

        public BookmarkService(AppDbContext context)
        {
            _context = context;
        }

        public async Task AddBookmarkAsync(int memberId, int bookId)
        {
            try
            {
                var exists = await _context.Bookmarks
                    .AnyAsync(b => b.MemberId == memberId && b.BookId == bookId);

                if (exists)
                    throw new InvalidOperationException("Book is already bookmarked.");

                var bookmark = new Bookmark
                {
                    MemberId = memberId,
                    BookId = bookId
                };

                _context.Bookmarks.Add(bookmark);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                throw new ApplicationException("Failed to bookmark book.", ex);
            }
        }

        public async Task RemoveBookmarkAsync(int memberId, int bookId)
        {
            try
            {
                var bookmark = await _context.Bookmarks
                    .FirstOrDefaultAsync(b => b.MemberId == memberId && b.BookId == bookId);

                if (bookmark == null)
                    throw new Exception("Bookmark not found.");

                _context.Bookmarks.Remove(bookmark);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                throw new ApplicationException("Failed to remove bookmark.", ex);
            }
        }

        public async Task<List<BookmarkDto>> GetBookmarksAsync(int memberId)
        {
            return await _context.Bookmarks
                .Where(b => b.MemberId == memberId)
                .Include(b => b.Book)
                    .ThenInclude(book => book.Reviews)
                .Select(b => new BookmarkDto
                {
                    BookId = b.BookId,
                    BookTitle = b.Book.Title,
                    Author = b.Book.Author,
                    ISBN = b.Book.ISBN,
                    Description = b.Book.Description,
                    Price = b.Book.Price,
                    Genre = b.Book.Genre,
                    Language = b.Book.Language,
                    Format = b.Book.Format,
                    Publisher = b.Book.Publisher,
                    PublicationDate = b.Book.PublicationDate,
                    PageCount = b.Book.PageCount,
                    StockQuantity = b.Book.StockQuantity,
                    ImageUrl = b.Book.ImageUrl,
                    AverageRating = b.Book.Reviews.Any() ? b.Book.Reviews.Average(r => r.Rating) : 0,
                    IsAvailableInLibrary = b.Book.IsAvailableInLibrary,
                    DiscountPercent = (int)(b.Book.DiscountPercent ?? 0),
                    DateAdded = b.BookmarkedAt
                })
                .ToListAsync();
        }
    }
}