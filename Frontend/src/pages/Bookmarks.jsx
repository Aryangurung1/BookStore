import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Bookmarks = () => {
  const { token } = useAuth();
  const [bookmarks, setBookmarks] = useState([]);
  const [error, setError] = useState('');
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
      fetchBookmarks();
    } catch (err) {
      setError('Failed to remove bookmark');
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">⭐ Your Bookmarks</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {bookmarks.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">You haven't bookmarked any books yet</p>
          <Link to="/" className="text-indigo-600 hover:underline">
            Browse Books
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookmarks.map((bookmark) => (
            <div key={bookmark.bookId} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <Link to={`/book/${bookmark.bookId}`}>
                <img
                  src={bookmark.imageUrl || 'https://via.placeholder.com/300x400'}
                  alt={bookmark.title}
                  className="w-full h-48 object-cover"
                />
              </Link>
              <div className="p-4">
                <Link to={`/book/${bookmark.bookId}`}>
                  <h3 className="font-semibold text-lg mb-1 hover:text-indigo-600">
                    {bookmark.title}
                  </h3>
                </Link>
                <p className="text-gray-600 text-sm mb-2">{bookmark.author}</p>
                <p className="font-medium text-indigo-600 mb-3">
                  ${bookmark.price.toFixed(2)}
                  {bookmark.isOnSale && (
                    <span className="ml-2 text-green-600 text-sm">On Sale</span>
                  )}
                </p>
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => handleRemoveBookmark(bookmark.bookId)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove Bookmark
                  </button>
                  <Link
                    to={`/book/${bookmark.bookId}`}
                    className="text-indigo-600 hover:text-indigo-800 text-sm"
                  >
                    View Details →
                  </Link>
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
