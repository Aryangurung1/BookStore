import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:5176/api/announcements/active')
      .then(res => setAnnouncements(res.data));
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Announcements</h1>
      <div className="space-y-4">
        {announcements.map(a => (
          <div
            key={a.announcementId}
            className="p-4 bg-white rounded shadow cursor-pointer hover:bg-indigo-50"
            onClick={() => setSelected(a)}
          >
            <h2 className="font-semibold text-lg">{a.title}</h2>
            <p className="text-gray-500 text-sm">Expires: {new Date(a.endTime).toLocaleString()}</p>
          </div>
        ))}
      </div>
      {/* Modal for details */}
      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setSelected(null)}>✕</button>
            <h2 className="text-xl font-bold mb-2">{selected.title}</h2>
            <p className="mb-2 text-gray-700 whitespace-pre-line">{selected.message}</p>
            <div className="text-sm text-gray-500 mb-1">
              <div>Start: {selected.startTime ? new Date(selected.startTime).toLocaleString() : '-'}</div>
              <div>End: {selected.endTime ? new Date(selected.endTime).toLocaleString() : '-'}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Announcements; 