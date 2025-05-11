using System.ComponentModel.DataAnnotations;

namespace BookHeaven.Models
{
    public class Staff
    {
        public int StaffId { get; set; }

        [Required]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        [Required]
        public string Position { get; set; } = string.Empty;

        public DateTime JoinDate { get; set; } = DateTime.UtcNow;

        public ICollection<ProcessedOrder> ProcessedOrders { get; set; } = new List<ProcessedOrder>();
    }
}
