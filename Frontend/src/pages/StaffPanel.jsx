import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const StaffPanel = () => {
  const { token } = useAuth();
  const [claimCode, setClaimCode] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleFulfillOrder = async (e) => {
    e.preventDefault();
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
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-3xl font-bold mb-6">Staff Panel</h1>
      
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Fulfill Order</h2>
        
        {message && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
            {message}
          </div>
        )}
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleFulfillOrder}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Order Claim Code
            </label>
            <input
              type="text"
              value={claimCode}
              onChange={(e) => setClaimCode(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
              placeholder="Enter claim code"
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Fulfill Order
          </button>
        </form>
      </div>
    </div>
  );
};

export default StaffPanel;
