import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link to="/" className="text-xl font-bold">
            📚 BookHeaven
          </Link>
          <Link to="/" className="hover:text-gray-300">
            Browse
          </Link>
          <Link to="/announcements" className="hover:text-gray-300">
            📢 Announcements
          </Link>
          {user?.role === 'Admin' && (
            <>
              {/* Admin Links */}
              <Link to="/admin" className="hover:text-gray-300">
                📚 Books
              </Link>
              <Link to="/admin/users" className="hover:text-gray-300">
                👥 Users
              </Link>
              <Link to="/admin/orders" className="hover:text-gray-300">
                📦 Orders
              </Link>
            </>
          )}
          {user?.role === 'Staff' && (
            <>
              {/* Staff Links */}
              <Link to="/staff" className="hover:text-gray-300">
                🎫 Staff Panel
              </Link>
              <Link to="/staff/books" className="hover:text-gray-300">
                📚 Books
              </Link>
              <Link to="/staff/fulfilled-orders" className="hover:text-gray-300">
                ✅ Fulfilled Orders
              </Link>
            </>
          )}
          {user?.role === 'Member' && (
            <>
              <Link to="/cart" className="hover:text-gray-300">
                🛒 Cart
              </Link>
              <Link to="/orders" className="hover:text-gray-300">
                📦 Orders
              </Link>
              <Link to="/bookmarks" className="hover:text-gray-300">
                ⭐ Bookmarks
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <span className="text-sm text-gray-300">
                Welcome, {user.name} ({user.role})
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
