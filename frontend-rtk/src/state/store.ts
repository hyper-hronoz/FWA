import { combineReducers, configureStore, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { useDispatch, useSelector, type TypedUseSelectorHook } from "react-redux";
import type { User, Chan } from "@shared/Profile";
import { authStorage } from "../../../frontend/src/state/shared/authStorage";
import { appApi } from "./appApi";

type AuthSliceState = {
  user: User | null;
};

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: authStorage.getSavedUser(),
  } as AuthSliceState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addMatcher(appApi.endpoints.login.matchFulfilled, (state, action) => {
      state.user = action.payload.user;
    });
    builder.addMatcher(appApi.endpoints.register.matchFulfilled, (state, action) => {
      state.user = action.payload.user;
    });
    builder.addMatcher(appApi.endpoints.getCurrentUser.matchFulfilled, (state, action) => {
      state.user = action.payload;
    });
    builder.addMatcher(appApi.endpoints.updateProfile.matchFulfilled, (state, action) => {
      state.user = action.payload;
    });
    builder.addMatcher(appApi.endpoints.logout.matchFulfilled, (state) => {
      state.user = null;
    });
  },
});

const sessionSlice = createSlice({
  name: "session",
  initialState: {
    matches: [] as Chan[],
  },
  reducers: {
    addMatch(state, action: PayloadAction<Chan>) {
      state.matches.push(action.payload);
    },
    removeMatch(state, action: PayloadAction<number>) {
      state.matches = state.matches.filter((item) => item.id !== action.payload);
    },
    clearMatches(state) {
      state.matches = [];
    },
  },
});

const rootReducer = combineReducers({
  auth: authSlice.reducer,
  session: sessionSlice.reducer,
  [appApi.reducerPath]: appApi.reducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(appApi.middleware),
});

export const sessionActions = sessionSlice.actions;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
