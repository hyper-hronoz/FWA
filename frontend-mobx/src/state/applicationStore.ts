import { makeAutoObservable, runInAction } from "mobx"

import { API_BASE_URL, ROUTES } from "../config/api"
import { normalizeGirlListPayload } from "../utils/girlListPayload"

import type { Chan, User } from "@shared/Profile"
import type { AuthResponse, LoginData, RegisterData } from "@shared/Auth"

const USER_KEY = "animeUser"
const ACCESS_KEY = "animeAccessToken"
const REFRESH_KEY = "animeRefreshToken"

/** Собственный TTL-кэш ответов API (отличается от RTK Query у соседнего варианта). */
const CACHE_TTL_MS = 45_000

function readUserFromStorage(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    if (!raw) return null
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

export class ApplicationStore {
  user: User | null = readUserFromStorage()
  authPending = false

  swipeFeed: Chan[] = []
  private swipeFeedStamp = 0
  swipeFeedLoading = false

  favoriteChans: Chan[] = []
  private favoriteStamp = 0
  favoriteLoading = false

  adminChans: Chan[] = []
  private adminStamp = 0
  adminLoading = false

  swipeMatches: Chan[] = []
  swipePassCount = 0

  constructor() {
    makeAutoObservable(this)
  }

  private isFresh(stamp: number) {
    return stamp > 0 && Date.now() - stamp < CACHE_TTL_MS
  }

  private bumpAfterSocialMutation() {
    this.swipeFeedStamp = 0
    this.favoriteStamp = 0
  }

  private bumpAfterAdminMutation() {
    this.adminStamp = 0
    this.swipeFeedStamp = 0
    this.favoriteStamp = 0
  }

  wipeSession() {
    localStorage.removeItem(ACCESS_KEY)
    localStorage.removeItem(REFRESH_KEY)
    localStorage.removeItem(USER_KEY)
    this.user = null
    this.swipeFeed = []
    this.swipeFeedStamp = 0
    this.favoriteChans = []
    this.favoriteStamp = 0
    this.adminChans = []
    this.adminStamp = 0
    this.swipeMatches = []
    this.swipePassCount = 0
  }

  async refreshAccessToken(): Promise<string | null> {
    const refresh = localStorage.getItem(REFRESH_KEY)
    if (!refresh) return null

    const res = await fetch(`${API_BASE_URL}${ROUTES.auth.refresh}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: refresh }),
    })

    if (!res.ok) {
      runInAction(() => this.wipeSession())
      return null
    }

    const data = (await res.json()) as { accessToken: string; refreshToken: string }
    localStorage.setItem(ACCESS_KEY, data.accessToken)
    localStorage.setItem(REFRESH_KEY, data.refreshToken)
    return data.accessToken
  }

  async authorizedFetch(input: string, init: RequestInit = {}) {
    let access = localStorage.getItem(ACCESS_KEY)
    const headers = new Headers(init.headers)
    if (access) headers.set("Authorization", `Bearer ${access}`)

    let response = await fetch(input, { ...init, headers })
    if (response.status !== 401 && response.status !== 403) {
      return response
    }

    access = await this.refreshAccessToken()
    if (!access) return response

    headers.set("Authorization", `Bearer ${access}`)
    return fetch(input, { ...init, headers })
  }

  async hydrateUserFromServer() {
    const hasToken =
      localStorage.getItem(ACCESS_KEY) || localStorage.getItem(REFRESH_KEY)
    if (!hasToken) {
      runInAction(() => {
        this.user = null
      })
      return
    }

    this.authPending = true
    try {
      const res = await this.authorizedFetch(`${API_BASE_URL}${ROUTES.auth.me}`)
      if (res.ok) {
        const data = (await res.json()) as User
        runInAction(() => {
          this.user = data
          localStorage.setItem(USER_KEY, JSON.stringify(data))
        })
      } else {
        runInAction(() => this.wipeSession())
      }
    } catch {
      const cached = readUserFromStorage()
      runInAction(() => {
        if (cached) this.user = cached
      })
    } finally {
      runInAction(() => {
        this.authPending = false
      })
    }
  }

  async login(
    payload: LoginData
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    this.authPending = true
    try {
      const res = await fetch(`${API_BASE_URL}${ROUTES.auth.login}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { message?: string }
        return { success: false, error: err.message || "Ошибка входа" }
      }

      const data = (await res.json()) as AuthResponse
      localStorage.setItem(ACCESS_KEY, data.accessToken)
      localStorage.setItem(REFRESH_KEY, data.refreshToken)
      localStorage.setItem(USER_KEY, JSON.stringify(data.user))

      runInAction(() => {
        this.user = data.user
        this.swipeFeedStamp = 0
        this.favoriteStamp = 0
        this.adminStamp = 0
      })

      if ("Notification" in window && Notification.permission === "default") {
        void Notification.requestPermission()
      }

      return { success: true, user: data.user }
    } catch {
      return { success: false, error: "Ошибка входа" }
    } finally {
      runInAction(() => {
        this.authPending = false
      })
    }
  }

  async register(
    payload: RegisterData
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    this.authPending = true
    try {
      const res = await fetch(`${API_BASE_URL}${ROUTES.auth.register}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { message?: string }
        return { success: false, error: err.message || "Ошибка регистрации" }
      }

      const data = (await res.json()) as AuthResponse
      localStorage.setItem(ACCESS_KEY, data.accessToken)
      localStorage.setItem(REFRESH_KEY, data.refreshToken)
      localStorage.setItem(USER_KEY, JSON.stringify(data.user))

      runInAction(() => {
        this.user = data.user
        this.swipeFeedStamp = 0
        this.favoriteStamp = 0
        this.adminStamp = 0
      })

      return { success: true, user: data.user }
    } catch {
      return { success: false, error: "Ошибка регистрации" }
    } finally {
      runInAction(() => {
        this.authPending = false
      })
    }
  }

  async logout() {
    try {
      const refresh = localStorage.getItem(REFRESH_KEY)
      const access = localStorage.getItem(ACCESS_KEY)
      if (refresh && access) {
        await fetch(`${API_BASE_URL}${ROUTES.auth.logout}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access}`,
          },
          body: JSON.stringify({ refreshToken: refresh }),
        })
      }
    } finally {
      runInAction(() => this.wipeSession())
    }
  }

  async updateProfile(data: Partial<User> & { password?: string }) {
    this.authPending = true
    try {
      const res = await this.authorizedFetch(`${API_BASE_URL}${ROUTES.users.profile}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const text = await res.text()
        return { success: false as const, error: text || "Не удалось обновить профиль" }
      }

      const updated = (await res.json()) as User
      runInAction(() => {
        this.user = updated
        localStorage.setItem(USER_KEY, JSON.stringify(updated))
      })

      return { success: true as const, user: updated }
    } catch {
      return { success: false as const, error: "Не удалось обновить профиль" }
    } finally {
      runInAction(() => {
        this.authPending = false
      })
    }
  }

  async fetchSwipeFeed(force = false) {
    if (!this.user) return
    if (!force && this.isFresh(this.swipeFeedStamp)) return

    this.swipeFeedLoading = true
    try {
      const res = await this.authorizedFetch(
        `${API_BASE_URL}${ROUTES.girls.unliked}?page=1&limit=10`
      )
      if (!res.ok) throw new Error("deck")
      const json = (await res.json()) as { data: Chan[] }
      runInAction(() => {
        this.swipeFeed = json.data ?? []
        this.swipeFeedStamp = Date.now()
      })
    } catch {
      runInAction(() => {
        this.swipeFeed = []
      })
    } finally {
      runInAction(() => {
        this.swipeFeedLoading = false
      })
    }
  }

  async fetchFavoriteChans(force = false) {
    if (!this.user) return
    if (!force && this.isFresh(this.favoriteStamp)) return

    this.favoriteLoading = true
    try {
      const res = await this.authorizedFetch(`${API_BASE_URL}${ROUTES.girls.liked}`)
      if (!res.ok) throw new Error("liked")
      const body: unknown = await res.json()
      runInAction(() => {
        this.favoriteChans = normalizeGirlListPayload(body)
        this.favoriteStamp = Date.now()
      })
    } catch {
      runInAction(() => {
        this.favoriteChans = []
      })
    } finally {
      runInAction(() => {
        this.favoriteLoading = false
      })
    }
  }

  async fetchAdminChans(force = false) {
    if (!this.user?.is_admin) return
    if (!force && this.isFresh(this.adminStamp)) return

    this.adminLoading = true
    try {
      const res = await this.authorizedFetch(
        `${API_BASE_URL}${ROUTES.girls.all}?page=1&limit=100`
      )
      if (!res.ok) throw new Error("admin")
      const json = (await res.json()) as { data: Chan[] }
      runInAction(() => {
        this.adminChans = json.data ?? []
        this.adminStamp = Date.now()
      })
    } catch {
      runInAction(() => {
        this.adminChans = []
      })
    } finally {
      runInAction(() => {
        this.adminLoading = false
      })
    }
  }

  noteSwipeMatch(chan: Chan) {
    this.swipeMatches.push(chan)
  }

  noteSwipePass() {
    this.swipePassCount += 1
  }

  resetSwipeProgress() {
    this.swipeMatches = []
    this.swipePassCount = 0
  }

  async postLikeToServer(id: number) {
    const res = await this.authorizedFetch(`${API_BASE_URL}${ROUTES.girls.like(id)}`, {
      method: "POST",
    })
    if (!res.ok) throw new Error("like")
    runInAction(() => this.bumpAfterSocialMutation())
  }

  async postUnlikeToServer(id: number) {
    const res = await this.authorizedFetch(`${API_BASE_URL}${ROUTES.girls.unlike(id)}`, {
      method: "DELETE",
    })
    if (!res.ok) throw new Error("unlike")
    runInAction(() => this.bumpAfterSocialMutation())
  }

  async createGirlAdmin(form: FormData) {
    const res = await this.authorizedFetch(`${API_BASE_URL}${ROUTES.girls.create}`, {
      method: "POST",
      body: form,
    })
    if (!res.ok) throw new Error(await res.text())
    runInAction(() => this.bumpAfterAdminMutation())
    return (await res.json()) as Chan
  }

  async updateGirlAdmin(id: number, form: FormData) {
    const res = await this.authorizedFetch(`${API_BASE_URL}${ROUTES.girls.update(id)}`, {
      method: "PUT",
      body: form,
    })
    if (!res.ok) throw new Error(await res.text())
    runInAction(() => this.bumpAfterAdminMutation())
    return (await res.json()) as Chan
  }

  async deleteGirlAdmin(id: number) {
    const res = await this.authorizedFetch(`${API_BASE_URL}${ROUTES.girls.delete(id)}`, {
      method: "DELETE",
    })
    if (!res.ok) throw new Error(await res.text())
    runInAction(() => this.bumpAfterAdminMutation())
  }
}
