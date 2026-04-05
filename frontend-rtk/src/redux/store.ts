import { configureStore } from "@reduxjs/toolkit"

import { backendApi } from "./services/backendApi"
import sessionReducer from "./sessionSlice"
import swipeDeckReducer from "./swipeDeckSlice"

export const store = configureStore({
  reducer: {
    session: sessionReducer,
    swipeDeck: swipeDeckReducer,
    [backendApi.reducerPath]: backendApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(backendApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
