import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";

import { profiles } from "./data/profiles";

import Auth from "./components/pages/Auth";
import Navbar from "./components/layout/Navbar";
import BackgroundEffects from "./components/layout/BackgroundEffects";

import FinishScreen from "./components/pages/FinishScreen";
import SwipeScreen from "./components/pages/SwipeScreen";

import MatchList from "./components/profile/MatchList";

import { useAuth } from "./hooks/useAuth";

import { AuthProvider, useAuthContext } from './context/AuthContext';

import {ProtectedRoute, GuestRoute } from "./routing/ProtectedRoute";
import type { Chan, User } from "./types/Profile"

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
  const [matches, setMatches] = useState<Chan[]>([]);

  const profile: Chan | undefined = profiles[index];
  const next = () => setIndex((prev) => prev + 1);

  const handleLike = () => {
    if (!profile) return;
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

          {user && (
            <Navbar
              user={user}
              currentIndex={index}
              totalProfiles={profiles.length}
              onLogout={logout}
            />
          )}

          <Routes>
            <Route element={<GuestRoute/>}>
              <Route path="/auth/login" element={<Auth mode="login" />} />
              <Route path="/auth/register" element={<Auth mode="register" />} />
            </Route>

            <Route element={<ProtectedRoute/>}>
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

              <Route
                path="/finish"
                element={
                  <FinishScreen
                    matches={matches}
                    total={profiles.length}
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

          {user && <MatchList matches={matches} />}

        </div>
      </div>
    </BrowserRouter>
  );
}

export default AppWrapper;

