// ✅ FILE: src/pages/BooksPage.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {books.map(book => (
          <div key={book.bookId} className="border rounded shadow p-4 bg-white flex flex-col items-center">
            <img
              src={book.imageUrl ? `http://localhost:5176${book.imageUrl}` : placeholderImg}
              alt={book.title}
              className="object-contain h-40 w-full mb-2 rounded"
              onError={e => { e.target.onerror = null; e.target.src = placeholderImg; }}
            />
            <h3 className="text-lg font-semibold mb-1">{book.title}</h3>
            <button
              className={`mb-2 ${isBookBookmarked(book.bookId) ? 'text-yellow-500' : 'text-gray-400'} hover:text-yellow-600`}
              title={isBookBookmarked(book.bookId) ? 'Remove Bookmark' : 'Bookmark'}
              onClick={() => handleToggleBookmark(book.bookId)}
            >
              {isBookBookmarked(book.bookId) ? <Star fill="currentColor" /> : <StarOff />}
            </button>
            <div className="flex gap-2 mt-2">
              <button
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                onClick={() => handleViewBook(book)}
              >
                View
              </button>
              <button
                className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700"
                onClick={() => handleAddToCart(book.bookId)}
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* View Book Modal */}
      {showViewModal && selectedBook && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold">{selectedBook.title}</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-600 hover:text-gray-800"
              >
                Close
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-64 overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center">
                <img
                  src={selectedBook.imageUrl ? `http://localhost:5176${selectedBook.imageUrl}` : placeholderImg}
                  alt={selectedBook.title}
                  className="w-full h-full object-contain"
                  onError={e => { e.target.onerror = null; e.target.src = placeholderImg; }}
                />
                <button
                  className={`mt-4 ${isBookBookmarked(selectedBook.bookId) ? 'text-yellow-500' : 'text-gray-400'} hover:text-yellow-600`}
                  title={isBookBookmarked(selectedBook.bookId) ? 'Remove Bookmark' : 'Bookmark'}
                  onClick={() => handleToggleBookmark(selectedBook.bookId)}
                >
                  {isBookBookmarked(selectedBook.bookId) ? <Star fill="currentColor" /> : <StarOff />}
                </button>
              </div>
              <div className="space-y-3">
                <div><h3 className="font-semibold">Author</h3><p>{selectedBook.author}</p></div>
                <div><h3 className="font-semibold">ISBN</h3><p>{selectedBook.isbn}</p></div>
                <div><h3 className="font-semibold">Description</h3><p>{selectedBook.description}</p></div>
                <div><h3 className="font-semibold">Genre</h3><p>{selectedBook.genre}</p></div>
                <div><h3 className="font-semibold">Language</h3><p>{selectedBook.language}</p></div>
                <div><h3 className="font-semibold">Format</h3><p>{selectedBook.format}</p></div>
                <div><h3 className="font-semibold">Publisher</h3><p>{selectedBook.publisher}</p></div>
                <div><h3 className="font-semibold">Price</h3><p>${selectedBook.price?.toFixed(2)}</p></div>
                <div><h3 className="font-semibold">Publication Date</h3><p>{selectedBook.publicationDate ? new Date(selectedBook.publicationDate).toLocaleDateString() : '-'}</p></div>
                <div><h3 className="font-semibold">Available in Library</h3><p>{selectedBook.isAvailableInLibrary ? 'Yes' : 'No'}</p></div>
                <div><h3 className="font-semibold">Discount Percent</h3><p>{selectedBook.discountPercent ?? selectedBook.DiscountPercent ?? 0}%</p></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BooksPage;
