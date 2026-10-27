import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface ProtectedRouteProps {
  requiredRole?: UserRole;
  requireApproval?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  requiredRole = 'DOCTOR',
  requireApproval = true,
}) => {
  const { session, isAuthenticated, isApproved, isAdmin, isDoctor } = useAuth();

  if (!isAuthenticated) {
    if (requiredRole === 'ADMIN') {
      return <Navigate to="/admin/login" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  // Check role authorization
  if (requiredRole === 'ADMIN' && !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  if (requiredRole === 'DOCTOR' && !isDoctor) {
    return <Navigate to="/login" replace />;
  }

  // Check doctor approval requirement
  if (isDoctor && requireApproval && !isApproved) {
    return <Navigate to="/registration-status" replace />;
  }

  return <Outlet />;
};
