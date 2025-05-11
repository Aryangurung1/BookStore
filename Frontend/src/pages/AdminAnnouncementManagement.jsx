import React, { useEffect, useState, Fragment } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Dialog, Transition } from '@headlessui/react';
import { Plus, Trash2, X, Megaphone } from 'lucide-react';

const Tooltip = ({ children, text }) => (
  <div className="relative group">
    {children}
    <span className="absolute z-20 left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg transition-opacity duration-200 opacity-90">
      {text}
    </span>
  </div>
);

const AdminAnnouncementManagement = () => {
  const { token } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    startTime: '',
    endTime: '',
    type: 'info'
  });
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await axios.get('http://localhost:5176/api/Announcement/active');
      setAnnouncements(res.data);
    } catch (err) {
      setError('Failed to fetch announcements');
      console.error('Error fetching announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString()
      };

      await axios.post(
        'http://localhost:5176/api/Announcement',
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Announcement added successfully');
      fetchAnnouncements();
      setShowAddModal(false);
      setFormData({
        title: '',
        message: '',
        startTime: '',
        endTime: '',
        type: 'info'
      });
    } catch (err) {
      setError('Failed to add announcement');
      console.error('Error saving announcement:', err);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:5176/api/Announcement/${deleteId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Announcement deleted successfully');
      fetchAnnouncements();
      setShowDeleteModal(false);
      setDeleteId(null);
    } catch (err) {
      setError('Failed to delete announcement');
      console.error('Error deleting announcement:', err);
    }
  };

  const getTypeBadgeClass = (type) => {
    switch (type?.toLowerCase()) {
      case 'info':
        return 'bg-blue-100 text-blue-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type) => {
    if (!type) return 'Info';
    return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/90 rounded-2xl shadow-2xl border border-gray-100 p-0 md:p-8">
          <div className="mb-8 flex items-center space-x-4">
            <div className="p-3 bg-indigo-100 rounded-xl">
              <Megaphone className="w-7 h-7 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Announcement Management</h2>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg animate-pulse">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg animate-pulse">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700 font-medium">{success}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end mb-6">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-indigo-600 to-indigo-500 text-white px-4 py-2 rounded-lg hover:from-indigo-700 hover:to-indigo-600 flex items-center gap-2 shadow-md transition-all duration-200 hover:shadow-lg"
            >
              <Plus className="h-5 w-5" />
              Add New Announcement
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            </div>
          ) : announcements.length === 0 ? (
            <div className="bg-gray-50 rounded-lg border border-dashed border-gray-300 p-12 text-center">
              <Megaphone className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No announcements found</h3>
              <p className="mt-1 text-gray-500">Get started by adding a new announcement.</p>
              <div className="mt-6">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Plus className="-ml-1 mr-2 h-5 w-5" />
                  Add Announcement
                </button>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {announcements.map((announcement) => (
                <div
                  key={announcement.announcementId}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 p-6 group relative"
                >
                  <div className="absolute top-4 right-4">
                    <Tooltip text="Delete Announcement">
                      <button
                        onClick={() => { setDeleteId(announcement.announcementId); setShowDeleteModal(true); }}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </Tooltip>
                  </div>

                  <div className="mb-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadgeClass(announcement.type)}`}>
                      {getTypeLabel(announcement.type)}
                    </span>
                  </div>

                  <button onClick={() => { setSelectedAnnouncement(announcement); setShowDetailModal(true); }} className="text-lg font-semibold text-indigo-700 hover:underline focus:outline-none mb-2 text-left w-full">{announcement.title}</button>

                  <div className="border-t border-gray-100 pt-4 mt-4">
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Start: {new Date(announcement.startTime).toLocaleDateString()}</span>
                      <span>End: {new Date(announcement.endTime).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Announcement Modal */}
          <Transition.Root show={showAddModal} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={() => {
              setShowAddModal(false);
              setFormData({
                title: '',
                message: '',
                startTime: '',
                endTime: '',
                type: 'info'
              });
            }}>
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
                    <Dialog.Panel className="relative transform overflow-hidden rounded-2xl bg-white p-8 text-left shadow-2xl border max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                      <div className="absolute top-0 right-0 pt-4 pr-4">
                        <button
                          type="button"
                          className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                          onClick={() => {
                            setShowAddModal(false);
                            setFormData({
                              title: '',
                              message: '',
                              startTime: '',
                              endTime: '',
                              type: 'info'
                            });
                          }}
                        >
                          <span className="sr-only">Close</span>
                          <X className="h-6 w-6" aria-hidden="true" />
                        </button>
                      </div>
                      <div className="sm:flex sm:items-start">
                        <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                          <Plus className="h-6 w-6 text-indigo-600" aria-hidden="true" />
                        </div>
                        <div className="mt-4 sm:mt-0 sm:ml-4 sm:text-left w-full">
                          <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                            Add New Announcement
                          </Dialog.Title>
                          <div className="mt-4">
                            <form onSubmit={handleSubmit} className="space-y-6">
                              <div>
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                                  Title *
                                </label>
                                <input
                                  type="text"
                                  name="title"
                                  id="title"
                                  value={formData.title}
                                  onChange={handleInputChange}
                                  className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors placeholder-gray-400"
                                  required
                                />
                              </div>

                              <div>
                                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                                  Message *
                                </label>
                                <textarea
                                  name="message"
                                  id="message"
                                  rows={4}
                                  value={formData.message}
                                  onChange={handleInputChange}
                                  className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors placeholder-gray-400"
                                  required
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
                                    Start Date
                                  </label>
                                  <input
                                    type="date"
                                    name="startTime"
                                    id="startTime"
                                    value={formData.startTime}
                                    onChange={handleInputChange}
                                    className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors placeholder-gray-400"
                                    required
                                  />
                                </div>

                                <div>
                                  <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
                                    End Date
                                  </label>
                                  <input
                                    type="date"
                                    name="endTime"
                                    id="endTime"
                                    value={formData.endTime}
                                    onChange={handleInputChange}
                                    className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors placeholder-gray-400"
                                    required
                                  />
                                </div>
                              </div>

                              <div>
                                <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                                  Type
                                </label>
                                <select
                                  name="type"
                                  id="type"
                                  value={formData.type}
                                  onChange={handleInputChange}
                                  className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors placeholder-gray-400"
                                >
                                  <option value="info">Info</option>
                                  <option value="warning">Warning</option>
                                  <option value="error">Error</option>
                                </select>
                              </div>

                              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                                <button
                                  type="submit"
                                  className="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                  Add Announcement
                                </button>
                                <button
                                  type="button"
                                  className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                                  onClick={() => {
                                    setShowAddModal(false);
                                    setFormData({
                                      title: '',
                                      message: '',
                                      startTime: '',
                                      endTime: '',
                                      type: 'info'
                                    });
                                  }}
                                >
                                  Cancel
                                </button>
                              </div>
                            </form>
                          </div>
                        </div>
                      </div>
                    </Dialog.Panel>
                  </Transition.Child>
                </div>
              </div>
            </Dialog>
          </Transition.Root>

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
                            Delete Announcement
                          </Dialog.Title>
                          <div className="mt-2">
                            <p className="text-sm text-gray-500 mb-2">
                              Are you sure you want to delete this announcement? This action cannot be undone.
                            </p>
                            {announcements.find(a => a.announcementId === deleteId) && (
                              <div className="bg-gray-50 rounded p-3 text-gray-700 text-sm">
                                <strong>Title:</strong> {announcements.find(a => a.announcementId === deleteId).title}
                                <br />
                                <strong>Message:</strong> {announcements.find(a => a.announcementId === deleteId).message}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                        <button
                          type="button"
                          className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                          onClick={handleDelete}
                        >
                          Delete
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

          {showDetailModal && selectedAnnouncement && (
            <Transition.Root show={showDetailModal} as={Fragment}>
              <Dialog as="div" className="relative z-50" onClose={() => setShowDetailModal(false)}>
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
                      <Dialog.Panel className="relative transform overflow-hidden rounded-2xl bg-white p-8 text-left shadow-2xl border max-w-lg w-full">
                        <Dialog.Title as="h3" className="text-2xl font-bold text-indigo-700 mb-4">
                          {selectedAnnouncement.title}
                        </Dialog.Title>
                        <div className="mb-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadgeClass(selectedAnnouncement.type)}`}>
                            {getTypeLabel(selectedAnnouncement.type)}
                          </span>
                        </div>
                        <div className="mb-4 text-gray-700 whitespace-pre-line">
                          {selectedAnnouncement.message}
                        </div>
                        <div className="flex justify-between text-sm text-gray-500 border-t pt-4">
                          <span>Start: {new Date(selectedAnnouncement.startTime).toLocaleDateString()}</span>
                          <span>End: {new Date(selectedAnnouncement.endTime).toLocaleDateString()}</span>
                        </div>
                        <div className="mt-6 flex justify-end">
                          <button
                            type="button"
                            className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                            onClick={() => setShowDetailModal(false)}
                          >
                            Close
                          </button>
                        </div>
                      </Dialog.Panel>
                    </Transition.Child>
                  </div>
                </div>
              </Dialog>
            </Transition.Root>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAnnouncementManagement; 