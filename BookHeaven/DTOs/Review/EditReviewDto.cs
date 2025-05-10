using System.ComponentModel.DataAnnotations;

namespace BookHeaven.DTOs.Review
{
    public class EditReviewDto
    {
        [Range(1, 5)]
        public int Rating { get; set; }

        [StringLength(1000)]
        public string Comment { get; set; } = string.Empty;
    }
} 