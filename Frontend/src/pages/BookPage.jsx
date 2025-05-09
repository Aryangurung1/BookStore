// ✅ FILE: src/pages/BooksPage.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const BooksPage = () => {
  const { token } = useAuth();
  const [books, setBooks] = useState([]);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBooks();
  }, [query]);

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {books.map(book => (
          <div key={book.bookId} className="border rounded shadow p-4 bg-white">
            <h3 className="text-lg font-semibold mb-1">{book.title}</h3>
            <p className="text-sm text-gray-600">By {book.author}</p>
            <p className="text-sm">Format: {book.format}</p>
            <p className="text-sm">Price: ${book.price.toFixed(2)}</p>
            <p className="text-sm text-green-600 mt-1">{book.isOnSale ? 'On Sale 🎉' : ''}</p>
            <button className="mt-2 bg-blue-600 text-white px-3 py-1 rounded text-sm">View Details</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BooksPage;
