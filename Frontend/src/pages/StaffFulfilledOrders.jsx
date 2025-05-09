import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

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

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">✅ Fulfilled Orders</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {orders.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No fulfilled orders found.</div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.orderId} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg">Order #{order.orderId}</h3>
                  <p className="text-sm text-gray-500">Placed on {new Date(order.orderDate).toLocaleDateString()}</p>
                  <p className="text-sm text-gray-500">Member: {order.member.fullName} (ID: {order.member.memberId}, Email: {order.member.email})</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-lg">${order.totalPrice?.toFixed(2)}</p>
                  <p className="text-green-600 text-sm">{order.status}</p>
                </div>
              </div>
              <div className="border-t border-b py-4 my-4">
                <h4 className="font-medium mb-2">Items:</h4>
                <ul className="space-y-2">
                  {order.items.map((item, idx) => (
                    <li key={idx} className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.book.imageUrl ? `http://localhost:5176${item.book.imageUrl}` : '/placeholder-book.jpg'}
                          alt={item.book.title}
                          className="h-14 w-10 object-contain rounded border"
                          onError={e => { e.target.onerror = null; e.target.src = '/placeholder-book.jpg'; }}
                        />
                        <div>
                          <div className="font-medium">{item.book.title}</div>
                          <div className="text-sm text-gray-500">By {item.book.author}</div>
                          <div className="text-xs text-gray-400">ISBN: {item.book.isbn}</div>
                        </div>
                      </div>
                      <div className="flex flex-col md:items-end">
                        <span>Qty: {item.quantity}</span>
                        <span className="text-sm">Unit: ${item.unitPrice?.toFixed(2)}</span>
                        <span className="text-sm font-semibold">Total: ${(item.unitPrice * item.quantity).toFixed(2)}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StaffFulfilledOrders; 