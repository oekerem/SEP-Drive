import React, { useContext, useEffect, useState } from 'react';
import {
    Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, TableSortLabel, Paper, Button
} from '@mui/material';
import { Link } from 'react-router-dom';
import AddressInput from './AddressInput';
import RouteService from '../services/RouteService';
import DriveService from '../services/DriveService';
import { sortByKey } from '../utils/sortUtils';
import { AuthContext } from '../contexts/AuthContext';
import L from 'leaflet';

const RideRequestList = () => {
    const { user: currentUser } = useContext(AuthContext);

    const [rides, setRides] = useState([]);
    const [error, setError] = useState(null);
    const [myOffer, setMyOffer] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
    const [addressInputValue, setAddressInputValue] = useState('');
    const [ridesWithDistance, setRidesWithDistance] = useState([]);

    useEffect(() => {
        const fetchRides = async () => {
            try {
                const data = await DriveService.getAllActiveDrives();
                setRides(data);
                setError(null);
            } catch (err) {
                setError(err);
            }
        };

        fetchRides();
        const interval = setInterval(fetchRides, 3000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!currentUser?.username) return;

        const fetchOffer = async () => {
            try {
                const result = await DriveService.getOfferByFahrerUsernameV2(currentUser.username);
                setMyOffer(result);
            } catch (err) {
                if (err.response?.status === 400) {
                    setMyOffer(null);
                } else {
                    console.error('Fehler beim Abrufen des Angebots:', err);
                }
            }

        };

        fetchOffer();
        const interval = setInterval(fetchOffer, 3000);
        return () => clearInterval(interval);
    }, [currentUser?.username]);

    const handleSort = (key) => {
        const isAsc = sortConfig.key === key && sortConfig.direction === 'asc';
        setSortConfig({ key, direction: isAsc ? 'desc' : 'asc' });
    };

    const handleLocationSelect = async (suggestion) => {
        setAddressInputValue(suggestion.text);

        if (!rides || rides.length === 0) {
            console.warn('No rides.');
            return;
        }

        const fromLatLng = L.latLng(suggestion.coordinates[1], suggestion.coordinates[0]);

        const toCoords = rides.map(ride => ride.startCoordinates);
        const straightLine = toCoords.map(([lon, lat]) =>
            fromLatLng.distanceTo(L.latLng(lat, lon)) / 1000
        );

        let distances = null;

        if (rides.length <= 3500) {
            try {
                distances = await RouteService.getMatrixDistances(suggestion.coordinates, toCoords);
            } catch (err) {
                console.warn("Matrix API failed using only Luftlinie.", err);
            }
        } else {
            console.warn("More than 3500 rides");
        }

        const updated = rides.map((ride, index) => ({
            ...ride,
            distanceToPickup: distances ? distances[index] : null,
            straightLineKm: straightLine[index]
        }));

        setRidesWithDistance(updated);
    };

    const requestCurrentLocation = () => {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const coords = [pos.coords.longitude, pos.coords.latitude];
                const coordinateText = `(${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)})`;
                setAddressInputValue(coordinateText);
                handleLocationSelect({
                    text: coordinateText,
                    coordinates: coords
                }).catch(console.error);
            },
            () => alert('Standort konnte nicht ermittelt werden.')
        );
    };

    const offerRide = async (driveId) => {
        try {
            await DriveService.createDriveOffer(driveId, currentUser.username);
            alert('Fahrtangebot gesendet');
            const newOffer = await DriveService.getOfferByFahrerUsernameV2(currentUser.username);
            setMyOffer(newOffer);
        } catch (err) {
            alert('Fehler beim Senden des Angebots');
        }
    };

    const withdrawOffer = async () => {
        if (!myOffer?.offer?.id) return;
        try {
            await DriveService.withdrawOffer(myOffer.offer.id, currentUser.username);
            alert('Angebot wurde zurückgezogen.');
            setMyOffer(null);
        } catch (err) {
            console.error('Fehler beim Zurückziehen:', err);
            alert('Fehler beim Zurückziehen des Angebots');
        }
    };

    const sortedRides = sortByKey(
        Array.isArray(ridesWithDistance) && ridesWithDistance.length > 0
            ? ridesWithDistance
            : Array.isArray(rides)
                ? rides
                : [],
        sortConfig.key,
        sortConfig.direction
    );

    return (
        <div>
            <h2>Verfügbare Fahranfragen</h2>

            {myOffer ? (
                <div style={{ marginBottom: '1rem' }}>
                    <h3>Dein Fahrtangebot</h3>
                    <p>Fahrt-ID: {myOffer.drive.id}</p>
                    <p>Angebots-ID: {myOffer.offer.id}</p>
                    <p>Status: {myOffer.offer.status}</p>
                    {myOffer.offer.status === 'PENDING' && (
                        <button onClick={withdrawOffer}>Zurückziehen</button>
                    )}
                </div>
            ) : (
                <p>Kein aktives Fahrtangebot</p>
            )}

            <AddressInput
                label="Dein Standort"
                value={addressInputValue}
                onChange={setAddressInputValue}
                onSelect={handleLocationSelect}
                onCurrentLocation={requestCurrentLocation}
            />

            {error && <p style={{ color: 'red' }}>Fehler beim Laden der Fahranfragen</p>}

            <TableContainer component={Paper} style={{ marginTop: '1rem' }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                <TableSortLabel
                                    active={sortConfig.key === 'id'}
                                    direction={sortConfig.key === 'id' ? sortConfig.direction : 'asc'}
                                    onClick={() => handleSort('id')}
                                >
                                    Fahrt-ID
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={sortConfig.key === 'createdAt'}
                                    direction={sortConfig.key === 'createdAt' ? sortConfig.direction : 'asc'}
                                    onClick={() => handleSort('createdAt')}
                                >
                                    Erstellt
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={sortConfig.key === 'distanceToPickup'}
                                    direction={sortConfig.key === 'distanceToPickup' ? sortConfig.direction : 'asc'}
                                    onClick={() => handleSort('distanceToPickup')}
                                >
                                    Entfernung zum Startpunkt
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={sortConfig.key === 'straightLineKm'}
                                    direction={sortConfig.key === 'straightLineKm' ? sortConfig.direction : 'asc'}
                                    onClick={() => handleSort('straightLineKm')}
                                >
                                    Luftlinie
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={sortConfig.key === 'duration'}
                                    direction={sortConfig.key === 'duration' ? sortConfig.direction : 'asc'}
                                    onClick={() => handleSort('duration')}
                                >
                                    Dauer
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={sortConfig.key === 'distance'}
                                    direction={sortConfig.key === 'distance' ? sortConfig.direction : 'asc'}
                                    onClick={() => handleSort('distance')}
                                >
                                    Routenlänge
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={sortConfig.key === 'cost'}
                                    direction={sortConfig.key === 'cost' ? sortConfig.direction : 'asc'}
                                    onClick={() => handleSort('cost')}
                                >
                                    Kosten
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={sortConfig.key === 'usernameKunde'}
                                    direction={sortConfig.key === 'usernameKunde' ? sortConfig.direction : 'asc'}
                                    onClick={() => handleSort('usernameKunde')}
                                >
                                    Kunde
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>Aktion</TableCell>
                            {myOffer && <TableCell>Chat</TableCell>}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortedRides.map((ride) => (
                            <TableRow key={ride.id} hover>
                                <TableCell>{ride.id}</TableCell>
                                <TableCell>{new Date(ride.createdAt).toLocaleString()}</TableCell>
                                <TableCell>
                                    {ride.distanceToPickup != null
                                        ? `${ride.distanceToPickup.toFixed(2)} km`
                                        : '–'}
                                </TableCell>
                                <TableCell>
                                    {ride.straightLineKm != null
                                        ? `${ride.straightLineKm.toFixed(2)} km`
                                        : '–'}
                                </TableCell>
                                <TableCell>
                                    {ride.duration != null ? `${Math.round(ride.duration)} min` : '–'}
                                </TableCell>
                                <TableCell>
                                    {ride.distance != null ? `${ride.distance.toFixed(2)} km` : '–'}
                                </TableCell>
                                <TableCell>
                                    {ride.cost != null ? `${ride.cost.toFixed(2)} €` : '–'}
                                </TableCell>
                                <TableCell>
                                    <Link to={`/profile/${ride.usernameKunde}`}>
                                        {ride.usernameKunde}
                                    </Link>
                                </TableCell>
                                <TableCell>
                                    <Button
                                        variant="contained"
                                        onClick={() => offerRide(ride.id)}
                                        disabled={!!myOffer}
                                    >
                                        Anbieten
                                    </Button>
                                </TableCell>

                            {myOffer && myOffer.offer.driveId === ride.id &&
                                <TableCell>
                                    <Link to={`/chat/${myOffer.offer.id}`} state={{username: currentUser.username, role: "FAHRER", partner: ride.usernameKunde}}>
                                     <Button variant={"outlined"}>Chat</Button>
                                    </Link>
                                </TableCell>
                            }

                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
};

export default RideRequestList;
