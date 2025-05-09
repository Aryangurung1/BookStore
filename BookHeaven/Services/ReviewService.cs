using System;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using BookHeaven.Data;
using BookHeaven.DTOs.Review;
using BookHeaven.Models;
using BookHeaven.Services.Interfaces;

namespace BookHeaven.Services
{
    public class ReviewService : IReviewService
    {
        private readonly AppDbContext _context;

        public ReviewService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<ReviewDto> AddReviewAsync(int memberId, CreateReviewDto dto)
        {
            // Check if the member has purchased the book
            var hasPurchased = await _context.Orders
                .Include(o => o.OrderItems)
                .AnyAsync(o => o.MemberId == memberId && 
                             o.OrderItems.Any(oi => oi.BookId == dto.BookId));

            if (!hasPurchased)
            {
                throw new UnauthorizedAccessException("You can only review books you've purchased.");
            }

            // Check if the member has already reviewed the book
            var existingReview = await _context.Reviews
                .FirstOrDefaultAsync(r => r.MemberId == memberId && r.BookId == dto.BookId);

            if (existingReview != null)
            {
                throw new InvalidOperationException("You have already reviewed this book.");
            }

            var review = new Review
            {
                MemberId = memberId,
                BookId = dto.BookId,
                Rating = dto.Rating,
                Comment = dto.Comment,
                CreatedAt = DateTime.UtcNow
            };

            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();

            var member = await _context.Members.FindAsync(memberId);
            if (member == null)
            {
                throw new InvalidOperationException("Member not found.");
            }

            return new ReviewDto
            {
                ReviewId = review.ReviewId,
                BookId = review.BookId,
                Rating = review.Rating,
                Comment = review.Comment,
                CreatedAt = review.CreatedAt,
                MemberName = member.FullName
            };
        }

        public async Task<IEnumerable<ReviewDto>> GetReviewsByBookIdAsync(int bookId)
        {
            var reviews = await _context.Reviews
                .Include(r => r.Member)
                .Where(r => r.BookId == bookId)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new ReviewDto
                {
                    ReviewId = r.ReviewId,
                    BookId = r.BookId,
                    Rating = r.Rating,
                    Comment = r.Comment,
                    CreatedAt = r.CreatedAt,
                    MemberName = r.Member.FullName
                })
                .ToListAsync();

            return reviews;
        }

        public async Task<List<ReviewDto>> GetReviewsForBookAsync(int bookId)
        {
            return await _context.Reviews
                .Where(r => r.BookId == bookId)
                .Select(r => new ReviewDto
                {
                    ReviewId = r.ReviewId,
                    BookId = r.BookId,
                    BookTitle = r.Book.Title,
                    Rating = r.Rating,
                    Comment = r.Comment,
                    CreatedAt = r.CreatedAt
                })
                .ToListAsync();
        }
    }
}