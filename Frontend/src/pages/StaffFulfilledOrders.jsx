import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Package, Calendar, User, DollarSign, Loader2 } from 'lucide-react';

const StaffFulfilledOrders = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('http://localhost:5176/api/Staff/fulfilled-orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data);
    } catch (err) {
      setError('Failed to load fulfilled orders');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-4 md:pt-8 px-10 max-w-7xl mx-auto">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Fulfilled Orders</h2>
          <p className="text-gray-600">View and manage all fulfilled book orders</p>
        </div>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded"
        >
          {error}
        </motion.div>
      )}

      {/* Orders List */}
      <div className="space-y-6">
        {orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 bg-white rounded-lg shadow-sm"
          >
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No fulfilled orders found</p>
          </motion.div>
        ) : (
          orders.map((order, index) => (
            <motion.div
              key={order.orderId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg text-gray-900">
                        Order #{order.orderId}
                      </h3>
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-50 text-green-700 border border-green-200">
                        <Package className="h-4 w-4" />
                        Fulfilled
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(order.orderDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {order.member?.fullName}
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        ${order.totalPrice?.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <h4 className="font-medium text-gray-900 mb-3">Order Items</h4>
                  <div className="space-y-3">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg">
                        <img
                          src={item.book?.imageUrl ? `http://localhost:5176${item.book.imageUrl}` : '/placeholder-book.jpg'}
                          alt={item.book?.title || 'Book'}
                          className="h-16 w-12 object-cover rounded border"
                          onError={e => { e.target.onerror = null; e.target.src = '/placeholder-book.jpg'; }}
                        />
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">{item.book?.title}</h5>
                          <p className="text-sm text-gray-500">By {item.book?.author}</p>
                          <div className="mt-1 flex items-center justify-between text-sm">
                            <span className="text-gray-600">Qty: {item.quantity}</span>
                            <span className="text-gray-900">${((item.unitPrice || 0) * item.quantity).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default StaffFulfilledOrders; 