import { Navigate, Route, Routes } from "react-router-dom";

import { AdminPanelPage } from "@shared-ui/index";

export default function AppRoutes() {
  return (
    <Routes>
      <Route index element={<AdminPanelPage />} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}
