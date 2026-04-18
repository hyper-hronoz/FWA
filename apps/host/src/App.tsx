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
} from "@fwa/shared-ui";
import { MicrofrontendBoundary } from "./components/MicrofrontendBoundary";
import { ShellLayout } from "./components/ShellLayout";
import { importWithRetry } from "./utils/lazyRemote";

const loadMainRemoteRoutes = () =>
  importWithRetry(() => import("mainRemote/AppRoutes"), {
    attempts: 6,
    delayMs: 1200
  });

const loadAdminRemoteRoutes = () =>
  importWithRetry(() => import("adminRemote/AppRoutes"), {
    attempts: 6,
    delayMs: 1200
  });

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
                        <MicrofrontendBoundary
                          loader={loadMainRemoteRoutes}
                          title="Основной микрофронт временно недоступен"
                          description="Пользовательский поток не загрузился с первого раза. Host попробует переподключить remote, а ты можешь вручную повторить подключение без полного рестарта приложения."
                          loadingLabel="Подключаем пользовательский поток..."
                        />
                      }
                    />
                  </Route>
                </Route>

                <Route element={<AdminRoute />}>
                  <Route element={<ShellLayout />}>
                    <Route
                      path="/admin/*"
                      element={
                        <MicrofrontendBoundary
                          loader={loadAdminRemoteRoutes}
                          title="Админ-микрофронт временно недоступен"
                          description="Админский remote сейчас не ответил. Shell остается живым и может заново подключить его без разрыва пользовательской сессии."
                          loadingLabel="Подключаем админ-поток..."
                        />
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
