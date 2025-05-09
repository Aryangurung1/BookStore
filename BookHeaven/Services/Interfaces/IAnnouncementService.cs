using BookHeaven.DTOs.Announcement;

namespace BookHeaven.Services.Interfaces
{
    public interface IAnnouncementService
    {
        Task<List<AnnouncementDto>> GetActiveAnnouncementsAsync();
        Task<AnnouncementDto> CreateAnnouncementAsync(CreateAnnouncementDto dto);
        Task<bool> DeleteAnnouncementAsync(int id);
    }
}