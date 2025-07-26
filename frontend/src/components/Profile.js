import React, { useEffect, useState, useContext } from "react";
import {useNavigate, useParams} from 'react-router-dom';
import UserService from "../services/UserService";
import { AuthContext } from "../contexts/AuthContext";




function Profile(){

    const {username} = useParams();
    const [user, setUser] = useState(null);
    const { user: currentUser } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        UserService.getUserByUsername(username)
            .then((data) => {
                setUser(data);
                })
            .catch((err) => {
                console.error("User not found", err);
                setUser(null);
            });
    }, [username]);






/*
    useEffect(() => {

        const foundUser = mockUsers.find((u) => u.username === username);
        setUser(foundUser);

    }, [username]);
*/

    if(!user) {return <p>No user found</p>}

    return (

        <>

            <h2 >Benutzerprofil</h2>

            <img src={`data:image/png;base64,${user.base64Image}`} alt="Profilbild" width="150" />




            <h3>{user.username}</h3>
            <p>Rolle: {user.role}</p>
            <p>Vorname: {user.firstName}</p>
            <p>Nachname: {user.lastName}</p>
            <p>E-Mail: {user.email}</p>
            <p>Geburtsdatum: {user.dob}</p>
            <p>Fahrten: {user.totalDrives}</p>
            {/*user.role === "FAHRER" ? ( <p>Auto-Klasse: {user.carClass}</p>) : null*/}

            {user.username === currentUser.username ? (<button onClick={() => {navigate("/ride-history");}}>Fahrthistorie</button>) : null}
            {user.username === currentUser.username && user.role === "FAHRER" && <button onClick={() => {navigate("/statistics");}}>Statistiken</button>}

        </>


    );

}

export default Profile