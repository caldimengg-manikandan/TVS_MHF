import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../state/authStore';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role) && user?.role !== 'Admin') {
    // If not authorized for this role, redirect to dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
