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
      const featured = res.data.filter(book => book.isOnSale);
      setFeaturedBooks(featured);
    } catch (err) {
      setError('Failed to load featured books');
    }
  };

  const categories = [
    { name: 'Fiction', icon: '📚' },
    { name: 'Non-Fiction', icon: '📖' },
    { name: 'Biography', icon: '👤' },
    { name: 'Science', icon: '🔬' },
    { name: 'History', icon: '⏳' },
    { name: 'Technology', icon: '💻' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-20 bg-indigo-600 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">BookHeaven</h1>
          <p className="text-xl mb-10 text-indigo-100">Discover your next favorite book</p>
          <Link
            to="/books"
            className="inline-block bg-white text-indigo-600 font-medium px-8 py-3 rounded-lg shadow hover:bg-opacity-90 transition-all"
          >
            Browse Books
          </Link>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-10 text-center">Browse Categories</h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <div
                key={cat.name}
                className="flex flex-col items-center p-4 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                <span className="text-3xl mb-3">{cat.icon}</span>
                <span className="text-sm font-medium text-gray-700">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Books Section */}
      {(!user || (user.role !== 'Admin' && user.role !== 'Staff')) && (
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-10 text-center">Featured Books</h2>
            {error && (
              <div className="max-w-md mx-auto mb-8 p-4 bg-red-50 rounded-lg text-center text-red-600">
                {error}
              </div>
            )}
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {featuredBooks.map((book) => (
                <Link to={`/book/${book.bookId}`} key={book.bookId} className="group">
                  <div className="bg-white rounded-lg overflow-hidden shadow transition-shadow hover:shadow-md h-full flex flex-col">
                    <div className="h-56 overflow-hidden">
                      <img
                        src={book.imageUrl ? `http://localhost:5176${book.imageUrl}` : 'https://via.placeholder.com/300x400'}
                        alt={book.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="font-medium text-gray-900 mb-1 line-clamp-1">{book.title}</h3>
                      <p className="text-gray-500 text-sm mb-3">{book.author}</p>
                      <div className="mt-auto flex items-center justify-between">
                        <span className="font-bold text-indigo-600">${book.price.toFixed(2)}</span>
                        {book.isOnSale && (
                          <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">Sale</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            
            {featuredBooks.length === 0 && !error && (
              <div className="text-center text-gray-500 py-12">
                No featured books available at the moment.
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;