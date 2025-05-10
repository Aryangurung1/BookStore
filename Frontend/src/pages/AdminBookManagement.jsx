import React, { useEffect, useState, Fragment } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import BookForm from '../components/BookForm';
import { Dialog, Transition } from '@headlessui/react';
import { Plus, Edit, Trash2, Eye, X, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';

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
  const booksPerPage = 9;

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await axios.get('http://localhost:5176/api/books', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBooks(res.data);
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
  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = books.slice(indexOfFirstBook, indexOfLastBook);
  const totalPages = Math.ceil(books.length / booksPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/90 rounded-2xl shadow-2xl border border-gray-100 p-0 md:p-8">
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

          <div className="flex justify-end mb-6">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-indigo-600 to-indigo-500 text-white px-4 py-2 rounded-lg hover:from-indigo-700 hover:to-indigo-600 flex items-center gap-2 shadow-md transition-all duration-200 hover:shadow-lg"
            >
              <Plus className="h-5 w-5" />
              Add New Book
            </button>
          </div>

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
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg ${
                      currentPage === 1
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index + 1}
                      onClick={() => handlePageChange(index + 1)}
                      className={`px-4 py-2 rounded-lg ${
                        currentPage === index + 1
                          ? 'bg-indigo-600 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-lg ${
                      currentPage === totalPages
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              )}
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
                    <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl sm:p-6">
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
                    <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl sm:p-6">
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
                    <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
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
                                          {selectedBook.discountStart && selectedBook.discountEnd
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
                    <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
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