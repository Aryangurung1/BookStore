// ✅ FILE: src/pages/Cart.jsx
import React, { useEffect, useState, Fragment } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Trash2, Plus, Minus, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';

const placeholderImg = '/placeholder-book.jpg';

const Cart = () => {
  const { token, user } = useAuth();
  const { updateCartCount } = useCart();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderInfo, setOrderInfo] = useState(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [fulfilledOrders, setFulfilledOrders] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);
  const [showClearCartModal, setShowClearCartModal] = useState(false);

  useEffect(() => {
    fetchCart();
    fetchFulfilledOrders();
    // eslint-disable-next-line
  }, []);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5176/api/Cart', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCart(res.data);
    } catch (err) {
      console.error('Failed to load cart:', err);
      addToast('Failed to load cart', 'error');
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
      console.error('Failed to fetch fulfilled orders:', err);
      setFulfilledOrders(0);
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
      addToast('Cart updated successfully', 'success');
      fetchCart();
      updateCartCount();
    } catch (err) {
      console.error('Failed to update quantity:', err);
      addToast(err.response?.data?.message || 'Failed to update quantity', 'error');
    }
  };

  const handleRemoveItem = async (bookId) => {
    setDeleteItemId(bookId);
    setShowDeleteModal(true);
  };

  const confirmRemoveItem = async () => {
    try {
      await axios.delete(`http://localhost:5176/api/Cart/${deleteItemId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      addToast('Item removed from cart', 'success');
      fetchCart();
      updateCartCount();
      setShowDeleteModal(false);
      setDeleteItemId(null);
    } catch (err) {
      console.error('Failed to remove item:', err);
      addToast('Failed to remove item from cart', 'error');
    }
  };

  const handleClearCart = async () => {
    setShowClearCartModal(true);
  };

  const confirmClearCart = async () => {
    try {
      await axios.delete('http://localhost:5176/api/Cart/clear', {
        headers: { Authorization: `Bearer ${token}` }
      });
      addToast('Cart cleared successfully', 'success');
      fetchCart();
      updateCartCount();
      setShowClearCartModal(false);
    } catch (err) {
      console.error('Failed to clear cart:', err);
      addToast('Failed to clear cart', 'error');
    }
  };

  const handleCheckout = async () => {
    setOrderInfo(null);
    if (cart.length === 0) {
      addToast('Your cart is empty', 'warning');
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
      addToast('Order placed successfully! A bill and claim code have been sent to your email.', 'success');
      setCart([]);
    } catch (err) {
      console.error('Failed to place order:', err);
      addToast(err.response?.data?.message || 'Failed to place order', 'error');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-gray-600">Loading your cart...</p>
        </div>
      </div>
    );
  }

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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <ShoppingBag className="w-8 h-8 text-indigo-600" />
            Your Shopping Cart
          </h1>
          {cart.length > 0 && (
            <span className="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full text-sm font-medium">
              {cart.length} {cart.length === 1 ? 'item' : 'items'}
            </span>
          )}
        </div>

        {cart.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center"
          >
            <div className="max-w-md mx-auto">
              <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h3>
              <p className="text-gray-500 mb-6">Looks like you haven't added any books to your cart yet.</p>
              <button
                onClick={() => navigate('/books')}
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
              >
                Browse Books
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence>
                {cart.map((item, index) => (
                  <motion.div
                    key={item.bookId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="p-6">
                      <div className="flex gap-6">
                        <div className="flex-shrink-0">
                          <img
                            src={item.imageUrl ? `http://localhost:5176${item.imageUrl}` : placeholderImg}
                            alt={item.bookTitle}
                            className="h-32 w-24 object-cover rounded-lg shadow-sm"
                            onError={e => { e.target.onerror = null; e.target.src = placeholderImg; }}
                          />
                        </div>
                        <div className="flex-grow">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.bookTitle}</h3>
                              <p className="text-gray-600 mb-2">By {item.author}</p>
                              {item.isOnSale && item.discountPercent > 0 && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  {item.discountPercent}% OFF
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() => handleRemoveItem(item.bookId)}
                              className="text-gray-400 hover:text-red-600 transition-colors"
                              title="Remove item"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                          <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => handleUpdateQuantity(item.bookId, Math.max(1, item.quantity - 1))}
                                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                              >
                                <Minus className="w-4 h-4 text-gray-600" />
                              </button>
                              <span className="w-8 text-center font-medium">{item.quantity}</span>
                              <button
                                onClick={() => handleUpdateQuantity(item.bookId, item.quantity + 1)}
                                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                              >
                                <Plus className="w-4 h-4 text-gray-600" />
                              </button>
                            </div>
                            <div className="text-right">
                              {item.isOnSale && item.discountPercent > 0 ? (
                                <>
                                  <div className="text-sm text-gray-500 line-through">${item.price.toFixed(2)} each</div>
                                  <div className="font-semibold text-green-700">
                                    ${(item.price * (1 - item.discountPercent / 100) * item.quantity).toFixed(2)}
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="font-semibold text-gray-900">${(item.price * item.quantity).toFixed(2)}</div>
                                  <div className="text-sm text-gray-500">${item.price.toFixed(2)} each</div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Summary</h2>
                
                <div className="space-y-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  
                  {totalBookDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Book Discounts</span>
                      <span>-${totalBookDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  {fivePercent > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>5% Bulk Discount</span>
                      <span>-${fivePercent.toFixed(2)}</span>
                    </div>
                  )}
                  
                  {tenPercent > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>10% Loyalty Discount</span>
                      <span>-${tenPercent.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">Total</span>
                      <span className="text-2xl font-bold text-gray-900">${finalTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <button
                    onClick={handleClearCart}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    disabled={isPlacingOrder}
                  >
                    <Trash2 className="w-5 h-5" />
                    Clear Cart
                  </button>
                  
                  <button
                    onClick={handleCheckout}
                    disabled={isPlacingOrder}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPlacingOrder ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-5 h-5" />
                        Checkout
                      </>
                    )}
                  </button>
                </div>

                {orderInfo && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg"
                  >
                    <h3 className="font-semibold text-green-800 mb-3">Order Confirmation</h3>
                    <div className="space-y-2 text-sm">
                      <p className="flex justify-between">
                        <span className="text-gray-600">Order ID:</span>
                        <span className="font-mono font-medium">{orderInfo.orderId}</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-gray-600">Total Paid:</span>
                        <span className="font-mono font-medium">
                          ${orderInfo.totalAmount?.toFixed(2) || orderInfo.totalPrice?.toFixed(2)}
                        </span>
                      </p>
                      {orderInfo.claimCode && (
                        <p className="flex justify-between">
                          <span className="text-gray-600">Claim Code:</span>
                          <span className="font-mono font-medium">{orderInfo.claimCode}</span>
                        </p>
                      )}
                    </div>
                    <div className="mt-4 space-y-2">
                      {orderInfo.appliedFivePercentDiscount && (
                        <p className="text-green-600 text-sm">✓ 5% discount applied for 5+ books</p>
                      )}
                      {orderInfo.appliedTenPercentDiscount && (
                        <p className="text-green-600 text-sm">✓ 10% loyalty discount applied</p>
                      )}
                    </div>
                    <p className="mt-3 text-sm text-gray-600">A bill and claim code have been sent to your email.</p>
                    <button
                      onClick={() => navigate('/orders')}
                      className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      View My Orders
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Transition.Root show={showDeleteModal} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setShowDeleteModal(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-2xl bg-white p-8 text-left shadow-2xl border max-w-md w-full">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                      <Trash2 className="h-6 w-6 text-red-600" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-gray-900">
                        Remove Item
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Are you sure you want to remove this item from your cart?
                        </p>
                        {cart.find(item => item.bookId === deleteItemId) && (
                          <div className="mt-3 bg-gray-50 rounded p-3 text-gray-700 text-sm">
                            <strong>Title:</strong> {cart.find(item => item.bookId === deleteItemId).bookTitle}
                            <br />
                            <strong>Author:</strong> {cart.find(item => item.bookId === deleteItemId).author}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                      type="button"
                      className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                      onClick={confirmRemoveItem}
                    >
                      Remove
                    </button>
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                      onClick={() => setShowDeleteModal(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Clear Cart Confirmation Modal */}
      <Transition.Root show={showClearCartModal} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setShowClearCartModal(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
          </Transition.Child>
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-2xl bg-white p-8 text-left shadow-2xl border max-w-md w-full">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                      <Trash2 className="h-6 w-6 text-red-600" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-gray-900">
                        Clear Cart
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Are you sure you want to clear your entire cart? This action cannot be undone.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                      type="button"
                      className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                      onClick={confirmClearCart}
                    >
                      Clear Cart
                    </button>
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                      onClick={() => setShowClearCartModal(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
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
