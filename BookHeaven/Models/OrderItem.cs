using System.ComponentModel.DataAnnotations;

namespace BookHeaven.Models
{
    public class OrderItem
    {
        public int OrderItemId { get; set; }

        public int OrderId { get; set; }
        [Required]
        public Order Order { get; set; } = null!;

        public int BookId { get; set; }
        [Required]
        public Book Book { get; set; } = null!;

        public int Quantity { get; set; }
        public decimal Price { get; set; }
        public decimal UnitPrice { get; set; }
    }
}
