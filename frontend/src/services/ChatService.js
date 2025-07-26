import axios from 'axios';

const API_BASE_URL =
    window.location.hostname === 'localhost'
        ? 'http://localhost:8080'
        : 'http://backend:8080';

const ChatService = {


    getMessages: async (driveOfferId) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/chat/${driveOfferId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching data:', error.response?.data || error.message);
            throw error;
        }
    },


    markChatOpened: async (driveOfferId, role) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/api/chat/${driveOfferId}/opened?role=${role}`);
            return response.data;
        } catch (error) {
            console.error('Error marking Chat as opened:', error.response?.data || error.message);
            throw error;
        }
    },

    editMessage: async (messageId, username, newContent) => {
        try {
            const response = await axios.put(`${API_BASE_URL}/api/chat/${messageId}?username=${username}&newContent=${newContent}`);
            return response.data;
        } catch (error) {
            console.error('Error editing message:', error.response?.data || error.message);
            throw error;
        }
    },

    deleteMessage: async (messageId, username) => {
        try {
            const response = await axios.delete(`${API_BASE_URL}/api/chat/${messageId}?username=${username}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting Message:', error.response?.data || error.message);
            throw error;
        }
    }

};

export default ChatService;
