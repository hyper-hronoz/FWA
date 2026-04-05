import { useEffect } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { observer } from "mobx-react-lite"

import Auth from "./components/pages/Auth"
import Navbar from "./components/layout/Navbar"
import BackgroundEffects from "./components/layout/BackgroundEffects"

import FinishScreen from "./components/pages/FinishScreen"
import SwipeScreen from "./components/pages/SwipeScreen"

import AdminPanel from "./components/admin/AdminPanel"
import Liked from "./components/pages/Liked"
import ProfileSettings from "./components/pages/ProfileSettings"

import { ProtectedRoute, GuestRoute, AdminRoute } from "./routing/ProtectedRoute"

import { useStore } from "./state/storeContext"

import type { Chan } from "@shared/Profile"

const App = observer(function App() {
  const store = useStore()

  useEffect(() => {
    void store.hydrateUserFromServer()
  }, [store])

  useEffect(() => {
    if (store.user) {
      void store.fetchSwipeFeed(false)
    }
  }, [store, store.user])

  const current = store.swipeFeed[0]
  const sessionTotal = store.swipeMatches.length + store.swipePassCount + store.swipeFeed.length

  const handleLike = async (profile: Chan) => {
    store.noteSwipeMatch(profile)
    try {
      await store.postLikeToServer(profile.id)
    } catch (e) {
      console.error(e)
    }
    await store.fetchSwipeFeed(true)
    void store.fetchFavoriteChans(true)
  }

  const handleSkip = async (profile: Chan) => {
    store.noteSwipePass()
    try {
      await store.postUnlikeToServer(profile.id)
    } catch (e) {
      console.error(e)
    }
    await store.fetchSwipeFeed(true)
  }

  const handleRestart = () => {
    store.resetSwipeProgress()
    void store.fetchSwipeFeed(true)
  }

  return (
    <BrowserRouter>
      <div className="app">
        <BackgroundEffects />

        <div className="app-container">
          {store.user && (
            <Navbar
              user={store.user}
              totalProfiles={store.swipeFeed.length}
              onLogout={() => void store.logout()}
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
                    refetch={() => void store.fetchSwipeFeed(true)}
                  />
                }
              />

              <Route path="/liked" element={<Liked />} />

              <Route
                path="/finish"
                element={
                  <FinishScreen
                    matches={store.swipeMatches}
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
              element={<Navigate to={store.user ? "/swipe" : "/auth/login"} replace />}
            />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
})

export default App
