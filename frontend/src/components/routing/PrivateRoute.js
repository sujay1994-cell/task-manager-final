import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ children }) => {
  const { user, token } = useSelector((state) => state.auth);
  
  console.log('PrivateRoute check:', { user, token }); // Debug log

  if (!token || !user) {
    console.log('No auth, redirecting to login'); // Debug log
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute; 