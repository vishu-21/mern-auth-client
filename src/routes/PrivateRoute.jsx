import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function PrivateRoute() {
  const { token } = useAuth();

  // If no token, redirect to login
  if (!token) return <Navigate to="/login" replace />;

  // Otherwise render the child route
  return <Outlet />;
}

export default PrivateRoute;