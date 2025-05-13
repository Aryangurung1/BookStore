import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Search, Filter, ChevronDown, Eye, X, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Select from 'react-select';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

const placeholderImg = '/placeholder-book.jpg';

const StaffBooks = () => {
  const [books, setBooks] = useState([]);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  // Filter states
  const [authors, setAuthors] = useState([]);
  const [genres, setGenres] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [formats, setFormats] = useState([]);
  const [publishers, setPublishers] = useState([]);
  // Multi-select state
  const [selectedAuthors, setSelectedAuthors] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [selectedFormats, setSelectedFormats] = useState([]);
  const [selectedPublishers, setSelectedPublishers] = useState([]);
  // Range state
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [ratingRange, setRatingRange] = useState([0, 5]);
  const [inStock, setInStock] = useState(false);
  const [inLibrary, setInLibrary] = useState(false);
  const [sortBy, setSortBy] = useState('title');
  const [sortDescending, setSortDescending] = useState(false);
  const [isAwardWinner, setIsAwardWinner] = useState(false);
  const [isBestseller, setIsBestseller] = useState(false);
  const [newReleases, setNewReleases] = useState(false);
  const [newArrivals, setNewArrivals] = useState(false);
  const [comingSoon, setComingSoon] = useState(false);
  const [deals, setDeals] = useState(false);
  const [resetFilters, setResetFilters] = useState(false);
  const booksPerPage = 9;

  // Fetch filter options on mount
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [a, g, l, f, p] = await Promise.all([
          axios.get('http://localhost:5176/api/books/authors'),
          axios.get('http://localhost:5176/api/books/genres'),
          axios.get('http://localhost:5176/api/books/languages'),
          axios.get('http://localhost:5176/api/books/formats'),
          axios.get('http://localhost:5176/api/books/publishers'),
        ]);
        setAuthors(a.data);
        setGenres(g.data);
        setLanguages(l.data);
        setFormats(f.data);
        setPublishers(p.data);
      } catch (err) {
        // ignore
      }
    };
    fetchFilters();
  }, []);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page on search or filter
  }, [query, selectedAuthors, selectedGenres, selectedLanguages, selectedFormats, selectedPublishers, priceRange, ratingRange, inStock, inLibrary, sortBy, sortDescending]);

  useEffect(() => {
    fetchBooks();
  }, [query, currentPage, selectedAuthors, selectedGenres, selectedLanguages, selectedFormats, selectedPublishers, priceRange, ratingRange, inStock, inLibrary, sortBy, sortDescending, isAwardWinner, isBestseller, newReleases, newArrivals, comingSoon, deals]);

  useEffect(() => {
    if (resetFilters) {
      setQuery('');
      setPriceRange([0, 1000]);
      setRatingRange([0, 5]);
      setSelectedLanguages([]);
      setSelectedAuthors([]);
      setSelectedGenres([]);
      setSelectedFormats([]);
      setSelectedPublishers([]);
      setSortBy('title');
      setSortDescending(false);
      setCurrentPage(1);
      setIsAwardWinner(false);
      setIsBestseller(false);
      setNewReleases(false);
      setNewArrivals(false);
      setComingSoon(false);
      setDeals(false);
      setResetFilters(false);
      fetchBooks();
    }
  }, [resetFilters]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('search', query);
      params.append('minPrice', priceRange[0]);
      params.append('maxPrice', priceRange[1]);
      params.append('minRating', ratingRange[0]);
      params.append('sortBy', sortBy);
      params.append('sortDescending', sortDescending);
      params.append('page', currentPage);
      params.append('pageSize', booksPerPage);
      if (inStock) params.append('inStock', true);
      if (inLibrary) params.append('isAvailableInLibrary', true);
      if (isAwardWinner) params.append('isAwardWinner', true);
      if (isBestseller) params.append('isBestseller', true);
      if (newReleases) params.append('newReleases', true);
      if (newArrivals) params.append('newArrivals', true);
      if (comingSoon) params.append('comingSoon', true);
      if (deals) params.append('deals', true);
      if (selectedLanguages.length > 0) {
        selectedLanguages.forEach(lang => params.append('languages[]', lang));
      }
      if (selectedAuthors.length > 0) {
        selectedAuthors.forEach(author => params.append('authors[]', author));
      }
      if (selectedGenres.length > 0) {
        selectedGenres.forEach(genre => params.append('genres[]', genre));
      }
      if (selectedFormats.length > 0) {
        selectedFormats.forEach(format => params.append('formats[]', format));
      }
      if (selectedPublishers.length > 0) {
        selectedPublishers.forEach(publisher => params.append('publishers[]', publisher));
      }
      const res = await axios.get(`http://localhost:5176/api/books`, { params });
      setBooks(res.data);
      const totalCount = parseInt(res.headers['x-total-count'] || '0');
      setTotalPages(Math.max(1, Math.ceil(totalCount / booksPerPage)));
    } catch (err) {
      setError('Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  const handleViewBook = (book) => {
    setSelectedBook(book);
    setShowViewModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-4 md:pt-8 px-10 max-w-7xl mx-auto">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
      >
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Book Catalog</h2>
          <p className="text-gray-600">Manage and view all books in the system</p>
        </div>
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search books by title, ISBN, or description..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-all duration-200"
          />
        </div>
      </motion.div>

      {/* Filters Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-all duration-200"
          >
            <Filter className="h-4 w-4" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          {showFilters && (
            <button
              onClick={() => setResetFilters(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-200 transition-all duration-200"
            >
              <RefreshCw className="h-4 w-4" />
              Reset Filters
            </button>
          )}
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 bg-white rounded-lg shadow-lg p-6 overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Authors</label>
                  <Select
                    isMulti
                    value={selectedAuthors.map(a => ({ value: a, label: a }))}
                    onChange={selected => setSelectedAuthors(selected ? selected.map(s => s.value) : [])}
                    options={authors.map(author => ({ value: author, label: author }))}
                    placeholder="Select authors..."
                    className="basic-multi-select"
                    classNamePrefix="select"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Genres</label>
                  <Select
                    isMulti
                    value={selectedGenres.map(g => ({ value: g, label: g }))}
                    onChange={selected => setSelectedGenres(selected ? selected.map(s => s.value) : [])}
                    options={genres.map(genre => ({ value: genre, label: genre }))}
                    placeholder="Select genres..."
                    className="basic-multi-select"
                    classNamePrefix="select"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Languages</label>
                  <Select
                    isMulti
                    value={selectedLanguages.map(l => ({ value: l, label: l }))}
                    onChange={selected => setSelectedLanguages(selected ? selected.map(s => s.value) : [])}
                    options={languages.map(lang => ({ value: lang, label: lang }))}
                    placeholder="Select languages..."
                    className="basic-multi-select"
                    classNamePrefix="select"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Formats</label>
                  <Select
                    isMulti
                    value={selectedFormats.map(f => ({ value: f, label: f }))}
                    onChange={selected => setSelectedFormats(selected ? selected.map(s => s.value) : [])}
                    options={formats.map(format => ({ value: format, label: format }))}
                    placeholder="Select formats..."
                    className="basic-multi-select"
                    classNamePrefix="select"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Publishers</label>
                  <Select
                    isMulti
                    value={selectedPublishers.map(p => ({ value: p, label: p }))}
                    onChange={selected => setSelectedPublishers(selected ? selected.map(s => s.value) : [])}
                    options={publishers.map(publisher => ({ value: publisher, label: publisher }))}
                    placeholder="Select publishers..."
                    className="basic-multi-select"
                    classNamePrefix="select"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Price Range</label>
                  <Slider
                    range
                    min={0}
                    max={1000}
                    value={priceRange}
                    onChange={setPriceRange}
                    marks={{
                      0: '$0',
                      250: '$250',
                      500: '$500',
                      750: '$750',
                      1000: '$1000'
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Rating Range</label>
                  <Slider
                    range
                    min={0}
                    max={5}
                    step={0.5}
                    value={ratingRange}
                    onChange={setRatingRange}
                    marks={{
                      0: '0',
                      1: '1',
                      2: '2',
                      3: '3',
                      4: '4',
                      5: '5'
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  >
                    <option value="title">Title</option>
                    <option value="date">Publication Date</option>
                    <option value="price">Price</option>
                    <option value="stock">Stock Quantity</option>
                  </select>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="inStock"
                      checked={inStock}
                      onChange={e => setInStock(e.target.checked)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="inStock" className="text-sm font-medium text-gray-700">In Stock Only</label>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => {
                    fetchBooks();
                    setShowFilters(false);
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Books Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {books.map((book, idx) => (
          <motion.div
            key={book.bookId || idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="relative aspect-[3/4] rounded-t-xl overflow-hidden">
              <img
                src={book.imageUrl ? `http://localhost:5176${book.imageUrl}` : placeholderImg}
                alt={book.title}
                className="w-full h-full object-cover"
                onError={e => { e.target.onerror = null; e.target.src = placeholderImg; }}
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <button
                  onClick={() => handleViewBook(book)}
                  className="bg-white/90 text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-white transition-colors duration-200"
                >
                  View Details
                </button>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg text-gray-900 mb-1 truncate">{book.title}</h3>
              <p className="text-gray-600 text-sm mb-2 truncate">{book.author}</p>
              <div className="flex items-center justify-between">
                <span className="text-indigo-600 font-semibold">${book.price}</span>
                <span className="text-sm text-gray-500">Stock: {book.stockQuantity}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className={`p-2 rounded-lg ${
              currentPage === 1
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index + 1}
              onClick={() => setCurrentPage(index + 1)}
              className={`px-4 py-2 rounded-lg ${
                currentPage === index + 1
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {index + 1}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className={`p-2 rounded-lg ${
              currentPage === totalPages
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* View Book Modal */}
      {showViewModal && selectedBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-4xl relative animate-fade-in">
            <button
              onClick={() => setShowViewModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-red-500 focus:outline-none"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-1/3">
                <img
                  src={selectedBook.coverImage || placeholderImg}
                  alt={selectedBook.title}
                  className="w-full aspect-[3/4] object-cover rounded-xl shadow-lg"
                />
              </div>
              <div className="w-full md:w-2/3">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedBook.title}</h2>
                <p className="text-gray-600 mb-4">{selectedBook.author}</p>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Description</h3>
                    <p className="text-gray-700">{selectedBook.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">ISBN</h3>
                      <p className="text-gray-700">{selectedBook.isbn}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Genre</h3>
                      <p className="text-gray-700">{selectedBook.genre}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Price</h3>
                      <p className="text-gray-700">${selectedBook.price}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Stock</h3>
                      <p className="text-gray-700">{selectedBook.stockQuantity} available</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffBooks; 