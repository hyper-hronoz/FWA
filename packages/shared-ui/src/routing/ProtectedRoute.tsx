import { Navigate, Outlet } from "react-router-dom";
import { useAuthContext } from '../context/AuthContext';
import { useAppPaths } from "./AppPathsContext";

export const ProtectedRoute = () => {
  const { user } = useAuthContext();
  const paths = useAppPaths();

  if (!user) {
    return <Navigate to={paths.authLogin} replace />;
  }

  return <Outlet />;
};

export const GuestRoute = () => {
  const { user } = useAuthContext();
  const paths = useAppPaths();

  if (user) {
    return <Navigate to={paths.mainSwipe} replace />;
  }

  return <Outlet />;
};

export const AdminRoute = () => {
  const { user } = useAuthContext();
  const paths = useAppPaths();

  if (!user) {
    return <Navigate to={paths.authLogin} replace />;
  }

  if (!user.is_admin) {
    return <Navigate to={paths.mainSwipe} replace />;
  }

  return <Outlet />;
};
