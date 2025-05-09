using System.ComponentModel.DataAnnotations;

namespace BookHeaven.DTOs.Cart
{
    public class CartItemDto
    {
        [Required]
        public int BookId { get; set; }
        public string BookTitle { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public string Author { get; set; } = string.Empty;
        [Range(1, int.MaxValue, ErrorMessage = "Quantity must be at least 1")]
        public int Quantity { get; set; }

        public decimal Price { get; set; }
        public bool IsOnSale { get; set; }
        public int DiscountPercent { get; set; }
    }
}