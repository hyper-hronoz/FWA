import type { User } from "@shared/Profile"

export interface LoginData {
  email: string
  password: string
}

export interface RegisterData {
  username: string
  age: number
  email: string
  password: string
}

export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
}
