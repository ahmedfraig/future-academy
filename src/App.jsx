import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ParentApp from './components/parent/ParentApp';
import TeacherDashboard from './components/teacher/TeacherDashboard';
import ManagerDashboard from './components/manager/ManagerDashboard';

// Root redirect based on auth state
function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  const map = { manager: '/dashboard/manager', teacher: '/dashboard/teacher', parent: '/dashboard/parent' };
  return <Navigate to={map[user.role] || '/login'} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div dir="rtl">
          <Routes>
            {/* Public routes */}
            <Route path="/login"    element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected role-based routes */}
            <Route path="/dashboard/manager" element={
              <ProtectedRoute role="manager"><ManagerDashboard /></ProtectedRoute>
            } />
            <Route path="/dashboard/teacher" element={
              <ProtectedRoute role="teacher"><TeacherDashboard /></ProtectedRoute>
            } />
            <Route path="/dashboard/parent" element={
              <ProtectedRoute role="parent"><ParentApp /></ProtectedRoute>
            } />

            {/* Catch-all → root redirect */}
            <Route path="*" element={<RootRedirect />} />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
