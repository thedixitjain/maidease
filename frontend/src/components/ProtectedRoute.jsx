import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * ProtectedRoute - Wrapper component to protect routes that require authentication
 * Redirects to login if user is not authenticated
 */
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

/**
 * RoleBasedRoute - Wrapper component to protect routes based on user role
 * Only allows users with specific roles to access the route
 * @param {string|string[]} allowedRoles - Role or array of roles allowed to access
 * @param {React.ReactNode} children - The component to render if authorized
 */
export const RoleBasedRoute = ({ allowedRoles, children }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Convert single role to array for consistent checking
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  if (!user || !roles.includes(user.role)) {
    // Redirect to dashboard if user doesn't have the required role
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};
