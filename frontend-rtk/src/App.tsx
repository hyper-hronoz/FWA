import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"

import Auth from "./components/pages/Auth"
import Navbar from "./components/layout/Navbar"
import BackgroundEffects from "./components/layout/BackgroundEffects"

import FinishScreen from "./components/pages/FinishScreen"
import SwipeScreen from "./components/pages/SwipeScreen"

import MatchList from "./components/profile/MatchList"
import AdminPanel from "./components/admin/AdminPanel"
import Liked from "./components/pages/Liked"
import ProfileSettings from "./components/pages/ProfileSettings"

import { ProtectedRoute, GuestRoute, AdminRoute } from "./routing/ProtectedRoute"

import { useAppDispatch, useAppSelector } from "./redux/hooks"
import {
  useGetSessionQuery,
  useGetSwipeQueueQuery,
  useSendLikeMutation,
  useSendUnlikeMutation,
} from "./redux/services/backendApi"
import {
  registerSessionLike,
  registerSessionSkip,
  resetSwipeSession,
} from "./redux/swipeDeckSlice"
import { hasAnyToken } from "./redux/authStorage"
import { useRtkSession } from "./hooks/useRtkSession"

import type { Chan } from "@shared/Profile"

function SessionBootstrap() {
  useGetSessionQuery(undefined, { skip: !hasAnyToken() })
  return null
}

function App() {
  const { user, logout } = useRtkSession()
  const dispatch = useAppDispatch()
  const matches = useAppSelector((s) => s.swipeDeck.sessionMatches)
  const sessionSkips = useAppSelector((s) => s.swipeDeck.sessionSkips)

  const { data: queue = [], refetch } = useGetSwipeQueueQuery(undefined, {
    skip: !user,
  })
  const [sendLike] = useSendLikeMutation()
  const [sendUnlike] = useSendUnlikeMutation()

  const current = queue[0]
  const sessionTotal = matches.length + sessionSkips + queue.length

  const handleLike = async (profile: Chan) => {
    dispatch(registerSessionLike(profile))
    await sendLike(profile.id)
  }

  const handleSkip = async (profile: Chan) => {
    dispatch(registerSessionSkip())
    await sendUnlike(profile.id)
  }

  const handleRestart = () => {
    dispatch(resetSwipeSession())
    void refetch()
  }

  return (
    <BrowserRouter>
      <SessionBootstrap />
      <div className="app">
        <BackgroundEffects />

        <div className="app-container">
          {user && (
            <Navbar
              user={user}
              totalProfiles={queue.length}
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
                    chan={current}
                    onLike={handleLike}
                    onSkip={handleSkip}
                    refetch={refetch}
                  />
                }
              />

              <Route path="/liked" element={<Liked />} />

              <Route
                path="/finish"
                element={
                  <FinishScreen
                    matches={matches}
                    total={sessionTotal}
                    onRestart={handleRestart}
                  />
                }
              />

              <Route path="/settings" element={<ProfileSettings />} />
            </Route>

            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminPanel />} />
            </Route>

            <Route
              path="*"
              element={<Navigate to={user ? "/swipe" : "/auth/login"} replace />}
            />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App
