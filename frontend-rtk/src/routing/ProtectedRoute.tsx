import { Navigate, Outlet } from "react-router-dom"

import { useAppSelector } from "../redux/hooks"
import { useGetSessionQuery } from "../redux/services/backendApi"
import { hasAnyToken } from "../redux/authStorage"

export const ProtectedRoute = () => {
  const user = useAppSelector((s) => s.session.user)
  const shouldProbe = hasAnyToken()
  const { isLoading, isFetching } = useGetSessionQuery(undefined, {
    skip: !shouldProbe,
  })

  const bootstrapping = shouldProbe && (isLoading || isFetching) && !user

  if (bootstrapping) {
    return (
      <div className="min-h-screen flex items-center justify-center text-anime-textSoft">
        Загрузка сессии…
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />
  }

  return <Outlet />
}

export const GuestRoute = () => {
  const user = useAppSelector((s) => s.session.user)

  if (user) {
    return <Navigate to="/swipe" replace />
  }

  return <Outlet />
}

export const AdminRoute = () => {
  const user = useAppSelector((s) => s.session.user)
  const shouldProbe = hasAnyToken()
  const { isLoading, isFetching } = useGetSessionQuery(undefined, {
    skip: !shouldProbe,
  })

  const bootstrapping = shouldProbe && (isLoading || isFetching) && !user

  if (bootstrapping) {
    return (
      <div className="min-h-screen flex items-center justify-center text-anime-textSoft">
        Загрузка сессии…
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />
  }

  if (!user.is_admin) {
    return <Navigate to="/swipe" replace />
  }

  return <Outlet />
}
