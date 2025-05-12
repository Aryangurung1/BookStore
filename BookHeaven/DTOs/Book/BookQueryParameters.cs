using Microsoft.AspNetCore.Mvc;

namespace BookHeaven.DTOs.Book
{
    public class BookQueryParameters
    {
        public string? Search { get; set; }
        public List<string>? Genres { get; set; }
        [FromQuery(Name = "genres[]")]
        public List<string>? GenresAlt { get; set; }
        public List<string>? Authors { get; set; }
        [FromQuery(Name = "authors[]")]
        public List<string>? AuthorsAlt { get; set; }
        public List<string>? Languages { get; set; }
        [FromQuery(Name = "languages[]")]
        public List<string>? LanguagesAlt { get; set; }
        public List<string>? Formats { get; set; }
        [FromQuery(Name = "formats[]")]
        public List<string>? FormatsAlt { get; set; }
        public List<string>? Publishers { get; set; }
        [FromQuery(Name = "publishers[]")]
        public List<string>? PublishersAlt { get; set; }
        public bool? IsOnSale { get; set; }
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
        public double? MinRating { get; set; }
        public bool? IsAvailableInLibrary { get; set; }
        public bool? InStock { get; set; }
        public string? SortBy { get; set; }
        public bool SortDescending { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public bool? IsAwardWinner { get; set; }
        public bool? IsBestseller { get; set; }
        public bool? NewReleases { get; set; }
        public bool? NewArrivals { get; set; }
        public bool? ComingSoon { get; set; }
        public bool? Deals { get; set; }
    }
}