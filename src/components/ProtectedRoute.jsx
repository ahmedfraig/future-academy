import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 to-blue-50">
        <div className="text-center">
          <div className="text-5xl animate-bounce mb-4">🌸</div>
          <p className="text-violet-600 font-bold text-lg" style={{ fontFamily: 'Cairo, sans-serif' }}>جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role && user.role !== role) {
    // Redirect to correct dashboard based on their actual role
    const dashMap = { manager: '/dashboard/manager', teacher: '/dashboard/teacher', parent: '/dashboard/parent' };
    return <Navigate to={dashMap[user.role] || '/login'} replace />;
  }

  return children;
}
