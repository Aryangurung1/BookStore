import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BookForm from './BookForm';

const placeholderImg = '/placeholder-book.jpg';

const BookList = () => {
  const [books, setBooks] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  const fetchBooks = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/books');
      setBooks(response.data);
    } catch (error) {
      setError('Failed to fetch books');
      console.error('Error fetching books:', error);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleAddBook = async (formData) => {
    try {
      await axios.post('http://localhost:5000/api/books', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setShowAddModal(false);
      fetchBooks();
    } catch (error) {
      setError('Failed to add book');
      console.error('Error adding book:', error);
    }
  };

  const handleEditBook = async (formData) => {
    try {
      await axios.put(`http://localhost:5000/api/books/${selectedBook.bookId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setShowEditModal(false);
      fetchBooks();
    } catch (error) {
      setError('Failed to update book');
      console.error('Error updating book:', error);
    }
  };

  const handleDeleteBook = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/books/${deleteId}`);
      setShowDeleteModal(false);
      setDeleteId(null);
      fetchBooks();
    } catch (error) {
      setError('Failed to delete book');
      console.error('Error deleting book:', error);
    }
  };

  const openDeleteModal = (bookId) => {
    setDeleteId(bookId);
    setShowDeleteModal(true);
  };

  const handleViewBook = (book) => {
    setSelectedBook(book);
    setShowViewModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/90 rounded-2xl shadow-2xl border border-gray-100 p-0 md:p-8">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-indigo-100 rounded-xl">
                <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Books</h1>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              Add Book
            </button>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {books.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v16m8-8H4" />
                </svg>
                <p className="text-gray-500 text-lg">No books found.</p>
              </div>
            )}
            {books.map((book) => (
              <div key={book.bookId} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 flex flex-col group relative">
                {book.isOnSale && (
                  <div className="flex items-center gap-2 px-4 pt-4">
                    <span className="inline-block w-3 h-3 rounded-full bg-green-500"></span>
                    <span className="text-green-700 font-semibold">On Sale! <span role='img' aria-label='party'>🎉</span></span>
                  </div>
                )}
                <div className="h-56 bg-indigo-50 flex items-center justify-center rounded-t-xl">
                  <img
                    src={book.imageUrl ? `http://localhost:5000${book.imageUrl}` : placeholderImg}
                    alt={book.title}
                    className="object-contain h-full w-full"
                    onError={e => { e.target.onerror = null; e.target.src = placeholderImg; }}
                  />
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <h2 className="text-lg font-bold mb-1 truncate flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                    {book.title}
                  </h2>
                  <p className="text-gray-600 mb-1 truncate flex items-center gap-1">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 15c3.183 0 6.22.62 9 1.745M15 10a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    {book.author}
                  </p>
                  <p className="text-indigo-600 font-semibold mb-1 flex items-center gap-1">
                    <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-4.418 0-8 1.79-8 4v4a2 2 0 002 2h12a2 2 0 002-2v-4c0-2.21-3.582-4-8-4z" /></svg>
                    ${book.price?.toFixed(2)}
                  </p>
                  <p className="text-gray-500 text-sm mb-2 flex items-center gap-1">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v4a1 1 0 001 1h3m10-5v4a1 1 0 01-1 1h-3m-4 4h4m-2 0v4" /></svg>
                    Stock: {book.stockQuantity}
                  </p>
                  <div className="flex gap-2 mt-auto">
                    <button
                      onClick={() => handleViewBook(book)}
                      className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded hover:bg-indigo-200 text-sm font-medium flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      View
                    </button>
                    <button
                      onClick={() => { setSelectedBook(book); setShowEditModal(true); }}
                      className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded hover:bg-yellow-200 text-sm font-medium flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5h2m-1 0v14m-7-7h14" /></svg>
                      Edit
                    </button>
                    <button
                      onClick={() => openDeleteModal(book.bookId)}
                      className="bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 text-sm font-medium flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Book Modal */}
          {showAddModal && (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">Add New Book</h2>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="text-gray-400 hover:text-red-500 focus:outline-none"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                <BookForm onSubmit={handleAddBook} />
              </div>
            </div>
          )}

          {/* Edit Book Modal */}
          {showEditModal && selectedBook && (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">Edit Book</h2>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="text-gray-400 hover:text-red-500 focus:outline-none"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                <BookForm onSubmit={handleEditBook} initialData={selectedBook} isEdit={true} />
              </div>
            </div>
          )}

          {/* View Book Modal */}
          {showViewModal && selectedBook && (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold">{selectedBook.title}</h2>
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="text-gray-400 hover:text-red-500 focus:outline-none"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="h-64 overflow-hidden rounded-lg bg-indigo-50 flex items-center justify-center">
                    <img
                      src={selectedBook.imageUrl ? `http://localhost:5000${selectedBook.imageUrl}` : placeholderImg}
                      alt={selectedBook.title}
                      className="w-full h-full object-contain"
                      onError={e => { e.target.onerror = null; e.target.src = placeholderImg; }}
                    />
                  </div>
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold">Author</h3>
                      <p>{selectedBook.author}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold">ISBN</h3>
                      <p>{selectedBook.isbn}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold">Description</h3>
                      <p>{selectedBook.description}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold">Genre</h3>
                      <p>{selectedBook.genre}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold">Language</h3>
                      <p>{selectedBook.language}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold">Format</h3>
                      <p>{selectedBook.format}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold">Publisher</h3>
                      <p>{selectedBook.publisher}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold">Price</h3>
                      <p>${selectedBook.price?.toFixed(2)}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold">Publication Date</h3>
                      <p>{selectedBook.publicationDate ? new Date(selectedBook.publicationDate).toLocaleDateString() : '-'}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold">Available in Library</h3>
                      <p>{selectedBook.isAvailableInLibrary ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {showDeleteModal && (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-red-600">Delete Book</h2>
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="text-gray-400 hover:text-red-500 focus:outline-none"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                <p className="mb-6">Are you sure you want to delete this book? This action cannot be undone.</p>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteBook}
                    className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookList;