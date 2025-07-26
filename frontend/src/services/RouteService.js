import axios from 'axios';

const API_KEY = 'YOUR_API_KEY_HERE';

const RouteService = {
    async calculateRoute(waypoints) {
        try {
            const response = await axios.post(
                'https://api.openrouteservice.org/v2/directions/driving-car/geojson',
                {
                    coordinates: waypoints,
                    instructions: false
                },
                {
                    headers: {
                        'Authorization': API_KEY,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const route = response.data.features[0];
            return {
                coords: route.geometry.coordinates.map(coord => [coord[1], coord[0]]),
                distance: (route.properties.summary.distance / 1000).toFixed(2),
                duration: (route.properties.summary.duration/60).toFixed(0)
            };
        } catch (error) {
            return { error: "Route berechnen fehlgeschlagen erneut versuchen oder Adresse/Koordinaten korrigieren." };
        }
    },

    async getDistanceBetweenPoints(start, end) {
        try {
            const response = await axios.post(
                'https://api.openrouteservice.org/v2/directions/driving-car',
                {
                    coordinates: [start, end],
                    instructions: false
                },
                {
                    headers: {
                        'Authorization': API_KEY,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const distance = response.data.routes[0].summary.distance;
            return distance / 1000;
        } catch (error) {
            console.error("Fehler bei Distanzberechnung:", error);
            return null;
        }
    },

    async getMatrixDistances(fromCoord, toCoords) {
        try {
            const response = await axios.post(
                'https://api.openrouteservice.org/v2/matrix/driving-car',
                {
                    locations: [fromCoord, ...toCoords],
                    sources: [0],
                    destinations: toCoords.map((_, idx) => idx + 1),
                    metrics: ['distance'],
                },
                {
                    headers: {
                        'Authorization': API_KEY,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data.distances[0].map(m => m / 1000);
        } catch (error) {
            console.error('Matrix API Fehler:', error);
            return null;
        }
    }
};

export default RouteService;
