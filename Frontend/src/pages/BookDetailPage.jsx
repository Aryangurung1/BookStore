// ✅ FILE: src/pages/BookDetailPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const BookDetailPage = () => {
  const { id } = useParams();
  const { user, token } = useAuth();
  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState('');
  const [reviewInput, setReviewInput] = useState({ rating: 5, comment: '' });
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    fetchBook();
    fetchReviews();
    if (user?.role === 'Member') {
      checkBookmarkStatus();
    }
  }, [id, user]);

  const fetchBook = async () => {
    try {
      const res = await axios.get(`http://localhost:5176/api/books/${id}`);
      setBook(res.data);
    } catch (err) {
      setError('Failed to load book');
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`http://localhost:5176/api/Review/book/${id}`);
      setReviews(res.data);
    } catch (err) {
      setError('Failed to load reviews');
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      setError('Please login to add items to cart');
      return;
    }
    try {
      await axios.post('http://localhost:5176/api/Cart', {
        bookId: parseInt(id),
        quantity: 1
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Added to cart successfully!');
    } catch (err) {
      setError('Failed to add to cart');
    }
  };

  const handleBookmark = async () => {
    if (!user) {
      setError('Please login to bookmark');
      return;
    }
    try {
      if (isBookmarked) {
        await axios.delete(`http://localhost:5176/api/Bookmark/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsBookmarked(false);
      } else {
        await axios.post(`http://localhost:5176/api/Bookmark/${id}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsBookmarked(true);
      }
    } catch (err) {
      setError('Failed to update bookmark');
    }
  };

  const checkBookmarkStatus = async () => {
    try {
      const res = await axios.get('http://localhost:5176/api/Bookmark', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsBookmarked(res.data.some(b => b.bookId === parseInt(id)));
    } catch (err) {
      console.error('Failed to check bookmark status');
    }
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('Please login to add a review');
      return;
    }
    try {
      await axios.post('http://localhost:5176/api/Review', {
        bookId: parseInt(id),
        rating: reviewInput.rating,
        comment: reviewInput.comment
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReviewInput({ rating: 5, comment: '' });
      fetchReviews();
    } catch (err) {
      setError('Failed to add review');
    }
  };

  if (!book) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {error && <p className="text-red-500 mb-4">{error}</p>}
      
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-2xl font-bold mb-2">{book.title}</h2>
        <p className="text-gray-600 mb-2">Author: {book.author}</p>
        <p className="mb-2">Genre: {book.genre} | Format: {book.format} | Language: {book.language}</p>
        <p className="text-lg font-semibold text-indigo-600 mb-2">${book.price.toFixed(2)}</p>
        {book.isOnSale && <p className="text-green-600 font-semibold mb-2">On Sale 🎉</p>}
        <p className="text-gray-700 mb-4">{book.description}</p>

        <div className="flex space-x-4">
          <button
            onClick={handleAddToCart}
            disabled={!user}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
          >
            Add to Cart
          </button>
          <button
            onClick={handleBookmark}
            disabled={!user}
            className={`px-4 py-2 rounded border ${
              isBookmarked 
                ? 'bg-yellow-100 text-yellow-700 border-yellow-300' 
                : 'bg-white text-gray-700 border-gray-300'
            }`}
          >
            {isBookmarked ? '★ Bookmarked' : '☆ Bookmark'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4">📝 Reviews</h3>
        
        {user?.role === 'Member' && (
          <form onSubmit={handleAddReview} className="mb-6">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Rating</label>
              <select
                value={reviewInput.rating}
                onChange={(e) => setReviewInput(prev => ({ ...prev, rating: parseInt(e.target.value) }))}
                className="w-full border rounded px-3 py-2"
              >
                {[5, 4, 3, 2, 1].map(num => (
                  <option key={num} value={num}>{num} ⭐</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Comment</label>
              <textarea
                value={reviewInput.comment}
                onChange={(e) => setReviewInput(prev => ({ ...prev, comment: e.target.value }))}
                className="w-full border rounded px-3 py-2"
                rows="3"
                required
              />
            </div>
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              Add Review
            </button>
          </form>
        )}

        {reviews.length === 0 ? (
          <p className="text-gray-500">No reviews yet.</p>
        ) : (
          <ul className="space-y-4">
            {reviews.map((review, index) => (
              <li key={index} className="border rounded p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">Rating: {review.rating} ⭐</p>
                  <p className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                </div>
                <p className="text-gray-700">{review.comment}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default BookDetailPage;
