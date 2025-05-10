// ✅ FILE: src/pages/BooksPage.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Star, StarOff } from 'lucide-react';
import Select from 'react-select';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

const placeholderImg = '/placeholder-book.jpg';

const BooksPage = () => {
  const { user, token, logout } = useAuth();
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
    if (user && user.role === 'Member') fetchBookmarks();
  }, [query, currentPage, user, selectedAuthors, selectedGenres, selectedLanguages, selectedFormats, selectedPublishers, priceRange, ratingRange, inStock, inLibrary, sortBy, sortDescending]);

  const fetchBookmarks = async () => {
    try {
      const res = await axios.get('http://localhost:5176/api/Bookmark', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookmarks(res.data.map(b => b.bookId));
    } catch (err) {
      console.error('Failed to fetch bookmarks:', err);
      setError('Failed to load bookmarks. Please try again later.');
    }
  };

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const params = {
        search: query,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        minRating: ratingRange[0],
        inStock: inStock ? true : undefined,
        isAvailableInLibrary: inLibrary ? true : undefined,
        sortBy,
        sortDescending,
        page: currentPage,
        pageSize: 9
      };
      if (selectedAuthors.length > 0) params.authors = selectedAuthors.map(a => a.value);
      if (selectedGenres.length > 0) params.genres = selectedGenres.map(g => g.value);
      if (selectedLanguages.length > 0) params.languages = selectedLanguages.map(l => l.value);
      if (selectedFormats.length > 0) params.formats = selectedFormats.map(f => f.value);
      if (selectedPublishers.length > 0) params.publishers = selectedPublishers.map(p => p.value);

      const res = await axios.get(`http://localhost:5176/api/books`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      setBooks(res.data);
      const totalCount = parseInt(res.headers['x-total-count'] || '0');
      setTotalPages(Math.max(1, Math.ceil(totalCount / 9)));
    } catch (err) {
      setError('Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  const isBookBookmarked = (bookId) => bookmarks.includes(bookId);

  const handleToggleBookmark = async (bookId) => {
    if (!user || user.role !== 'Member') {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    try {
      setError('');
      setSuccess('');
      if (isBookBookmarked(bookId)) {
        await axios.delete(`http://localhost:5176/api/Bookmark/${bookId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBookmarks(prev => prev.filter(id => id !== bookId));
        setSuccess('Bookmark removed successfully!');
      } else {
        await axios.post(`http://localhost:5176/api/Bookmark/${bookId}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBookmarks(prev => [...prev, bookId]);
        setSuccess('Book bookmarked successfully!');
      }
    } catch (err) {
      console.error('Bookmark error:', err);
      setError(err.response?.data?.message || 'Failed to update bookmark');
      if (err.response?.status === 401) {
        logout();
        navigate('/login', { state: { from: location.pathname } });
      }
    }
  };

  const handleAddToCart = async (bookId) => {
    setError('');
    setSuccess('');
    if (!user || user.role !== 'Member') {
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
      setSuccess('Added to cart successfully!');
    } catch (err) {
      setError('Failed to add to cart');
    }
  };

  const handleViewBook = (book) => {
    setSelectedBook(book);
    setShowViewModal(true);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-xl font-bold mb-4">📚 Book Catalog</h2>
      <div className="mb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search books by title, ISBN, or description..."
          className="w-full p-2 border rounded"
        />
        <Select
          isMulti
          options={authors.map(a => ({ value: a, label: a }))}
          value={selectedAuthors}
          onChange={setSelectedAuthors}
          placeholder="Authors"
          className="w-full"
        />
        <Select
          isMulti
          options={genres.map(g => ({ value: g, label: g }))}
          value={selectedGenres}
          onChange={setSelectedGenres}
          placeholder="Genres"
          className="w-full"
        />
        <Select
          isMulti
          options={languages.map(l => ({ value: l, label: l }))}
          value={selectedLanguages}
          onChange={setSelectedLanguages}
          placeholder="Languages"
          className="w-full"
        />
        <Select
          isMulti
          options={formats.map(f => ({ value: f, label: f }))}
          value={selectedFormats}
          onChange={setSelectedFormats}
          placeholder="Formats"
          className="w-full"
        />
        <Select
          isMulti
          options={publishers.map(p => ({ value: p, label: p }))}
          value={selectedPublishers}
          onChange={setSelectedPublishers}
          placeholder="Publishers"
          className="w-full"
        />
        <div className="flex flex-col">
          <span className="mb-1">Price Range (${priceRange[0]} - ${priceRange[1]})</span>
          <Slider
            range
            min={0}
            max={1000}
            step={1}
            value={priceRange}
            onChange={setPriceRange}
            allowCross={false}
          />
        </div>
        <div className="flex flex-col">
          <span className="mb-1">Min Rating ({ratingRange[0]} - {ratingRange[1]})</span>
          <Slider
            range
            min={0}
            max={5}
            step={0.1}
            value={ratingRange}
            onChange={setRatingRange}
            allowCross={false}
          />
        </div>
        <label className="flex items-center space-x-2">
          <input type="checkbox" checked={inStock} onChange={e => setInStock(e.target.checked)} />
          <span>In Stock Only</span>
        </label>
        <label className="flex items-center space-x-2">
          <input type="checkbox" checked={inLibrary} onChange={e => setInLibrary(e.target.checked)} />
          <span>Available in Library</span>
        </label>
        <select className="w-full p-2 border rounded" value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="title">Sort by Title</option>
          <option value="date">Sort by Publication Date</option>
          <option value="price">Sort by Price</option>
          <option value="popularity">Sort by Popularity</option>
        </select>
        <label className="flex items-center space-x-2">
          <input type="checkbox" checked={sortDescending} onChange={e => setSortDescending(e.target.checked)} />
          <span>Descending</span>
        </label>
      </div>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-600 mb-4">{success}</p>}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <>
          {books.length === 0 ? (
            <div className="text-center text-gray-500 py-12 text-lg">No books found.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {books.map(book => (
                <div key={book.bookId} className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col group">
                  <Link
                    to={`/book/${book.bookId}`}
                    className="flex-1 flex flex-col cursor-pointer"
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <img
                      src={book.imageUrl ? `http://localhost:5176${book.imageUrl}` : placeholderImg}
                      alt={book.title}
                      className="w-full h-56 object-cover group-hover:opacity-80 transition"
                      onError={e => { e.target.onerror = null; e.target.src = placeholderImg; }}
                    />
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="font-semibold text-lg mb-1 truncate">{book.title}</h3>
                      <p className="text-gray-600 text-sm mb-1 truncate">{book.author}</p>
                      <p className="font-medium text-indigo-600 mb-2">
                        ${book.price?.toFixed(2)}
                        {book.isOnSale && (
                          <span className="ml-2 text-green-600 text-sm">On Sale! 🎉</span>
                        )}
                      </p>
                      {(!book.isAvailableInLibrary || book.stockQuantity <= 0) && (
                        <p className="text-red-600 text-sm mb-2">Not Available</p>
                      )}
                    </div>
                  </Link>
                  <div className="flex gap-2 p-4 pt-0">
                    <button
                      onClick={() => handleAddToCart(book.bookId)}
                      disabled={!user || !book.isAvailableInLibrary || book.stockQuantity <= 0}
                      className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add to Cart
                    </button>
                    <button
                      onClick={() => handleToggleBookmark(book.bookId)}
                      className={`flex-1 px-4 py-2 rounded border ${
                        isBookBookmarked(book.bookId)
                          ? 'bg-yellow-100 text-yellow-700 border-yellow-300'
                          : 'bg-white text-gray-700 border-gray-300'
                      }`}
                    >
                      {isBookBookmarked(book.bookId) ? '★' : '☆'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && books.length > 0 && (
            <div className="mt-8 flex justify-center items-center space-x-4">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={currentPage === totalPages || books.length < 9}
                className="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BooksPage;
