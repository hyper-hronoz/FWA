import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import {
  AppPathsProvider,
  AuthProvider,
  BackgroundEffects,
  ProtectedRoute,
  defaultAppPaths
} from "@fwa/shared-ui";

import AppRoutes from "./exposes/AppRoutes";

const standalonePaths = {
  ...defaultAppPaths,
  mainSwipe: "/liked",
  liked: "/liked"
};

function StandaloneLoginHint() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 text-center text-anime-textSoft">
      Для входа удобнее использовать основное приложение. После авторизации этот раздел можно открывать отдельно.
    </div>
  );
}

export default function StandaloneApp() {
  return (
    <AuthProvider>
      <AppPathsProvider value={standalonePaths}>
        <BrowserRouter>
          <div className="min-h-screen bg-gradient-to-br from-anime-background via-[#15172a] to-[#22153b] text-white">
            <BackgroundEffects />
            <div className="relative z-10">
              <Routes>
                <Route path="/auth/login" element={<StandaloneLoginHint />} />
                <Route element={<ProtectedRoute />}>
                  <Route path="/liked/*" element={<AppRoutes />} />
                </Route>
                <Route path="*" element={<Navigate to="/liked" replace />} />
              </Routes>
            </div>
          </div>
        </BrowserRouter>
      </AppPathsProvider>
    </AuthProvider>
  );
}
