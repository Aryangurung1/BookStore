using BookHeaven.DTOs.Review;

namespace BookHeaven.Services.Interfaces
{
    public interface IReviewService
    {
        Task<ReviewDto> AddReviewAsync(int memberId, CreateReviewDto dto);
        Task<List<ReviewDto>> GetReviewsForBookAsync(int bookId);
    }
}