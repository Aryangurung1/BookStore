namespace BookHeaven.DTOs.Bookmark;

public class BookmarkDto
{
    public int BookId { get; set; }
    public required string BookTitle { get; set; }
    public required string Author { get; set; }
    public required string Genre { get; set; }
    public required string Language { get; set; }
    public DateTime DateAdded { get; set; }
}