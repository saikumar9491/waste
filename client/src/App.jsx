import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import DemoSwitcher from './components/DemoSwitcher';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ReportWaste from './pages/ReportWaste';
import CitizenDashboard from './pages/CitizenDashboard';
import ComplaintDetails from './pages/ComplaintDetails';
import AdminDashboard from './pages/AdminDashboard';
import AdminMap from './pages/AdminMap';
import Analytics from './pages/Analytics';
import CollectorDashboard from './pages/CollectorDashboard';
import DriverTracking from './pages/DriverTracking';

// Smart Home redirect based on login role
const HomeOrDashboard = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-xs text-slate-400">Loading WasteWise...</div>;
  }

  if (user) {
    if (user.role === 'citizen') return <Navigate to="/citizen-dashboard" replace />;
    if (user.role === 'collector') return <Navigate to="/collector-dashboard" replace />;
    if (user.role === 'admin') return <Navigate to="/admin-dashboard" replace />;
  }

  return <Home />;
};

// Redirect logged-in users away from login/register pages
const PublicOnlyRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) {
    if (user.role === 'citizen') return <Navigate to="/citizen-dashboard" replace />;
    if (user.role === 'collector') return <Navigate to="/collector-dashboard" replace />;
    if (user.role === 'admin') return <Navigate to="/admin-dashboard" replace />;
  }
  return children;
};

// Protected Route helper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-xs text-slate-400">Loading WasteWise...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-emerald-500 selection:text-white">
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3500,
                style: {
                  background: '#0f172a',
                  color: '#fff',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: 600
                }
              }}
            />

            <Navbar />

            <main className="flex-1">
              <Routes>
                {/* Public / Role-Redirected */}
                <Route path="/" element={<HomeOrDashboard />} />
                <Route
                  path="/login"
                  element={
                    <PublicOnlyRoute>
                      <Login />
                    </PublicOnlyRoute>
                  }
                />
                <Route
                  path="/register"
                  element={
                    <PublicOnlyRoute>
                      <Register />
                    </PublicOnlyRoute>
                  }
                />
                <Route
                  path="/report"
                  element={
                    <ProtectedRoute allowedRoles={['citizen', 'admin']}>
                      <ReportWaste />
                    </ProtectedRoute>
                  }
                />
                <Route path="/complaint/:id" element={<ComplaintDetails />} />

                {/* Citizen */}
                <Route
                  path="/citizen-dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['citizen', 'admin']}>
                      <CitizenDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Collector */}
                <Route
                  path="/collector-dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['collector', 'admin']}>
                      <CollectorDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Admin */}
                <Route
                  path="/admin-dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin-map"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminMap />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/track-drivers"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <DriverTracking />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/analytics"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <Analytics />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            <Footer />
            <DemoSwitcher />
          </div>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}
