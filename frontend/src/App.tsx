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


// --- Только для авторизованных ---
function ProtectedRoute({ user }) {
  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  return <Outlet />;
}


// --- Только для гостей ---
function GuestRoute({ user }) {
  if (user) {
    return <Navigate to="/swipe" replace />;
  }

  return <Outlet />;
}


function App() {
  const { user, logout } = useAuth();

  const [index, setIndex] = useState(0);
  const [matches, setMatches] = useState([]);

  const profile = profiles[index];

  const next = () => setIndex((prev) => prev + 1);

  const handleLike = () => {
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
              index={index}
              total={profiles.length}
              onLogout={logout}
            />
          )}

          <Routes>

            {/* Гостевые страницы */}
            <Route element={<GuestRoute user={user} />}>
              <Route path="/auth/login" element={<Auth mode="login" />} />
              <Route path="/auth/register" element={<Auth mode="register" />} />
            </Route>


            {/* Защищённые страницы */}
            <Route element={<ProtectedRoute user={user} />}>

              <Route
                path="/swipe"
                element={
                  !profile ? (
                    <Navigate to="/finish" replace />
                  ) : (
                    <SwipeScreen
                      profile={profile}
                      onLike={handleLike}
                      onSkip={handleSkip}
                    />
                  )
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


            {/* Редирект по умолчанию */}
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

export default App;
