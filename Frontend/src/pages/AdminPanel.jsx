import React, { useEffect, useState, Fragment } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import BookForm from '../components/BookForm';
import { Dialog, Transition } from '@headlessui/react';
import { Plus, Edit, Trash2, Eye, X, BookOpen, Megaphone } from 'lucide-react';

const placeholderImg = '/placeholder-book.jpg';

const Tooltip = ({ children, text }) => (
  <div className="relative group">
    {children}
    <span className="absolute z-20 left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg transition-opacity duration-200 opacity-90">
      {text}
    </span>
  </div>
);

const AdminPanel = () => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('books');
  const [books, setBooks] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', message: '', endTime: '' });
  const [showAddAnnouncementModal, setShowAddAnnouncementModal] = useState(false);

  useEffect(() => {
    if (activeTab === 'books') fetchBooks();
    else if (activeTab === 'announcements') fetchAnnouncements();
  }, [activeTab]);

  const fetchBooks = async () => {
    try {
      const res = await axios.get('http://localhost:5176/api/books', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBooks(res.data);
    } catch (err) {
      setError('Failed to fetch books');
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const res = await axios.get('http://localhost:5176/api/Announcement/active');
      setAnnouncements(res.data);
    } catch (err) {
      setError('Failed to fetch announcements');
    }
  };

  const handleAddBook = async (formData) => {
    try {
      await axios.post('http://localhost:5176/api/books', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      fetchBooks();
      setShowAddModal(false);
    } catch (err) {
      setError('Failed to add book');
      console.error(err);
    }
  };

  const handleUpdateBook = async (formData) => {
    try {
      await axios.put(`http://localhost:5176/api/books/${selectedBook.bookId}`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      fetchBooks();
      setShowEditModal(false);
      setSelectedBook(null);
    } catch (err) {
      setError('Failed to update book');
      console.error(err);
    }
  };

  const handleDeleteBook = async () => {
    try {
      await axios.delete(`http://localhost:5176/api/books/${deleteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchBooks();
      setShowDeleteModal(false);
      setDeleteId(null);
    } catch (err) {
      setError('Failed to delete book');
    }
  };

  const handleAddAnnouncement = async (e) => {
    e.preventDefault();
    try {
      const endTimeUtc = new Date(newAnnouncement.endTime).toISOString();
      const payload = {
        ...newAnnouncement,
        endTime: endTimeUtc,
      };
      await axios.post('http://localhost:5176/api/announcements', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewAnnouncement({ title: '', message: '', endTime: '' });
      fetchAnnouncements();
    } catch (err) {
      setError('Failed to add announcement');
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await axios.delete(`http://localhost:5176/api/Announcement/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchAnnouncements();
    } catch (err) {
      setError('Failed to delete announcement');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
              <p className="text-gray-600">Manage your bookstore content</p>
            </div>
            {error && (
              <div className="px-4 py-3 bg-red-100 text-red-700 rounded-lg">
                {error}
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200">
              <nav className="flex">
                <button
                  onClick={() => setActiveTab('books')}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium ${activeTab === 'books' ? 'border-b-2 border-indigo-500 text-indigo-600 bg-indigo-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                >
                  <BookOpen className="h-4 w-4" />
                  Books
                </button>
                <button
                  onClick={() => setActiveTab('announcements')}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium ${activeTab === 'announcements' ? 'border-b-2 border-indigo-500 text-indigo-600 bg-indigo-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                >
                  <Megaphone className="h-4 w-4" />
                  Announcements
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'books' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800">Book Management</h2>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="bg-gradient-to-r from-indigo-600 to-indigo-500 text-white px-4 py-2 rounded-lg hover:from-indigo-700 hover:to-indigo-600 flex items-center gap-2 shadow-md transition-all duration-200 hover:shadow-lg"
                    >
                      <Plus className="h-5 w-5" />
                      Add New Book
                    </button>
                  </div>

                  {books.length === 0 ? (
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
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {books.map((book) => (
                        <div key={book.bookId} className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 border border-gray-100">
                          <div className="relative">
                            <div className="h-48 bg-gray-100 flex items-center justify-center">
                              <img
                                src={book && book.imageUrl ? `http://localhost:5176${book.imageUrl}` : placeholderImg}
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
                          <div className="p-4">
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
                  )}
                </div>
              )}

              {activeTab === 'announcements' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">Announcements</h2>
                    <button
                      onClick={() => setShowAddAnnouncementModal(true)}
                      className="bg-gradient-to-r from-indigo-600 to-indigo-500 text-white px-4 py-2 rounded-lg hover:from-indigo-700 hover:to-indigo-600 flex items-center gap-2 shadow-md transition-all duration-200 hover:shadow-lg"
                    >
                      <Plus className="h-5 w-5" />
                      Add Announcement
                    </button>
                  </div>

                  {announcements.length > 0 ? (
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900">Active Announcements</h3>
                      {announcements.map((announcement) => (
                        <div key={announcement.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                          <div className="p-5">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="text-lg font-semibold text-gray-900 mb-2">{announcement.title}</h4>
                                <p className="text-gray-600 whitespace-pre-line">{announcement.message}</p>
                              </div>
                              <button 
                                onClick={() => handleDeleteAnnouncement(announcement.id)} 
                                className="text-gray-400 hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </div>
                            <div className="mt-4 flex items-center text-sm text-gray-500">
                              <span>Expires: {new Date(announcement.endTime).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg border border-dashed border-gray-300 p-12 text-center">
                      <Megaphone className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-lg font-medium text-gray-900">No active announcements</h3>
                      <p className="mt-1 text-gray-500">Create an announcement to display to your users.</p>
                    </div>
                  )}

                  {/* Add Announcement Modal */}
                  {showAddAnnouncementModal && (
                    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
                      <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl relative">
                        <button
                          onClick={() => setShowAddAnnouncementModal(false)}
                          className="absolute top-3 right-3 text-gray-400 hover:text-red-500 focus:outline-none"
                        >
                          <X className="w-6 h-6" />
                        </button>
                        <h2 className="text-2xl font-bold mb-6">Add Announcement</h2>
                        <form onSubmit={handleAddAnnouncement} className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                            <input
                              type="text"
                              value={newAnnouncement.title}
                              onChange={e => setNewAnnouncement(a => ({ ...a, title: e.target.value }))}
                              className="w-full px-4 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                            <textarea
                              value={newAnnouncement.message}
                              onChange={e => setNewAnnouncement(a => ({ ...a, message: e.target.value }))}
                              className="w-full px-4 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors min-h-[80px]"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                            <input
                              type="datetime-local"
                              value={newAnnouncement.endTime}
                              onChange={e => setNewAnnouncement(a => ({ ...a, endTime: e.target.value }))}
                              className="w-full px-4 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                              required
                            />
                          </div>
                          <div className="flex justify-end gap-2 pt-2">
                            <button
                              type="button"
                              onClick={() => setShowAddAnnouncementModal(false)}
                              className="px-4 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
                            >
                              Add
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

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
                            <div className="flex flex-col sm:flex-row gap-6">
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
  );
};

export default AdminPanel;