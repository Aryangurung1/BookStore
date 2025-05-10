import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Search, Filter, ChevronDown, Eye, X, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const placeholderImg = '/placeholder-book.jpg';

const StaffBooks = () => {
  const [books, setBooks] = useState([]);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedAuthor, setSelectedAuthor] = useState('All');
  const [inStock, setInStock] = useState(false);
  const [inLibrary, setInLibrary] = useState(false);
  const [sortBy, setSortBy] = useState('title');

  useEffect(() => {
    fetchBooks();
    // eslint-disable-next-line
  }, [query]);

  const fetchBooks = async () => {
    try {
      const res = await axios.get(`http://localhost:5176/api/books?search=${query}`);
      setBooks(res.data);
    } catch (err) {
      setError('Failed to load books');
    }
  };

  const handleViewBook = (book) => {
    setSelectedBook(book);
    setShowViewModal(true);
  };

  // Get unique genres and authors for filters
  const genres = ['All', ...new Set(books.map(book => book.genre))].filter(Boolean);
  const authors = ['All', ...new Set(books.map(book => book.author))].filter(Boolean);

  // Filter and sort books
  const filteredBooks = books
    .filter(book => {
      const matchesGenre = selectedGenre === 'All' || book.genre === selectedGenre;
      const matchesAuthor = selectedAuthor === 'All' || book.author === selectedAuthor;
      const matchesStock = !inStock || book.stockQuantity > 0;
      const matchesLibrary = !inLibrary || book.isAvailableInLibrary;
      return matchesGenre && matchesAuthor && matchesStock && matchesLibrary;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'date':
          return new Date(b.publicationDate) - new Date(a.publicationDate);
        case 'price':
          return b.price - a.price;
        case 'stock':
          return b.stockQuantity - a.stockQuantity;
        default:
          return 0;
      }
    });

  const resetFilters = () => {
    setSelectedGenre('All');
    setSelectedAuthor('All');
    setInStock(false);
    setInLibrary(false);
    setSortBy('title');
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-4 md:pt-8 px-10 max-w-7xl mx-auto">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
      >
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Book Catalog</h2>
          <p className="text-gray-600">Manage and view all books in the system</p>
        </div>
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search books by title, ISBN, or description..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-all duration-200"
          />
        </div>
      </motion.div>

      {/* Filters Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-all duration-200"
          >
            <Filter className="h-4 w-4" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
          </button>
          {showFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-200 transition-all duration-200"
            >
              <RefreshCw className="h-4 w-4" />
              Reset Filters
            </button>
          )}
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 bg-white rounded-lg shadow-lg p-6 overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Author</label>
                  <select
                    value={selectedAuthor}
                    onChange={(e) => setSelectedAuthor(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  >
                    {authors.map(author => (
                      <option key={author} value={author}>{author}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Genre</label>
                  <select
                    value={selectedGenre}
                    onChange={(e) => setSelectedGenre(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  >
                    {genres.map(genre => (
                      <option key={genre} value={genre}>{genre}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  >
                    <option value="title">Title</option>
                    <option value="date">Publication Date</option>
                    <option value="price">Price</option>
                    <option value="stock">Stock Quantity</option>
                  </select>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="inStock"
                      checked={inStock}
                      onChange={e => setInStock(e.target.checked)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="inStock" className="text-sm font-medium text-gray-700">
                      In Stock Only
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="inLibrary"
                      checked={inLibrary}
                      onChange={e => setInLibrary(e.target.checked)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="inLibrary" className="text-sm font-medium text-gray-700">
                      Available in Library
                    </label>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Books Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredBooks.map(book => (
          <motion.div
            key={book.bookId}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
          >
            <div className="aspect-[3/4] relative">
              <img
                src={book.imageUrl ? `http://localhost:5176${book.imageUrl}` : placeholderImg}
                alt={book.title}
                className="w-full h-full object-cover"
                onError={e => { e.target.onerror = null; e.target.src = placeholderImg; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-end justify-center p-4">
                <button
                  onClick={() => handleViewBook(book)}
                  className="bg-white text-gray-900 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-100 transition-colors duration-200"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{book.title}</h3>
              <p className="text-sm text-gray-600 mb-2 line-clamp-1">{book.author}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">${book.price?.toFixed(2)}</span>
                <span className={`text-sm px-2 py-1 rounded-full ${
                  book.stockQuantity > 0 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {book.stockQuantity} in stock
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* View Book Modal */}
      {showViewModal && selectedBook && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-gray-900">{selectedBook.title}</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="aspect-[3/4] overflow-hidden rounded-lg bg-gray-100">
                <img
                  src={selectedBook.imageUrl ? `http://localhost:5176${selectedBook.imageUrl}` : placeholderImg}
                  alt={selectedBook.title}
                  className="w-full h-full object-contain"
                  onError={e => { e.target.onerror = null; e.target.src = placeholderImg; }}
                />
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Author</h3>
                    <p className="mt-1 text-gray-900">{selectedBook.author}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">ISBN</h3>
                    <p className="mt-1 text-gray-900">{selectedBook.isbn}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Genre</h3>
                    <p className="mt-1 text-gray-900">{selectedBook.genre}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Language</h3>
                    <p className="mt-1 text-gray-900">{selectedBook.language}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Format</h3>
                    <p className="mt-1 text-gray-900">{selectedBook.format}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Publisher</h3>
                    <p className="mt-1 text-gray-900">{selectedBook.publisher}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Price</h3>
                    <p className="mt-1 text-gray-900">${selectedBook.price?.toFixed(2)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Stock</h3>
                    <p className="mt-1 text-gray-900">{selectedBook.stockQuantity} units</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Description</h3>
                  <p className="mt-1 text-gray-900">{selectedBook.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Publication Date</h3>
                    <p className="mt-1 text-gray-900">
                      {selectedBook.publicationDate ? new Date(selectedBook.publicationDate).toLocaleDateString() : '-'}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Library Available</h3>
                    <p className="mt-1 text-gray-900">{selectedBook.isAvailableInLibrary ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default StaffBooks; 