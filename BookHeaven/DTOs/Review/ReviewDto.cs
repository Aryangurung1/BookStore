namespace BookHeaven.DTOs.Review
{
    public class ReviewDto
    {
        public int ReviewId { get; set; }
        public int BookId { get; set; }
        public string BookTitle { get; set; } = string.Empty;
        public int Rating { get; set; }
        public string Comment { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public string MemberName { get; set; } = string.Empty;
        public int MemberId { get; set; }
    }
}