import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminPanel from './pages/AdminPanel';
import Cart from './pages/Cart';
import Bookmarks from './pages/Bookmarks';
import Navbar from './components/Navbar';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import BookPage from './pages/BookPage';
import BookDetailPage from './pages/BookDetailPage';
import UserManagement from './pages/UserManagement';
import Orders from './pages/Orders';
import OrderManagement from './pages/OrderManagement';
import StaffPanel from './pages/StaffPanel';
import StaffBooks from './pages/StaffBooks';
import StaffFulfilledOrders from './pages/StaffFulfilledOrders';
import Announcements from './pages/Announcements';
import AdminReviews from './pages/AdminReviews';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { BookmarkProvider } from './context/BookmarkContext';
import { ToastProvider } from './context/ToastContext';
import Sidebar from './components/Sidebar';
import AdminBookManagement from './pages/AdminBookManagement';
import AdminAnnouncementManagement from './pages/AdminAnnouncementManagement';
import { HubConnectionBuilder } from '@microsoft/signalr';
import { useEffect } from 'react';
import OrderNotificationListener from './components/OrderNotificationListener';

const App = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  const isAdminOrStaff = user?.role === 'Admin' || user?.role === 'Staff';
  const isLoginOrRegister = location.pathname === '/login' || location.pathname === '/register';
  const isMember = user?.role === 'Member';

  return (
    <CartProvider>
      <BookmarkProvider>
        <ToastProvider>
          <OrderNotificationListener />
          <div className="min-h-screen bg-gray-50">
            {(!isAdminOrStaff && !isLoginOrRegister) && <Navbar />}
            {user && isAdminOrStaff && <Sidebar />}
            <div className={`${isAdminOrStaff ? 'pl-64 pt-0' : (!isLoginOrRegister ? 'pt-16' : '')}`}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/books" element={<BookPage />} />
                <Route path="/book/:id" element={<BookDetailPage />} />
                <Route path="/announcements" element={<Announcements />} />

                {/* Member Routes */}
                <Route
                  path="/cart"
                  element={
                    <ProtectedRoute allowedRoles={['Member']}>
                      <Cart />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/bookmarks"
                  element={
                    <ProtectedRoute allowedRoles={['Member']}>
                      <Bookmarks />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute allowedRoles={['Member']}>
                      <Orders />
                    </ProtectedRoute>
                  }
                />

                {/* Staff Routes */}
                <Route
                  path="/staff"
                  element={
                    <ProtectedRoute allowedRoles={['Staff']}>
                      <StaffPanel />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/staff/books"
                  element={
                    <ProtectedRoute allowedRoles={['Staff']}>
                      <StaffBooks />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/staff/fulfilled-orders"
                  element={
                    <ProtectedRoute allowedRoles={['Staff']}>
                      <StaffFulfilledOrders />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Routes */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={['Admin']}>
                      <AdminPanel />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute allowedRoles={['Admin']}>
                      <UserManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/orders"
                  element={
                    <ProtectedRoute allowedRoles={['Admin']}>
                      <OrderManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/reviews"
                  element={
                    <ProtectedRoute allowedRoles={['Admin']}>
                      <AdminReviews />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/books"
                  element={
                    <ProtectedRoute allowedRoles={['Admin']}>
                      <AdminBookManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/announcements"
                  element={
                    <ProtectedRoute allowedRoles={['Admin']}>
                      <AdminAnnouncementManagement />
                    </ProtectedRoute>
                  }
                />

                {/* Not Found */}
                <Route path="*" element={<div className="p-10">Page Not Found</div>} />
              </Routes>
            </div>
          </div>
        </ToastProvider>
      </BookmarkProvider>
    </CartProvider>
  );
};

export default App;