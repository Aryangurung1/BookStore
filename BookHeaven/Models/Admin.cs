using System.ComponentModel.DataAnnotations;

namespace BookHeaven.Models
{
    public class Admin
    {
        public int AdminId { get; set; }

        [Required]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string FullName { get; set; } = string.Empty;

        [Required]
        public string PasswordHash { get; set; } = string.Empty;
    }
}
