import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Auth from "./components/pages/Auth";
import Navbar from "./components/layout/Navbar";
import BackgroundEffects from "./components/layout/BackgroundEffects";

import FinishScreen from "./components/pages/FinishScreen";
import SwipeScreen from "./components/pages/SwipeScreen";

import AdminPanel from "./components/admin/AdminPanel";
import Liked from "./components/pages/Liked";
import ProfileSettings from "./components/pages/ProfileSettings";

import { AppStateProvider, useAuthContext, useChan, useLiked } from "@state/hooks";
import { ProtectedRoute, GuestRoute, AdminRoute } from "./routing/ProtectedRoute";

function AppWrapper() {
  return (
    <AppStateProvider>
      <App />
    </AppStateProvider>
  );
}

function App() {
  const { user, logout } = useAuthContext();

  const {
    availableProfiles,
    matches,
    handleLike,
    handleSkip,
    handleRestart
  } = useChan();

  return (
    <BrowserRouter>
      <div className="app">
        <BackgroundEffects />

        <div className="app-container">
          {user && (
            <Navbar
              user={user}
              totalProfiles={availableProfiles.length}
              onLogout={logout}
            />
          )}

          <Routes>
            <Route element={<GuestRoute />}>
              <Route path="/auth/login" element={<Auth mode="login" />} />
              <Route path="/auth/register" element={<Auth mode="register" />} />
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route
                path="/swipe"
                element={<SwipeRoute />}
              />

              <Route element={<ProtectedRoute />}>
              <Route
                path="/liked"
                element={<LikedRoute onSkip={handleSkip} />}
                />
              </Route>

              <Route
                path="/finish"
                element={
                  <FinishScreen
                    matches={matches}
                    total={availableProfiles.length}
                    onRestart={handleRestart}
                  />
                }
              />

              <Route
                path="/settings"
                element={<ProfileSettings />}
              />
            </Route>

            <Route element={<AdminRoute />}>
              <Route
                path="/admin"
                element={<AdminPanel />}
              />
            </Route>

            <Route
              path="*"
              element={<Navigate to={user ? "/swipe" : "/auth/login"} replace />}
            />
          </Routes>

        </div>
      </div>
    </BrowserRouter>
  );
}

function SwipeRoute() {
  const { availableProfiles, handleLike, handleSkip, refetch } = useChan();

  useEffect(() => {
    void refetch();
  }, []);

  return (
    <SwipeScreen
      chan={availableProfiles[0]}
      onLike={handleLike}
      onSkip={handleSkip}
    />
  );
}

function LikedRoute({ onSkip }: { onSkip: (profile: import("@shared/Profile").Chan) => Promise<void> }) {
  const { refetch } = useLiked();

  useEffect(() => {
    void refetch();
  }, []);

  return <Liked onSkip={onSkip} />;
}

export default AppWrapper;
