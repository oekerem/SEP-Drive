
import axios from 'axios';

const API_BASE_URL =
    window.location.hostname === 'localhost'
        ? 'http://localhost:8080/api'
        : 'http://backend:8080/api';

const AuthService = {
    // Login user
    login: async (username, password) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/users/login`, { username, password });
            const user = response.data;
            console.log(user);
            localStorage.setItem('user', JSON.stringify(user));
            return user;
        } catch (error) {
            console.error('Login error:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Invalid credentials');
        }
    },

    // Logout clear local storage
    logout: () => {
        localStorage.removeItem('user');
        window.location.href = '/login';

    },

    // Register new user
    register: async (userData) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/users/register`, userData);
            return response.data;
        } catch (error) {
            console.error('Registration error:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Registration failed');
        }
    },

    //Get current user from local storage
    getCurrentUser: () => {

        return JSON.parse(localStorage.getItem('user'));
    }



};

export default AuthService;
