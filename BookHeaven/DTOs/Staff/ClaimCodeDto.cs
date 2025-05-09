using System.ComponentModel.DataAnnotations;

namespace BookHeaven.DTOs.Staff
{
    public class ClaimCodeDto
    {
        [Required]
        public string ClaimCode { get; set; } = string.Empty;
    }
}