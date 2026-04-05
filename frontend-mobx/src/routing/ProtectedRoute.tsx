import { Navigate, Outlet } from "react-router-dom"
import { observer } from "mobx-react-lite"

import { useStore } from "../state/storeContext"

export const ProtectedRoute = observer(function ProtectedRoute() {
  const store = useStore()

  if (store.authPending && !store.user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-anime-textSoft">
        Загрузка сессии…
      </div>
    )
  }

  if (!store.user) {
    return <Navigate to="/auth/login" replace />
  }

  return <Outlet />
})

export const GuestRoute = observer(function GuestRoute() {
  const store = useStore()

  if (store.user) {
    return <Navigate to="/swipe" replace />
  }

  return <Outlet />
})

export const AdminRoute = observer(function AdminRoute() {
  const store = useStore()

  if (store.authPending && !store.user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-anime-textSoft">
        Загрузка сессии…
      </div>
    )
  }

  if (!store.user) {
    return <Navigate to="/auth/login" replace />
  }

  if (!store.user.is_admin) {
    return <Navigate to="/swipe" replace />
  }

  return <Outlet />
})
