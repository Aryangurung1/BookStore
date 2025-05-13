import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Clock, CheckCircle, XCircle, AlertCircle, Loader2, BookOpen, ArrowRight } from 'lucide-react';

const Orders = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get('http://localhost:5176/api/Orders/my-orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data);
    } catch (err) {
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      await axios.post(`http://localhost:5176/api/Orders/cancel/${orderId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchOrders();
    } catch (err) {
      setError('Failed to cancel order');
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'fulfilled':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'fulfilled':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status.toLowerCase() === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Sticky Header Section */}
      <div className="sticky top-16 z-20 bg-gray-50 border-b border-gray-200 shadow-sm">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-6"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-4 sm:px-6 lg:px-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">My Orders</h2>
              <p className="mt-1 text-gray-600">Track and manage your book orders</p>
            </div>
            <div className="flex gap-2">
              {['all', 'pending', 'fulfilled', 'cancelled'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    filter === status
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Scrollable Orders List */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded"
            >
              <p>{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Orders List */}
        <AnimatePresence>
          {filteredOrders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 bg-white rounded-lg shadow-sm"
            >
              <div className="mx-auto w-24 h-24 text-gray-400">
                <Package className="w-full h-full" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No orders found</h3>
              <p className="mt-2 text-gray-500">
                {filter === 'all'
                  ? "You haven't placed any orders yet"
                  : `No ${filter} orders found`}
              </p>
              <Link
                to="/books"
                className="mt-4 inline-flex items-center text-indigo-600 hover:text-indigo-700"
              >
                Browse Books
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </motion.div>
          ) : (
            <motion.div
              layout
              className="space-y-6"
            >
              {filteredOrders.map((order, index) => (
                <motion.div
                  key={order.orderId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
                >
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg text-gray-900">
                            Order #{order.orderId}
                          </h3>
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            {order.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          Placed on {new Date(order.orderDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-lg text-gray-900">
                          ${(order.totalPrice !== undefined && order.totalPrice !== null ? order.totalPrice : order.totalAmount).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-b border-gray-100 py-4 my-4">
                      <h4 className="font-medium text-gray-900 mb-3">Order Items</h4>
                      <div className="space-y-3">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="h-12 w-9 bg-gray-100 rounded flex items-center justify-center">
                                <BookOpen className="h-6 w-6 text-gray-400" />
                              </div>
                              <div>
                                <Link 
                                  to={`/book/${item.bookId}`}
                                  className="text-indigo-600 hover:text-indigo-700 font-medium"
                                >
                                  {item.title}
                                </Link>
                                <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                              </div>
                            </div>
                            <span className="font-medium text-gray-900">
                              ${((item.unitPrice !== undefined && item.unitPrice !== null) ? item.unitPrice : item.price) * item.quantity}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {order.status === 'Pending' && (
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleCancelOrder(order.orderId)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1 transition-colors duration-200"
                        >
                          <XCircle className="h-4 w-4" />
                          Cancel Order
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Orders;
