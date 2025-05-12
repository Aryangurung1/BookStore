using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace BookHeaven.DTOs.Book
{
    public class CreateBookDto
    {
        [Required(ErrorMessage = "Title is required")]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required(ErrorMessage = "ISBN is required")]
        [StringLength(13)]
        public string ISBN { get; set; } = string.Empty;

        [Required(ErrorMessage = "Description is required")]
        [StringLength(2000)]
        public string Description { get; set; } = string.Empty;

        [Required(ErrorMessage = "Author is required")]
        [StringLength(200)]
        public string Author { get; set; } = string.Empty;

        [Required(ErrorMessage = "Genre is required")]
        [StringLength(50)]
        public string Genre { get; set; } = string.Empty;

        [Required(ErrorMessage = "Language is required")]
        [StringLength(50)]
        public string Language { get; set; } = string.Empty;

        [Required(ErrorMessage = "Format is required")]
        [StringLength(50)]
        public string Format { get; set; } = string.Empty;

        [Required(ErrorMessage = "Publisher is required")]
        [StringLength(200)]
        public string Publisher { get; set; } = string.Empty;

        [Required(ErrorMessage = "Price is required")]
        [Range(0.01, 99999.99, ErrorMessage = "Price must be between 0.01 and 99999.99")]
        public decimal Price { get; set; }

        [Required(ErrorMessage = "Publication date is required")]
        public DateTime PublicationDate { get; set; }

        [Required(ErrorMessage = "Stock quantity is required")]
        [Range(0, int.MaxValue, ErrorMessage = "Stock quantity must be non-negative")]
        public int StockQuantity { get; set; }

        public bool IsAvailableInLibrary { get; set; }

        [Required(ErrorMessage = "Image is required")]
        public IFormFile Image { get; set; } = null!;

        public decimal? DiscountPercent { get; set; }

        public bool IsAwardWinner { get; set; } = false;
        public bool IsBestseller { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
