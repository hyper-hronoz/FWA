import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

import type { Chan } from "@shared/Profile"

type SwipeDeckState = {
  sessionMatches: Chan[]
  sessionSkips: number
}

const initialState: SwipeDeckState = {
  sessionMatches: [],
  sessionSkips: 0,
}

export const swipeDeckSlice = createSlice({
  name: "swipeDeck",
  initialState,
  reducers: {
    registerSessionLike(state, action: PayloadAction<Chan>) {
      state.sessionMatches.push(action.payload)
    },
    registerSessionSkip(state) {
      state.sessionSkips += 1
    },
    resetSwipeSession() {
      return initialState
    },
  },
})

export const { registerSessionLike, registerSessionSkip, resetSwipeSession } =
  swipeDeckSlice.actions
export default swipeDeckSlice.reducer
