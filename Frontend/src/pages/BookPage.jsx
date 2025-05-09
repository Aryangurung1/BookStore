// ✅ FILE: src/pages/BooksPage.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Star, StarOff } from 'lucide-react';

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
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchBooks();
    if (user && user.role === 'Member') fetchBookmarks();
  }, [query, user]);

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
      const res = await axios.get(`http://localhost:5176/api/books?search=${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBooks(res.data);
    } catch (err) {
      setError('Failed to load books');
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
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search books by title, ISBN, or description..."
        className="w-full mb-4 p-2 border rounded"
      />
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-600 mb-4">{success}</p>}

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
    </div>
  );
};

export default BooksPage;
