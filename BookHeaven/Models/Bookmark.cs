using System.ComponentModel.DataAnnotations;

namespace BookHeaven.Models
{
    public class Bookmark
    {
        public int BookmarkId { get; set; }
        public int MemberId { get; set; }
        public int BookId { get; set; }
        public DateTime BookmarkedAt { get; set; } = DateTime.UtcNow;

        [Required]
        public Member Member { get; set; } = null!;

        [Required]
        public Book Book { get; set; } = null!;
    }
}
