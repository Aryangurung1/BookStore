import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useBookmark } from '../context/BookmarkContext';
import { useToast } from '../context/ToastContext';
import { Bookmark, ShoppingCart, Eye, Loader2, AlertCircle, CheckCircle2, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const placeholderImg = '/placeholder-book.jpg';

const Bookmarks = () => {
  const { token, user } = useAuth();
  const { updateBookmarkCount } = useBookmark();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      const res = await axios.get('http://localhost:5176/api/Bookmark', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookmarks(res.data);
    } catch (err) {
      console.error('Failed to fetch bookmarks:', err);
      addToast('Failed to load bookmarks', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBookmark = async (bookId) => {
    try {
      await axios.delete(`http://localhost:5176/api/Bookmark/${bookId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookmarks(prev => prev.filter(book => book.bookId !== bookId));
      await updateBookmarkCount();
      addToast('Bookmark removed successfully', 'success');
    } catch (err) {
      console.error('Failed to remove bookmark:', err);
      addToast('Failed to remove bookmark', 'error');
    }
  };

  const handleAddToCart = async (bookId) => {
    if (!user || user.role !== 'Member') {
      addToast('Please login as a member to add books to cart', 'warning');
      navigate('/login', { state: { from: '/bookmarks' } });
      return;
    }
    try {
      await axios.post('http://localhost:5176/api/Cart', {
        bookId,
        quantity: 1
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      addToast('Book added to cart successfully', 'success');
    } catch (err) {
      console.error('Failed to add to cart:', err);
      addToast('Failed to add book to cart', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-gray-600">Loading your bookmarks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Bookmark className="w-8 h-8 text-indigo-600" />
            Your Bookmarks
          </h1>
          {bookmarks.length > 0 && (
            <span className="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full text-sm font-medium">
              {bookmarks.length} {bookmarks.length === 1 ? 'book' : 'books'}
            </span>
          )}
        </div>

        {bookmarks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center"
          >
            <div className="max-w-md mx-auto">
              <Bookmark className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookmarks yet</h3>
              <p className="text-gray-500 mb-6">Start saving your favorite books to read them later.</p>
              <button
                onClick={() => navigate('/books')}
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
              >
                Browse Books
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {bookmarks.map((book, index) => (
                <motion.div
                  key={book.bookId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
                >
                  <div className="relative">
                    <img
                      src={book.imageUrl ? `http://localhost:5176${book.imageUrl}` : placeholderImg}
                      alt={book.title}
                      className="w-full h-48 object-cover"
                      onError={e => { e.target.onerror = null; e.target.src = placeholderImg; }}
                    />
                    <button
                      onClick={() => handleRemoveBookmark(book.bookId)}
                      className="absolute top-2 right-2 p-2 bg-white rounded-full shadow hover:bg-gray-100 transition-colors"
                      title="Remove Bookmark"
                    >
                      <Bookmark className="w-5 h-5 text-yellow-500 fill-current" />
                    </button>
                    {book.discountPercent > 0 && (
                      <div className="absolute top-2 left-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {book.discountPercent}% OFF
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <Link to={`/book/${book.bookId}`}>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1 hover:text-indigo-600 transition-colors">
                        {book.title}
                      </h3>
                    </Link>
                    <p className="text-gray-600 text-sm mb-3">By {book.author}</p>

                    <div className="flex justify-between items-center mb-4">
                      <div>
                        {book.discountPercent > 0 ? (
                          <>
                            <span className="text-sm text-gray-500 line-through">${book.price?.toFixed(2)}</span>
                            <span className="ml-2 font-semibold text-green-700">
                              ${(book.price * (1 - book.discountPercent / 100)).toFixed(2)}
                            </span>
                          </>
                        ) : (
                          <span className="font-semibold text-gray-900">${book.price?.toFixed(2)}</span>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">
                        {book.stockQuantity > 0 ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <Link
                        to={`/book/${book.bookId}`}
                        className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </Link>
                      <button
                        onClick={() => handleAddToCart(book.bookId)}
                        disabled={!book.isAvailableInLibrary || book.stockQuantity <= 0}
                        className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookmarks;
