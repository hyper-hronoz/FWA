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

const loadLikedRemoteRoutes = () =>
  importWithRetry(() => import("likedRemote/AppRoutes"), {
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
                    <Route path="/app">
                      <Route
                        path="liked/*"
                        element={
                          <MicrofrontendBoundary
                            boundaryKey="liked"
                            loader={loadLikedRemoteRoutes}
                            title="Раздел лайкнутых временно недоступен"
                            description="Список понравившихся карточек сейчас не открылся. Можно попробовать загрузить его снова без полного перезапуска приложения."
                            loadingLabel="Открываем лайкнутые..."
                          />
                        }
                      />
                      <Route
                        path="*"
                        element={
                          <MicrofrontendBoundary
                            boundaryKey="main"
                            loader={loadMainRemoteRoutes}
                            title="Основной микрофронт временно недоступен"
                            description="Раздел не открылся с первого раза. Можно попробовать подключить его снова без полного перезапуска приложения."
                            loadingLabel="Подготавливаем раздел..."
                          />
                        }
                      />
                    </Route>
                  </Route>
                </Route>

                <Route element={<AdminRoute />}>
                  <Route element={<ShellLayout />}>
                    <Route
                      path="/admin/*"
                      element={
                        <MicrofrontendBoundary
                          boundaryKey="admin"
                          loader={loadAdminRemoteRoutes}
                          title="Админ-микрофронт временно недоступен"
                          description="Раздел управления сейчас недоступен. Можно попробовать открыть его снова, не перезапуская приложение."
                          loadingLabel="Открываем раздел управления..."
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
