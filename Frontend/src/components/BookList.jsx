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
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Books</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700 transition"
        >
          Add Book
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {books.map((book) => (
          <div key={book.bookId} className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col">
            {book.isOnSale && (
              <div className="flex items-center gap-2 px-4 pt-4">
                <span className="inline-block w-3 h-3 rounded-full bg-green-500"></span>
                <span className="text-green-700 font-semibold">On Sale! <span role='img' aria-label='party'>🎉</span></span>
              </div>
            )}
            <div className="h-56 bg-gray-100 flex items-center justify-center">
              <img
                src={book.imageUrl ? `http://localhost:5000${book.imageUrl}` : placeholderImg}
                alt={book.title}
                className="object-contain h-full w-full"
                onError={e => { e.target.onerror = null; e.target.src = placeholderImg; }}
              />
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <h2 className="text-lg font-bold mb-1 truncate">{book.title}</h2>
              <p className="text-gray-600 mb-1 truncate">{book.author}</p>
              <p className="text-indigo-600 font-semibold mb-1">${book.price?.toFixed(2)}</p>
              <p className="text-gray-500 text-sm mb-2">Stock: {book.stockQuantity}</p>
              <div className="flex gap-2 mt-auto">
                <button
                  onClick={() => handleViewBook(book)}
                  className="bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 text-sm font-medium"
                >
                  View
                </button>
                <button
                  onClick={() => { setSelectedBook(book); setShowEditModal(true); }}
                  className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded hover:bg-yellow-200 text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => openDeleteModal(book.bookId)}
                  className="bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 text-sm font-medium"
                >
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
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <h2 className="text-2xl font-bold mb-4">Add New Book</h2>
            <BookForm onSubmit={handleAddBook} />
            <button
              onClick={() => setShowAddModal(false)}
              className="mt-4 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Edit Book Modal */}
      {showEditModal && selectedBook && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <h2 className="text-2xl font-bold mb-4">Edit Book</h2>
            <BookForm onSubmit={handleEditBook} initialData={selectedBook} isEdit={true} />
            <button
              onClick={() => setShowEditModal(false)}
              className="mt-4 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

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
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-red-600">Delete Book</h2>
            <p className="mb-6">Are you sure you want to delete this book? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
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
  );
};

export default BookList; 