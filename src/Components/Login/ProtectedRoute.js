import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { decodeJwt, decodeJwtID, getJWTFromSession } from './GetAuth';

const ProtectedRoute = ({ roles = [], requiredActive = true }) => {
    const jwt = getJWTFromSession();

    if (!jwt) {
        return <Navigate to="/login" />;
    }

    try {
        const decoded = JSON.parse(decodeJwt(jwt));
        const userRole = decoded?.UserRole;
        const isActive = decoded?.isActive;

        if (roles.length > 0 && !roles.includes(userRole)) {
            return <Navigate to="/unauthorized" />;
        }

        if (requiredActive && isActive === 0) {
            return <Navigate to="/inactive" />;
        }

        return <Outlet />;
    } catch (error) {
        console.error("JWT decoding error:", error);
        return <Navigate to="/login" />;
    }
};

export default ProtectedRoute;