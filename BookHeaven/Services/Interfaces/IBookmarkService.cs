using BookHeaven.DTOs.Bookmark;

namespace BookHeaven.Services.Interfaces
{
    public interface IBookmarkService
    {
        Task AddBookmarkAsync(int memberId, int bookId);
        Task RemoveBookmarkAsync(int memberId, int bookId);
        Task<List<BookmarkDto>> GetBookmarksAsync(int memberId);
    }
}