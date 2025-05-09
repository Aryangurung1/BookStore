using System.ComponentModel.DataAnnotations;

namespace BookHeaven.Models
{
    public class CartItem
    {
        public int CartItemId { get; set; }
        public int MemberId { get; set; }
        public int BookId { get; set; }
        public int Quantity { get; set; }

        // Navigation properties
        [Required]
        public Member Member { get; set; } = null!;

        [Required]
        public Book Book { get; set; } = null!;
    }
}
