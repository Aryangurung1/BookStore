using BookHeaven.DTOs.Staff;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace BookHeaven.Services.Interfaces
{
    public interface IStaffService
    {
        Task<string> FulfillOrderAsync(ClaimCodeDto dto, int staffId);
        Task<List<object>> GetFulfilledOrdersAsync();
    }
}