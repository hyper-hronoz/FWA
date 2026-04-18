import { Outlet } from "react-router-dom";

import { Navbar, useAuthContext } from "@fwa/shared-ui";

export function ShellLayout() {
  const { user, logout } = useAuthContext();

  if (!user) {
    return <Outlet />;
  }

  return (
    <div className="relative z-10">
      <Navbar user={user} totalProfiles={0} onLogout={logout} />
      <Outlet />
    </div>
  );
}
