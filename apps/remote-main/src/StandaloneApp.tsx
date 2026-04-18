import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import {
  AppPathsProvider,
  AuthProvider,
  BackgroundEffects,
  ProtectedRoute,
  defaultAppPaths
} from "@shared-ui/index";

import AppRoutes from "./exposes/AppRoutes";

function StandaloneLoginHint() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 text-center text-anime-textSoft">
      Для полноценной авторизации используй host-приложение. После входа этот remote можно открывать отдельно.
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
                <Route element={<ProtectedRoute />}>
                  <Route path="/*" element={<AppRoutes />} />
                </Route>
                <Route path="*" element={<Navigate to="/swipe" replace />} />
              </Routes>
            </div>
          </div>
        </BrowserRouter>
      </AppPathsProvider>
    </AuthProvider>
  );
}
