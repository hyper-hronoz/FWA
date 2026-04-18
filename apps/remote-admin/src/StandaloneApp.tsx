import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import {
  AdminRoute,
  AppPathsProvider,
  AuthProvider,
  BackgroundEffects,
  defaultAppPaths
} from "@fwa/shared-ui";

import AppRoutes from "./exposes/AppRoutes";

function StandaloneLoginHint() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 text-center text-anime-textSoft">
      Этот remote ожидает уже авторизованного администратора. Проще входить через host shell.
    </div>
  );
}

export default function StandaloneApp() {
  return (
    <AuthProvider>
      <AppPathsProvider value={defaultAppPaths}>
        <BrowserRouter>
          <div className="min-h-screen bg-gradient-to-br from-anime-background via-[#15172a] to-[#22153b] text-white">
            <BackgroundEffects />
            <div className="relative z-10">
              <Routes>
                <Route path="/auth/login" element={<StandaloneLoginHint />} />
                <Route element={<AdminRoute />}>
                  <Route path="/*" element={<AppRoutes />} />
                </Route>
                <Route path="*" element={<Navigate to="/admin" replace />} />
              </Routes>
            </div>
          </div>
        </BrowserRouter>
      </AppPathsProvider>
    </AuthProvider>
  );
}
