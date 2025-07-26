import axios from 'axios';

const API_BASE_URL =
    window.location.hostname === 'localhost'
        ? 'http://localhost:8080/api/users'
        : 'http://backend:8080/api/users';

const UserService = {
    // Get any user by username
    getUserByUsername: async (username) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/profile/${username}`);
            console.log(response.data);
            return response.data;

        } catch (error) {
            console.error('Error fetching user:', error.response?.data || error.message);
            return null;
        }
    }
};

export default UserService;
