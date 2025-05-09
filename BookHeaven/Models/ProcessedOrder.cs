using System.ComponentModel.DataAnnotations;

namespace BookHeaven.Models
{
    public class ProcessedOrder
    {
        public int ProcessedOrderId { get; set; }
        public int OrderId { get; set; }
        public int StaffId { get; set; }
        public DateTime ProcessedAt { get; set; } = DateTime.UtcNow;

        [Required]
        public Order Order { get; set; } = null!;

        [Required]
        public Staff Staff { get; set; } = null!;
    }
}
