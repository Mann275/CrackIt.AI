import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';

const AuthAwareLayout = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  
  // Define paths that should not have the dashboard layout
  const authPaths = ['/login', '/register', '/forgot-password'];
  const isAuthPath = authPaths.includes(location.pathname);

  // If it's an auth page or user is not logged in, render without dashboard layout
  if (isAuthPath || !user) {
    return children;
  }

  return children;
};

export default AuthAwareLayout;