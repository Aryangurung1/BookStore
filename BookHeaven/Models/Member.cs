using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;

namespace BookHeaven.Models
{
    public class Member
    {
        public int MemberId { get; set; }
        
        [Required]
        public string FullName { get; set; } = string.Empty;
        
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        public string MembershipId { get; set; } = Guid.NewGuid().ToString();
        
        public DateTime JoinDate { get; set; } = DateTime.UtcNow;

        public int SuccessfulOrdersCount { get; set; }

        public ICollection<Order> Orders { get; set; } = new List<Order>();
        public ICollection<Review> Reviews { get; set; } = new List<Review>();
        public ICollection<Bookmark> Bookmarks { get; set; } = new List<Bookmark>();
        public ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();
    }
}
