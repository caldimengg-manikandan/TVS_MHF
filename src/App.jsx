import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/Layout/ProtectedRoute';
import Login from './pages/Login/Login';
import AnalyticsDashboard from './pages/Dashboard/AnalyticsDashboard';
import Dashboard from './pages/Dashboard/Dashboard';
import ProductionParts from './pages/Edit/ProductionParts';
import EditParameters from './pages/Edit/EditParameters';

// New Sprint 1 Pages
import VehicleModelsMaster from './pages/Masters/VehicleModelsMaster';
import ProductionPartsMaster from './pages/Masters/ProductionPartsMaster';
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
import { useEffect } from 'react';
import { useProductionPartsStore } from './stores/productionPartsStore';
import { useAuthStore } from './state/authStore';
import { useAllocationStore } from './stores/allocationStore';
import { useGapStore } from './stores/gapStore';
import { usePlanningStore } from './stores/planningStore';
import { useRequestStore } from './stores/requestStore';
import { useTransferStore } from './stores/transferStore';

export default function App() {
  const adminAndOps = ['Admin', 'Planner', 'Production Engineer', 'editor'];
  const adminOnly = ['Admin', 'editor'];

  const { fetchData } = useProductionPartsStore();
  const { fetchUsers } = useAuthStore();
  const { fetchAllocations } = useAllocationStore();
  const { fetchGaps } = useGapStore();
  const { fetchPlans } = usePlanningStore();
  const { fetchRequests } = useRequestStore();
  const { fetchTransfers } = useTransferStore();

  useEffect(() => {
    fetchData();
    fetchUsers();
    fetchAllocations();
    fetchGaps();
    fetchPlans();
    fetchRequests();
    fetchTransfers();
  }, [fetchData, fetchUsers, fetchAllocations, fetchGaps, fetchPlans, fetchRequests, fetchTransfers]);

  return (
    <BrowserRouter>
      <Toaster position="top-center" toastOptions={{ duration: 4000, style: { background: 'hsl(220, 16%, 14%)', color: '#fff', borderRadius: '8px' } }} />
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
          path="/masters/production-parts"
          element={
            <ProtectedRoute allowedRoles={adminAndOps}>
              <ProductionPartsMaster />
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

        {/* Production Parts Route */}
        <Route
          path="/planning/production-parts"
          element={
            <ProtectedRoute allowedRoles={adminAndOps}>
              <ProductionParts />
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
