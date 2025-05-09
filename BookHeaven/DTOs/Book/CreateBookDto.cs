using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace BookHeaven.DTOs.Book
{
    public class CreateBookDto
    {
        [Required]
        [StringLength(200)]
        public required string Title { get; set; }

        [Required]
        [StringLength(13)]
        public required string ISBN { get; set; }

        [StringLength(2000)]
        public required string Description { get; set; }

        [StringLength(200)]
        public required string Author { get; set; }

        [StringLength(50)]
        public required string Genre { get; set; }

        [StringLength(50)]
        public required string Language { get; set; }

        [StringLength(50)]
        public required string Format { get; set; }

        [StringLength(200)]
        public required string Publisher { get; set; }

        [Required]
        [Range(0.01, 99999.99)]
        public decimal Price { get; set; }

        [Required]
        public DateTime PublicationDate { get; set; }

        [Required]
        [Range(0, int.MaxValue)]
        public int StockQuantity { get; set; }

        public bool IsAvailableInLibrary { get; set; }

        [Required]
        public required IFormFile Image { get; set; }
    }
}
