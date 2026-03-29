import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/index_hooks';
import LoadingSpinner from './LoadingSpinner';

export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '60vh' }}>
        <LoadingSpinner text="Consulting the library records..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" state={{ from: location, openAuth: 'login' }} replace />;
  }

  return children;
};

export const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '60vh' }}>
        <LoadingSpinner text="Checking administrative clearance..." />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/home" state={{ from: location }} replace />;
  }

  return children;
};
