import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const BookmarkContext = createContext();

export const useBookmark = () => {
  const context = useContext(BookmarkContext);
  if (!context) {
    throw new Error('useBookmark must be used within a BookmarkProvider');
  }
  return context;
};

export const BookmarkProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [bookmarkCount, setBookmarkCount] = useState(0);

  const fetchBookmarkCount = async () => {
    if (!user || user.role !== 'Member') return;
    
    try {
      const res = await axios.get('http://localhost:5176/api/Bookmark', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookmarkCount(res.data.length);
    } catch (err) {
      console.error('Failed to fetch bookmark count:', err);
    }
  };

  useEffect(() => {
    if (user?.role === 'Member') {
      fetchBookmarkCount();
    }
  }, [user, token]);

  const updateBookmarkCount = async () => {
    await fetchBookmarkCount();
  };

  return (
    <BookmarkContext.Provider value={{ bookmarkCount, updateBookmarkCount }}>
      {children}
    </BookmarkContext.Provider>
  );
}; 