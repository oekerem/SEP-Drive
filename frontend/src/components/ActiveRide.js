import React,{useContext} from 'react';
import useSWR from 'swr';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from "../contexts/AuthContext";
import ActiveRideService from '../services/ActiveRideService';
import MapComponent from "./MapComponent";

const ActiveRide = () => {
    const navigate = useNavigate();
    const { user: currentUser } = useContext(AuthContext);
    const username = currentUser?.username;

    const { data: ride,isLoading } = useSWR(
        username,
        ActiveRideService.getActiveRideByUsername,
        {
            revalidateOnFocus: false,
            shouldRetryOnError: false
        }
    );


    const handleCancelRide = async () => {
        console.log(username);
        const { success, error } = await ActiveRideService.cancelRideByUsername(username);
        if (success) {
            alert('Fahrt wurde storniert.');
            navigate('/'); // redirects based on role
        } else {
            alert('Fehler beim Stornieren: ' + error);
        }
    };

    if (isLoading) {
        return <div>Fahrt wird geladen...</div>;
    }

    if(!ride){
        return <p>Keine aktive Fahrt vorhanden</p>
    }

    const route = ride.route.map(({ latitude, longitude }) => [latitude, longitude]);

    const stops = (ride.stops || [])
        .filter(s => s.coordinates?.length === 2)
        .map(s => s.coordinates);


    return (
        <div>
            <h2>Aktive Fahrt</h2>


                    <p>Von: {ride.startLocation}</p>
                    <p>Nach: {ride.endLocation}</p>
                    <p>Status: {ride.driveStatus}</p>
                    <p>Gesamtdistanz: {ride.distance} km </p>
                    <p>Gesamtdauer: {ride.duration} Minuten</p>
                    <p>Preis: {ride.cost} €</p>
                    <button onClick={handleCancelRide}>Fahrt stornieren</button>
                    <MapComponent
                        routeCoords={route}
                        selectedStart={ride.startCoordinates}
                        selectedDestination={ride.endCoordinates}
                        stops = {stops}
                    />
        </div>
    );
};

export default ActiveRide;