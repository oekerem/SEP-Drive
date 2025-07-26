import axios from 'axios';

const API_BASE_URL =
    window.location.hostname === 'localhost'
        ? 'http://localhost:8080/api/wallet'
        : 'http://backend:8080/api/wallet';



const WalletService = {
    getBalance: async (username) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/${username}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching balance:', error.response?.data || error.message);
            throw error;
        }
    },

    uploadMoney: async (username,input) => {
        try {
            await axios.post(`${API_BASE_URL}/${username}/deposit`, {
                amount: input
            });
            return { success: true, error: null };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Geld konnte nicht hochgeladen werden'
            };
        }
    }
};


export default WalletService