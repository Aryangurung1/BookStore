using System.ComponentModel.DataAnnotations;

namespace BookHeaven.DTOs.Announcement
{
    public class CreateAnnouncementDto
    {
        [Required]
        public string Message { get; set; } = null!;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
    }
}