import { Navigate, Outlet } from "react-router-dom";
import { useAuthContext } from '../context/AuthContext';

export const ProtectedRoute = () => {
  const { user } = useAuthContext();

  console.log("From ProtectedRoute.tsx user: ", user);

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  return <Outlet />;
};

export const GuestRoute = () => {
  const { user } = useAuthContext();

  if (user) {
    return <Navigate to="/swipe" replace />;
  }

  return <Outlet />;
};

export const AdminRoute = () => {
  const { user } = useAuthContext();
  
  console.log("AdminRoute - user from context:", user);

  if (!user) {
    console.log("AdminRoute - no user, redirecting to login");
    return <Navigate to="/auth/login" replace />;
  }

  if (!user.is_admin) {
    console.log("AdminRoute - not admin, redirecting to swipe");
    return <Navigate to="/swipe" replace />;
  }

  return <Outlet />;
};
