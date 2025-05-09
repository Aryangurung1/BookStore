using System;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace BookHeaven.DTOs.Announcement
{
    public class AnnouncementDto
    {
        public int AnnouncementId { get; set; }

        [Required]
        [StringLength(100)]
        public string Title { get; set; }

        [Required]
        [StringLength(500)]
        [JsonPropertyName("message")]
        public string Message { get; set; }

        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public string? Type { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class CreateAnnouncementDto
    {
        [Required]
        [StringLength(100)]
        public string Title { get; set; }

        [Required]
        [StringLength(500)]
        [JsonPropertyName("message")]
        public string Message { get; set; }

        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public string? Type { get; set; }
    }

    public class UpdateAnnouncementDto : CreateAnnouncementDto
    {
        // Inherits all properties from CreateAnnouncementDto
    }
}