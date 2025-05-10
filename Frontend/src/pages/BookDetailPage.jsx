// ✅ FILE: src/pages/BookDetailPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useBookmark } from '../context/BookmarkContext';
import { useToast } from '../context/ToastContext';
import { Star, ShoppingCart, Bookmark, Loader2, AlertCircle, BookOpen, Users, Calendar, Tag } from 'lucide-react';

const BookDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { addToCart, updateCartCount } = useCart();
  const { updateBookmarkCount } = useBookmark();
  const { addToast } = useToast();
  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState('');
  const [reviewInput, setReviewInput] = useState({ rating: 5, comment: '' });
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editInput, setEditInput] = useState({ rating: 5, comment: '' });
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [userReview, setUserReview] = useState({
    rating: 5,
    comment: ''
  });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    fetchBook();
    fetchReviews();
    if (user?.role === 'Member') {
      checkBookmarkStatus();
      checkCanReview();
    }
  }, [id, user]);

  const fetchBook = async () => {
    try {
      const res = await axios.get(`http://localhost:5176/api/books/${id}`);
      setBook(res.data);
    } catch (err) {
      setError('Failed to load book');
    } finally {
      setLoading(false);
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
      addToast('Please login to add items to cart', 'warning');
      navigate('/login');
      return;
    }

    try {
      await axios.post('http://localhost:5176/api/Cart', {
        bookId: parseInt(id),
        quantity: 1
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      updateCartCount();
      addToast('Book added to cart successfully', 'success');
    } catch (err) {
      console.error('Add to cart error:', err);
      addToast(err.response?.data?.message || 'Failed to add book to cart', 'error');
    }
  };

  const handleBookmark = async () => {
    if (!user) {
      addToast('Please login to bookmark books', 'warning');
      navigate('/login');
      return;
    }

    try {
      if (isBookmarked) {
        // Remove bookmark
        await axios.delete(`http://localhost:5176/api/Bookmark/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsBookmarked(false);
        addToast('Book removed from bookmarks', 'success');
      } else {
        // Add bookmark
        await axios.post(`http://localhost:5176/api/Bookmark/${id}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsBookmarked(true);
        addToast('Book added to bookmarks', 'success');
      }
      updateBookmarkCount();
    } catch (err) {
      console.error('Bookmark error:', err);
      addToast(err.response?.data?.message || 'Failed to update bookmark', 'error');
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

  const checkCanReview = async () => {
    try {
      const res = await axios.get(`http://localhost:5176/api/Review/can-review/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCanReview(res.data.canReview);
    } catch (err) {
      setCanReview(false);
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

  const handleEditClick = (review) => {
    setEditingReviewId(review.reviewId);
    setEditInput({ rating: review.rating, comment: review.comment });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditInput((prev) => ({ ...prev, [name]: name === 'rating' ? parseInt(value) : value }));
  };

  const handleEditSubmit = async (reviewId) => {
    try {
      await axios.put(`http://localhost:5176/api/Review/${reviewId}`, {
        rating: editInput.rating,
        comment: editInput.comment
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditingReviewId(null);
      fetchReviews();
    } catch (err) {
      setError('Failed to update review');
    }
  };

  const handleEditCancel = () => {
    setEditingReviewId(null);
    setEditInput({ rating: 5, comment: '' });
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      // Admin and member both can delete (admin: any, member: own)
      await axios.delete(`http://localhost:5176/api/Admin/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchReviews();
    } catch (err) {
      setError('Failed to delete review');
    }
  };

  // Find if the logged-in member has already reviewed this book
  const ownReview = user && user.role === 'Member' && reviews.find(r => String(r.memberId) === String(user.memberId));

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      addToast('Please login to submit a review', 'warning');
      navigate('/login');
      return;
    }

    setIsSubmittingReview(true);
    try {
      await axios.post(
        'http://localhost:5176/api/Review',
        {
          bookId: book.bookId,
          rating: userReview.rating,
          comment: userReview.comment
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      addToast('Review submitted successfully', 'success');
      setShowReviewForm(false);
      setUserReview({ rating: 5, comment: '' });
      fetchReviews();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to submit review', 'error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (!book) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
            {/* Book Image */}
            <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
              <img
                src={book.imageUrl ? `http://localhost:5176${book.imageUrl}` : '/placeholder-book.jpg'}
                alt={book.title}
                className="w-full h-full object-cover"
                onError={e => { e.target.onerror = null; e.target.src = '/placeholder-book.jpg'; }}
              />
              {book.isOnSale && (
                <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                  {book.discountPercent}% OFF
                </div>
              )}
            </div>
            {/* Book Details */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{book.title}</h1>
                <p className="text-xl text-gray-600">by {book.author}</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < Math.floor(book.averageRating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                  <span className="ml-2 text-gray-600">
                    ({book.averageRating?.toFixed(1) || 'No ratings'})
                  </span>
                </div>
                <span className="text-gray-400">|</span>
                <span className="text-gray-600">{reviews.length} reviews</span>
              </div>
              <div className="space-y-4">
                <div className="flex items-baseline space-x-4">
                  <span className="text-3xl font-bold text-indigo-600">
                    ${book.price.toFixed(2)}
                  </span>
                  {book.isOnSale && (
                    <span className="text-lg text-gray-500 line-through">
                      ${(book.price * (1 + book.discountPercent / 100)).toFixed(2)}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">ISBN:</span>
                    <span className="ml-2 text-gray-900">{book.isbn}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Genre:</span>
                    <span className="ml-2 text-gray-900">{book.genre}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Format:</span>
                    <span className="ml-2 text-gray-900">{book.format}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Language:</span>
                    <span className="ml-2 text-gray-900">{book.language}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Publisher:</span>
                    <span className="ml-2 text-gray-900">{book.publisher}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Published:</span>
                    <span className="ml-2 text-gray-900">{book.publicationDate ? new Date(book.publicationDate).toLocaleDateString() : '-'}</span>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed">{book.description}</p>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleAddToCart}
                    disabled={!user || !book.isAvailableInLibrary || book.stockQuantity <= 0}
                    className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span>
                      {!book.isAvailableInLibrary || book.stockQuantity <= 0 ? 'Not Available' : 'Add to Cart'}
                    </span>
                  </button>
                  <button
                    onClick={handleBookmark}
                    disabled={!user}
                    className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${isBookmarked ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-yellow-700' : ''}`} />
                    <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
                  </button>
                </div>
                {(!book.isAvailableInLibrary || book.stockQuantity <= 0) && (
                  <p className="text-sm text-red-600">
                    This book is currently out of stock
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Reviews Section */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>
          {user?.role === 'Member' && canReview && !ownReview && (
            <form onSubmit={handleReviewSubmit} className="mb-8 p-6 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setUserReview(prev => ({ ...prev, rating }))}
                        className={`p-2 rounded-full transition-colors ${userReview.rating === rating ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-400'}`}
                      >
                        <Star className="w-6 h-6" fill={userReview.rating >= rating ? 'currentColor' : 'none'} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Review</label>
                  <textarea
                    value={userReview.comment}
                    onChange={(e) => setUserReview(prev => ({ ...prev, comment: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    rows="4"
                    required
                    placeholder="Share your thoughts about this book..."
                  />
                </div>
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                >
                  Submit Review
                </button>
              </div>
            </form>
          )}
          {!canReview && user?.role === 'Member' && (
            <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700">
              You can only review books you have purchased and received.
            </div>
          )}
          <div className="space-y-6">
            {reviews.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review this book!</p>
            ) : (
              reviews.map((review) => {
                const isOwnReview = user && user.role === 'Member' &&
                  !!user.memberId && !!review.memberId &&
                  String(user.memberId) === String(review.memberId);
                const isEditing = editingReviewId === review.reviewId;
                return (
                  <div key={review.reviewId} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">{review.memberName}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                    </div>
                    {isEditing ? (
                      <form onSubmit={e => { e.preventDefault(); handleEditSubmit(review.reviewId); }} className="space-y-4 mt-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                          <div className="flex items-center space-x-2">
                            {[1, 2, 3, 4, 5].map((rating) => (
                              <button
                                key={rating}
                                type="button"
                                onClick={() => setEditInput(prev => ({ ...prev, rating }))}
                                className={`p-2 rounded-full transition-colors ${editInput.rating === rating ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-400'}`}
                              >
                                <Star className="w-6 h-6" fill={editInput.rating >= rating ? 'currentColor' : 'none'} />
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Your Review</label>
                          <textarea
                            name="comment"
                            value={editInput.comment}
                            onChange={e => setEditInput(prev => ({ ...prev, comment: e.target.value }))}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            rows="3"
                            required
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                          >
                            Save Changes
                          </button>
                          <button
                            type="button"
                            onClick={handleEditCancel}
                            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <p className="text-gray-700">{review.comment}</p>
                        {isOwnReview && (
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => handleEditClick(review)}
                              className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                            >
                              Edit
                            </button>
                          </div>
                        )}
                        {user?.role === 'Admin' && (
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => handleDeleteReview(review.reviewId)}
                              className="text-red-600 hover:text-red-700 text-sm font-medium"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetailPage;
