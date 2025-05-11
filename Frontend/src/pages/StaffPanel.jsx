import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const StaffPanel = () => {
  const { token } = useAuth();
  const [claimCode, setClaimCode] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFulfillOrder = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await axios.post(
        'http://localhost:5176/api/Staff/fulfill-order',
        { claimCode },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessage(response.data.message);
      setClaimCode('');
      setError('');
    } catch (err) {
      setError('Failed to fulfill order. Please check the claim code.');
      setMessage('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-4 md:pt-8 px-10 max-w-7xl mx-auto">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Fullfill Order</h2>
          <p className="text-gray-600">Manage and fulfill book orders</p>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto">
        {/* Fulfill Order Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
        >
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <Package className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Fulfill Order</h3>
            </div>

            <AnimatePresence mode="wait">
              {message && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3"
                >
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <p className="text-green-700">{message}</p>
                </motion.div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
                >
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <p className="text-red-700">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleFulfillOrder} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order Claim Code
                </label>
                <input
                  type="text"
                  value={claimCode}
                  onChange={(e) => setClaimCode(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-all duration-200"
                  required
                  placeholder="Enter claim code"
                />
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    Fulfill Order
                  </>
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default StaffPanel;
