import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../state/authStore';

export default function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    // If not authorized for this role, redirect to dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
