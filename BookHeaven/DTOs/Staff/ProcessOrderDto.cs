using System.ComponentModel.DataAnnotations;

namespace BookHeaven.DTOs.Staff
{
    public class ProcessOrderDto
    {
        [Required]
        public string ClaimCode { get; set; } = null!;
    }
}