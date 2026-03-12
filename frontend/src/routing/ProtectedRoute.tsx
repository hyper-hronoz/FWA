import { Navigate } from "react-router-dom";
import { ReactNode } from "react";
import { useAuthContext } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

const ProtectedRoute = ({ children, redirectTo = "/auth/login" }: ProtectedRouteProps) => {
  const { user } = useAuthContext();

  console.log("From ProtectedRoute.tsx user: ", user)

  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
