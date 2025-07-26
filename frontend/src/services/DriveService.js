import axios from 'axios';

const API_BASE_URL =
    window.location.hostname === 'localhost'
        ? 'http://localhost:8080'
        : 'http://backend:8080';

const DriveService = {
    getAllActiveDrives: async () => {
        const res = await axios.get(`${API_BASE_URL}/api/drives/active/all`);
        console.log(res.data);
        return res.data;
    },

    getActiveDriveForUser: async (username) => {
        const res = await axios.get(`${API_BASE_URL}/api/drives/active/${username}`);
        console.log(res.data);
        return res.data;
    },

    createDriveOffer: async (driveId, usernameFahrer) => {
        return axios.post(`${API_BASE_URL}/api/driveoffer/create`, {
            usernameFahrer,
            driveId,
        });
    },

    getOffersForDrive: async (driveId) => {
        const res = await axios.get(`${API_BASE_URL}/api/driveoffer/drive/${driveId}/offers`);
        return res.data;
    },

    rejectOffer: async (offerId) => {
        const url = `${API_BASE_URL}/api/driveoffer/offers/${offerId}/reject`;
        const res = await axios.put(url);
        return res.data;
    },

    withdrawOffer: async (offerId, usernameFahrer) => {
        const url = `${API_BASE_URL}/api/driveoffer/offers/${offerId}/withdraw?usernameFahrer=${usernameFahrer}`;
        const res = await axios.put(url);
        return res.data;
    },

    getOfferByFahrerUsername: async (username) => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/driveoffer/${username}`);
            console.log(res.data);
            return res.data;
        } catch (err) {
            const status = err.response?.status;
            const message = err.response?.data?.message || err.message;

            if (status === 500 && message.includes("not found")) {
                return null;
            }

            if (status === 404) {
                return null;
            }

            throw err;
        }
    },

    getOfferByFahrerUsernameV2: async (username) => { // More Route Data version
        try {
            const res = await axios.get(`${API_BASE_URL}/api/driveoffer/${username}/v2`);
            console.log(res.data);
            return res.data;
        } catch (err) {
            const status = err.response?.status;
            const message = err.response?.data?.message || err.message;

            if (status === 500 && message.includes("not found")) {
                return null;
            }

            if (status === 404) {
                return null;
            }

            throw err;
        }
    },


    acceptOffer: async (driveId, offerId) => {
        const url = `${API_BASE_URL}/api/driveoffer/drive/${driveId}/offers/${offerId}/accept`;
        const res = await axios.put(url);
        return res.data;
    },

    completeDrive: async (driveId) => {
        const res = await axios.put(`${API_BASE_URL}/api/drives/${driveId}/complete`);
        return res.data;
    }
};

export default DriveService;
