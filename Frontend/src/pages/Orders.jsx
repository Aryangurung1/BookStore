import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Orders = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">📦 My Orders</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {orders.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">You haven't placed any orders yet</p>
          <Link to="/" className="text-indigo-600 hover:underline">
            Browse Books
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.orderId} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg">
                    Order #{order.orderId}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Placed on {new Date(order.orderDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-lg">${order.totalAmount.toFixed(2)}</p>
                  <p className={`text-sm ${
                    order.status === 'Cancelled' ? 'text-red-600' :
                    order.status === 'Completed' ? 'text-green-600' :
                    'text-blue-600'
                  }`}>
                    {order.status}
                  </p>
                </div>
              </div>

              <div className="border-t border-b py-4 my-4">
                <h4 className="font-medium mb-2">Items:</h4>
                <ul className="space-y-2">
                  {order.items.map((item, index) => (
                    <li key={index} className="flex justify-between">
                      <div>
                        <Link 
                          to={`/book/${item.bookId}`}
                          className="text-indigo-600 hover:underline"
                        >
                          {item.title}
                        </Link>
                        <span className="text-gray-500 ml-2">x{item.quantity}</span>
                      </div>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {order.status === 'Pending' && (
                <button
                  onClick={() => handleCancelOrder(order.orderId)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Cancel Order
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
