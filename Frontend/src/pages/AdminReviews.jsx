import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const AdminReviews = () => {
  const { token } = useAuth();
  const [books, setBooks] = useState([]);
  const [selectedBookId, setSelectedBookId] = useState('');
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const res = await axios.get('http://localhost:5176/api/books', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBooks(res.data);
    } catch (err) {
      setError('Failed to load books');
    }
  };

  const fetchReviews = async (bookId) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await axios.get(`http://localhost:5176/api/Review/book/${bookId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReviews(res.data);
    } catch (err) {
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleBookChange = (e) => {
    setSelectedBookId(e.target.value);
    if (e.target.value) {
      fetchReviews(e.target.value);
    } else {
      setReviews([]);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await axios.delete(`http://localhost:5176/api/Admin/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Review deleted successfully');
      fetchReviews(selectedBookId);
    } catch (err) {
      setError('Failed to delete review');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">📝 Manage Book Reviews</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-600 mb-4">{success}</p>}
      <div className="mb-6">
        <label className="block mb-2 font-medium">Select Book:</label>
        <select
          value={selectedBookId}
          onChange={handleBookChange}
          className="w-full border rounded px-3 py-2"
        >
          <option value="">-- Select a Book --</option>
          {books.map((book) => (
            <option key={book.bookId} value={book.bookId}>
              {book.title} by {book.author}
            </option>
          ))}
        </select>
      </div>
      {loading ? (
        <div>Loading reviews...</div>
      ) : (
        <ul className="space-y-4">
          {reviews.map((review) => (
            <li key={review.reviewId} className="border rounded p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-medium">Rating: {review.rating} ⭐</p>
                  <p className="text-sm text-gray-500">By {review.memberName}</p>
                </div>
                <p className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
              </div>
              <p className="text-gray-700 mb-2">{review.comment}</p>
              <button
                onClick={() => handleDeleteReview(review.reviewId)}
                className="text-red-600 hover:underline text-sm"
              >
                Delete
              </button>
            </li>
          ))}
          {reviews.length === 0 && selectedBookId && (
            <li className="text-gray-500">No reviews for this book.</li>
          )}
        </ul>
      )}
    </div>
  );
};

export default AdminReviews; 