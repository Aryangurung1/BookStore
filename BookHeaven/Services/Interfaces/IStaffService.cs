using BookHeaven.DTOs.Staff;
using System.Threading.Tasks;

namespace BookHeaven.Services.Interfaces
{
    public interface IStaffService
    {
        Task<string> FulfillOrderAsync(ClaimCodeDto dto);
    }
}