import React, { useEffect, useState } from 'react';
import axios from 'axios';

const placeholderImg = '/placeholder-book.jpg';

const StaffBooks = () => {
  const [books, setBooks] = useState([]);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

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

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-xl font-bold mb-4">📚 Book Catalog (Staff View)</h2>
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
          <div key={book.bookId} className="border rounded shadow p-4 bg-white flex flex-col items-center">
            <img
              src={book.imageUrl ? `http://localhost:5176${book.imageUrl}` : placeholderImg}
              alt={book.title}
              className="object-contain h-40 w-full mb-2 rounded"
              onError={e => { e.target.onerror = null; e.target.src = placeholderImg; }}
            />
            <h3 className="text-lg font-semibold mb-1">{book.title}</h3>
            <div className="text-sm text-gray-500 mb-1">Stock: {book.stockQuantity}</div>
            <div className="flex gap-2 mt-2">
              <button
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                onClick={() => handleViewBook(book)}
              >
                View
              </button>
            </div>
          </div>
        ))}
      </div>
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
                  src={selectedBook.imageUrl ? `http://localhost:5176${selectedBook.imageUrl}` : placeholderImg}
                  alt={selectedBook.title}
                  className="w-full h-full object-contain"
                  onError={e => { e.target.onerror = null; e.target.src = placeholderImg; }}
                />
              </div>
              <div className="space-y-3">
                <div><h3 className="font-semibold">Author</h3><p>{selectedBook.author}</p></div>
                <div><h3 className="font-semibold">ISBN</h3><p>{selectedBook.isbn}</p></div>
                <div><h3 className="font-semibold">Description</h3><p>{selectedBook.description}</p></div>
                <div><h3 className="font-semibold">Genre</h3><p>{selectedBook.genre}</p></div>
                <div><h3 className="font-semibold">Language</h3><p>{selectedBook.language}</p></div>
                <div><h3 className="font-semibold">Format</h3><p>{selectedBook.format}</p></div>
                <div><h3 className="font-semibold">Publisher</h3><p>{selectedBook.publisher}</p></div>
                <div><h3 className="font-semibold">Price</h3><p>${selectedBook.price?.toFixed(2)}</p></div>
                <div><h3 className="font-semibold">Publication Date</h3><p>{selectedBook.publicationDate ? new Date(selectedBook.publicationDate).toLocaleDateString() : '-'}</p></div>
                <div><h3 className="font-semibold">Available in Library</h3><p>{selectedBook.isAvailableInLibrary ? 'Yes' : 'No'}</p></div>
                <div><h3 className="font-semibold">Discount Percent</h3><p>{selectedBook.discountPercent ?? selectedBook.DiscountPercent ?? 0}%</p></div>
                <div><h3 className="font-semibold">Stock Quantity</h3><p>{selectedBook.stockQuantity}</p></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffBooks; 