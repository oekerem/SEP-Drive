import React, { useContext } from 'react';
import useSWR from 'swr';
import { AuthContext } from '../contexts/AuthContext';
import UserService from '../services/UserService';
import Wallet from "./Wallet";

const DriverDashboard = () => {
    const { user: currentUser } = useContext(AuthContext);

    // Gets userdata from backend
    const { data: user } = useSWR(
        currentUser?.username,
        UserService.getUserByUsername,
        {
            revalidateOnFocus: false,
            shouldRetryOnError: false
        }
    );

    // Fallback gets locally
    const displayUser = user || currentUser;

    return (
        <div>
            <h2>Fahrer Dashboard</h2>
            <p>Willkommen, {displayUser?.firstName} {displayUser?.lastName}!</p>
            <p>Email: {displayUser?.email}</p>
            <p>Geb. Datum: {displayUser?.dob}</p>
            <hr/>
            <Wallet username ={currentUser?.username} role={"FAHRER"} />
        </div>
    );
};

export default DriverDashboard;