import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

import type { User } from "@shared/Profile"

const USER_KEY = "animeUser"

function readUserFromStorage(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    if (!raw) return null
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

type SessionState = {
  user: User | null
}

const initialState: SessionState = {
  user: readUserFromStorage(),
}

export const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    setSessionUser(state, action: PayloadAction<User | null>) {
      state.user = action.payload
      if (action.payload) {
        localStorage.setItem(USER_KEY, JSON.stringify(action.payload))
      } else {
        localStorage.removeItem(USER_KEY)
      }
    },
  },
})

export const { setSessionUser } = sessionSlice.actions
export default sessionSlice.reducer
