import { Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Layouts
import UserLayout from './components/UserLayout';
import AdminLayout from './components/AdminLayout';

// Login / Portal Selector
import LoginPage from './pages/LoginPage';

// User Portal Pages
import UserDashboard from './pages/user/UserDashboard';
import MyReportsPage from './pages/user/MyReportsPage';

// Admin Portal Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageRoadsPage from './pages/admin/ManageRoadsPage';
import NetworkAnalysisPage from './pages/admin/NetworkAnalysisPage';

import { useApp } from './context/AppContext';
import './App.css';

function ProtectedRoute({ children, allowedRole }) {
  const { currentUser, authLoading } = useApp();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070D1E] text-cyan-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold font-mono">Connecting to ERNA Database...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && currentUser.role !== allowedRole) {
    return <Navigate to={currentUser.role === 'admin' ? '/admin' : '/public'} replace />;
  }

  return children;
}

export default function App() {
  return (
    <AnimatePresence mode="wait">
      <Routes>
        {/* Entry / Login Page */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* 👤 Public Portal */}
        <Route
          path="/public"
          element={
            <ProtectedRoute allowedRole="public">
              <UserLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<UserDashboard />} />
          <Route path="reports" element={<MyReportsPage />} />
        </Route>

        {/* Legacy /user redirect to /public */}
        <Route path="/user" element={<Navigate to="/public" replace />} />
        <Route path="/user/*" element={<Navigate to="/public" replace />} />

        {/* 👨‍💼 Admin Portal */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="roads" element={<ManageRoadsPage />} />
          <Route path="resilience" element={<NetworkAnalysisPage />} />
          <Route path="analysis" element={<NetworkAnalysisPage />} />
        </Route>

        {/* Catch-all redirect to Login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}
