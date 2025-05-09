namespace BookHeaven.DTOs.Announcement
{
    public class AnnouncementDto
    {
        public int Id { get; set; }
        public string Message { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
    }
}