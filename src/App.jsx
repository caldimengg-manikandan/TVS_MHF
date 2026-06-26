import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/Layout/ProtectedRoute';
import Login from './pages/Login/Login';
import AnalyticsDashboard from './pages/Dashboard/AnalyticsDashboard';
import Dashboard from './pages/Dashboard/Dashboard';
import CalculateCapacity from './pages/Edit/CalculateCapacity';
import EditParameters from './pages/Edit/EditParameters';

// New Sprint 1 Pages
import VehicleModelsMaster from './pages/Masters/VehicleModelsMaster';
import SupplierMaster from './pages/Masters/SupplierMaster';
import PlantMaster from './pages/Masters/PlantMaster';
import UserManagement from './pages/Administration/UserManagement';
import DailyPlanning from './pages/Planning/DailyPlanning';
import PlanningCalendar from './pages/Planning/PlanningCalendar';
import PlanningHistory from './pages/Planning/PlanningHistory';
import Allocation from './pages/Operations/Allocation';
import GapManagement from './pages/Operations/GapManagement';
import TransferManagement from './pages/Operations/TransferManagement';
import RequestManagement from './pages/Operations/RequestManagement';
import ReportsDashboard from './pages/Reports/ReportsDashboard';

import './App.css';

export default function App() {
  const adminAndOps = ['Admin', 'Planner', 'Production Engineer', 'editor'];
  const adminOnly = ['Admin', 'editor'];

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Routes (All Authenticated Users) */}
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

        {/* Planning Routes */}
        <Route
          path="/planning/daily"
          element={
            <ProtectedRoute allowedRoles={adminAndOps}>
              <DailyPlanning />
            </ProtectedRoute>
          }
        />
        <Route
          path="/planning/calendar"
          element={
            <ProtectedRoute allowedRoles={adminAndOps}>
              <PlanningCalendar />
            </ProtectedRoute>
          }
        />
        <Route
          path="/planning/history"
          element={
            <ProtectedRoute allowedRoles={adminAndOps}>
              <PlanningHistory />
            </ProtectedRoute>
          }
        />

        {/* Operations Routes */}
        <Route
          path="/operations/allocation"
          element={
            <ProtectedRoute allowedRoles={adminAndOps}>
              <Allocation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/operations/gap-management"
          element={
            <ProtectedRoute allowedRoles={adminAndOps}>
              <GapManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/operations/transfer-management"
          element={
            <ProtectedRoute allowedRoles={adminAndOps}>
              <TransferManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/operations/request-management"
          element={
            <ProtectedRoute allowedRoles={adminAndOps}>
              <RequestManagement />
            </ProtectedRoute>
          }
        />

        {/* Reports Routes */}
        <Route
          path="/reports"
          element={
            <ProtectedRoute allowedRoles={adminAndOps}>
              <ReportsDashboard />
            </ProtectedRoute>
          }
        />

        {/* Master Data Routes */}
        <Route
          path="/masters/vehicle-models"
          element={
            <ProtectedRoute allowedRoles={adminAndOps}>
              <VehicleModelsMaster />
            </ProtectedRoute>
          }
        />
        <Route
          path="/masters/suppliers"
          element={
            <ProtectedRoute allowedRoles={adminAndOps}>
              <SupplierMaster />
            </ProtectedRoute>
          }
        />
        <Route
          path="/masters/plants"
          element={
            <ProtectedRoute allowedRoles={adminAndOps}>
              <PlantMaster />
            </ProtectedRoute>
          }
        />

        {/* Calculator Routes */}
        <Route
          path="/calculate-capacity"
          element={
            <ProtectedRoute allowedRoles={adminAndOps}>
              <CalculateCapacity />
            </ProtectedRoute>
          }
        />
        <Route
          path="/calculate-capacity/parameters"
          element={
            <ProtectedRoute allowedRoles={adminAndOps}>
              <EditParameters />
            </ProtectedRoute>
          }
        />

        {/* Administration Routes */}
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={adminOnly}>
              <UserManagement />
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
