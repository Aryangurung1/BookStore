import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
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

const App = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
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

        {/* Not Found */}
        <Route path="*" element={<div className="p-10">Page Not Found</div>} />
      </Routes>
    </div>
  );
};

export default App;