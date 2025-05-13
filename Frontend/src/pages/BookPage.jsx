// ✅ FILE: src/pages/BooksPage.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useBookmark } from '../context/BookmarkContext';
import { useToast } from '../context/ToastContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Star, StarOff, Search, Filter, ChevronLeft, ChevronRight, Loader2, ShoppingCart, Bookmark, BookOpen } from 'lucide-react';
import Select from 'react-select';
import Slider from 'rc-slider';
import { motion, AnimatePresence } from 'framer-motion';
import 'rc-slider/assets/index.css';

const placeholderImg = '/placeholder-book.jpg';

const BooksPage = () => {
  const { user, token, logout } = useAuth();
  const { updateCartCount, addToCart } = useCart();
  const { updateBookmarkCount } = useBookmark();
  const { addToast } = useToast();
  const [books, setBooks] = useState([]);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
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
  const [showFilters, setShowFilters] = useState(false);
  const [isAwardWinner, setIsAwardWinner] = useState(false);
  const [isBestseller, setIsBestseller] = useState(false);
  const [newReleases, setNewReleases] = useState(false);
  const [newArrivals, setNewArrivals] = useState(false);
  const [comingSoon, setComingSoon] = useState(false);
  const [deals, setDeals] = useState(false);
  const [resetFilters, setResetFilters] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

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
        console.error('Error fetching filter options:', err);
      }
    };
    fetchFilters();
  }, []);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page on search or filter
  }, [query, selectedAuthors, selectedGenres, selectedLanguages, selectedFormats, selectedPublishers, priceRange, ratingRange, inStock, inLibrary, sortBy, sortDescending]);

  useEffect(() => {
    fetchBooks();
    if (user && user.role === 'Member') fetchBookmarks();
  }, [query, currentPage, user, selectedAuthors, selectedGenres, selectedLanguages, selectedFormats, selectedPublishers, priceRange, ratingRange, inStock, inLibrary, sortBy, sortDescending, isAwardWinner, isBestseller, newReleases, newArrivals, comingSoon, deals]);

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

  const fetchBookmarks = async () => {
    try {
      const res = await axios.get('http://localhost:5176/api/Bookmark', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookmarks(res.data.map(b => b.bookId));
    } catch (err) {
      console.error('Failed to fetch bookmarks:', err);
      addToast('Failed to load bookmarks. Please try again later.', 'error');
    }
  };

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
      params.append('pageSize', 9);
      if (inStock) params.append('inStock', true);
      if (inLibrary) params.append('isAvailableInLibrary', true);
      if (isAwardWinner) params.append('isAwardWinner', true);
      if (isBestseller) params.append('isBestseller', true);
      if (newReleases) params.append('newReleases', true);
      if (newArrivals) params.append('newArrivals', true);
      if (comingSoon) params.append('comingSoon', true);
      if (deals) params.append('deals', true);
      
      // Handle multi-select filters
      if (selectedLanguages.length > 0) {
        selectedLanguages.forEach(lang => params.append('languages[]', lang.value));
      }
      if (selectedAuthors.length > 0) {
        selectedAuthors.forEach(author => params.append('authors[]', author.value));
      }
      if (selectedGenres.length > 0) {
        selectedGenres.forEach(genre => params.append('genres[]', genre.value));
      }
      if (selectedFormats.length > 0) {
        selectedFormats.forEach(format => params.append('formats[]', format.value));
      }
      if (selectedPublishers.length > 0) {
        selectedPublishers.forEach(publisher => params.append('publishers[]', publisher.value));
      }

      const res = await axios.get(`http://localhost:5176/api/books`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      setBooks(res.data);
      const totalCount = parseInt(res.headers['x-total-count'] || '0');
      setTotalPages(Math.max(1, Math.ceil(totalCount / 9)));
    } catch (err) {
      setError('Failed to load books');
      console.error('Error fetching books:', err);
    } finally {
      setLoading(false);
    }
  };

  const isBookBookmarked = (bookId) => bookmarks.includes(bookId);

  const handleToggleBookmark = async (bookId) => {
    if (!user || user.role !== 'Member') {
      addToast('Please login as a member to bookmark books', 'warning');
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    try {
      if (isBookBookmarked(bookId)) {
        // Remove bookmark
        await axios.delete(`http://localhost:5176/api/Bookmark/${bookId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBookmarks(prev => prev.filter(id => id !== bookId));
        addToast('Book removed from bookmarks', 'success');
      } else {
        // Add bookmark
        await axios.post(`http://localhost:5176/api/Bookmark/${bookId}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBookmarks(prev => [...prev, bookId]);
        addToast('Book added to bookmarks', 'success');
      }
      updateBookmarkCount();
    } catch (err) {
      console.error('Bookmark error:', err);
      if (err.response?.status === 401) {
        logout();
        navigate('/login', { state: { from: location.pathname } });
      } else {
        addToast(err.response?.data?.message || 'Failed to update bookmark', 'error');
      }
    }
  };

  const handleAddToCart = async (bookId) => {
    if (!user || !bookId) {
      addToast('Please login to add items to cart', 'warning');
      navigate('/login');
      return;
    }

    try {
      await axios.post('http://localhost:5176/api/Cart', {
        bookId,
        quantity: 1
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      updateCartCount(); // Update the cart count in the navbar
      addToast('Book added to cart successfully', 'success');
    } catch (err) {
      console.error('Failed to add to cart:', err);
      addToast(err.response?.data?.message || 'Failed to add book to cart', 'error');
    }
  };

  const handleViewBook = (book) => {
    setSelectedBook(book);
    setShowViewModal(true);
  };

  // Debug log for pagination
  console.log('totalPages:', totalPages, 'currentPage:', currentPage, 'books.length:', books.length);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
        >
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Book Catalog</h2>
            <p className="text-gray-600">Discover your next favorite book</p>
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

        {/* Category Tabs Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setIsAwardWinner(!isAwardWinner);
                setIsBestseller(false);
                setNewReleases(false);
                setNewArrivals(false);
                setComingSoon(false);
                setDeals(false);
                fetchBooks();
              }}
              className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                isAwardWinner ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Award Winners
            </button>
            <button
              onClick={() => {
                setIsBestseller(!isBestseller);
                setIsAwardWinner(false);
                setNewReleases(false);
                setNewArrivals(false);
                setComingSoon(false);
                setDeals(false);
                fetchBooks();
              }}
              className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                isBestseller ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Bestsellers
            </button>
            <button
              onClick={() => {
                setNewReleases(!newReleases);
                setIsAwardWinner(false);
                setIsBestseller(false);
                setNewArrivals(false);
                setComingSoon(false);
                setDeals(false);
                fetchBooks();
              }}
              className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                newReleases ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              New Releases
            </button>
            <button
              onClick={() => {
                setNewArrivals(!newArrivals);
                setIsAwardWinner(false);
                setIsBestseller(false);
                setNewReleases(false);
                setComingSoon(false);
                setDeals(false);
                fetchBooks();
              }}
              className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                newArrivals ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              New Arrivals
            </button>
            <button
              onClick={() => {
                setComingSoon(!comingSoon);
                setIsAwardWinner(false);
                setIsBestseller(false);
                setNewReleases(false);
                setNewArrivals(false);
                setDeals(false);
                fetchBooks();
              }}
              className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                comingSoon ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Coming Soon
            </button>
            <button
              onClick={() => {
                setDeals(!deals);
                setIsAwardWinner(false);
                setIsBestseller(false);
                setNewReleases(false);
                setNewArrivals(false);
                setComingSoon(false);
                fetchBooks();
              }}
              className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                deals ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Deals
            </button>
          </div>
        </motion.div>

        {/* Filters Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-all duration-200"
          >
            <Filter className="h-4 w-4" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>

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
                      options={authors.map(a => ({ value: a, label: a }))}
                      value={selectedAuthors}
                      onChange={selected => setSelectedAuthors(selected || [])}
                      placeholder="Select authors..."
                      className="basic-multi-select"
                      classNamePrefix="select"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Genres</label>
                    <Select
                      isMulti
                      options={genres.map(g => ({ value: g, label: g }))}
                      value={selectedGenres}
                      onChange={selected => setSelectedGenres(selected || [])}
                      placeholder="Select genres..."
                      className="basic-multi-select"
                      classNamePrefix="select"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Languages</label>
                    <Select
                      isMulti
                      options={languages.map(l => ({ value: l, label: l }))}
                      value={selectedLanguages}
                      onChange={selected => setSelectedLanguages(selected || [])}
                      placeholder="Select languages..."
                      className="basic-multi-select"
                      classNamePrefix="select"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Formats</label>
                    <Select
                      isMulti
                      options={formats.map(f => ({ value: f, label: f }))}
                      value={selectedFormats}
                      onChange={selected => setSelectedFormats(selected || [])}
                      placeholder="Select formats..."
                      className="basic-multi-select"
                      classNamePrefix="select"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Publishers</label>
                    <Select
                      isMulti
                      options={publishers.map(p => ({ value: p, label: p }))}
                      value={selectedPublishers}
                      onChange={selected => setSelectedPublishers(selected || [])}
                      placeholder="Select publishers..."
                      className="basic-multi-select"
                      classNamePrefix="select"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Price Range (${priceRange[0]} - ${priceRange[1]})
                    </label>
                    <Slider
                      range
                      min={0}
                      max={1000}
                      step={1}
                      value={priceRange}
                      onChange={setPriceRange}
                      allowCross={false}
                      trackStyle={[{ backgroundColor: '#6366f1' }]}
                      handleStyle={[
                        { borderColor: '#6366f1', backgroundColor: 'white' },
                        { borderColor: '#6366f1', backgroundColor: 'white' }
                      ]}
                      activeDotStyle={{ borderColor: '#6366f1' }}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Rating Range ({ratingRange[0]} - {ratingRange[1]})
                    </label>
                    <Slider
                      range
                      min={0}
                      max={5}
                      step={0.1}
                      value={ratingRange}
                      onChange={setRatingRange}
                      allowCross={false}
                      trackStyle={[{ backgroundColor: '#6366f1' }]}
                      handleStyle={[
                        { borderColor: '#6366f1', backgroundColor: 'white' },
                        { borderColor: '#6366f1', backgroundColor: 'white' }
                      ]}
                      activeDotStyle={{ borderColor: '#6366f1' }}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="inStock"
                      checked={inStock}
                      onChange={e => setInStock(e.target.checked)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="inStock" className="text-sm font-medium text-gray-700">
                      In Stock Only
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="inLibrary"
                      checked={inLibrary}
                      onChange={e => setInLibrary(e.target.checked)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="inLibrary" className="text-sm font-medium text-gray-700">
                      Available in Library
                    </label>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Sort By</label>
                    <select
                      className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      value={sortBy}
                      onChange={e => setSortBy(e.target.value)}
                    >
                      <option value="title">Title</option>
                      <option value="date">Publication Date</option>
                      <option value="price">Price</option>
                      <option value="popularity">Popularity</option>
                    </select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="sortDescending"
                      checked={sortDescending}
                      onChange={e => setSortDescending(e.target.checked)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="sortDescending" className="text-sm font-medium text-gray-700">
                      Descending
                    </label>
                  </div>
                </div>
                <button
                  onClick={() => setResetFilters(true)}
                  className="text-indigo-600 hover:text-indigo-800"
                >
                  Reset Filters
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Error and Success Messages */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded"
            >
              <p>{error}</p>
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded"
            >
              <p>{success}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Books Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No books found matching your criteria.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {books.map((book, index) => (
                <motion.div
                  key={book.bookId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  <Link
                    to={`/book/${book.bookId}`}
                    className="block cursor-pointer group"
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <div className="relative pb-[120%] overflow-hidden">
                      <img
                        src={book.imageUrl ? `http://localhost:5176${book.imageUrl}` : placeholderImg}
                        alt={book.title}
                        className="absolute h-full w-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                        onError={e => { e.target.onerror = null; e.target.src = placeholderImg; }}
                      />
                      {book.isOnSale && (
                        <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                          SALE
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-1 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                        {book.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-1 line-clamp-1">{book.author}</p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="font-medium text-indigo-600">
                          ${book.price?.toFixed(2)}
                        </p>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < Math.floor(book.averageRating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                      </div>
                      {(!book.isAvailableInLibrary || book.stockQuantity <= 0) && (
                        <p className="mt-2 text-xs text-red-600">
                          Currently unavailable
                        </p>
                      )}
                    </div>
                  </Link>
                  <div className="px-4 pb-4 flex gap-2">
                    <button
                      onClick={() => handleAddToCart(book.bookId)}
                      disabled={!user || !book.isAvailableInLibrary || book.stockQuantity <= 0}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Add to Cart
                    </button>
                    <button
                      onClick={() => handleToggleBookmark(book.bookId)}
                      className={`p-2 rounded-md border transition-all duration-200 ${
                        isBookBookmarked(book.bookId)
                          ? 'bg-yellow-50 text-yellow-600 border-yellow-200 hover:bg-yellow-100'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                      }`}
                      aria-label={isBookBookmarked(book.bookId) ? "Remove bookmark" : "Add bookmark"}
                    >
                      <Bookmark className={`h-5 w-5 ${isBookBookmarked(book.bookId) ? 'fill-yellow-400' : ''}`} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination Controls */}
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
          </>
        )}
      </div>
    </div>
  );
};

export default BooksPage;