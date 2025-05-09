using BookHeaven.DTOs.Cart;
using BookHeaven.DTOs.Order;
using BookHeaven.Models;

namespace BookHeaven.Services.Interfaces
{
    public interface IOrderService
    {
        Task<Order> PlaceOrderAsync(int memberId, CreateOrderDto dto);
        Task<bool> CancelOrderAsync(int orderId, int memberId);
        Task<List<Order>> GetOrdersByMemberAsync(int memberId);
    }
}