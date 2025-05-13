import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useBookmark } from '../context/BookmarkContext';
import { ShoppingCart, Bookmark, BookOpen, Megaphone, LogOut, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const { bookmarkCount } = useBookmark();
  const navigate = useNavigate();

  // Only render for members and unauthenticated users
  if (user && (user.role === 'Admin' || user.role === 'Staff')) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Brand */}
          <div className="flex-shrink-0">
            <Link 
              to="/" 
              className="flex items-center text-xl font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              <BookOpen className="w-6 h-6 mr-2" />
              BookHeaven
            </Link>
          </div>

          {/* Center - Navigation Links */}
          {(!user || user.role === 'Member') && (
            <div className="hidden md:flex items-center justify-center flex-1">
              <div className="flex items-center space-x-8">
                <NavLink
                  to="/books"
                  className={({ isActive }) =>
                    `text-sm font-medium transition-colors ${isActive ? 'text-indigo-600 font-bold' : 'text-gray-700 hover:text-indigo-600'}`
                  }
                >
                  Browse Books
                </NavLink>
                <NavLink
                  to="/announcements"
                  className={({ isActive }) =>
                    `text-sm font-medium transition-colors ${isActive ? 'text-indigo-600 font-bold' : 'text-gray-700 hover:text-indigo-600'}`
                  }
                >
                  Announcements
                </NavLink>
                {user?.role === 'Member' && (
                  <NavLink
                    to="/orders"
                    className={({ isActive }) =>
                      `text-sm font-medium transition-colors ${isActive ? 'text-indigo-600 font-bold' : 'text-gray-700 hover:text-indigo-600'}`
                    }
                  >
                    Orders
                  </NavLink>
                )}
              </div>
            </div>
          )}

          {/* Right side - Auth and icons */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Icons for member */}
                {user.role === 'Member' && (
                  <div className="flex items-center space-x-3">
                    
                    <Link 
                      to="/cart" 
                      className="p-2 text-gray-500 hover:text-indigo-600 rounded-full hover:bg-gray-50 transition-colors relative"
                      title="Cart"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {cartCount}
                        </span>
                      )}
                    </Link>
                    <Link 
                      to="/bookmarks" 
                      className="p-2 text-gray-500 hover:text-indigo-600 rounded-full hover:bg-gray-50 transition-colors relative"
                      title="Bookmarks"
                    >
                      <Bookmark className="w-5 h-5" />
                      {bookmarkCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {bookmarkCount}
                        </span>
                      )}
                    </Link>
                  </div>
                )}

                {/* User dropdown/logout */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-2 rounded-md bg-red-600 hover:bg-red-400 text-white transition-colors font-medium shadow-sm"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Log Out</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;