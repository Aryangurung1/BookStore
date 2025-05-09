import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import BookForm from '../components/BookForm';

const AdminPanel = () => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('books');
  const [books, setBooks] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editBook, setEditBook] = useState(null);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    endDate: ''
  });

  useEffect(() => {
    if (activeTab === 'books') {
      fetchBooks();
    } else if (activeTab === 'announcements') {
      fetchAnnouncements();
    }
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
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
      });
      fetchBooks();
      setShowForm(false);
    } catch (err) {
      setError('Failed to add book');
      console.error(err);
    }
  };

  const handleUpdateBook = async (formData) => {
    try {
      await axios.put(`http://localhost:5176/api/books/${editBook.bookId}`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
      });
      fetchBooks();
      setEditBook(null);
      setShowForm(false);
    } catch (err) {
      setError('Failed to update book');
      console.error(err);
    }
  };

  const handleDeleteBook = async (bookId) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;
    
    try {
      await axios.delete(`http://localhost:5176/api/books/${bookId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchBooks();
    } catch (err) {
      setError('Failed to delete book');
    }
  };

  const handleAddAnnouncement = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5176/api/Announcement', newAnnouncement, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewAnnouncement({ title: '', content: '', endDate: '' });
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
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'books'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📚 Books
            </button>
            <button
              onClick={() => setActiveTab('announcements')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'announcements'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📢 Announcements
            </button>
          </nav>
        </div>
      </div>

      {activeTab === 'books' && (
        <div>
          <div className="mb-6">
            <button
              onClick={() => {
                setEditBook(null);
                setShowForm(true);
              }}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              Add New Book
            </button>
          </div>

          {showForm && (
            <div className="mb-6 bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">
                {editBook ? 'Edit Book' : 'Add New Book'}
              </h2>
              <BookForm
                initialData={editBook}
                onSubmit={editBook ? handleUpdateBook : handleAddBook}
                onCancel={() => {
                  setShowForm(false);
                  setEditBook(null);
                }}
              />
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {books.map((book) => (
              <div key={book.bookId} className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="font-semibold text-lg mb-2">{book.title}</h3>
                <p className="text-gray-600 text-sm mb-2">{book.author}</p>
                <p className="text-indigo-600 font-medium mb-2">
                  ${book.price.toFixed(2)}
                  {book.isOnSale && (
                    <span className="ml-2 text-green-600 text-sm">On Sale</span>
                  )}
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Stock: {book.stockQuantity}
                </p>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => {
                      setEditBook(book);
                      setShowForm(true);
                    }}
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteBook(book.bookId)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'announcements' && (
        <div>
          <div className="mb-8 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Add New Announcement</h2>
            <form onSubmit={handleAddAnnouncement}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={newAnnouncement.title}
                    onChange={(e) =>
                      setNewAnnouncement((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Content
                  </label>
                  <textarea
                    value={newAnnouncement.content}
                    onChange={(e) =>
                      setNewAnnouncement((prev) => ({
                        ...prev,
                        content: e.target.value,
                      }))
                    }
                    className="w-full border rounded px-3 py-2"
                    rows="3"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={newAnnouncement.endDate}
                    onChange={(e) =>
                      setNewAnnouncement((prev) => ({
                        ...prev,
                        endDate: e.target.value,
                      }))
                    }
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                >
                  Add Announcement
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-6">
            {announcements.map((announcement) => (
              <div
                key={announcement.id}
                className="bg-white rounded-lg shadow-lg p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">
                      {announcement.title}
                    </h3>
                    <p className="text-gray-600">{announcement.content}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteAnnouncement(announcement.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
                <p className="text-sm text-gray-500">
                  Expires: {new Date(announcement.endDate).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;