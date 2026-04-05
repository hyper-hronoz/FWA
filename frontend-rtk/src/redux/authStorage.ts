const ACCESS = "animeAccessToken"
const REFRESH = "animeRefreshToken"

export function readAccessToken(): string | null {
  return localStorage.getItem(ACCESS)
}

export function readRefreshToken(): string | null {
  return localStorage.getItem(REFRESH)
}

export function hasAnyToken(): boolean {
  return !!(readAccessToken() || readRefreshToken())
}

export function persistTokens(access: string, refresh: string) {
  localStorage.setItem(ACCESS, access)
  localStorage.setItem(REFRESH, refresh)
}

export function wipeTokens() {
  localStorage.removeItem(ACCESS)
  localStorage.removeItem(REFRESH)
}
