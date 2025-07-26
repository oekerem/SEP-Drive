import axios from 'axios';

const API_KEY = 'YOUR_API_KEY_HERE';

const GeocodingService = {
    async fetchSuggestions({ query }) {
        const coordMatch = query.match(/^\s*(-?\d+\.?\d*),\s*(-?\d+\.?\d*)\s*$/);
        if (coordMatch) {
            return {
                suggestions: [{
                    text: query.trim(),
                    coordinates: [parseFloat(coordMatch[2]), parseFloat(coordMatch[1])]
                }]
            };
        }


            const response = await axios.get(
                'https://api.openrouteservice.org/geocode/autocomplete',
                {
                    params: {
                        api_key: API_KEY,
                        text: query,
                        'boundary.country': 'DE'
                    },
                    timeout: 5000
                }
            );

            return {
                suggestions: response.data.features.map(f => ({
                    text: f.properties.label,
                    coordinates: f.geometry.coordinates
                }))
            };

    }
};

export default GeocodingService;