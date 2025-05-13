// ✅ FILE: src/pages/UserManagement.jsx
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Dialog, Transition } from '@headlessui/react';
import { Trash2 } from 'lucide-react';

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
  const [showStaffModal, setShowStaffModal] = useState(false);
  const staffModalRef = useRef(null);
  const [showDeleteMemberModal, setShowDeleteMemberModal] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);

  useEffect(() => {
    if (activeTab === 'members') {
      fetchMembers();
    } else {
      fetchStaffs();
    }
  }, [activeTab]);

  // Close modal on ESC
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') setShowStaffModal(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  // Close modal on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (staffModalRef.current && !staffModalRef.current.contains(event.target)) {
        setShowStaffModal(false);
      }
    }
    if (showStaffModal) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showStaffModal]);

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
    const member = members.find(m => m.memberId === memberId);
    setMemberToDelete(member);
    setShowDeleteMemberModal(true);
  };

  const confirmDeleteMember = async () => {
    if (!memberToDelete) return;
    try {
      await axios.delete(`http://localhost:5176/api/Admin/members/${memberToDelete.memberId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMembers(prev => prev.filter(member => member.memberId !== memberToDelete.memberId));
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete member');
    } finally {
      setShowDeleteMemberModal(false);
      setMemberToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-t-4 border-b-4 border-indigo-600 animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-10 w-10 rounded-full bg-indigo-100"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/90 rounded-2xl shadow-2xl border border-gray-100 p-0 md:p-8 flex flex-col max-h-[80vh]">
          <div className="mb-8 flex items-center space-x-4">
            <div className="p-3 bg-indigo-100 rounded-xl">
              <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">User Management</h1>
          </div>

          {/* Tabs */}
          <div className="mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-10">
                <button
                  onClick={() => setActiveTab('members')}
                  className={`group py-4 px-1 border-b-2 font-semibold text-base flex items-center space-x-3 transition-all duration-200 ${
                    activeTab === 'members'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className={`p-2 rounded-lg ${activeTab === 'members' ? 'bg-indigo-100' : 'bg-gray-100 group-hover:bg-gray-200'} transition-colors duration-200`}>
                    <svg className={`w-5 h-5 ${activeTab === 'members' ? 'text-indigo-600' : 'text-gray-500 group-hover:text-gray-700'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </span>
                  <span>Members</span>
                </button>
                <button
                  onClick={() => setActiveTab('staff')}
                  className={`group py-4 px-1 border-b-2 font-semibold text-base flex items-center space-x-3 transition-all duration-200 ${
                    activeTab === 'staff'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className={`p-2 rounded-lg ${activeTab === 'staff' ? 'bg-blue-100' : 'bg-gray-100 group-hover:bg-gray-200'} transition-colors duration-200`}>
                    <svg className={`w-5 h-5 ${activeTab === 'staff' ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </span>
                  <span>Staff</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Members List */}
          {activeTab === 'members' && (
            <>
              <h2 className="text-xl font-bold text-indigo-700 mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                Members List
              </h2>
              <div className="space-y-4 flex-1 min-h-0 overflow-y-auto pr-2">
                {members.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <p className="text-gray-500 text-lg">No members found</p>
                  </div>
                ) : (
                  members.map((member, idx) => (
                    <div 
                      key={member.memberId || idx} 
                      className="flex items-center bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 px-4 py-3 group relative"
                    >
                      <div className="bg-indigo-100 w-12 h-12 flex items-center justify-center rounded-full mr-4">
                        <span className="text-indigo-600 font-bold text-xl">
                          {member.fullName?.charAt(0).toUpperCase() || "M"}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg text-gray-900 mb-0.5 truncate">{member.fullName}</h3>
                        <div className="flex items-center text-gray-500 text-sm gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span className="truncate">{member.email}</span>
                        </div>
                        <div className="flex items-center text-gray-400 text-xs mt-1 gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Joined: {new Date(member.joinDate).toLocaleDateString()}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteMember(member.memberId)}
                        className="ml-4 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors duration-200"
                        title="Delete member"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                      <div className="absolute left-0 right-0 bottom-0 h-px bg-gradient-to-r from-indigo-100 via-gray-100 to-indigo-100 opacity-60 group-last:hidden" />
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {/* Staff List */}
          {activeTab === 'staff' && (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-blue-700 flex items-center gap-2">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  Staff List
                </h2>
                <button
                  onClick={() => setShowStaffModal(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                  Add Staff
                </button>
              </div>
              {/* Staff Modal */}
              {showStaffModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                  <div ref={staffModalRef} className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg relative animate-fade-in">
                    <button
                      onClick={() => setShowStaffModal(false)}
                      className="absolute top-3 right-3 text-gray-400 hover:text-red-500 focus:outline-none"
                      aria-label="Close"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900">Add New Staff Member</h2>
                    </div>
                    <form onSubmit={handleAddStaff} className="space-y-6">
                      <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700 flex items-center space-x-1">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span>Name</span>
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
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700 flex items-center space-x-1">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span>Email</span>
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
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700 flex items-center space-x-1">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            <span>Password</span>
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
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700 flex items-center space-x-1">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span>Position</span>
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
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm"
                            required
                          />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-sm flex items-center space-x-2 transform active:scale-95"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          <span>Add Staff Member</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
              <div className="space-y-4 flex-1 min-h-0 overflow-y-auto pr-2">
                {staffs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <p className="text-gray-500 text-lg">No staff members found</p>
                  </div>
                ) : (
                  staffs.map((staff, idx) => (
                    <div 
                      key={staff.staffId || idx} 
                      className="flex items-center bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 px-4 py-3 group relative"
                    >
                      <div className="bg-blue-100 w-12 h-12 flex items-center justify-center rounded-full mr-4">
                        <span className="text-blue-600 font-bold text-xl">
                          {staff.name?.charAt(0).toUpperCase() || "S"}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg text-gray-900 mb-0.5 truncate">{staff.name}</h3>
                        <div className="flex items-center text-gray-500 text-sm gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span className="truncate">{staff.email}</span>
                        </div>
                        <div className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          {staff.position}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteStaff(staff.staffId)}
                        className="ml-4 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors duration-200"
                        title="Delete staff member"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                      <div className="absolute left-0 right-0 bottom-0 h-px bg-gradient-to-r from-blue-100 via-gray-100 to-blue-100 opacity-60 group-last:hidden" />
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;