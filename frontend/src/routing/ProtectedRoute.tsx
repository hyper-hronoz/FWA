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

export const ProtectedRouteWithChildren = ({ children, redirectTo = "/auth/login" }: { 
  children: React.ReactNode; 
  redirectTo?: string;
}) => {
  const { user } = useAuthContext();

  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

export const GuestRoute = () => {
  const { user } = useAuthContext();

  if (user) {
    return <Navigate to="/swipe" replace />;
  }

  return <Outlet />;
};
