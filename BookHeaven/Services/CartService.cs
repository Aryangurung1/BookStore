using BookHeaven.Data;
using BookHeaven.DTOs.Cart;
using BookHeaven.Models;
using BookHeaven.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BookHeaven.Services
{
    public class CartService : ICartService
    {
        private readonly AppDbContext _context;

        public CartService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<CartItemDto>> GetCartAsync(int memberId)
        {
            return await _context.CartItems
                .Where(c => c.MemberId == memberId)
                .Include(c => c.Book)
                .Select(c => new CartItemDto
                {
                    BookId = c.BookId,
                    BookTitle = c.Book.Title,
                    ImageUrl = c.Book.ImageUrl,
                    Author = c.Book.Author,
                    Quantity = c.Quantity,
                    Price = c.Book.Price,
                    IsOnSale = c.Book.IsOnSale,
                    DiscountPercent = c.Book.DiscountPercent.HasValue ? (int)c.Book.DiscountPercent.Value : 0
                })
                .ToListAsync();
        }

        public async Task AddOrUpdateCartItemAsync(int memberId, UpdateCartDto dto)
        {
            // First check if the book exists and is available
            var book = await _context.Books.FirstOrDefaultAsync(b => b.BookId == dto.BookId);
            if (book == null)
            {
                throw new Exception("Book not found");
            }

            if (!book.IsAvailableInLibrary || book.StockQuantity <= 0)
            {
                throw new Exception("This book is not available in the library");
            }

            var existing = await _context.CartItems
                .FirstOrDefaultAsync(c => c.MemberId == memberId && c.BookId == dto.BookId);

            if (dto.Quantity <= 0)
            {
                if (existing != null)
                {
                    _context.CartItems.Remove(existing);
                    await _context.SaveChangesAsync();
                }
                return;
            }

            // Check if requested quantity is available
            if (dto.Quantity > book.StockQuantity)
            {
                throw new Exception($"Only {book.StockQuantity} copies available");
            }

            if (existing == null)
            {
                var newItem = new CartItem
                {
                    MemberId = memberId,
                    BookId = dto.BookId,
                    Quantity = dto.Quantity
                };
                _context.CartItems.Add(newItem);
            }
            else
            {
                existing.Quantity = dto.Quantity;
            }

            await _context.SaveChangesAsync();
        }

        public async Task RemoveCartItemAsync(int memberId, int bookId)
        {
            var item = await _context.CartItems
                .FirstOrDefaultAsync(c => c.MemberId == memberId && c.BookId == bookId);

            if (item != null)
            {
                _context.CartItems.Remove(item);
                await _context.SaveChangesAsync();
            }
        }

        public async Task ClearCartAsync(int memberId)
        {
            var items = await _context.CartItems
                .Where(c => c.MemberId == memberId)
                .ToListAsync();

            _context.CartItems.RemoveRange(items);
            await _context.SaveChangesAsync();
        }
    }
}