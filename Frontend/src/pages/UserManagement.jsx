// ✅ FILE: src/pages/UserManagement.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const UserManagement = () => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('members');
  const [members, setMembers] = useState([]);
  const [staffs, setStaffs] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [newStaff, setNewStaff] = useState({
    name: '',
    email: '',
    password: '',
    position: ''
  });

  useEffect(() => {
    if (activeTab === 'members') {
      fetchMembers();
    } else {
      fetchStaffs();
    }
  }, [activeTab]);

  const fetchMembers = async () => {
    try {
      const res = await axios.get('http://localhost:5176/api/Admin/members', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMembers(res.data);
    } catch (err) {
      setError('Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  const fetchStaffs = async () => {
    try {
      const res = await axios.get('http://localhost:5176/api/Admin/staffs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStaffs(res.data);
    } catch (err) {
      setError('Failed to load staff');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5176/api/Admin/staffs', newStaff, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewStaff({ name: '', email: '', password: '', position: '' });
      // Add the new staff to the list
      setStaffs(prev => [...prev, res.data.staff]);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add staff member');
    }
  };

  const handleDeleteStaff = async (staffId) => {
    if (!staffId) {
      setError('Invalid staff ID');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this staff member?')) return;
    
    try {
      await axios.delete(`http://localhost:5176/api/Admin/staffs/${staffId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Remove the deleted staff from the list
      setStaffs(prev => prev.filter(staff => staff.staffId !== staffId));
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete staff member');
    }
  };

  const handleDeleteMember = async (memberId) => {
    if (!memberId) {
      setError('Invalid member ID');
      return;
    }
    
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this member? This will also delete all their orders, cart items, reviews, and bookmarks. This action cannot be undone.'
    );
    
    if (!confirmDelete) return;
    
    try {
      await axios.delete(`http://localhost:5176/api/Admin/members/${memberId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Remove the deleted member from the list
      setMembers(prev => prev.filter(member => member.memberId !== memberId));
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete member');
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">User Management</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('members')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'members'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              👥 Members
            </button>
            <button
              onClick={() => setActiveTab('staff')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'staff'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              👔 Staff
            </button>
          </nav>
        </div>
      </div>

      {activeTab === 'members' && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {members.map((member, idx) => (
            <div key={member.memberId || idx} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg mb-2">{member.fullName}</h3>
                  <p className="text-gray-600 text-sm">{member.email}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Joined: {new Date(member.joinDate).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteMember(member.memberId)}
                  className="text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'staff' && (
        <div>
          <div className="mb-8 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Add New Staff Member</h2>
            <form onSubmit={handleAddStaff}>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={newStaff.name}
                    onChange={(e) =>
                      setNewStaff((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newStaff.email}
                    onChange={(e) =>
                      setNewStaff((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={newStaff.password}
                    onChange={(e) =>
                      setNewStaff((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Position
                  </label>
                  <input
                    type="text"
                    value={newStaff.position}
                    onChange={(e) =>
                      setNewStaff((prev) => ({
                        ...prev,
                        position: e.target.value,
                      }))
                    }
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
              >
                Add Staff Member
              </button>
            </form>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {staffs.map((staff, idx) => (
              <div key={staff.staffId || idx} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{staff.fullName}</h3>
                    <p className="text-gray-600 text-sm">{staff.email}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Position: {staff.position}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteStaff(staff.staffId)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
