import React, { useContext } from 'react';
import useSWR from 'swr';
import { AuthContext } from '../contexts/AuthContext';
import UserService from '../services/UserService';
import Wallet from "./Wallet";

const CustomerDashboard = () => {
    const { user: currentUser } = useContext(AuthContext);

    const { data: user } = useSWR(
        currentUser?.username ? ['user', currentUser.username] : null,
        ([, username]) => UserService.getUserByUsername(username),
        {
            revalidateOnFocus: false,
            shouldRetryOnError: false
        }
    );

    const displayUser = user || currentUser;

    if (!displayUser) return <p>Lade Benutzerdaten...</p>;

    return (
        <div>
            <h2>Kunden Dashboard</h2>
            <p>Willkommen, {displayUser.firstName} {displayUser.lastName}!</p>
            <p>Email: {displayUser.email}</p>
            <p>Geb. Datum: {displayUser.dob}</p>
            <hr/>
            <Wallet username ={currentUser.username} role={"KUNDE"}  />
        </div>
    );
};

export default CustomerDashboard;
