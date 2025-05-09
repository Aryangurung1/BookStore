using System.ComponentModel.DataAnnotations;

namespace BookHeaven.Models
{
    public class Review
    {
        public int ReviewId { get; set; }

        [Required]
        public string Comment { get; set; } = string.Empty;

        [Required]
        public int Rating { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public int BookId { get; set; }
        public int MemberId { get; set; }

        [Required]
        public Book Book { get; set; } = null!;

        [Required]
        public Member Member { get; set; } = null!;
    }
}
