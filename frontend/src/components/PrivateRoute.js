import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const PrivateRoute = ({ children, roles }) => {
    const { user } = useContext(AuthContext);

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (roles && !roles.includes(user.role)) {
        // Redirect to appropriate dashboard if user tries to access wrong dashboard
        return user.role === 'FAHRER'
            ? <Navigate to="/driver-dashboard" />
            : <Navigate to="/customer-dashboard" />;
    }

    return children;
};

export default PrivateRoute;