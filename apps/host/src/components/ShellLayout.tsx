import { Outlet } from "react-router-dom";

import { Navbar, useAuthContext } from "@fwa/shared-ui";

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
