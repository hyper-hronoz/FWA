import { useCallback, useMemo } from "react"

import { useAppSelector } from "../redux/hooks"
import {
  useLoginMutation,
  useLogoutMutation,
  usePatchProfileMutation,
  useRegisterMutation,
} from "../redux/services/backendApi"

import type { User } from "@shared/Profile"
import type { LoginData, RegisterData } from "@shared/Auth"

export function useRtkSession() {
  const user = useAppSelector((s) => s.session.user)

  const [loginMut, loginState] = useLoginMutation()
  const [registerMut, registerState] = useRegisterMutation()
  const [logoutMut] = useLogoutMutation()
  const [patchProfileMut, patchState] = usePatchProfileMutation()

  const loading = useMemo(
    () =>
      loginState.isLoading ||
      registerState.isLoading ||
      patchState.isLoading,
    [loginState.isLoading, registerState.isLoading, patchState.isLoading]
  )

  const login = useCallback(
    async (data: LoginData) => {
      try {
        const result = await loginMut(data).unwrap()
        return { success: true as const, user: result.user }
      } catch (e) {
        const message =
          e && typeof e === "object" && "data" in e
            ? String((e as { data?: { message?: string } }).data?.message ?? "")
            : ""
        return {
          success: false as const,
          error: message || "Ошибка входа",
        }
      }
    },
    [loginMut]
  )

  const register = useCallback(
    async (data: RegisterData) => {
      try {
        const result = await registerMut(data).unwrap()
        return { success: true as const, user: result.user }
      } catch (e) {
        const message =
          e && typeof e === "object" && "data" in e
            ? String((e as { data?: { message?: string } }).data?.message ?? "")
            : ""
        return {
          success: false as const,
          error: message || "Ошибка регистрации",
        }
      }
    },
    [registerMut]
  )

  const logout = useCallback(async () => {
    try {
      await logoutMut().unwrap()
    } catch {
      /* очистка уже в onQueryStarted */
    }
  }, [logoutMut])

  const updateProfile = useCallback(
    async (data: Partial<User> & { password?: string }) => {
      try {
        const updated = await patchProfileMut(data).unwrap()
        return { success: true as const, user: updated }
      } catch (e) {
        const message =
          e && typeof e === "object" && "data" in e
            ? String((e as { data?: { message?: string } }).data?.message ?? "")
            : ""
        return {
          success: false as const,
          error: message || "Не удалось обновить профиль",
        }
      }
    },
    [patchProfileMut]
  )

  return { user, loading, login, register, logout, updateProfile }
}
