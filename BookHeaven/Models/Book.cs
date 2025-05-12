// ============================
// UPDATED: Book.cs (Add ImageUrl)
// ============================
using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;

namespace BookHeaven.Models
{
    public class Book
    {
        public int BookId { get; set; }

        [Required]
        public string Title { get; set; } = null!;

        [Required]
        public string ISBN { get; set; } = null!;

        public string Description { get; set; } = string.Empty;
        public string Author { get; set; } = string.Empty;
        public string Genre { get; set; } = string.Empty;
        public string Language { get; set; } = string.Empty;
        public string Format { get; set; } = string.Empty;
        public string Publisher { get; set; } = string.Empty;

        [Required]
        public decimal Price { get; set; }

        [Required]
        public DateTime PublicationDate { get; set; }

        [Required]
        public int StockQuantity { get; set; }

        public bool IsAvailableInLibrary { get; set; }

        public bool IsOnSale { get; set; }
        public decimal? DiscountPercent { get; set; }
        public DateTime? DiscountStart { get; set; }
        public DateTime? DiscountEnd { get; set; }

        [Required]
        public string ImageUrl { get; set; } = null!;

        public int PageCount { get; set; }

        public bool IsAwardWinner { get; set; } = false;
        public bool IsBestseller { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<Review> Reviews { get; set; } = new List<Review>();
        public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    }
}
