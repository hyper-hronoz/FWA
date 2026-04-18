import { Navigate, Route, Routes } from "react-router-dom";

import { AdminPanelPage } from "@fwa/shared-ui";

export default function AppRoutes() {
  return (
    <Routes>
      <Route index element={<AdminPanelPage />} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}
