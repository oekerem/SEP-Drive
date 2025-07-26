import axios from "axios";

const API_BASE_URL =
    window.location.hostname === 'localhost'
        ? 'http://localhost:8080/api/drives'
        : 'http://backend:8080/api/drives';

const RideHistoryService = {

    getRideHistory: async (username) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/history/${username}`);

            return response.data;
        } catch (error) {
            console.error('Error fetching data:', error.response?.data || error.message);
            throw error;
        }
    }
};

export default RideHistoryService