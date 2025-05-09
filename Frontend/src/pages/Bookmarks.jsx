import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Star, ShoppingCart, Eye } from 'lucide-react';

const placeholderImg = '/placeholder-book.jpg';

const Bookmarks = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
      setError('Failed to load bookmarks');
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
      setSuccess('Bookmark removed successfully');
    } catch (err) {
      setError('Failed to remove bookmark');
    }
  };

  const handleAddToCart = async (bookId) => {
    if (!user || user.role !== 'Member') {
      navigate('/login', { state: { from: '/bookmarks' } });
      return;
    }
    try {
      setError('');
      setSuccess('');
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

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">⭐ Your Bookmarks</h2>
        <Link to="/books" className="text-indigo-600 hover:text-indigo-800">
          Browse More Books
        </Link>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-600 mb-4">{success}</p>}

      {bookmarks.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 mb-4">You haven't bookmarked any books yet</p>
          <Link to="/books" className="text-indigo-600 hover:text-indigo-800">
            Start Browsing Books
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookmarks.map((book) => (
            <div key={book.bookId} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="relative">
                <img
                  src={book.imageUrl ? `http://localhost:5176${book.imageUrl}` : placeholderImg}
                  alt={book.title}
                  className="w-full h-48 object-cover"
                  onError={e => { e.target.onerror = null; e.target.src = placeholderImg; }}
                />
                <button
                  onClick={() => handleRemoveBookmark(book.bookId)}
                  className="absolute top-2 right-2 p-2 bg-white rounded-full shadow hover:bg-gray-100"
                  title="Remove Bookmark"
                >
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                </button>
              </div>
              <div className="p-4">
                <Link to={`/book/${book.bookId}`}>
                  <h3 className="font-semibold text-lg mb-1 hover:text-indigo-600">
                    {book.title}
                  </h3>
                </Link>
                <p className="text-gray-600 text-sm mb-2">{book.author}</p>
                <div className="flex justify-between items-center mb-4">
                  <p className="font-medium text-indigo-600">
                    ${book.price?.toFixed(2)}
                    {book.discountPercent > 0 && (
                      <span className="ml-2 text-green-600 text-sm">
                        {book.discountPercent}% off
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    to={`/book/${book.bookId}`}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </Link>
                  <button
                    onClick={() => handleAddToCart(book.bookId)}
                    className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Bookmarks;
