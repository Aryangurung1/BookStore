using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using BookHeaven.DTOs.Cart;

namespace BookHeaven.DTOs.Order
{
    public class CreateOrderDto
    {
        [Required]
        public List<CartItemDto> Items { get; set; } = new();

        public string? ShippingAddress { get; set; }
        public string? PaymentMethod { get; set; }
    }
}