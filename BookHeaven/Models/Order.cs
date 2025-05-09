using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;

namespace BookHeaven.Models
{
    public class Order
    {
        public int OrderId { get; set; }
        public int MemberId { get; set; }
        [Required]
        public Member Member { get; set; } = null!;
        public DateTime OrderDate { get; set; } = DateTime.UtcNow;
        public decimal TotalAmount { get; set; }
        public string Status { get; set; } = "Pending";
        public string? ClaimCode { get; set; }
        public bool IsCancelled { get; set; } = false;
        public decimal TotalPrice { get; set; }
        public bool AppliedFivePercentDiscount { get; set; } = false;
        public bool AppliedTenPercentDiscount { get; set; } = false;

        public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
        public ProcessedOrder? ProcessedOrder { get; set; }
    }
}
