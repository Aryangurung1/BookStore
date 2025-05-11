import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, Loader2, AlertCircle } from 'lucide-react';

const OrderManagement = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, fulfilled, cancelled

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get('http://localhost:5176/api/Orders/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data);
    } catch (err) {
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, status) => {
    try {
      await axios.put(`http://localhost:5176/api/Orders/${orderId}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchOrders();
    } catch (err) {
      setError('Failed to update order status');
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status.toLowerCase() === filter;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/90 rounded-2xl shadow-2xl border border-gray-100 p-0 md:p-8 flex flex-col max-h-[80vh]">
          <div className="mb-8 flex items-center space-x-4">
            <div className="p-3 bg-indigo-100 rounded-xl">
              <ShoppingCart className="w-7 h-7 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Order Management</h2>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg animate-pulse flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 text-red-500" />
              <span className="text-sm text-red-700 font-medium">{error}</span>
            </div>
          )}

          <div className="mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {['all', 'pending', 'fulfilled', 'cancelled'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 focus:outline-none ${
                      filter === status
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="animate-spin h-10 w-10 text-indigo-600" />
            </div>
          ) : (
            <div className="space-y-8 flex-1 min-h-0 overflow-y-auto">
              {filteredOrders.map((order) => (
                <div key={order.orderId} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 px-6 py-6 group relative">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-2">
                    <div>
                      <h3 className="font-semibold text-lg text-indigo-700 mb-1">Order #{order.orderId}</h3>
                      <p className="text-sm text-gray-500">Placed on {new Date(order.orderDate).toLocaleDateString()}</p>
                      <p className="text-sm text-gray-500">Customer: {order.member?.fullName} (ID: {order.member?.memberId})</p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <span className="font-bold text-xl text-indigo-800">${order.totalPrice?.toFixed(2) || '0.00'}</span>
                      <span
                        className={`inline-block px-3 py-1 text-sm rounded-full font-semibold shadow-sm ${
                          order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                          order.status === 'Fulfilled' ? 'bg-green-100 text-green-800' :
                          'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-b py-4 my-4">
                    <h4 className="font-medium mb-2 text-gray-800">Items:</h4>
                    <ul className="space-y-2">
                      {order.items.map((item, index) => (
                        <li key={index} className="flex justify-between items-center">
                          <div>
                            <span className="font-medium text-gray-900">{item.title}</span>
                            <span className="text-gray-500 ml-2">x{item.quantity}</span>
                          </div>
                          <span className="font-semibold text-indigo-700">${((item.unitPrice || item.price) * item.quantity).toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="text-sm text-gray-500 mb-2">
                    {order.notes && (
                      <div className="mb-2">
                        <span className="font-medium">Notes: </span>
                        {order.notes}
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Last Updated: </span>
                      {new Date(order.lastUpdated).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}

              {filteredOrders.length === 0 && (
                <div className="text-center text-gray-500 py-12">
                  No {filter === 'all' ? '' : filter} orders found.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderManagement;
