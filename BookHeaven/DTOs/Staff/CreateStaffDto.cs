using System.ComponentModel.DataAnnotations;

namespace BookHeaven.DTOs.Staff
{
    public class CreateStaffDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MinLength(6)]
        public string Password { get; set; } = string.Empty;

        [Required]
        public string Position { get; set; } = string.Empty;
    }
}
