import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
    // A simple cookie check or session check. 
    // For local state persistence, we can check if a flag was set on login.
    const isAuthenticated = localStorage.getItem('sh_logged_in') === 'true';

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
}