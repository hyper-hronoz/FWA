import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { profiles } from "./data/profiles";

import Auth from "./components/pages/Auth";
import Navbar from "./components/layout/Navbar";
import BackgroundEffects from "./components/layout/BackgroundEffects";

import SwipeScreen from "./components/pages/SwipeScreen";
import FinishScreen from "./components/pages/FinishScreen";

import MatchList from "./components/profile/MatchList";

import ProtectedRoute from "./routing/ProtectedRoute";
import { AuthProvider, useAuthContext } from './context/AuthContext';

function AppWrapper() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}

function App() {
  const { user, logout } = useAuthContext();

  const [index, setIndex] = useState(0);
  const [matches, setMatches] = useState([]);

  const profile = profiles[index];

  const next = () => setIndex((prev) => prev + 1);

  const handleLike = () => {
    if (!user) return;
    setMatches((prev) => [...prev, profile]);
    next();
  };

  const handleSkip = () => {
    next();
  };

  const handleRestart = () => {
    setIndex(0);
    setMatches([]);
  };

  return (
    <BrowserRouter>
      <div className="app">
        <BackgroundEffects />

        <div className="app-container">
          {/* Navbar only shows when user is logged in */}
          {user && (
            <Navbar
              user={user}
              index={index}
              total={profiles.length}
              onLogout={logout}
            />
          )}

          <Routes>
            {/* Auth Routes */}
            <Route
              path="/auth/login"
              element={user ? <Navigate to="/swipe" /> : <Auth mode="login" user={user} />}
            />
            <Route
              path="/auth/register"
              element={user ? <Navigate to="/swipe" /> : <Auth mode="register" user={user} />}
            />

            {/* Protected Swipe Route */}
            <Route
              path="/swipe"
              element={
                <ProtectedRoute>
                  <SwipeScreen
                    profile={profile}
                    onLike={handleLike}
                    onSkip={handleSkip}
                    user={user}
                  />
                </ProtectedRoute>
              }
            />

            {/* Protected Finish Route */}
            <Route
              path="/finish"
              element={
                <ProtectedRoute>
                  <FinishScreen
                    matches={matches}
                    total={profiles.length}
                    onRestart={handleRestart}
                    user={user}
                  />
                </ProtectedRoute>
              }
            />

            {/* Default route */}
            <Route
              path="*"
              element={user ? <Navigate to="/swipe" /> : <Navigate to="/auth/login" />}
            />
          </Routes>

          {/* Match list always visible if user is logged in */}
          {user && <MatchList matches={matches} user={user} />}
        </div>
      </div>
    </BrowserRouter>
  );
}

export default AppWrapper;
