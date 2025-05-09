import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const announcementService = {
    getAllAnnouncements: async () => {
        const response = await axios.get(`${API_URL}/announcements`);
        return response.data;
    },

    createAnnouncement: async (announcement) => {
        const response = await axios.post(`${API_URL}/announcements`, announcement);
        return response.data;
    },

    updateAnnouncement: async (id, announcement) => {
        const response = await axios.put(`${API_URL}/announcements/${id}`, announcement);
        return response.data;
    },

    deleteAnnouncement: async (id) => {
        const response = await axios.delete(`${API_URL}/announcements/${id}`);
        return response.data;
    }
}; 