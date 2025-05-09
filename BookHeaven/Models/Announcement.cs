using System.ComponentModel.DataAnnotations;

namespace BookHeaven.Models
{
    public class Announcement
    {
        public int AnnouncementId { get; set; }

        [Required]
        public string Message { get; set; } = string.Empty;
        
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
    }
}
