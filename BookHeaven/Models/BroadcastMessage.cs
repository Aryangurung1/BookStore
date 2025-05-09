using System.ComponentModel.DataAnnotations;

namespace BookHeaven.Models
{
    public class BroadcastMessage
    {
        public int BroadcastMessageId { get; set; }

        [Required]
        public string Message { get; set; } = string.Empty;

        public DateTime SentAt { get; set; } = DateTime.UtcNow;
    }
}
