import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const location = useLocation();

    useEffect(() => {
        if (!isAuthenticated) {
            alert('Please login to continue');
        }
    }, [isAuthenticated]);

    if (!isAuthenticated) {
        // Redirect them to the /login page, but save the current location they were trying to go to
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default PrivateRoute;
