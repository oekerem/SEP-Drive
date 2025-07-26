import React, { useEffect, useState, useRef, useContext } from 'react';
import { connectWebSocket, subscribe, unsubscribe, sendMessage } from '../websocket/WebSocketService';
import MapComponent from './MapComponent';
import { AuthContext } from '../contexts/AuthContext';
import DriveService from "../services/DriveService";
import RoutePlanner from './RoutePlanner';
import L from 'leaflet';

const CustomerSimulation = () => {
    const { user: currentUser } = useContext(AuthContext);
    const [driveId, setDriveId] = useState(null);
    const [route, setRoute] = useState([]);
    const [stops, setStops] = useState([]);
    const [currentPosition, setCurrentPosition] = useState(null);
    const [duration, setDuration] = useState(30000);
    const [isRunning, setIsRunning] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [startCoords, setStartCoords] = useState(null);
    const [destinationCoords, setDestinationCoords] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [destinationAddress, setDestinationAddress] = useState('');

    const [editableStops, setEditableStops] = useState([]);

    const hasSubscribedRef = useRef(false);

    const fetchDrive = async () => {
        if (!currentUser?.username) return;

        try {
            const drive = await DriveService.getActiveDriveForUser(currentUser.username);
            if (drive?.id && drive?.route?.length > 0) {
                const formattedRoute = drive.route.map(p => ({ lat: p.latitude, lng: p.longitude }));
                setDriveId(drive.id);
                setRoute(formattedRoute);

                setStops((drive.stops || []).map(s => ({
                    address: s.address || '',
                    coordinates: s.coordinates
                })));


                if (drive.startCoordinates?.length === 2) {
                    setStartCoords({ coords: drive.startCoordinates });
                }
                if (drive.endCoordinates?.length === 2) {
                    setDestinationCoords({ coords: drive.endCoordinates });
                    setDestinationAddress(drive.endLocation || '');
                }
                setIsCompleted(false);
            } else {
                setDriveId(null);
                setRoute([]);
                setStops([]);
                setCurrentPosition(null);
                setStartCoords(null);
                setDestinationCoords(null);
                setDestinationAddress('');
                setIsRunning(false);
                setIsCompleted(false);
            }
        } catch (err) {
            console.error('Fehler beim Abrufen des aktiven Drives:', err);
            setIsRunning(false);
            setIsCompleted(false);
        }
    };

    useEffect(() => {
        fetchDrive();
    }, [currentUser]); // run again if user changes

    useEffect(() => {
        if (!driveId || hasSubscribedRef.current) return;

        connectWebSocket(() => {
            subscribe(`/topic/simulation/${driveId}`, handleIncomingMessage);
            hasSubscribedRef.current = true;
        });

        return () => {
            unsubscribe(`/topic/simulation/${driveId}`);
            hasSubscribedRef.current = false;
        };
    }, [driveId]);

    const handleIncomingMessage = async (msg) => {
        if (msg.type === 'POSITION') {
            setCurrentPosition(msg.data);
        } else if (msg.type === 'CONTROL') {
            if (msg.command === 'SPEED') setDuration(msg.millis);
        } else if (msg.type === 'STATUS_UPDATE') {
            setIsRunning(msg.data.isRunning);
            setIsCompleted(msg.data.isCompleted);
            if (msg.data.isCompleted || (!msg.data.isRunning && !msg.data.isCompleted && driveId)) {
                fetchDrive();
            }
        }
    };

    const handlePause = () => {
        sendMessage(`/app/simulation/${driveId}`, { type: 'CONTROL', command: 'PAUSE' });
    };

    const handleResume = () => {
        sendMessage(`/app/simulation/${driveId}`, { type: 'CONTROL', command: 'RESUME' });
    };

    const handleSpeedChange = (e) => {
        const millis = parseInt(e.target.value);
        setDuration(millis);
        sendMessage(`/app/simulation/${driveId}`, {
            type: 'CONTROL',
            command: 'SPEED',
            millis
        });
    };

    const getClosestIndex = (target, routeArray) => {
        if (!target || !routeArray?.length) return -1;

        const targetLatLng = L.latLng(target.lat, target.lng);
        let minDistance = Infinity;
        let closestIndex = -1;

        routeArray.forEach((coord, index) => {
            const pointLatLng = L.latLng(coord.lat, coord.lng);
            const dist = targetLatLng.distanceTo(pointLatLng);
            if (dist < minDistance) {
                minDistance = dist;
                closestIndex = index;
            }
        });

        return closestIndex;
    };

    const handleStartEdit = () => {
        if (!currentPosition || !route.length) return;

        handlePause();

        const currentIdx = getClosestIndex(currentPosition, route);

        const filtered = stops.filter(stop => {
            const coords = stop.coordinates;
            if (!coords || coords.length !== 2) return false;

            const stopLatLng = { lat: coords[1], lng: coords[0] };
            const stopIdx = getClosestIndex(stopLatLng, route);
            return stopIdx >= currentIdx;
        });

        setEditableStops(filtered);
        setEditMode(true);
    };

    const handleCancelEdit = async () => {
        setEditMode(false);
        await fetchDrive();
    };

    const isPaused = !isRunning && !isCompleted && route.length > 0;
    const hasDrive = driveId !== null && route.length > 0;

    return (
        <div>
            <h2>Kunde-Simulation</h2>

            {!hasDrive && !editMode && <p>Keine aktive Fahrt vorhanden.</p>}
            {!route.length && hasDrive && !editMode && <p>Lade Route...</p>}

            {!editMode ? (
                <>
                    <div style={{ marginBottom: '10px' }}>
                        <button
                            onClick={handlePause}
                            disabled={!isRunning || !hasDrive || isCompleted}
                        >
                            Pause
                        </button>
                        <button
                            onClick={handleResume}
                            disabled={!isPaused || !hasDrive || isRunning || isCompleted}
                        >
                            Fortsetzen
                        </button>
                        <button
                            onClick={handleStartEdit}
                            disabled={isRunning || isCompleted || !hasDrive}
                        >
                            Route bearbeiten
                        </button>
                    </div>

                    <label>
                        Geschwindigkeit:
                        <input
                            type="range"
                            min="3000"
                            max="30000"
                            step="1000"
                            value={duration}
                            onChange={handleSpeedChange}
                            style={{ marginLeft: '10px' }}
                            disabled={!hasDrive || isCompleted || isPaused}
                        />
                        <span style={{ marginLeft: '8px' }}>{(duration / 1000).toFixed(1)}s</span>
                    </label>

                    <MapComponent
                        routeCoords={route}
                        currentPosition={currentPosition}
                        selectedStart={startCoords}
                        selectedDestination={destinationCoords}
                        stops={stops.filter(s => s.coordinates).map(s => s.coordinates)}
                    />
                </>
            ) : (
                <RoutePlanner
                    edit={true}
                    rideId={driveId}
                    lockedStart={currentPosition}
                    onCancel={handleCancelEdit}
                    initialRoute={route}
                    initialStops={editableStops}
                    destinationCoordinates={destinationCoords?.coords}
                    destinationAddressText={destinationAddress}
                />
            )}
        </div>
    );
};

export default CustomerSimulation;
