import React, { useState, useEffect } from 'react';
import AddressInput from './AddressInput';
import MapComponent from './MapComponent';
import RouteService from '../services/RouteService';
import RideRequestService from '../services/RideRequestService';
import DemoData from '../DemoRoute/duisburgEssenRoute.json';

const RoutePlanner = ({ edit = false, rideId = null, lockedStart = null, onCancel, initialRoute = [],
                          initialStops = [], destinationAddressText = '',
                          destinationCoordinates = null }) => {
    const [startAddress, setStartAddress] = useState('');
    const [destinationAddress, setDestinationAddress] = useState('');
    const [selectedStart, setSelectedStart] = useState(null);
    const [selectedDestination, setSelectedDestination] = useState(null);
    const [stops, setStops] = useState([]);
    const [routeCoords, setRouteCoords] = useState([]);
    const [distance, setDistance] = useState(null);
    const [error, setError] = useState(null);
    const [price, setPrice] = useState(null);
    const [duration, setDuration] = useState(null);

    useEffect(() => {
        if (edit && rideId && lockedStart && initialRoute?.length > 0) {
            setSelectedStart([lockedStart.lng, lockedStart.lat]);
            setRouteCoords(initialRoute.map(p => [p.lat, p.lng]));
            setStops(initialStops || []);
            setStartAddress(`Aktuelle Position (${lockedStart.lat.toFixed(4)}, ${lockedStart.lng.toFixed(4)})`);

            if (destinationCoordinates?.length === 2) {
                setSelectedDestination(destinationCoordinates);
                setDestinationAddress(
                    destinationAddressText ||
                    `(${destinationCoordinates[1].toFixed(4)}, ${destinationCoordinates[0].toFixed(4)})`
                );
            }
        }
    }, [
        edit, rideId,
        lockedStart,
        initialRoute,
        initialStops,
        destinationCoordinates,
        destinationAddressText
    ]);


    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            setError('Geolocation wird nicht unterstützt');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                setSelectedStart([longitude, latitude]);
                setStartAddress(`(${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
            },
            () => setError('Standort konnte nicht ermittelt werden')
        );
    };

    const addStop = () => {
        if (stops.length < 3) {
            setStops([...stops, { address: '', coordinates: null }]);
        }
    };

    const removeStop = (index) => {
        const updated = [...stops];
        updated.splice(index, 1);
        setStops(updated);
    };

    const updateStop = (index, field, value) => {
        const updated = [...stops];
        updated[index] = { ...updated[index], [field]: value };
        setStops(updated);
    };

    const handleStartSelect = (suggestion) => {
        if (!edit) {
            setStartAddress(suggestion.text);
            setSelectedStart(suggestion.coordinates);
        }
    };

    const handleDestinationSelect = (suggestion) => {
        setDestinationAddress(suggestion.text);
        setSelectedDestination(suggestion.coordinates);
    };

    const handleStopSelect = (index) => (suggestion) => {
        const updated = [...stops];
        updated[index] = { address: suggestion.text, coordinates: suggestion.coordinates };
        setStops(updated);
    };

    const calculateRoute = async () => {
        const waypoints = [];

        if (selectedStart) waypoints.push(selectedStart);
        for (const stop of stops) {
            if (stop.coordinates) {
                waypoints.push(stop.coordinates);
            }
        }
        if (selectedDestination) waypoints.push(selectedDestination);

        if (waypoints.length < 2) {
            setError('Bitte geben Sie mindestens Start und Ziel ein');
            return;
        }

        setError(null);
        setDistance(null);

        try {
            const { coords, distance, duration, error } = await RouteService.calculateRoute(waypoints);
            if (error) {
                setError(error);
                return;
            }

            setRouteCoords(coords);
            setDistance(distance);
            setDuration(duration);
            setPrice(distance);
        } catch (err) {
            setError(err.message);
        }
    };

    const sendRideToBackend = async () => {
        if (!selectedStart || !selectedDestination || routeCoords.length === 0 || !distance) {
            setError('Bitte berechne zuerst eine gültige Route.');
            return;
        }

        try {
            const stopsCleaned = stops.filter(s => s.coordinates);

            const payload = {
                startAddress,
                destinationAddress,
                startCoordinates: selectedStart,
                destinationCoordinates: selectedDestination,
                stops: stopsCleaned,
                route: routeCoords,
                distance,
                price,
                duration
            };

            const { error } = edit
                ? await RideRequestService.updateRequest({ ...payload, rideId })
                : await RideRequestService.sendRequest(payload);

            if (error) {
                setError(error);
                return;
            }

            alert(edit ? 'Fahrt aktualisiert' : 'Fahrt wurde erfolgreich angefragt!');
        } catch (err) {
            setError(err.message || 'Fehler beim Senden der Fahrt');
        }
    };


    const loadPredefinedRoute = () => {
        if (!edit) {
            setStartAddress(DemoData.startAddress);
            setSelectedStart(DemoData.startCoordinates);
        }

        setDestinationAddress(DemoData.destinationAddress);
        setSelectedDestination(DemoData.destinationCoordinates);
        setStops(DemoData.waypoints || []);
        setRouteCoords(DemoData.route);
        setDistance(DemoData.distanceKm);
        setDuration(DemoData.durationMin);
        setPrice(DemoData.priceEuro);
        setError(null);
    };


    return (
        <div>
            <h2>{edit ? 'Route bearbeiten' : 'Route Planen & Fahrt Anfragen'}</h2>

            {!edit && (
                <AddressInput
                    label="Start"
                    value={startAddress}
                    onChange={setStartAddress}
                    onSelect={handleStartSelect}
                    onCurrentLocation={getCurrentLocation}
                />
            )}

            {edit && (
                <p style={{ color: 'red', marginTop: '0.5rem' }}>
                    Hinweis: Die Demo-Route ist offline und nach Fahrtantritt ungenau und nicht Aktuell –
                    bitte Route neu berechnen, wenn Sie online sind und OpenRouteService Server verfügbar sind. Die Offline-Route ist dennoch verwendbar.
                </p>
            )}

            {edit && (
                <div>
                    <label>Start: {startAddress}</label>
                </div>
            )}

            {stops.map((stop, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
                    <AddressInput
                        label={`Stop ${index + 1}`}
                        value={stop.address}
                        onChange={(value) => updateStop(index, 'address', value)}
                        onSelect={handleStopSelect(index)}
                    />
                    <button onClick={() => removeStop(index)}>- Stop entfernen</button>
                </div>
            ))}

            <button onClick={addStop} disabled={stops.length >= 3}>+ Stop hinzufügen</button>

            <AddressInput
                label="Ziel"
                value={destinationAddress}
                onChange={setDestinationAddress}
                onSelect={handleDestinationSelect}
            />

            <button onClick={calculateRoute}>Route berechnen</button>
            <button onClick={sendRideToBackend} disabled={!routeCoords.length}>
                {edit ? 'Fahrt aktualisieren' : 'Fahrt Anfragen'}
            </button>


                <button onClick={loadPredefinedRoute}>Demo Route</button>


            {edit && onCancel && (
                <button onClick={onCancel} style={{ marginLeft: '10px' }}>
                    Zurück zur Fahrtansicht
                </button>
            )}

            {distance && <p>Strecke: {distance} km – Preis: {price} € – Dauer: {duration} Minuten</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <div style={{ height: '500px', width: '100%', marginTop: '20px' }}>
                <MapComponent
                    routeCoords={routeCoords}
                    selectedStart={selectedStart}
                    selectedDestination={selectedDestination}
                    stops={stops.filter(s => s.coordinates).map(s => s.coordinates)}
                />
            </div>
        </div>
    );
};

export default RoutePlanner;
