import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  MessageSquare, 
  Megaphone, 
  BookOpen, 
  CheckCircle,
  LogOut,
  User,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Hide sidebar if not logged in or not staff/admin
  if (!user || (user.role !== 'Admin' && user.role !== 'Staff')) {
    return null;
  }

  const isActive = (path) => {
    return location.pathname === path;
  };

  const getNavItems = () => {
    if (user?.role === 'Admin') {
      return [
        { path: '/admin', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
        { path: '/admin/users', label: 'Users', icon: <Users className="w-5 h-5" /> },
        { path: '/admin/orders', label: 'Orders', icon: <Package className="w-5 h-5" /> },
        { path: '/admin/reviews', label: 'Reviews', icon: <MessageSquare className="w-5 h-5" /> },
        { path: '/admin/books', label: 'Book Management', icon: <BookOpen className="w-5 h-5" /> },
        { path: '/admin/announcements', label: 'Announcements', icon: <Megaphone className="w-5 h-5" /> },
      ];
    } else if (user?.role === 'Staff') {
      return [
        { path: '/staff', label: 'Fulfill Order', icon: <LayoutDashboard className="w-5 h-5" /> },
        { path: '/staff/books', label: 'Books', icon: <BookOpen className="w-5 h-5" /> },
        { path: '/staff/fulfilled-orders', label: 'Fulfilled Orders', icon: <CheckCircle className="w-5 h-5" /> },
      ];
    }
    return [];
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Sidebar */}
      <div 
        className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white z-40 flex flex-col shadow-xl transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-6 bg-indigo-600 p-1.5 rounded-full text-white hover:bg-indigo-700 transition-colors duration-200"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* User Profile Section */}
        <div className={`p-6 border-b border-gray-700 ${isCollapsed ? 'px-4' : ''}`}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
              <User className="w-6 h-6" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <h2 className="text-lg font-semibold truncate">{user?.username}</h2>
                <p className="text-sm text-gray-400 truncate">{user?.role}</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-6">
          <nav className="space-y-1 px-3">
            {getNavItems().map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                    : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                }`}
                title={isCollapsed ? item.label : ''}
              >
                {item.icon}
                {!isCollapsed && <span className="font-medium">{item.label}</span>}
              </Link>
            ))}
          </nav>
        </div>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center justify-center space-x-2 bg-red-600/10 text-red-400 px-4 py-3 rounded-lg hover:bg-red-600/20 transition-all duration-200 font-medium ${
              isCollapsed ? 'px-3' : ''
            }`}
            title={isCollapsed ? 'Logout' : ''}
          >
            <LogOut className="w-5 h-5" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Overlay for mobile */}
      <div 
        className={`fixed inset-0 bg-black/50 z-30 lg:hidden transition-opacity duration-300 ${
          isCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        onClick={() => setIsCollapsed(true)}
      />
    </>
  );
};

export default Sidebar; 