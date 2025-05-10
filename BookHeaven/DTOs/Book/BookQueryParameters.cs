namespace BookHeaven.DTOs.Book
{
    public class BookQueryParameters
    {
        public string? Search { get; set; }
        public List<string>? Genres { get; set; }
        public List<string>? Authors { get; set; }
        public List<string>? Languages { get; set; }
        public List<string>? Formats { get; set; }
        public List<string>? Publishers { get; set; }
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
    }
}