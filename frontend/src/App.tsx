import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Auth from "./components/pages/Auth";
import Navbar from "./components/layout/Navbar";
import BackgroundEffects from "./components/layout/BackgroundEffects";

import FinishScreen from "./components/pages/FinishScreen";
import SwipeScreen from "./components/pages/SwipeScreen";

import MatchList from "./components/profile/MatchList";
import AdminPanel from "./components/admin/AdminPanel";
import Liked from "./components/pages/Liked";

import { AuthProvider, useAuthContext } from "./context/AuthContext";
import { ProtectedRoute, GuestRoute, AdminRoute } from "./routing/ProtectedRoute";

import { useChan } from "./hooks/useChan.ts";

function AppWrapper() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}

function App() {
  const { user, logout } = useAuthContext();

  const {
    availableProfiles,
    matches,
    likedProfiles,
    loading,
    handleLike,
    handleSkip,
    handleRestart,
    refetch
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
                element={
                  <SwipeScreen
                    chan={availableProfiles[0]}
                    onLike={handleLike}
                    onSkip={handleSkip}
                    refetch={refetch}
                  />
                }
              />

              <Route element={<ProtectedRoute />}>
               <Route
                  path="/liked"
                  element={<Liked 
                    onLike={handleLike}
                    onSkip={handleSkip}
                  />}
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

export default AppWrapper;
