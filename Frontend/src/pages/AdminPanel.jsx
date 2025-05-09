import React, { useEffect, useState, Fragment } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import BookForm from '../components/BookForm';
import { Dialog, Transition } from '@headlessui/react';
import { Plus, Edit, Trash2, Eye, X } from 'lucide-react';

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
      // Convert endTime to UTC ISO string
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
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('books')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'books' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >📚 Books</button>
            <button
              onClick={() => setActiveTab('announcements')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'announcements' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >📢 Announcements</button>
          </nav>
        </div>
      </div>
      {activeTab === 'books' && (
        <div>
          <div className="mb-6 flex justify-end">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 flex items-center gap-2 shadow transition"
            >
              <Plus className="text-lg" /> Add New Book
            </button>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {books.map((book) => (
              <div key={book.bookId} className="bg-white rounded-xl shadow-lg p-6 flex flex-col transition-transform hover:scale-[1.02] hover:shadow-2xl duration-200">
                {book.isOnSale && (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-block w-3 h-3 rounded-full bg-green-500"></span>
                    <span className="text-green-700 font-semibold">On Sale! <span role='img' aria-label='party'>🎉</span></span>
                  </div>
                )}
                <div className="h-40 flex items-center justify-center mb-4 bg-gray-100 rounded">
                  <img
                    src={book && book.imageUrl ? `http://localhost:5176${book.imageUrl}` : placeholderImg}
                    alt={book.title}
                    className="object-contain h-full max-h-36 w-auto rounded shadow"
                    onError={e => { e.target.onerror = null; e.target.src = placeholderImg; }}
                  />
                </div>
                <h3 className="font-semibold text-lg mb-1 truncate">{book.title}</h3>
                <p className="text-gray-600 text-sm mb-1 truncate">{book.author}</p>
                <p className="text-indigo-600 font-medium mb-1">${book.price?.toFixed(2)}</p>
                <p className="text-sm text-gray-500 mb-2">Stock: {book.stockQuantity}</p>
                <div className="flex justify-end gap-2 mt-auto">
                  <Tooltip text="View Details">
                    <button
                      onClick={() => { setSelectedBook(book); setShowViewModal(true); setShowEditModal(false); setShowDeleteModal(false); }}
                      className="bg-blue-100 text-blue-700 p-2 rounded hover:bg-blue-200 text-sm font-medium flex items-center"
                    >
                      <Eye />
                    </button>
                  </Tooltip>
                  <Tooltip text="Edit Book">
                    <button
                      onClick={() => { setSelectedBook(book); setShowEditModal(true); setShowDeleteModal(false); setShowViewModal(false); }}
                      className="bg-yellow-100 text-yellow-700 p-2 rounded hover:bg-yellow-200 text-sm font-medium flex items-center"
                    >
                      <Edit />
                    </button>
                  </Tooltip>
                  <Tooltip text="Delete Book">
                    <button
                      onClick={() => { setSelectedBook(book); setDeleteId(book.bookId); setShowDeleteModal(true); setShowEditModal(false); setShowViewModal(false); }}
                      className="bg-red-100 text-red-700 p-2 rounded hover:bg-red-200 text-sm font-medium flex items-center"
                    >
                      <Trash2 />
                    </button>
                  </Tooltip>
                </div>
              </div>
            ))}
          </div>
          {/* Add Modal */}
          <Transition.Root show={showAddModal} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={setShowAddModal}>
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
                leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
              >
                <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
              </Transition.Child>
              <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="bg-white rounded-xl p-6 max-w-2xl w-full shadow-xl relative">
                    <Dialog.Title className="text-2xl font-bold mb-4 flex items-center gap-2">
                      <Plus /> Add New Book
                    </Dialog.Title>
                    <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"><X size={22} /></button>
                    <BookForm onSubmit={handleAddBook} />
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </Dialog>
          </Transition.Root>
          {/* Edit Modal */}
          {showEditModal && selectedBook && (
            <Transition.Root show={showEditModal} as={Fragment}>
              <Dialog as="div" className="relative z-50" onClose={() => { setShowEditModal(false); setSelectedBook(null); }}>
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                  <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
                </Transition.Child>
                <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
                  <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                    <Dialog.Panel className="bg-white rounded-xl p-6 max-w-2xl w-full shadow-xl relative">
                      <Dialog.Title className="text-2xl font-bold mb-4 flex items-center gap-2">
                        <Edit /> Edit Book
                      </Dialog.Title>
                      <button onClick={() => { setShowEditModal(false); setSelectedBook(null); }} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"><X size={22} /></button>
                      <BookForm onSubmit={handleUpdateBook} initialData={selectedBook} isEdit={true} />
                    </Dialog.Panel>
                  </Transition.Child>
                </div>
              </Dialog>
            </Transition.Root>
          )}
          {/* View Modal */}
          {showViewModal && selectedBook && (
            <Transition.Root show={showViewModal} as={Fragment}>
              <Dialog as="div" className="relative z-50" onClose={() => setShowViewModal(false)}>
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                  <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
                </Transition.Child>
                <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
                  <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                    <Dialog.Panel className="bg-white rounded-xl p-6 max-w-2xl w-full shadow-xl relative">
                      <Dialog.Title className="text-2xl font-bold mb-4 flex items-center gap-2">
                        <Eye /> Book Details
                      </Dialog.Title>
                      <button onClick={() => setShowViewModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"><X size={22} /></button>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 flex justify-center mb-4">
                          <img
                            src={selectedBook.imageUrl ? `http://localhost:5176${selectedBook.imageUrl}` : placeholderImg}
                            alt={selectedBook.title}
                            className="h-64 object-contain rounded shadow-lg"
                          />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-600">Title</h3>
                          <p className="text-lg">{selectedBook.title}</p>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-600">Author</h3>
                          <p className="text-lg">{selectedBook.author}</p>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-600">ISBN</h3>
                          <p>{selectedBook.isbn}</p>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-600">Genre</h3>
                          <p>{selectedBook.genre}</p>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-600">Language</h3>
                          <p>{selectedBook.language}</p>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-600">Format</h3>
                          <p>{selectedBook.format}</p>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-600">Publisher</h3>
                          <p>{selectedBook.publisher}</p>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-600">Price</h3>
                          <p>${selectedBook.price?.toFixed(2)}</p>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-600">Stock Quantity</h3>
                          <p>{selectedBook.stockQuantity}</p>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-600">Publication Date</h3>
                          <p>{new Date(selectedBook.publicationDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-600">Available in Library</h3>
                          <p>{selectedBook.isAvailableInLibrary ? 'Yes' : 'No'}</p>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-600">On Sale</h3>
                          <p>{selectedBook.isOnSale ? 'Yes' : 'No'}</p>
                        </div>
                        {selectedBook.isOnSale && (
                          <>
                            <div>
                              <h3 className="font-semibold text-gray-600">Discount Percent</h3>
                              <p>{selectedBook.discountPercent}%</p>
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-600">Discount Period</h3>
                              <p>
                                {selectedBook.discountStart && selectedBook.discountEnd
                                  ? `${new Date(selectedBook.discountStart).toLocaleDateString()} - ${new Date(selectedBook.discountEnd).toLocaleDateString()}`
                                  : 'Not set'}
                              </p>
                            </div>
                          </>
                        )}
                        <div className="col-span-2">
                          <h3 className="font-semibold text-gray-600">Description</h3>
                          <p className="whitespace-pre-wrap">{selectedBook.description}</p>
                        </div>
                      </div>
                    </Dialog.Panel>
                  </Transition.Child>
                </div>
              </Dialog>
            </Transition.Root>
          )}
          {/* Delete Confirmation Modal */}
          {showDeleteModal && selectedBook && (
            <Transition.Root show={showDeleteModal} as={Fragment}>
              <Dialog as="div" className="relative z-50" onClose={() => { setShowDeleteModal(false); setSelectedBook(null); setDeleteId(null); }}>
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                  <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
                </Transition.Child>
                <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
                  <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                    <Dialog.Panel className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl relative">
                      <Dialog.Title className="text-xl font-bold mb-4 text-red-600 flex items-center gap-2">
                        <Trash2 /> Delete Book
                      </Dialog.Title>
                      <button onClick={() => setShowDeleteModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"><X size={22} /></button>
                      <p className="mb-6">Are you sure you want to delete this book? This action cannot be undone.</p>
                      <div className="flex justify-end gap-3">
                        <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300">Cancel</button>
                        <button onClick={handleDeleteBook} className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 flex items-center gap-2"><Trash2 /> Delete</button>
                      </div>
                    </Dialog.Panel>
                  </Transition.Child>
                </div>
              </Dialog>
            </Transition.Root>
          )}
        </div>
      )}
      {activeTab === 'announcements' && (
        <div>
          <div className="mb-8 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Add New Announcement</h2>
            <form onSubmit={handleAddAnnouncement}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input type="text" value={newAnnouncement.title} onChange={e => setNewAnnouncement((prev) => ({ ...prev, title: e.target.value }))} className="w-full border rounded px-3 py-2" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea value={newAnnouncement.message} onChange={e => setNewAnnouncement((prev) => ({ ...prev, message: e.target.value }))} className="w-full border rounded px-3 py-2" rows="3" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input type="datetime-local" value={newAnnouncement.endTime} onChange={e => setNewAnnouncement((prev) => ({ ...prev, endTime: e.target.value }))} className="w-full border rounded px-3 py-2" required />
                </div>
                <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">Add Announcement</button>
              </div>
            </form>
          </div>
          <div className="space-y-6">
            {announcements.map((announcement) => (
              <div key={announcement.id} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{announcement.title}</h3>
                    <p className="text-gray-600">{announcement.message}</p>
                  </div>
                  <button onClick={() => handleDeleteAnnouncement(announcement.id)} className="text-red-600 hover:text-red-800">Delete</button>
                </div>
                <p className="text-sm text-gray-500">Expires: {new Date(announcement.endTime).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;