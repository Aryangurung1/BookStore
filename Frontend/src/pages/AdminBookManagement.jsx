import React, { useEffect, useState, Fragment } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import BookForm from '../components/BookForm';
import { Dialog, Transition } from '@headlessui/react';
import { Plus, Edit, Trash2, Eye, X, BookOpen, ChevronLeft, ChevronRight, Search, Filter } from 'lucide-react';
import Select from 'react-select';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

const placeholderImg = '/placeholder-book.jpg';

const Tooltip = ({ children, text }) => (
  <div className="relative group">
    {children}
    <span className="absolute z-20 left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg transition-opacity duration-200 opacity-90">
      {text}
    </span>
  </div>
);

const AdminBookManagement = () => {
  const { token } = useAuth();
  const [books, setBooks] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const booksPerPage = 9;

  // Filter states
  const [query, setQuery] = useState('');
  const [authors, setAuthors] = useState([]);
  const [genres, setGenres] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [formats, setFormats] = useState([]);
  const [publishers, setPublishers] = useState([]);
  // Multi-select state
  const [selectedAuthors, setSelectedAuthors] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [selectedFormats, setSelectedFormats] = useState([]);
  const [selectedPublishers, setSelectedPublishers] = useState([]);
  // Range state
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [ratingRange, setRatingRange] = useState([0, 5]);
  const [inStock, setInStock] = useState(false);
  const [inLibrary, setInLibrary] = useState(false);
  const [sortBy, setSortBy] = useState('title');
  const [sortDescending, setSortDescending] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isAwardWinner, setIsAwardWinner] = useState(false);
  const [isBestseller, setIsBestseller] = useState(false);
  const [newReleases, setNewReleases] = useState(false);
  const [newArrivals, setNewArrivals] = useState(false);
  const [comingSoon, setComingSoon] = useState(false);
  const [deals, setDeals] = useState(false);
  const [resetFilters, setResetFilters] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch filter options on mount
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [a, g, l, f, p] = await Promise.all([
          axios.get('http://localhost:5176/api/books/authors'),
          axios.get('http://localhost:5176/api/books/genres'),
          axios.get('http://localhost:5176/api/books/languages'),
          axios.get('http://localhost:5176/api/books/formats'),
          axios.get('http://localhost:5176/api/books/publishers'),
        ]);
        setAuthors(a.data);
        setGenres(g.data);
        setLanguages(l.data);
        setFormats(f.data);
        setPublishers(p.data);
      } catch (err) {
        // ignore
      }
    };
    fetchFilters();
  }, []);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page on search or filter
  }, [query, selectedAuthors, selectedGenres, selectedLanguages, selectedFormats, selectedPublishers, priceRange, ratingRange, inStock, inLibrary, sortBy, sortDescending]);

  useEffect(() => {
    fetchBooks();
  }, [query, currentPage, selectedAuthors, selectedGenres, selectedLanguages, selectedFormats, selectedPublishers, priceRange, ratingRange, inStock, inLibrary, sortBy, sortDescending, isAwardWinner, isBestseller, newReleases, newArrivals, comingSoon, deals]);

  useEffect(() => {
    if (resetFilters) {
      setQuery('');
      setPriceRange([0, 1000]);
      setRatingRange([0, 5]);
      setSelectedLanguages([]);
      setSelectedAuthors([]);
      setSelectedGenres([]);
      setSelectedFormats([]);
      setSelectedPublishers([]);
      setSortBy('title');
      setSortDescending(false);
      setCurrentPage(1);
      setIsAwardWinner(false);
      setIsBestseller(false);
      setNewReleases(false);
      setNewArrivals(false);
      setComingSoon(false);
      setDeals(false);
      setResetFilters(false);
      fetchBooks();
    }
  }, [resetFilters]);

  const fetchBooks = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const params = new URLSearchParams();
      params.append('search', query);
      params.append('minPrice', priceRange[0]);
      params.append('maxPrice', priceRange[1]);
      params.append('minRating', ratingRange[0]);
      params.append('sortBy', sortBy);
      params.append('sortDescending', sortDescending);
      params.append('page', currentPage);
      params.append('pageSize', booksPerPage);
      if (inStock) params.append('inStock', true);
      if (inLibrary) params.append('isAvailableInLibrary', true);
      if (isAwardWinner) params.append('isAwardWinner', true);
      if (isBestseller) params.append('isBestseller', true);
      if (newReleases) params.append('newReleases', true);
      if (newArrivals) params.append('newArrivals', true);
      if (comingSoon) params.append('comingSoon', true);
      if (deals) params.append('deals', true);
      if (selectedLanguages.length > 0) {
        selectedLanguages.forEach(lang => params.append('languages[]', lang));
      }
      if (selectedAuthors.length > 0) {
        selectedAuthors.forEach(author => params.append('authors[]', author));
      }
      if (selectedGenres.length > 0) {
        selectedGenres.forEach(genre => params.append('genres[]', genre));
      }
      if (selectedFormats.length > 0) {
        selectedFormats.forEach(format => params.append('formats[]', format));
      }
      if (selectedPublishers.length > 0) {
        selectedPublishers.forEach(publisher => params.append('publishers[]', publisher));
      }

      const res = await axios.get('http://localhost:5176/api/books', {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      setBooks(res.data);
      const totalCountHeader = parseInt(res.headers['x-total-count'] || '0');
      setTotalCount(totalCountHeader);
      setTotalPages(Math.max(1, Math.ceil(totalCountHeader / booksPerPage)));
    } catch (err) {
      setError('Failed to fetch books');
      console.error('Error fetching books:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBook = async (formData) => {
    try {
      await axios.post('http://localhost:5176/api/books', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      setSuccess('Book added successfully');
      fetchBooks();
      setShowAddModal(false);
    } catch (err) {
      setError('Failed to add book');
      console.error('Error adding book:', err);
    }
  };

  const handleUpdateBook = async (formData) => {
    try {
      await axios.put(`http://localhost:5176/api/books/${selectedBook.bookId}`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      setSuccess('Book updated successfully');
      fetchBooks();
      setShowEditModal(false);
      setSelectedBook(null);
    } catch (err) {
      setError('Failed to update book');
      console.error('Error updating book:', err);
    }
  };

  const handleDeleteBook = async () => {
    try {
      await axios.delete(`http://localhost:5176/api/books/${deleteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Book deleted successfully');
      fetchBooks();
      setShowDeleteModal(false);
      setDeleteId(null);
    } catch (err) {
      setError('Failed to delete book');
      console.error('Error deleting book:', err);
    }
  };

  // Calculate pagination
  const currentBooks = books;
  const realTotal = totalCount && totalCount > 0 ? totalCount : books.length;
  const pageCount = Math.max(1, Math.ceil(realTotal / booksPerPage));

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const isValidDate = (d) => d && !isNaN(new Date(d).getTime());

  useEffect(() => {
    if (books.length === 0 && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [books, currentPage]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/90 rounded-2xl shadow-2xl border border-gray-100 p-0 md:p-8 flex flex-col max-h-[90vh]">
          <div className="mb-8 flex items-center space-x-4">
            <div className="p-3 bg-indigo-100 rounded-xl">
              <BookOpen className="w-7 h-7 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Book Management</h2>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg animate-pulse">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg animate-pulse">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700 font-medium">{success}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center mb-6">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search books..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <Filter className="h-5 w-5 text-gray-500 mr-2" />
                Filters
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-gradient-to-r from-indigo-600 to-indigo-500 text-white px-4 py-2 rounded-lg hover:from-indigo-700 hover:to-indigo-600 flex items-center gap-2 shadow-md transition-all duration-200 hover:shadow-lg"
              >
                <Plus className="h-5 w-5" />
                Add New Book
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="mb-6 p-3 bg-white rounded-lg border border-gray-200 shadow-sm relative">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Authors</label>
                  <Select isMulti options={authors.map(a => ({ value: a, label: a }))} value={selectedAuthors.map(a => ({ value: a, label: a }))} onChange={selected => setSelectedAuthors(selected.map(s => s.value))} classNamePrefix="select" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Genres</label>
                  <Select isMulti options={genres.map(g => ({ value: g, label: g }))} value={selectedGenres.map(g => ({ value: g, label: g }))} onChange={selected => setSelectedGenres(selected.map(s => s.value))} classNamePrefix="select" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Languages</label>
                  <Select isMulti options={languages.map(l => ({ value: l, label: l }))} value={selectedLanguages.map(l => ({ value: l, label: l }))} onChange={selected => setSelectedLanguages(selected.map(s => s.value))} classNamePrefix="select" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Formats</label>
                  <Select isMulti options={formats.map(f => ({ value: f, label: f }))} value={selectedFormats.map(f => ({ value: f, label: f }))} onChange={selected => setSelectedFormats(selected.map(s => s.value))} classNamePrefix="select" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Publishers</label>
                  <Select isMulti options={publishers.map(p => ({ value: p, label: p }))} value={selectedPublishers.map(p => ({ value: p, label: p }))} onChange={selected => setSelectedPublishers(selected.map(s => s.value))} classNamePrefix="select" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Price Range</label>
                  <Slider range min={0} max={1000} value={priceRange} onChange={setPriceRange} marks={{0: '$0', 250: '$250', 500: '$500', 750: '$750', 1000: '$1000'}} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Rating Range</label>
                  <Slider range min={0} max={5} step={0.5} value={ratingRange} onChange={setRatingRange} marks={{0: '0', 1: '1', 2: '2', 3: '3', 4: '4', 5: '5'}} />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Sort By</label>
                  <div className="flex gap-2 items-center">
                    <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md">
                      <option value="title">Title</option>
                      <option value="price">Price</option>
                      <option value="date">Publication Date</option>
                      <option value="popularity">Popularity</option>
                    </select>
                    <label className="flex items-center text-xs font-medium">
                      <input type="checkbox" checked={sortDescending} onChange={e => setSortDescending(e.target.checked)} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
                      <span className="ml-1">Desc</span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="border-t my-3" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 items-center text-xs font-medium">
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  <label className="flex items-center"><input type="checkbox" checked={inStock} onChange={e => setInStock(e.target.checked)} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" /><span className="ml-2">In Stock</span></label>
                  <label className="flex items-center"><input type="checkbox" checked={inLibrary} onChange={e => setInLibrary(e.target.checked)} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" /><span className="ml-2">Available in Library</span></label>
                  <label className="flex items-center"><input type="checkbox" checked={isAwardWinner} onChange={e => setIsAwardWinner(e.target.checked)} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" /><span className="ml-2">Award Winners</span></label>
                  <label className="flex items-center"><input type="checkbox" checked={isBestseller} onChange={e => setIsBestseller(e.target.checked)} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" /><span className="ml-2">Bestsellers</span></label>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-2 md:justify-end items-center w-full">
                  <label className="flex items-center"><input type="checkbox" checked={newReleases} onChange={e => setNewReleases(e.target.checked)} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" /><span className="ml-2">New Releases</span></label>
                  <label className="flex items-center"><input type="checkbox" checked={newArrivals} onChange={e => setNewArrivals(e.target.checked)} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" /><span className="ml-2">New Arrivals</span></label>
                  <label className="flex items-center"><input type="checkbox" checked={comingSoon} onChange={e => setComingSoon(e.target.checked)} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" /><span className="ml-2">Coming Soon</span></label>
                  <label className="flex items-center"><input type="checkbox" checked={deals} onChange={e => setDeals(e.target.checked)} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" /><span className="ml-2">Deals</span></label>
                  <div className="flex-1" />
                  <button
                    onClick={() => { setResetFilters(true); setShowFilters(false); }}
                    className="ml-auto px-4 py-2 text-xs font-semibold text-white bg-indigo-600 border border-indigo-600 rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
                    style={{ minWidth: 110 }}
                  >
                    Reset Filters
                  </button>
                  <button
                    onClick={() => { fetchBooks(); setShowFilters(false); }}
                    className="ml-2 px-4 py-2 text-xs font-semibold text-indigo-600 bg-white border border-indigo-600 rounded hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
                    style={{ minWidth: 110 }}
                  >
                    Apply Filter
                  </button>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            </div>
          ) : books.length === 0 ? (
            <div className="bg-gray-50 rounded-lg border border-dashed border-gray-300 p-12 text-center">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No books found</h3>
              <p className="mt-1 text-gray-500">Get started by adding a new book.</p>
              <div className="mt-6">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Plus className="-ml-1 mr-2 h-5 w-5" />
                  Add Book
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 flex-1 min-h-0 overflow-y-auto">
                {currentBooks.map((book) => (
                  <div
                    key={book.bookId}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 p-4 group relative"
                  >
                    <div className="relative mb-4">
                      <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden">
                        <img
                          src={book.imageUrl ? `http://localhost:5176${book.imageUrl}` : placeholderImg}
                          alt={book.title}
                          className="object-contain h-full max-h-44 w-auto"
                          onError={e => { e.target.onerror = null; e.target.src = placeholderImg; }}
                        />
                      </div>
                      {book.isOnSale && (
                        <div className="absolute top-2 left-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
                          <span>Sale</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1 truncate">{book.title}</h3>
                      <p className="text-gray-600 text-sm mb-2 truncate">{book.author}</p>
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-bold text-indigo-700">${book.price?.toFixed(2)}</span>
                        <span className={`text-sm px-2 py-1 rounded-full ${book.stockQuantity > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {book.stockQuantity > 0 ? `${book.stockQuantity} in stock` : 'Out of stock'}
                        </span>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Tooltip text="View Details">
                          <button
                            onClick={() => { setSelectedBook(book); setShowViewModal(true); }}
                            className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                        </Tooltip>
                        <Tooltip text="Edit Book">
                          <button
                            onClick={() => { setSelectedBook(book); setShowEditModal(true); }}
                            className="p-2 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 rounded-full transition-colors"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                        </Tooltip>
                        <Tooltip text="Delete Book">
                          <button
                            onClick={() => { setDeleteId(book.bookId); setShowDeleteModal(true); }}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </Tooltip>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              <div className="mt-8 flex items-center justify-center space-x-2">
                {books.length === 0 ? (
                  <button className="px-4 py-2 rounded-lg bg-gray-200 text-gray-400 cursor-not-allowed" disabled>1</button>
                ) : pageCount === 1 ? (
                  <button className="px-4 py-2 rounded-lg bg-indigo-600 text-white">1</button>
                ) : (
                  <>
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`p-2 rounded-lg ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    {[...Array(pageCount)].map((_, index) => (
                      <button
                        key={index + 1}
                        onClick={() => handlePageChange(index + 1)}
                        className={`px-4 py-2 rounded-lg ${currentPage === index + 1 ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                      >
                        {index + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === pageCount}
                      className={`p-2 rounded-lg ${currentPage === pageCount ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
              </div>
            </>
          )}

          {/* Add Book Modal */}
          <Transition.Root show={showAddModal} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={setShowAddModal}>
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
              </Transition.Child>

              <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4 text-center">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0 scale-95"
                    enterTo="opacity-100 scale-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100 scale-100"
                    leaveTo="opacity-0 scale-95"
                  >
                    <Dialog.Panel className="relative transform overflow-hidden rounded-2xl bg-white p-8 text-left shadow-2xl border max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                      <div className="absolute top-0 right-0 pt-4 pr-4">
                        <button
                          type="button"
                          className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                          onClick={() => setShowAddModal(false)}
                        >
                          <span className="sr-only">Close</span>
                          <X className="h-6 w-6" aria-hidden="true" />
                        </button>
                      </div>
                      <div className="sm:flex sm:items-start">
                        <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                          <Plus className="h-6 w-6 text-indigo-600" aria-hidden="true" />
                        </div>
                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                          <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                            Add New Book
                          </Dialog.Title>
                          <div className="mt-2">
                            <BookForm onSubmit={handleAddBook} />
                          </div>
                        </div>
                      </div>
                    </Dialog.Panel>
                  </Transition.Child>
                </div>
              </div>
            </Dialog>
          </Transition.Root>

          {/* Edit Book Modal */}
          <Transition.Root show={showEditModal} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={() => setShowEditModal(false)}>
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
              </Transition.Child>

              <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4 text-center">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0 scale-95"
                    enterTo="opacity-100 scale-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100 scale-100"
                    leaveTo="opacity-0 scale-95"
                  >
                    <Dialog.Panel className="relative transform overflow-hidden rounded-2xl bg-white p-8 text-left shadow-2xl border max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                      <div className="absolute top-0 right-0 pt-4 pr-4">
                        <button
                          type="button"
                          className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                          onClick={() => setShowEditModal(false)}
                        >
                          <span className="sr-only">Close</span>
                          <X className="h-6 w-6" aria-hidden="true" />
                        </button>
                      </div>
                      <div className="sm:flex sm:items-start">
                        <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-yellow-100 sm:mx-0 sm:h-10 sm:w-10">
                          <Edit className="h-6 w-6 text-yellow-600" aria-hidden="true" />
                        </div>
                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                          <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                            Edit Book
                          </Dialog.Title>
                          <div className="mt-2">
                            <BookForm onSubmit={handleUpdateBook} initialData={selectedBook} isEdit={true} />
                          </div>
                        </div>
                      </div>
                    </Dialog.Panel>
                  </Transition.Child>
                </div>
              </div>
            </Dialog>
          </Transition.Root>

          {/* View Book Modal */}
          <Transition.Root show={showViewModal} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={() => setShowViewModal(false)}>
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
              </Transition.Child>

              <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4 text-center">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0 scale-95"
                    enterTo="opacity-100 scale-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100 scale-100"
                    leaveTo="opacity-0 scale-95"
                  >
                    <Dialog.Panel className="relative transform overflow-hidden rounded-2xl bg-white p-8 text-left shadow-2xl border max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                      <div className="absolute top-0 right-0 pt-4 pr-4">
                        <button
                          type="button"
                          className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                          onClick={() => setShowViewModal(false)}
                        >
                          <span className="sr-only">Close</span>
                          <X className="h-6 w-6" aria-hidden="true" />
                        </button>
                      </div>
                      <div className="sm:flex sm:items-start">
                        <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                          <Eye className="h-6 w-6 text-blue-600" aria-hidden="true" />
                        </div>
                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                          <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                            Book Details
                          </Dialog.Title>
                          <div className="mt-4">
                            {selectedBook && (
                              <div className="space-y-6">
                                <div className="flex gap-6">
                                  <div className="flex-shrink-0">
                                    <img
                                      src={selectedBook.imageUrl ? `http://localhost:5176${selectedBook.imageUrl}` : placeholderImg}
                                      alt={selectedBook.title}
                                      className="h-48 w-32 object-cover rounded-lg shadow-md"
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="text-xl font-bold text-gray-900">{selectedBook.title}</h4>
                                    <p className="text-gray-600">{selectedBook.author}</p>
                                    <div className="mt-2 flex items-center justify-between">
                                      <span className="text-2xl font-bold text-indigo-700">${selectedBook.price?.toFixed(2)}</span>
                                      {selectedBook.isOnSale && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                          On Sale
                                        </span>
                                      )}
                                    </div>
                                    <div className="mt-2">
                                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${selectedBook.stockQuantity > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {selectedBook.stockQuantity > 0 ? `${selectedBook.stockQuantity} in stock` : 'Out of stock'}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="border-t border-gray-200 pt-4">
                                  <h5 className="font-medium text-gray-900 mb-3">Details</h5>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-sm text-gray-500">ISBN</p>
                                      <p className="text-sm font-medium">{selectedBook.isbn || '-'}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-500">Genre</p>
                                      <p className="text-sm font-medium">{selectedBook.genre || '-'}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-500">Language</p>
                                      <p className="text-sm font-medium">{selectedBook.language || '-'}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-500">Format</p>
                                      <p className="text-sm font-medium">{selectedBook.format || '-'}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-500">Publisher</p>
                                      <p className="text-sm font-medium">{selectedBook.publisher || '-'}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-500">Publication Date</p>
                                      <p className="text-sm font-medium">
                                        {selectedBook.publicationDate ? new Date(selectedBook.publicationDate).toLocaleDateString() : '-'}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-500">Library Availability</p>
                                      <p className="text-sm font-medium">
                                        {selectedBook.isAvailableInLibrary ? 'Available' : 'Not Available'}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {selectedBook.isOnSale && (
                                  <div className="border-t border-gray-200 pt-4">
                                    <h5 className="font-medium text-gray-900 mb-3">Discount Information</h5>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <p className="text-sm text-gray-500">Discount Percentage</p>
                                        <p className="text-sm font-medium">{selectedBook.discountPercent}%</p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-gray-500">Discount Period</p>
                                        <p className="text-sm font-medium">
                                          {isValidDate(selectedBook.discountStart) && isValidDate(selectedBook.discountEnd)
                                            ? `${new Date(selectedBook.discountStart).toLocaleDateString()} - ${new Date(selectedBook.discountEnd).toLocaleDateString()}`
                                            : 'Not specified'}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                <div className="border-t border-gray-200 pt-4">
                                  <h5 className="font-medium text-gray-900 mb-3">Description</h5>
                                  <p className="text-sm text-gray-700 whitespace-pre-line">
                                    {selectedBook.description || 'No description available.'}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </Dialog.Panel>
                  </Transition.Child>
                </div>
              </div>
            </Dialog>
          </Transition.Root>

          {/* Delete Confirmation Modal */}
          <Transition.Root show={showDeleteModal} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={() => setShowDeleteModal(false)}>
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
              </Transition.Child>

              <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4 text-center">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0 scale-95"
                    enterTo="opacity-100 scale-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100 scale-100"
                    leaveTo="opacity-0 scale-95"
                  >
                    <Dialog.Panel className="relative transform overflow-hidden rounded-2xl bg-white p-8 text-left shadow-2xl border max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                      <div className="sm:flex sm:items-start">
                        <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                          <Trash2 className="h-6 w-6 text-red-600" aria-hidden="true" />
                        </div>
                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                          <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                            Delete Book
                          </Dialog.Title>
                          <div className="mt-2">
                            <p className="text-sm text-gray-500">
                              Are you sure you want to delete this book? This action cannot be undone.
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                        <button
                          type="button"
                          className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                          onClick={handleDeleteBook}
                        >
                          Delete
                        </button>
                        <button
                          type="button"
                          className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                          onClick={() => setShowDeleteModal(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </Dialog.Panel>
                  </Transition.Child>
                </div>
              </div>
            </Dialog>
          </Transition.Root>
        </div>
      </div>
    </div>
  );
};

export default AdminBookManagement; 