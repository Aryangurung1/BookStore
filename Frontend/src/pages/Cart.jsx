// ✅ FILE: src/pages/Cart.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const placeholderImg = '/placeholder-book.jpg';

const Cart = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [orderInfo, setOrderInfo] = useState(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [fulfilledOrders, setFulfilledOrders] = useState(0);

  useEffect(() => {
    fetchCart();
    fetchFulfilledOrders();
    // eslint-disable-next-line
  }, []);

  const fetchCart = async () => {
    setLoading(true);
    setError('');
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

  const fetchFulfilledOrders = async () => {
    try {
      const res = await axios.get('http://localhost:5176/api/Orders/fulfilled-count', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFulfilledOrders(res.data.fulfilledCount);
    } catch (err) {
      setFulfilledOrders(0);
    }
  };

  const handleUpdateQuantity = async (bookId, quantity) => {
    setError('');
    setSuccess('');
    try {
      await axios.post('http://localhost:5176/api/Cart', {
        bookId,
        quantity
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Cart updated!');
      fetchCart();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update quantity');
    }
  };

  const handleRemoveItem = async (bookId) => {
    setError('');
    setSuccess('');
    try {
      await axios.delete(`http://localhost:5176/api/Cart/${bookId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Item removed!');
      fetchCart();
    } catch (err) {
      setError('Failed to remove item');
    }
  };

  const handleClearCart = async () => {
    setError('');
    setSuccess('');
    try {
      await axios.delete('http://localhost:5176/api/Cart/clear', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Cart cleared!');
      fetchCart();
    } catch (err) {
      setError('Failed to clear cart');
    }
  };

  const handleCheckout = async () => {
    setError('');
    setSuccess('');
    setOrderInfo(null);
    if (cart.length === 0) {
      setError('Your cart is empty.');
      return;
    }
    setIsPlacingOrder(true);
    try {
      const items = cart.map(item => ({
        bookId: item.bookId,
        quantity: item.quantity
      }));
      const res = await axios.post('http://localhost:5176/api/Orders', {
        items
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrderInfo(res.data);
      setSuccess('Order placed successfully! A bill and claim code have been sent to your email.');
      setCart([]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalBookDiscount = cart.reduce((sum, item) => {
    if (item.isOnSale && item.discountPercent > 0) {
      return sum + ((item.price * item.discountPercent / 100) * item.quantity);
    }
    return sum;
  }, 0);
  const afterBookDiscount = subtotal - totalBookDiscount;
  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  const fivePercent = totalQuantity >= 5 ? afterBookDiscount * 0.05 : 0;
  const tenPercent = fulfilledOrders >= 10 ? (afterBookDiscount - fivePercent) * 0.10 : 0;
  const finalTotal = afterBookDiscount - fivePercent - tenPercent;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">🛒 Your Cart</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-600 mb-4">{success}</p>}

      {cart.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">Your cart is empty</p>
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
                  <tr key={item.bookId}>
                    <td className="px-6 py-4 flex items-center gap-3">
                      <img
                        src={item.imageUrl ? `http://localhost:5176${item.imageUrl}` : placeholderImg}
                        alt={item.bookTitle}
                        className="h-16 w-12 object-contain rounded shadow border"
                        onError={e => { e.target.onerror = null; e.target.src = placeholderImg; }}
                      />
                      <div>
                        <div className="font-medium">{item.bookTitle}</div>
                        <div className="text-sm text-gray-500">By {item.author}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleUpdateQuantity(item.bookId, Math.max(1, item.quantity - 1))}
                          className="text-gray-500 hover:text-gray-700 px-2"
                        >-</button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.bookId, item.quantity + 1)}
                          className="text-gray-500 hover:text-gray-700 px-2"
                        >+</button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {item.isOnSale && item.discountPercent > 0 ? (
                        <>
                          <div className="text-sm text-gray-500 line-through">${item.price.toFixed(2)} each</div>
                          <div className="font-medium text-green-700">
                            ${(item.price * (1 - item.discountPercent / 100) * item.quantity).toFixed(2)}
                            <span className="ml-1 text-xs text-green-700">({item.discountPercent}% off)</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="font-medium">${(item.price * item.quantity).toFixed(2)}</div>
                          <div className="text-sm text-gray-500">${item.price.toFixed(2)} each</div>
                        </>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleRemoveItem(item.bookId)}
                        className="text-red-600 hover:text-red-800"
                      >Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-2">
              <div>
                <p className="text-lg font-medium">Subtotal:</p>
              </div>
              <p className="text-lg">${subtotal.toFixed(2)}</p>
            </div>
            <div className="flex justify-between items-center mb-2">
              <div>
                <p className="text-lg font-medium">Book Discounts:</p>
              </div>
              <p className="text-lg text-green-700">-${totalBookDiscount.toFixed(2)}</p>
            </div>
            {fivePercent > 0 && (
              <div className="flex justify-between items-center mb-2">
                <div>
                  <p className="text-lg font-medium">5% Discount (5+ books):</p>
                </div>
                <p className="text-lg text-green-700">-${fivePercent.toFixed(2)}</p>
              </div>
            )}
            {tenPercent > 0 && (
              <div className="flex justify-between items-center mb-2">
                <div>
                  <p className="text-lg font-medium">
                    10% Loyalty Discount
                    <span className="ml-1 text-xs text-gray-500">(after 10 fulfilled orders)</span>
                  </p>
                </div>
                <p className="text-lg text-green-700">-${tenPercent.toFixed(2)}</p>
              </div>
            )}
            <div className="flex justify-between items-center mb-2">
              <div>
                <p className="text-xl font-bold">Total After Discounts:</p>
              </div>
              <p className="text-2xl font-bold">${finalTotal.toFixed(2)}</p>
            </div>
            <button
              className="mt-4 w-full bg-gray-200 text-gray-700 py-2 px-4 rounded hover:bg-gray-300"
              onClick={handleClearCart}
              disabled={isPlacingOrder}
            >
              Clear Cart
            </button>
            <button
              className="mt-4 w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleCheckout}
              disabled={isPlacingOrder || cart.length === 0}
            >
              {isPlacingOrder ? 'Placing your order...' : 'Checkout'}
            </button>
            {orderInfo && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded">
                <h3 className="font-bold text-green-700 mb-2">Order Confirmation</h3>
                <p>Order ID: <span className="font-mono">{orderInfo.orderId}</span></p>
                <p>Total Paid: <span className="font-mono">${orderInfo.totalAmount?.toFixed(2) || orderInfo.totalPrice?.toFixed(2)}</span></p>
                {orderInfo.claimCode && (
                  <p>Claim Code: <span className="font-mono">{orderInfo.claimCode}</span></p>
                )}
                {orderInfo.appliedFivePercentDiscount && (
                  <p className="text-green-600">5% discount applied for 5+ books!</p>
                )}
                {orderInfo.appliedTenPercentDiscount && (
                  <p className="text-green-600">10% loyalty discount applied (after 10 fulfilled orders)!</p>
                )}
                <p className="mt-2 text-sm text-gray-600">A bill and claim code have been sent to your email.</p>
                <button
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  onClick={() => navigate('/orders')}
                >
                  View My Orders
                </button>
              </div>
            )}
            {isPlacingOrder && (
              <div className="flex justify-center items-center mt-4">
                <span className="loader mr-2"></span>
                <span className="text-gray-600">Placing your order, please wait...</span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;

<style>
{`
.loader {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #6366f1;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`}
</style>
