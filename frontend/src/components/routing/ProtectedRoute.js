import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children, requiredRoles = [], requiredDepartment = null }) => {
  const currentUser = useSelector(state => state.auth.user);
  const location = useLocation();

  if (!currentUser) {
    // Not logged in, redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRoles.length > 0 && !requiredRoles.includes(currentUser.role)) {
    // Role not authorized, redirect to home page
    return <Navigate to="/" replace />;
  }

  if (requiredDepartment && 
      currentUser.department !== requiredDepartment && 
      !['super_admin', 'super_manager'].includes(currentUser.role)) {
    // Department not authorized, redirect to home page
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute; 