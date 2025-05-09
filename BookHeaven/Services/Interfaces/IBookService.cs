using BookHeaven.DTOs.Book;
using BookHeaven.Models;

namespace BookHeaven.Services.Interfaces
{
    public interface IBookService
    {
        Task<List<BookDto>> GetAllBooksAsync();
        Task<BookDto?> GetBookByIdAsync(int bookId);
        Task<Book?> CreateBookAsync(CreateBookDto dto);
        Task<Book?> UpdateBookAsync(int bookId, UpdateBookDto dto);
        Task<bool> DeleteBookAsync(int bookId);
        Task<List<BookDto>> GetBooksAsync(BookQueryParameters query);
    }
}
