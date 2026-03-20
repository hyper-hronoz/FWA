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

import { useSwipeLogic } from "./hooks/useSwipeLogic";

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
    profile,
    index,
    matches,
    likedProfiles,
    loading,
    total,
    handleLike,
    handleSkip,
    handleRestart,
  } = useSwipeLogic();

  return (
    <BrowserRouter>
      <div className="app">
        <BackgroundEffects />

        <div className="app-container">
          {user && (
            <Navbar
              user={user}
              currentIndex={index}
              totalProfiles={total}
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
                    chan={profile}
                    onLike={handleLike}
                    onSkip={handleSkip}
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
                    total={total}
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
