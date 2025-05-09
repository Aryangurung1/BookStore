import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchFeaturedBooks();
  }, []);

  const fetchFeaturedBooks = async () => {
    try {
      const res = await axios.get('http://localhost:5176/api/books');
      // Filter books that are on sale or have special tags
      const featured = res.data.filter(book => book.isOnSale);
      setFeaturedBooks(featured);
    } catch (err) {
      setError('Failed to load featured books');
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Welcome Section */}
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Welcome to BookHeaven</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Discover your next favorite book from our vast collection of titles.
          {!user && (
            <Link to="/register" className="text-indigo-600 hover:underline ml-2">
              Join us today!
            </Link>
          )}
        </p>
      </section>

      {/* Featured Books */}
      {(!user || (user.role !== 'Admin' && user.role !== 'Staff')) && (
        <section>
          <h2 className="text-2xl font-bold mb-6">🌟 Featured Books</h2>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredBooks.map((book) => (
              <div key={book.bookId} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <Link to={`/book/${book.bookId}`}>
                  <img
                    src={book.imageUrl ? `http://localhost:5176${book.imageUrl}` : 'https://via.placeholder.com/300x400'}
                    alt={book.title}
                    className="w-full h-48 object-cover"
                  />
                </Link>
                <div className="p-4">
                  <Link to={`/book/${book.bookId}`}>
                    <h3 className="font-semibold text-lg mb-1 hover:text-indigo-600">
                      {book.title}
                    </h3>
                  </Link>
                  <p className="text-gray-600 text-sm mb-2">{book.author}</p>
                  <p className="font-medium text-indigo-600 mb-2">
                    ${book.price.toFixed(2)}
                    {book.isOnSale && (
                      <span className="ml-2 text-green-600 text-sm">On Sale! 🎉</span>
                    )}
                  </p>
                  <Link
                    to={`/book/${book.bookId}`}
                    className="text-indigo-600 hover:text-indigo-800 text-sm"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
          {featuredBooks.length === 0 && !error && (
            <p className="text-center text-gray-500">No featured books at the moment.</p>
          )}
        </section>
      )}
    </div>
  );
};

export default Home;