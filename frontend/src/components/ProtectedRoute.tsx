import React, { JSX } from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
    children: JSX.Element;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    // Verificar si existe una sesión activa
    const isAuthenticated = sessionStorage.getItem('user') !== null;

    // Si no hay sesión, redirigir al login
    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    // Si hay sesión, mostrar el componente hijo
    return children;
};

export default ProtectedRoute;