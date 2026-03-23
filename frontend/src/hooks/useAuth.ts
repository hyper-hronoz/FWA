import { useState, useEffect } from 'react'
import { API_BASE_URL, ROUTES } from '../config/api'

import type { User } from '@shared/Profile'
import type { LoginData, RegisterData, AuthResponse } from "@shared/Auth"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const ACCESS_TOKEN_KEY = 'animeAccessToken'
  const REFRESH_TOKEN_KEY = 'animeRefreshToken'
  const USER_KEY = 'animeUser'

  useEffect(() => {
    checkAuth()
  }, [])

  const saveAuth = (payload: AuthResponse) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, payload.accessToken)
    localStorage.setItem(REFRESH_TOKEN_KEY, payload.refreshToken)
    localStorage.setItem(USER_KEY, JSON.stringify(payload.user))
    setUser(payload.user)
  }

  const clearAuth = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setUser(null)
  }

  const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) return error.message
    if (typeof error === 'string') return error
    return 'An unknown error occurred'
  }

  const parseErrorResponse = async (response: Response) => {
    const contentType = response.headers.get('content-type') || ''

    if (contentType.includes('application/json')) {
      const err = await response.json() as { message?: string }
      return err.message || 'Ошибка запроса'
    }

    const text = await response.text()
    return text || `Ошибка запроса: ${response.status}`
  }

  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
    if (!refreshToken) return null

    const response = await fetch(`${API_BASE_URL}${ROUTES.auth.refresh}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    })

    if (!response.ok) {
      clearAuth()
      return null
    }

    const refreshed = await response.json() as { accessToken: string; refreshToken: string }
    localStorage.setItem(ACCESS_TOKEN_KEY, refreshed.accessToken)
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshed.refreshToken)
    return refreshed.accessToken
  }

  const authFetch = async (url: string, options: RequestInit = {}) => {
    let accessToken = localStorage.getItem(ACCESS_TOKEN_KEY)
    const headers = new Headers(options.headers || {})

    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`)
    }

    const response = await fetch(url, { ...options, headers })
    if (response.status !== 401 && response.status !== 403) {
      return response
    }

    accessToken = await refreshAccessToken()
    if (!accessToken) {
      return response
    }

    headers.set('Authorization', `Bearer ${accessToken}`)
    return fetch(url, { ...options, headers })
  }

  const checkAuth = async () => {
    const savedUser = localStorage.getItem(USER_KEY)
    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY)
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)

    if (!savedUser || (!accessToken && !refreshToken)) {
      setUser(null)
      return
    }

    try {
      setLoading(true)
      const response = await authFetch(`${API_BASE_URL}${ROUTES.auth.me}`)

      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
        localStorage.setItem(USER_KEY, JSON.stringify(userData))
      } else {
        clearAuth()
      }
    } catch {
      try {
        const parsedUser = JSON.parse(savedUser) as User
        setUser(parsedUser)
      } catch {
        clearAuth()
      }
    } finally {
      setLoading(false)
    }
  }

  const login = async (data: LoginData) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`${API_BASE_URL}${ROUTES.auth.login}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.message || 'Ошибка входа')
      }

      const result: AuthResponse = await response.json()
      saveAuth(result)

      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission()
      }

      return { success: true, user: result.user }
    } catch (err) {
      const message = getErrorMessage(err)
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }

  const register = async (data: RegisterData) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`${API_BASE_URL}${ROUTES.auth.register}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.message || 'Ошибка регистрации')
      }

      const result: AuthResponse = await response.json()
      saveAuth(result)

      return { success: true, user: result.user }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ошибка при регистрации'
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }
  
  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
      const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY)
      if (refreshToken && accessToken) {
        await fetch(`${API_BASE_URL}${ROUTES.auth.logout}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({ refreshToken })
        })
      }
    } finally {
      clearAuth()
    }
  }

  const updateProfile = async (data: Partial<User>) => {
    try {
      setLoading(true)
      setError(null)

      const response = await authFetch(`${API_BASE_URL}${ROUTES.users.profile}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error(await parseErrorResponse(response))
      }

      const updatedUser = await response.json()
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser))
      setUser(updatedUser)

      return { success: true, user: updatedUser }
    } catch (err) {
      const message = getErrorMessage(err)
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    checkAuth
  }
}
