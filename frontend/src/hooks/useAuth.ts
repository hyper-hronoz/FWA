import { useState, useEffect } from 'react'
import { API_BASE_URL, ROUTES } from '../config/api'

import type { LoginData, RegisterData, AuthResponse } from '../types/Auth'
import type { User } from '../types/Profile'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  const fake_login = () => {
    const userToSave = {
      id: "1",
      username: "Анна Коваленко",
      age: 18,
      email: "anna.kovalenko@example.com",
      createdAt: "2024-01-15T10:30:00.000Z"
    }

    localStorage.setItem('animeToken', JSON.stringify('token-sdfksdkfj-token'))
    localStorage.setItem('animeUser', JSON.stringify(userToSave))

    setUser(userToSave)
    setLoading(false)

    return { success: true, user: userToSave }
  }

  const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) return error.message
    if (typeof error === 'string') return error
    return 'An unknown error occurred'
  }

  const checkAuth = async () => {
    // Comment out fake login for production
    // return fake_login();

    const token = localStorage.getItem('animeToken')
    const savedUser = localStorage.getItem('animeUser')

    if (!token || !savedUser) {
      setUser(null)
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}${ROUTES.auth.me}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const userData = await response.json()
        console.log(response)
        console.log(userData)
        setUser(userData)
      } else {
        localStorage.removeItem('animeToken')
        localStorage.removeItem('animeUser')
        setUser(null)
      }
    } catch {
      try {
        const parsedUser = JSON.parse(savedUser as string) as User
        setUser(parsedUser)
      } catch (parseError) {
        console.error('Failed to parse saved user:', parseError)
        setUser(null)
      }
    } finally {
      setLoading(false)
    }
  }

  const login = async (data: LoginData) => {
    // Comment out fake login for production
    return fake_login();

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
      localStorage.setItem('animeToken', result.token)
      localStorage.setItem('animeUser', JSON.stringify(result.user))
      setUser(result.user)

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
      localStorage.setItem('animeToken', result.token)
      localStorage.setItem('animeUser', JSON.stringify(result.user))
      setUser(result.user)

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
      console.log("logout triggered hook")
      // pass
    } finally {
      localStorage.removeItem('animeToken')
      localStorage.removeItem('animeUser')
      setUser(null)
    }
  }


  const updateProfile = async (data: Partial<User>) => {
    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem('animeToken')
      if (!token) throw new Error('Не авторизован')

      const response = await fetch(`${API_BASE_URL}${ROUTES.users.profile}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.message || 'Ошибка обновления профиля')
      }

      const updatedUser = await response.json()
      localStorage.setItem('animeUser', JSON.stringify(updatedUser))
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
