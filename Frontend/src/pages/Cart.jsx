// ✅ FILE: src/pages/Cart.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Cart = () => {
  const { token } = useAuth();
  const [cart, setCart] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const res = await axios.get('http://localhost:5176/api/Cart', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCart(res.data);
    } catch (err) {
      setError('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (bookId, quantity) => {
    try {
      await axios.post('http://localhost:5176/api/Cart', {
        bookId,
        quantity
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCart();
    } catch (err) {
      setError('Failed to update quantity');
    }
  };

  const handleRemoveItem = async (bookId) => {
    try {
      await axios.delete(`http://localhost:5176/api/Cart/${bookId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCart();
    } catch (err) {
      setError('Failed to remove item');
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  const total = cart.reduce((sum, item) => sum + (item.book.price * item.quantity), 0);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">🛒 Your Cart</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {cart.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">Your cart is empty</p>
          <Link to="/" className="text-indigo-600 hover:underline">
            Browse Books
          </Link>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Book</th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-gray-500">Quantity</th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">Price</th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {cart.map((item) => (
                  <tr key={item.book.bookId}>
                    <td className="px-6 py-4">
                      <Link to={`/book/${item.book.bookId}`} className="hover:text-indigo-600">
                        <div className="font-medium">{item.book.title}</div>
                        <div className="text-sm text-gray-500">{item.book.author}</div>
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleUpdateQuantity(item.book.bookId, Math.max(1, item.quantity - 1))}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          -
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.book.bookId, item.quantity + 1)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="font-medium">${(item.book.price * item.quantity).toFixed(2)}</div>
                      {item.book.isOnSale && (
                        <span className="text-sm text-green-600">On Sale</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleRemoveItem(item.book.bookId)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-lg font-medium">Total:</p>
                <p className="text-sm text-gray-500">Including all discounts</p>
              </div>
              <p className="text-2xl font-bold">${total.toFixed(2)}</p>
            </div>
            <button
              className="mt-4 w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700"
              onClick={() => alert('Checkout functionality coming soon!')}
            >
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
