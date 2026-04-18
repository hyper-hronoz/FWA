import { lazy } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import {
  AdminRoute,
  AppPathsProvider,
  AuthPage,
  AuthProvider,
  BackgroundEffects,
  GuestRoute,
  ProtectedRoute,
  defaultAppPaths
} from "@shared-ui/index";

import { MicrofrontendBoundary } from "./components/MicrofrontendBoundary";
import { ShellLayout } from "./components/ShellLayout";

const MainRemoteRoutes = lazy(() => import("mainRemote/AppRoutes"));
const AdminRemoteRoutes = lazy(() => import("adminRemote/AppRoutes"));

const hostPaths = {
  ...defaultAppPaths,
  mainSwipe: "/app/swipe",
  liked: "/app/liked",
  finish: "/app/finish",
  settings: "/app/settings",
  admin: "/admin"
};

export default function App() {
  return (
    <AuthProvider>
      <AppPathsProvider value={hostPaths}>
        <BrowserRouter>
          <div className="app">
            <BackgroundEffects />

            <div className="app-container">
              <Routes>
                <Route element={<GuestRoute />}>
                  <Route path="/auth/login" element={<AuthPage mode="login" />} />
                  <Route path="/auth/register" element={<AuthPage mode="register" />} />
                </Route>

                <Route element={<ProtectedRoute />}>
                  <Route element={<ShellLayout />}>
                    <Route
                      path="/app/*"
                      element={
                        <MicrofrontendBoundary title="Основной микрофронт временно недоступен">
                          <MainRemoteRoutes />
                        </MicrofrontendBoundary>
                      }
                    />
                  </Route>
                </Route>

                <Route element={<AdminRoute />}>
                  <Route element={<ShellLayout />}>
                    <Route
                      path="/admin/*"
                      element={
                        <MicrofrontendBoundary title="Админ-микрофронт временно недоступен">
                          <AdminRemoteRoutes />
                        </MicrofrontendBoundary>
                      }
                    />
                  </Route>
                </Route>

                <Route path="/" element={<Navigate to="/app/swipe" replace />} />
                <Route path="*" element={<Navigate to="/app/swipe" replace />} />
              </Routes>
            </div>
          </div>
        </BrowserRouter>
      </AppPathsProvider>
    </AuthProvider>
  );
}
