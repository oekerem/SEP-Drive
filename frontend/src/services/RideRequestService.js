import axios from 'axios';
import AuthService from './AuthService';

const API_BASE_URL =
    window.location.hostname === 'localhost'
        ? 'http://localhost:8080/api/drives'
        : 'http://backend:8080/api/drives';

const RideRequestService = {
    sendRequest: async ({
                            startAddress,
                            destinationAddress,
                            startCoordinates,
                            destinationCoordinates,
                            stops = [],
                            route,
                            distance,
                            price,
                            duration

                        }) => {
        const currentUser = AuthService.getCurrentUser();
        if (!currentUser) throw new Error('Kein Benutzer angemeldet');

        const payload = {
            usernameKunde: currentUser.username, // Injected here
            startLocation: startAddress,
            endLocation: destinationAddress,
            startCoordinates,
            endCoordinates: destinationCoordinates,
            stops,
            route,
            distance,
            cost: price,
            duration
        };
        console.log(payload);

        const response = await axios.post(`${API_BASE_URL}/create`, payload);
        return { data: response.data, error: null };
    },

    updateRequest: async ({
                              rideId,
                              startAddress,
                              destinationAddress,
                              startCoordinates,
                              destinationCoordinates,
                              stops = [],
                              route,
                              distance,
                              price,
                              duration
                          }) => {
        const currentUser = AuthService.getCurrentUser();
        if (!currentUser) throw new Error('Kein Benutzer angemeldet');

        const payload = {
            usernameKunde: currentUser.username,
            startLocation: startAddress,
            endLocation: destinationAddress,
            startCoordinates,
            endCoordinates: destinationCoordinates,
            stops,
            route,
            distance,
            cost: price,
            duration
        };
        console.log(payload);

        const response = await axios.put(`${API_BASE_URL}/update/${rideId}`, payload);
        return { data: response.data, error: null };
    }
};

export default RideRequestService;