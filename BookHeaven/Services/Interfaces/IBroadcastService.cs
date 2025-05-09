using BookHeaven.DTOs.Broadcast;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BookHeaven.Services.Interfaces
{
    public interface IBroadcastService
    {
        Task CreateMessageAsync(string message);
        Task<List<BroadcastMessageDto>> GetRecentMessagesAsync();
    }
}