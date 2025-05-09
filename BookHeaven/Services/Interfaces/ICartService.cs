using BookHeaven.DTOs.Cart;

namespace BookHeaven.Services.Interfaces
{
    public interface ICartService
    {
        Task<List<CartItemDto>> GetCartAsync(int memberId);
        Task AddOrUpdateCartItemAsync(int memberId, UpdateCartDto dto);
        Task RemoveCartItemAsync(int memberId, int bookId);
        Task ClearCartAsync(int memberId);
    }
}