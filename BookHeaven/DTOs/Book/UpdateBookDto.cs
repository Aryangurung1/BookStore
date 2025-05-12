using Microsoft.AspNetCore.Http;

namespace BookHeaven.DTOs.Book
{
    public class UpdateBookDto
    {
        public string Title { get; set; } = string.Empty;
        public string ISBN { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Author { get; set; } = string.Empty;
        public string Genre { get; set; } = string.Empty;
        public string Language { get; set; } = string.Empty;
        public string Format { get; set; } = string.Empty;
        public string Publisher { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public DateTime PublicationDate { get; set; }
        public int StockQuantity { get; set; }
        public bool IsAvailableInLibrary { get; set; }
        public bool IsOnSale { get; set; }
        public decimal? DiscountPercent { get; set; }
        public DateTime? DiscountStart { get; set; }
        public DateTime? DiscountEnd { get; set; }
        public IFormFile? Image { get; set; }
        public bool IsAwardWinner { get; set; } = false;
        public bool IsBestseller { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}