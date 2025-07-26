import React, { useEffect, useState } from 'react';
import GeocodingService from '../services/GeocodingService';
import RouteService from '../services/RouteService';
import { connectWebSocket } from '../websocket/WebSocketService';

const StatusMonitor = () => {
    const [status, setStatus] = useState({
        websocket: 'Checking...',
        routing: 'Checking...',
        geocoding: 'Checking...'
    });

    const [countdown, setCountdown] = useState(60);
    const resetCountdown = () => setCountdown(60);

    const checkWebSocket = async () => {
        try {
            const connected = await new Promise(resolve => {
                connectWebSocket(() => resolve(true));
                setTimeout(() => resolve(false), 3000);
            });
            setStatus(prev => ({ ...prev, websocket: connected ? 'OK' : 'Error' }));
        } catch {
            setStatus(prev => ({ ...prev, websocket: 'Error' }));
        }
    };

    const checkRouting = async () => {
        try {
            const start = [8.681495, 49.41461];
            const end = [8.687872, 49.420318];
            const { error } = await RouteService.calculateRoute([start, end]);
            setStatus(prev => ({ ...prev, routing: error ? 'Error' : 'OK' }));
        } catch {
            setStatus(prev => ({ ...prev, routing: 'Error' }));
        }
    };

    const checkGeocoding = async () => {
        try {
            const { suggestions } = await GeocodingService.fetchSuggestions({ query: 'Berlin' });
            setStatus(prev => ({ ...prev, geocoding: suggestions?.length ? 'OK' : 'Error' }));
        } catch {
            setStatus(prev => ({ ...prev, geocoding: 'Error' }));
        }
    };

    const runAllChecks = async () => {
        await checkWebSocket();
        await checkRouting();
        await checkGeocoding();
        resetCountdown();
    };

    useEffect(() => {
        runAllChecks();

        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev === 1) {
                    runAllChecks();
                    return 60;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            width: '100%',
            backgroundColor: '#f0f0f0',
            borderTop: '1px solid #ccc',
            padding: '6px 12px',
            fontSize: '14px',
            textAlign: 'center',
            zIndex: 1000
        }}>
            WebSocket: {status.websocket} | Routing: {status.routing} | Geocoding: {status.geocoding} | {countdown}s
            <button onClick={runAllChecks} style={{ marginLeft: '10px' }}>Check Now</button>
            <a
                href="https://status.openrouteservice.org/"
                target="_blank"
                rel="noopener noreferrer"
            >
                https://status.openrouteservice.org/
            </a>


        </div>
    );
};

export default StatusMonitor;
