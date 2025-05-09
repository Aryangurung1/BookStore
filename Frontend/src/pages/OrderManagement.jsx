import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const OrderManagement = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, completed, cancelled

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

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Order Management</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {['all', 'pending', 'completed', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
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

      <div className="space-y-6">
        {filteredOrders.map((order) => (
          <div key={order.orderId} className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-lg">
                  Order #{order.orderId}
                </h3>
                <p className="text-sm text-gray-500">
                  Placed on {new Date(order.orderDate).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-500">
                  Customer: {order.memberName} (ID: {order.memberId})
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium text-lg">
                  ${order.totalAmount.toFixed(2)}
                </p>
                <select
                  value={order.status}
                  onChange={(e) => handleUpdateStatus(order.orderId, e.target.value)}
                  className={`mt-1 text-sm rounded border ${
                    order.status === 'Cancelled' ? 'text-red-600 border-red-200' :
                    order.status === 'Completed' ? 'text-green-600 border-green-200' :
                    'text-blue-600 border-blue-200'
                  }`}
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="border-t border-b py-4 my-4">
              <h4 className="font-medium mb-2">Items:</h4>
              <ul className="space-y-2">
                {order.items.map((item, index) => (
                  <li key={index} className="flex justify-between">
                    <div>
                      <span className="font-medium">{item.title}</span>
                      <span className="text-gray-500 ml-2">x{item.quantity}</span>
                    </div>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-sm text-gray-500">
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
          <p className="text-center text-gray-500 py-8">
            No {filter === 'all' ? '' : filter} orders found.
          </p>
        )}
      </div>
    </div>
  );
};

export default OrderManagement;
