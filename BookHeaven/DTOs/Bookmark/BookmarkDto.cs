namespace BookHeaven.DTOs.Bookmark;

public class BookmarkDto
{
    public int BookId { get; set; }
    public required string BookTitle { get; set; }
    public required string Author { get; set; }
    public required string Genre { get; set; }
    public required string Language { get; set; }
    public string? ISBN { get; set; }
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public string? Format { get; set; }
    public string? Publisher { get; set; }
    public DateTime PublicationDate { get; set; }
    public int PageCount { get; set; }
    public int StockQuantity { get; set; }
    public string? ImageUrl { get; set; }
    public double AverageRating { get; set; }
    public bool IsAvailableInLibrary { get; set; }
    public int DiscountPercent { get; set; }
    public DateTime DateAdded { get; set; }
}