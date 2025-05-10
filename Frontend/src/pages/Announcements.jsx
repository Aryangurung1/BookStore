import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await axios.get('http://localhost:5176/api/announcements/active');
        setAnnouncements(res.data);
      } catch (error) {
        console.error('Failed to fetch announcements:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  const getAnnouncementTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'deal':
        return 'bg-green-50 border-green-200 hover:bg-green-100';
      case 'info':
        return 'bg-blue-50 border-blue-200 hover:bg-blue-100';
      case 'new':
        return 'bg-purple-50 border-purple-200 hover:bg-purple-100';
      default:
        return 'bg-white hover:bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Announcements</h1>
        <p className="text-gray-600">Stay updated with our latest news and offers</p>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {announcements.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 bg-gray-50 rounded-lg"
            >
              <p className="text-gray-500">No active announcements at the moment</p>
            </motion.div>
          ) : (
            announcements.map((a) => (
              <motion.div
                key={a.announcementId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`p-6 rounded-lg shadow-sm border transition-all duration-200 cursor-pointer ${getAnnouncementTypeColor(a.type)}`}
                onClick={() => setSelected(a)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-semibold text-lg text-gray-900 mb-1">{a.title}</h2>
                    <p className="text-gray-600 line-clamp-2">{a.message}</p>
                  </div>
                  {a.type && (
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800">
                      {a.type}
                    </span>
                  )}
                </div>
                <div className="mt-4 flex items-center text-sm text-gray-500">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Expires: {format(new Date(a.endTime), 'MMM d, yyyy h:mm a')}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Modal for details */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-2xl w-full shadow-2xl relative"
              onClick={e => e.stopPropagation()}
            >
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors"
                onClick={() => setSelected(null)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{selected.title}</h2>
                  {selected.type && (
                    <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-indigo-100 text-indigo-800 mb-4">
                      {selected.type}
                    </span>
                  )}
                </div>

                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-line">{selected.message}</p>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                    <div>
                      <span className="font-medium">Start:</span>{' '}
                      {selected.startTime ? format(new Date(selected.startTime), 'MMM d, yyyy h:mm a') : '-'}
                    </div>
                    <div>
                      <span className="font-medium">End:</span>{' '}
                      {selected.endTime ? format(new Date(selected.endTime), 'MMM d, yyyy h:mm a') : '-'}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Announcements; 