import React, { createContext, useState, useEffect } from 'react';
import AuthService from '../services/AuthService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(AuthService.getCurrentUser());

    const login = async (username, password) => {
        const loggedInUser = await AuthService.login(username, password);
        setUser(loggedInUser);
        return loggedInUser;
    };

    const logout = () => {
        AuthService.logout();
        setUser(null);
    };

    useEffect(() => {
        const storedUser = AuthService.getCurrentUser();
        setUser(storedUser);

        const handleStorageChange = (e) => {
            if (e.key === 'user') {
                const updatedUser = AuthService.getCurrentUser();
                setUser(updatedUser);
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
