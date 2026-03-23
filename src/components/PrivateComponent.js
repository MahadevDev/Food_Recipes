import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateComponent = () => {
  // Check if user is authenticated
  const isAuthenticated = localStorage.getItem('token');

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateComponent;
