namespace BookHeaven.DTOs.Book
{
    public class BookDto
    {
        public int BookId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string ISBN { get; set; } = string.Empty;
        public string Author { get; set; } = string.Empty;
        public string Genre { get; set; } = string.Empty;
        public string Language { get; set; } = string.Empty;
        public string Format { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public bool IsOnSale { get; set; }
        public int DiscountPercent { get; set; }
        public DateTime? DiscountStart { get; set; }
        public DateTime? DiscountEnd { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public int StockQuantity { get; set; }
        public string Description { get; set; } = string.Empty;
        public string Publisher { get; set; } = string.Empty;
        public DateTime PublicationDate { get; set; }
        public int PageCount { get; set; }
        public double AverageRating { get; set; }
        public bool IsAvailableInLibrary { get; set; }
        public bool IsAwardWinner { get; set; }
        public bool IsBestseller { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}