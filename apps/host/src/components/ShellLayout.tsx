import { Outlet } from "react-router-dom";

import { useAuthContext } from "@shared-ui/index";
import Navbar from "@shared-ui/components/layout/Navbar";

export function ShellLayout() {
  const { user, logout } = useAuthContext();

  if (!user) {
    return <Outlet />;
  }

  return (
    <>
      <Navbar user={user} totalProfiles={0} onLogout={logout} />
      <Outlet />
    </>
  );
}
