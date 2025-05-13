import Select from 'react-select';
import qs from 'qs';
import axios from 'axios';
import { HubConnectionBuilder } from '@microsoft/signalr';
import { useEffect, useState } from 'react';
import { useToast } from 'react-react-toast';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const selectMenuPortalStyles = {
  menuPortal: base => ({ ...base, zIndex: 9999 })
};

<Select
  isMulti
  options={authors.map(a => ({ value: a, label: a }))}
  value={selectedAuthors}
  onChange={setSelectedAuthors}
  placeholder="Select authors..."
  className="basic-multi-select"
  classNamePrefix="select"
  menuPortalTarget={document.body}
  styles={selectMenuPortalStyles}
/>

<Select
  isMulti
  options={genres.map(g => ({ value: g, label: g }))}
  value={selectedGenres}
  onChange={setSelectedGenres}
  placeholder="Select genres..."
  className="basic-multi-select"
  classNamePrefix="select"
  menuPortalTarget={document.body}
  styles={selectMenuPortalStyles}
/>

<Select
  isMulti
  options={languages.map(l => ({ value: l, label: l }))}
  value={selectedLanguages}
  onChange={setSelectedLanguages}
  placeholder="Select languages..."
  className="basic-multi-select"
  classNamePrefix="select"
  menuPortalTarget={document.body}
  styles={selectMenuPortalStyles}
/>

<Select
  isMulti
  options={formats.map(f => ({ value: f, label: f }))}
  value={selectedFormats}
  onChange={setSelectedFormats}
  placeholder="Select formats..."
  className="basic-multi-select"
  classNamePrefix="select"
  menuPortalTarget={document.body}
  styles={selectMenuPortalStyles}
/>

<Select
  isMulti
  options={publishers.map(p => ({ value: p, label: p }))}
  value={selectedPublishers}
  onChange={setSelectedPublishers}
  placeholder="Select publishers..."
  className="basic-multi-select"
  classNamePrefix="select"
  menuPortalTarget={document.body}
  styles={selectMenuPortalStyles}
/>

const booksPerPage = 9;
const [totalCount, setTotalCount] = useState(0);
const [currentPage, setCurrentPage] = useState(1);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
const [books, setBooks] = useState([]);
const [totalPages, setTotalPages] = useState(0);

const realTotal = totalCount && totalCount > 0 ? totalCount : books.length;
const pageCount = Math.max(1, Math.ceil(realTotal / booksPerPage));

const handlePageChange = (pageNumber) => {
  setCurrentPage(pageNumber);
};

useEffect(() => {
  if (books.length === 0 && currentPage !== 1) {
    setCurrentPage(1);
  }
}, [books, currentPage]);

const fetchBooks = async () => {
  try {
    setLoading(true);
    const params = new URLSearchParams();
    // ... all your params ...
    const res = await axios.get(`http://localhost:5176/api/books`, {
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

const { addToast } = useToast();

useEffect(() => {
  // SignalR connection for real-time order notifications
  const connection = new HubConnectionBuilder()
    .withUrl('http://localhost:5176/orderHub')
    .withAutomaticReconnect()
    .build();

  connection.start()
    .then(() => {
      connection.on('OrderPlaced', (message) => {
        addToast(message, 'info');
      });
    })
    .catch(err => console.error('SignalR Connection Error:', err));

  return () => {
    connection.stop();
  };
}, [addToast]);

return (
  <div className="min-h-screen flex flex-col bg-gray-50">
    {/* Sticky Section: header, search, filters, etc. */}
    <div className="sticky top-0 z-20 bg-gray-50">
      {/* Header, search bar, filter controls, error/success messages, etc. */}
      {/* Place your header, search, filter, and messages JSX here */}
    </div>

    {/* Scrollable Books Grid */}
    <div className="flex-1 overflow-y-auto px-4">
      {/* Books grid/cards here */}
      {/* Pagination controls (can be sticky at bottom if desired) */}
    </div>
  </div>
); 