import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/Layout/ProtectedRoute';
import Login from './pages/Login/Login';
import AnalyticsDashboard from './pages/Dashboard/AnalyticsDashboard';
import Dashboard from './pages/Dashboard/Dashboard';
import CalculateCapacity from './pages/Edit/CalculateCapacity';
import EditParameters from './pages/Edit/EditParameters';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Routes (Authenticated Users) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AnalyticsDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/details"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Protected Routes (Editors Only) */}
        <Route
          path="/calculate-capacity"
          element={
            <ProtectedRoute requiredRole="editor">
              <CalculateCapacity />
            </ProtectedRoute>
          }
        />
        <Route
          path="/calculate-capacity/parameters"
          element={
            <ProtectedRoute requiredRole="editor">
              <EditParameters />
            </ProtectedRoute>
          }
        />

        {/* Catch-all redirects */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
