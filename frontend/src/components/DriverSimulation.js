import React, { useEffect, useRef, useState, useContext } from 'react';
import { connectWebSocket, subscribe, unsubscribe, sendMessage } from '../websocket/WebSocketService';
import MapComponent from './MapComponent';
import { AuthContext } from '../contexts/AuthContext';
import DriveService from '../services/DriveService';

const DriverSimulation = () => {
    const { user: currentUser } = useContext(AuthContext);

    const [route, setRoute] = useState([]);
    const [stops, setStops] = useState([]);
    const [driveId, setDriveId] = useState(null);
    const [currentPosition, setCurrentPosition] = useState(null);
    const [duration, setDuration] = useState(30000);
    const [isRunning, setIsRunning] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [startCoords, setStartCoords] = useState(null);
    const [destinationCoords, setDestinationCoords] = useState(null);
    const [isOfferAccepted, setIsOfferAccepted] = useState(false);

    const indexRef = useRef(0);
    const intervalRef = useRef(null);
    const intervalMs = 100; // Reduce for more FPS later if possible (performance)

    const hasSubscribedRef = useRef(false);

    const indexKey = (id) => `drive-index-${id}`;
    const routeKey = (id) => `drive-route-${id}`;

    const saveIndex = (id, idx) => {
        localStorage.setItem(indexKey(id), idx.toString());
    };

    const getSavedIndex = (id) => {
        const val = localStorage.getItem(indexKey(id));
        return val ? parseInt(val, 10) : 0;
    };

    const saveRouteSnapshot = (id, route) => {
        localStorage.setItem(routeKey(id), JSON.stringify(route));
    };

    const getSavedRouteSnapshot = (id) => {
        const val = localStorage.getItem(routeKey(id));
        return val ? JSON.parse(val) : null;
    };

    const clearPersisted = (id) => {
        localStorage.removeItem(indexKey(id));
        localStorage.removeItem(routeKey(id));
    };

    const routesEqual = (r1, r2) => {
        if (!r1 || !r2 || r1.length !== r2.length) return false;
        return r1.every((p, i) => p.lat === r2[i].lat && p.lng === r2[i].lng);
    };

    const fetchDriveData = async () => {
        if (!currentUser?.username) {
            setIsOfferAccepted(false);
            return null;
        }

        try {
            const res = await DriveService.getOfferByFahrerUsernameV2(currentUser.username);
            const routeData = res?.drive?.route;
            const id = res?.drive?.id;
            const offerStatus = res?.offer?.status;

            if (id && routeData?.length && offerStatus === "ACCEPTED") { // Check ACCEPTED
                const newRoute = routeData.map(([lat, lng]) => ({ lat, lng }));
                setDriveId(id);
                setRoute(newRoute);
                setIsOfferAccepted(true);

                setStops((res.drive.stops || []).map(s => ({
                    address: s.address || '',
                    coordinates: s.coordinates
                })));


                if (res.drive.startCoordinates?.length === 2) {
                    setStartCoords({ coords: res.drive.startCoordinates });
                }
                if (res.drive.endCoordinates?.length === 2) {
                    setDestinationCoords({ coords: res.drive.endCoordinates });
                }

                return { id, route: newRoute };
            } else {
                setDriveId(null);
                setRoute([]);
                setStops([]);
                setStartCoords(null);
                setDestinationCoords(null);
                setIsOfferAccepted(false);
                setIsRunning(false);
                setIsCompleted(false);
                clearPersisted(id);
            }
        } catch (err) {
            console.error('Fehler beim Abrufen von Route/Drive:', err);
            setIsOfferAccepted(false);
            setDriveId(null);
            setRoute([]);
            setStops([]);
            setStartCoords(null);
            setDestinationCoords(null);
            setIsRunning(false);
            setIsCompleted(false);
            clearPersisted(null);
        }

        return null;
    };

    useEffect(() => {
        fetchDriveData().then((res) => {
            if (res?.id) {
                const savedIndex = getSavedIndex(res.id);
                indexRef.current = savedIndex;
                const totalPoints = res.route.length;
                if (savedIndex > 0 && savedIndex < totalPoints) {
                    setIsRunning(false);
                } else if (savedIndex === totalPoints && totalPoints > 0) {
                    setIsCompleted(true);
                }
            }
        });
    }, []);

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

    const sendStatusUpdate = (running, completed) => {
        if (driveId) {
            sendMessage(`/app/simulation/${driveId}`, {
                type: 'STATUS_UPDATE',
                data: { isRunning: running, isCompleted: completed },
            });
        }
    };

    const handleIncomingMessage = (msg) => {
        if (msg.type === 'CONTROL') {
            if (msg.command === 'PAUSE') pause();
            if (msg.command === 'RESUME') resume();
            if (msg.command === 'SPEED') setDuration(msg.millis);
        }
    };

    const pause = () => {
        clearInterval(intervalRef.current);
        setIsRunning(false);
        sendStatusUpdate(false, isCompleted);
    };

    const resume = async () => {
        const res = await fetchDriveData();
        if (!res || !isOfferAccepted) {
            clearInterval(intervalRef.current);
            setIsRunning(false);
            setIsCompleted(false);
            sendStatusUpdate(false, false);
            return;
        }

        const prevRoute = getSavedRouteSnapshot(res.id);
        const currentRoute = res.route;

        const routeChanged = !routesEqual(prevRoute, currentRoute);

        if (routeChanged) {
            indexRef.current = 0;
            clearPersisted(res.id);
        } else {
            indexRef.current = getSavedIndex(res.id);
        }

        setRoute(currentRoute);
        saveRouteSnapshot(res.id, currentRoute);

        setIsCompleted(false);
        setIsRunning(true);
        sendStatusUpdate(true, false);
        setupIntervalWith(currentRoute, res.id);
    };

    const setupIntervalWith = (routeToUse, id) => {
        clearInterval(intervalRef.current);

        const totalPoints = routeToUse.length;
        const totalSteps = Math.floor(duration / intervalMs);

        if (totalSteps <= 0 || totalPoints === 0) {
            setIsCompleted(true);
            setIsRunning(false);
            sendStatusUpdate(false, true);
            return;
        }

        const pointIncrement = totalPoints / totalSteps;
        let floatIndex = indexRef.current;

        intervalRef.current = setInterval(() => {
            if (Math.floor(floatIndex) >= totalPoints) {
                pause();
                setIsCompleted(true);
                setIsRunning(false);
                sendStatusUpdate(false, true);
                clearPersisted(id);
                return;
            }

            const point = routeToUse[Math.floor(floatIndex)];
            setCurrentPosition(point);

            sendMessage(`/app/simulation/${id}`, {
                type: 'POSITION',
                data: point,
            });

            floatIndex += pointIncrement;
            indexRef.current = Math.floor(floatIndex);
            saveIndex(id, indexRef.current);
        }, intervalMs);
    };

    const handleStart = () => {
        if (!route.length || isRunning || isCompleted || !isOfferAccepted) return;

        indexRef.current = 0;
        setCurrentPosition(route[0]);
        setIsRunning(true);
        setIsCompleted(false);
        sendStatusUpdate(true, false);

        saveRouteSnapshot(driveId, route);
        setupIntervalWith(route, driveId);

        sendMessage(`/app/simulation/${driveId}`, {
            type: 'POSITION',
            data: route[0],
        });
    };

    const handlePause = () => {
        sendMessage(`/app/simulation/${driveId}`, { type: 'CONTROL', command: 'PAUSE' });
    };

    const handleResume = () => {
        sendMessage(`/app/simulation/${driveId}`, { type: 'CONTROL', command: 'RESUME' });
    };

    const handleSpeedChange = (value) => {
        setDuration(value);
        sendMessage(`/app/simulation/${driveId}`, {
            type: 'CONTROL',
            command: 'SPEED',
            millis: value,
        });
    };

    const handleComplete = async () => {
        if (!driveId) return;
        try {
            await DriveService.completeDrive(driveId);
            alert('Fahrt abgeschlossen');
            setIsCompleted(false);
            setIsRunning(false);
            sendStatusUpdate(false, false);
            clearPersisted(driveId);
            setIsOfferAccepted(false);
        } catch (err) {
            console.error('Fehler beim Abschließen der Fahrt:', err);
            alert('Fehler beim Abschließen der Fahrt.');
        }
    };

    useEffect(() => {
        if (isRunning && !isCompleted) {
            setupIntervalWith(route, driveId);
        } else {
            clearInterval(intervalRef.current);
        }
    }, [duration, isRunning, isCompleted, route, driveId]);

    const isPaused = !isRunning && !isCompleted && route.length > 0 && indexRef.current > 0;

    return (
        <div>
            <h2>Fahrer-Simulation</h2>

            {!route.length && <p>Lade Route...</p>}


            <div style={{ marginBottom: '10px' }}>
                <button
                    onClick={handleStart}
                    disabled={!route.length || isRunning || isCompleted || !isOfferAccepted}
                >
                    Start
                </button>
                <button
                    onClick={handlePause}
                    disabled={!isRunning || !isOfferAccepted}
                >
                    Pause
                </button>
                <button
                    onClick={handleResume}
                    disabled={!isPaused || isRunning || isCompleted || !route.length || !isOfferAccepted}
                >
                    Fortsetzen
                </button>
                {isCompleted && (
                    <button
                        onClick={handleComplete}
                        style={{ marginLeft: '10px' }}
                        disabled={!isCompleted || !isOfferAccepted}
                    >
                        Fahrt abschließen
                    </button>
                )}
            </div>

            <label>
                Geschwindigkeit:
                <input
                    type="range"
                    min="3000"
                    max="30000"
                    step="1000"
                    value={duration}
                    onChange={(e) => handleSpeedChange(parseInt(e.target.value))}
                    style={{ marginLeft: '10px' }}
                    //disabled={isCompleted || (!isRunning && !isPaused && route.length === 0) || !isOfferAccepted}
                    disabled={!isOfferAccepted || isCompleted || isPaused}
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
        </div>
    );
};

export default DriverSimulation;
