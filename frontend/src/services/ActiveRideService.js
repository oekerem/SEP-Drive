import axios from 'axios';

const API_BASE_URL =
    window.location.hostname === 'localhost'
        ? 'http://localhost:8080/api/drives'
        : 'http://backend:8080/api/drives';

const ActiveRideService = {
    getActiveRideByUsername: async (username) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/active/${username}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching active ride:', error.response?.data || error.message);
            return null;
        }
    },

    cancelRideByUsername: async (username) => {
        try {
            await axios.put(`${API_BASE_URL}/cancel/${username}`);
            return { success: true, error: null };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Fahrt konnte nicht storniert werden'
            };
        }
    }
};

export default ActiveRideService;