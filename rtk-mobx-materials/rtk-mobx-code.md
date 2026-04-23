# RTK И MobX: Код И Скриншоты

## 1. Краткое описание

Во frontend части проекта для управления состоянием были использованы два подхода:

- `Redux Toolkit (RTK)` — для централизованного глобального state, асинхронных запросов через `RTK Query` и управления кэшем.
- `MobX` — для реактивного store, локального кэширования, загрузки данных и бизнес-операций над состоянием.

## 2. Структура файлов

```text
frontend-rtk/
  src/state/store.ts
  src/state/appApi.ts
  src/state/hooks.tsx

frontend-mobx/
  src/state/store.ts
  src/state/hooks.tsx
```

## 3. Redux Toolkit (RTK)

Файл: `frontend-rtk/src/state/store.ts`

```ts
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
```

Файл: `frontend-rtk/src/state/appApi.ts`

```ts
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import type { AuthResponse, LoginData, RegisterData } from "@shared/Auth";
import type { Chan, User } from "@shared/Profile";
import type { GirlFormInput, UpdateProfileInput } from "../../../frontend/src/state/contracts";
import { ApiError } from "../../../frontend/src/state/shared/apiClient";
import { appServices } from "../../../frontend/src/state/shared/services";

const APP_API_REDUCER_PATH = "appApi";

type AppApiState = {
  [APP_API_REDUCER_PATH]?: {
    queries?: Record<
      string,
      {
        status?: string;
        data?: unknown;
        fulfilledTimeStamp?: number;
      }
    >;
  };
};

const formatValue = (value: unknown) => {
  if (Array.isArray(value)) {
    return {
      type: "array",
      length: value.length,
      ids: value
        .map((item) =>
          item && typeof item === "object" && "id" in item && typeof item.id === "number" ? item.id : null,
        )
        .filter((id): id is number => id !== null)
        .slice(0, 5),
    };
  }

  if (value && typeof value === "object") {
    return value;
  }

  return value;
};

const logRtkCacheSnapshot = (endpointName: string, state: unknown) => {
  const queries = (state as AppApiState)?.[APP_API_REDUCER_PATH]?.queries ?? {};
  const matchingEntries = Object.entries(queries)
    .filter(([key]) => key.startsWith(`${endpointName}(`))
    .map(([key, entry]) => ({
      key,
      status: entry.status,
      fulfilledTimeStamp: entry.fulfilledTimeStamp,
      cached: formatValue(entry.data),
    }));

  console.info(`[RTK cache before] ${endpointName}`, matchingEntries);
};

const logRtkQueryResult = (endpointName: string, result: { data?: unknown; error?: unknown }) => {
  if ("error" in result && result.error) {
    console.info(`[RTK result] ${endpointName} error`, result.error);
    return;
  }

  console.info(`[RTK result] ${endpointName} data`, formatValue(result.data));
};

const toApiError = (error: unknown) => {
  if (error instanceof ApiError) {
    return {
      status: error.status,
      data: error.message,
    };
  }

  return {
    status: 500,
    data: error instanceof Error ? error.message : "Неизвестная ошибка",
  };
};

const tryRequest = async <T>(request: () => Promise<T>) => {
  try {
    return { data: await request() };
  } catch (error) {
    return { error: toApiError(error) };
  }
};

const runLoggedQuery = async <T>(endpointName: string, state: unknown, request: () => Promise<T>) => {
  logRtkCacheSnapshot(endpointName, state);
  const result = await tryRequest(request);
  logRtkQueryResult(endpointName, result);
  return result;
};

export const appApi = createApi({
  reducerPath: APP_API_REDUCER_PATH,
  baseQuery: fakeBaseQuery<{ status: number; data: string }>(),
  tagTypes: ["Auth", "Girls", "Liked", "AdminGirls"],
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginData>({
      queryFn: (data) => tryRequest(() => appServices.login(data)),
      invalidatesTags: ["Auth", "Girls", "Liked", "AdminGirls"],
    }),
    register: builder.mutation<AuthResponse, RegisterData>({
      queryFn: (data) => tryRequest(() => appServices.register(data)),
      invalidatesTags: ["Auth", "Girls", "Liked", "AdminGirls"],
    }),
    logout: builder.mutation<void, void>({
      queryFn: () => tryRequest(() => appServices.logout()),
      invalidatesTags: ["Auth", "Girls", "Liked", "AdminGirls"],
    }),
    getCurrentUser: builder.query<User, void>({
      queryFn: (_arg, api) => runLoggedQuery("getCurrentUser", api.getState(), () => appServices.me()),
      providesTags: ["Auth"],
    }),
    updateProfile: builder.mutation<User, UpdateProfileInput>({
      queryFn: (data) => tryRequest(() => appServices.updateProfile(data)),
      invalidatesTags: ["Auth"],
    }),
    getUnlikedGirls: builder.query<Chan[], void>({
      queryFn: (_arg, api) => runLoggedQuery("getUnlikedGirls", api.getState(), () => appServices.getUnlikedGirls()),
      providesTags: ["Girls"],
    }),
    getLikedGirls: builder.query<Chan[], void>({
      queryFn: (_arg, api) => runLoggedQuery("getLikedGirls", api.getState(), () => appServices.getLikedGirls()),
      providesTags: ["Liked"],
    }),
    likeGirl: builder.mutation<void, number>({
      queryFn: (id) => tryRequest(() => appServices.likeGirl(id)),
      async onQueryStarted(id, { dispatch, getState, queryFulfilled }) {
        const currentGirls = appApi.endpoints.getUnlikedGirls.select()(getState() as never).data;
        const currentGirl = currentGirls?.find((girl) => girl.id === id);

        const unlikedPatch = dispatch(
          appApi.util.updateQueryData("getUnlikedGirls", undefined, (draft) =>
            draft.filter((girl) => girl.id !== id),
          ),
        );

        const likedPatch = currentGirl
          ? dispatch(
              appApi.util.updateQueryData("getLikedGirls", undefined, (draft) => {
                if (!draft.some((girl) => girl.id === currentGirl.id)) {
                  draft.unshift(currentGirl);
                }
              }),
            )
          : undefined;

        try {
          await queryFulfilled;
        } catch {
          unlikedPatch.undo();
          likedPatch?.undo();
        }
      },
      invalidatesTags: ["Girls", "Liked"],
    }),
    unlikeGirl: builder.mutation<void, number>({
      queryFn: (id) => tryRequest(() => appServices.unlikeGirl(id)),
      invalidatesTags: ["Girls", "Liked"],
    }),
    dislikeGirl: builder.mutation<void, number>({
      queryFn: (id) => tryRequest(() => appServices.dislikeGirl(id)),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const unlikedPatch = dispatch(
          appApi.util.updateQueryData("getUnlikedGirls", undefined, (draft) =>
            draft.filter((girl) => girl.id !== id),
          ),
        );

        const likedPatch = dispatch(
          appApi.util.updateQueryData("getLikedGirls", undefined, (draft) =>
            draft.filter((girl) => girl.id !== id),
          ),
        );

        try {
          await queryFulfilled;
        } catch {
          unlikedPatch.undo();
          likedPatch.undo();
        }
      },
      invalidatesTags: ["Girls", "Liked"],
    }),
    getAllGirls: builder.query<Chan[], void>({
      queryFn: (_arg, api) => runLoggedQuery("getAllGirls", api.getState(), () => appServices.getAllGirls()),
      providesTags: ["AdminGirls"],
    }),
    createGirl: builder.mutation<Chan, GirlFormInput>({
      queryFn: (data) => tryRequest(() => appServices.createGirl(data)),
      invalidatesTags: ["AdminGirls", "Girls", "Liked"],
    }),
    updateGirl: builder.mutation<Chan, { id: number; input: GirlFormInput }>({
      queryFn: ({ id, input }) => tryRequest(() => appServices.updateGirl(id, input)),
      invalidatesTags: ["AdminGirls", "Girls", "Liked"],
    }),
    deleteGirl: builder.mutation<void, number>({
      queryFn: (id) => tryRequest(() => appServices.deleteGirl(id)),
      invalidatesTags: ["AdminGirls", "Girls", "Liked"],
    }),
  }),
});
```

Файл: `frontend-rtk/src/state/hooks.tsx`

```tsx
import { useEffect } from "react";
import { Provider } from "react-redux";
import type { ReactNode } from "react";
import type { LoginData, RegisterData } from "@shared/Auth";
import type { Chan } from "@shared/Profile";
import type { GirlFormInput, UpdateProfileInput } from "../../../frontend/src/state/contracts";
import { authStorage } from "../../../frontend/src/state/shared/authStorage";
import { appApi } from "./appApi";
import { store, sessionActions, useAppDispatch, useAppSelector } from "./store";

const hasSession = () =>
  Boolean(authStorage.getAccessToken() || authStorage.getRefreshToken() || authStorage.getSavedUser());

export const AppStateProvider = ({ children }: { children: ReactNode }) => (
  <Provider store={store}>{children}</Provider>
);

export const useAuthContext = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const shouldCheckSession = hasSession();

  const currentUserQuery = appApi.useGetCurrentUserQuery(undefined, {
    skip: !shouldCheckSession,
  });
  const [loginMutation, loginState] = appApi.useLoginMutation();
  const [registerMutation, registerState] = appApi.useRegisterMutation();
  const [updateProfileMutation, updateProfileState] = appApi.useUpdateProfileMutation();
  const [logoutMutation] = appApi.useLogoutMutation();

  return {
    user,
    loading:
      currentUserQuery.isLoading ||
      currentUserQuery.isFetching ||
      loginState.isLoading ||
      registerState.isLoading ||
      updateProfileState.isLoading,
    async login(data: LoginData) {
      try {
        const response = await loginMutation(data).unwrap();
        return { success: true, user: response.user };
      } catch (error) {
        return {
          success: false,
          error: typeof error === "object" && error && "data" in error ? String(error.data) : "Ошибка входа",
        };
      }
    },
    async register(data: RegisterData) {
      try {
        const response = await registerMutation(data).unwrap();
        return { success: true, user: response.user };
      } catch (error) {
        return {
          success: false,
          error:
            typeof error === "object" && error && "data" in error ? String(error.data) : "Ошибка регистрации",
        };
      }
    },
    async updateProfile(data: UpdateProfileInput) {
      try {
        const response = await updateProfileMutation(data).unwrap();
        return { success: true, user: response };
      } catch (error) {
        return {
          success: false,
          error:
            typeof error === "object" && error && "data" in error ? String(error.data) : "Ошибка обновления",
        };
      }
    },
    async logout() {
      await logoutMutation().unwrap().catch(() => undefined);
      dispatch(sessionActions.clearMatches());
      dispatch(appApi.util.resetApiState());
    },
  };
};

export const useChan = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const matches = useAppSelector((state) => state.session.matches);

  const unlikedQuery = appApi.useGetUnlikedGirlsQuery(undefined, {
    skip: !user,
  });
  const likedQuery = appApi.useGetLikedGirlsQuery(undefined, {
    skip: !user,
  });
  const [likeGirl] = appApi.useLikeGirlMutation();
  const [dislikeGirl] = appApi.useDislikeGirlMutation();

  return {
    availableProfiles: unlikedQuery.data || [],
    likedProfiles: likedQuery.data || [],
    matches,
    loading: unlikedQuery.isLoading || unlikedQuery.isFetching || likedQuery.isLoading || likedQuery.isFetching,
    async handleLike(profile: Chan) {
      dispatch(sessionActions.addMatch(profile));
      await likeGirl(profile.id).unwrap();
    },
    async handleSkip(profile: Chan) {
      dispatch(sessionActions.removeMatch(profile.id));
      await dislikeGirl(profile.id).unwrap();
    },
    async handleRestart() {
      dispatch(sessionActions.clearMatches());
      await unlikedQuery.refetch();
      await likedQuery.refetch();
    },
    async refetch() {
      await unlikedQuery.refetch();
    },
  };
};

export const useLiked = () => {
  const user = useAppSelector((state) => state.auth.user);
  const likedQuery = appApi.useGetLikedGirlsQuery(undefined, {
    skip: !user,
  });

  return {
    likedProfiles: likedQuery.data || [],
    loading: likedQuery.isLoading && !likedQuery.data,
    async refetch() {
      await likedQuery.refetch();
    },
  };
};

export const useAdminGirls = () => {
  const user = useAppSelector((state) => state.auth.user);
  const adminQuery = appApi.useGetAllGirlsQuery(undefined, {
    skip: !user?.is_admin,
  });
  const [createGirlMutation] = appApi.useCreateGirlMutation();
  const [updateGirlMutation] = appApi.useUpdateGirlMutation();
  const [deleteGirlMutation] = appApi.useDeleteGirlMutation();

  useEffect(() => {
    if (user?.is_admin) {
      void adminQuery.refetch();
    }
  }, [user?.is_admin]);

  return {
    profiles: adminQuery.data || [],
    loadingProfiles: adminQuery.isLoading || adminQuery.isFetching,
    async refetch() {
      await adminQuery.refetch();
    },
    async createGirl(input: GirlFormInput) {
      return createGirlMutation(input).unwrap();
    },
    async updateGirl(id: number, input: GirlFormInput) {
      return updateGirlMutation({ id, input }).unwrap();
    },
    async deleteGirl(id: number) {
      await deleteGirlMutation(id).unwrap();
    },
  };
};
```

## 4. MobX

Файл: `frontend-mobx/src/state/store.ts`

```ts
import { makeAutoObservable, runInAction } from "mobx";
import type { Chan, User } from "@shared/Profile";
import type { GirlFormInput, UpdateProfileInput } from "../../../frontend/src/state/contracts";
import { authStorage } from "../../../frontend/src/state/shared/authStorage";
import { appServices } from "../../../frontend/src/state/shared/services";
import { ApiError } from "../../../frontend/src/state/shared/apiClient";

const CACHE_TTL = 60_000;

const isFresh = (timestamp: number) => Date.now() - timestamp < CACHE_TTL;

const summarizeProfiles = (profiles: Chan[]) => ({
  length: profiles.length,
  ids: profiles.slice(0, 5).map((profile) => profile.id),
});

const logMobxCache = (scope: string, payload: Record<string, unknown>) => {
  console.info(`[MobX cache] ${scope}`, payload);
};

const logMobxResult = (scope: string, payload: Record<string, unknown>) => {
  console.info(`[MobX result] ${scope}`, payload);
};

const isAuthError = (error: unknown) => error instanceof ApiError && (error.status === 401 || error.status === 403);

export class AppStore {
  user: User | null = authStorage.getSavedUser();
  authLoading = true;
  girlsLoading = false;
  likedLoading = false;
  adminLoading = false;
  availableProfiles: Chan[] = [];
  likedProfiles: Chan[] = [];
  adminProfiles: Chan[] = [];
  matches: Chan[] = [];
  private girlsFetchedAt = 0;
  private likedFetchedAt = 0;
  private adminFetchedAt = 0;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  private resetSession() {
    authStorage.clear();
    this.user = null;
    this.availableProfiles = [];
    this.likedProfiles = [];
    this.adminProfiles = [];
    this.matches = [];
    this.girlsFetchedAt = 0;
    this.likedFetchedAt = 0;
    this.adminFetchedAt = 0;
  }

  private handleAuthError(error: unknown, scope: string) {
    if (!isAuthError(error)) {
      return false;
    }

    runInAction(() => {
      this.resetSession();
    });

    console.warn(`[MobX auth] ${scope}`, error instanceof Error ? error.message : error);
    return true;
  }

  async bootstrapAuth() {
    const hasSession = Boolean(
      authStorage.getAccessToken() || authStorage.getRefreshToken() || authStorage.getSavedUser(),
    );

    if (!hasSession) {
      runInAction(() => {
        this.user = null;
        this.authLoading = false;
      });
      return;
    }

    try {
      runInAction(() => {
        this.authLoading = true;
      });
      logMobxCache("bootstrapAuth before request", {
        user: this.user ? { id: this.user.id, is_admin: this.user.is_admin } : null,
      });
      const currentUser = await appServices.me();
      runInAction(() => {
        this.user = currentUser;
      });
      logMobxResult("bootstrapAuth after request", {
        user: currentUser ? { id: currentUser.id, is_admin: currentUser.is_admin } : null,
      });
    } catch (error) {
      if (!this.handleAuthError(error, "bootstrapAuth")) {
        runInAction(() => {
          this.user = authStorage.getSavedUser();
        });
      }
    } finally {
      runInAction(() => {
        this.authLoading = false;
      });
    }
  }

  async ensureSwipeData(force = false) {
    if (!this.user) {
      return;
    }

    const girlsFresh = isFresh(this.girlsFetchedAt);
    const likedFresh = isFresh(this.likedFetchedAt);

    logMobxCache("ensureSwipeData before request", {
      force,
      girlsFresh,
      likedFresh,
      availableProfiles: summarizeProfiles(this.availableProfiles),
      likedProfiles: summarizeProfiles(this.likedProfiles),
    });

    if (!force && girlsFresh && likedFresh) {
      logMobxResult("ensureSwipeData served from cache", {
        availableProfiles: summarizeProfiles(this.availableProfiles),
        likedProfiles: summarizeProfiles(this.likedProfiles),
      });
      return;
    }

    this.girlsLoading = true;

    try {
      const [availableProfiles, likedProfiles] = await Promise.all([
        appServices.getUnlikedGirls(),
        appServices.getLikedGirls(),
      ]);

      runInAction(() => {
        this.availableProfiles = availableProfiles;
        this.likedProfiles = likedProfiles;
        this.girlsFetchedAt = Date.now();
        this.likedFetchedAt = Date.now();
      });
      logMobxResult("ensureSwipeData after request", {
        availableProfiles: summarizeProfiles(availableProfiles),
        likedProfiles: summarizeProfiles(likedProfiles),
      });
    } catch (error) {
      if (!this.handleAuthError(error, "ensureSwipeData")) {
        throw error;
      }
    } finally {
      runInAction(() => {
        this.girlsLoading = false;
      });
    }
  }

  async ensureLiked(force = false) {
    if (!this.user) {
      return;
    }

    const likedFresh = isFresh(this.likedFetchedAt);

    logMobxCache("ensureLiked before request", {
      force,
      likedFresh,
      likedProfiles: summarizeProfiles(this.likedProfiles),
    });

    if (!force && likedFresh) {
      logMobxResult("ensureLiked served from cache", {
        likedProfiles: summarizeProfiles(this.likedProfiles),
      });
      return;
    }

    this.likedLoading = true;

    try {
      const likedProfiles = await appServices.getLikedGirls();
      runInAction(() => {
        this.likedProfiles = likedProfiles;
        this.likedFetchedAt = Date.now();
      });
      logMobxResult("ensureLiked after request", {
        likedProfiles: summarizeProfiles(likedProfiles),
      });
    } catch (error) {
      if (!this.handleAuthError(error, "ensureLiked")) {
        throw error;
      }
    } finally {
      runInAction(() => {
        this.likedLoading = false;
      });
    }
  }

  async ensureAdminGirls(force = false) {
    if (!this.user?.is_admin) {
      return;
    }

    const adminFresh = isFresh(this.adminFetchedAt);

    logMobxCache("ensureAdminGirls before request", {
      force,
      adminFresh,
      adminProfiles: summarizeProfiles(this.adminProfiles),
    });

    if (!force && adminFresh) {
      logMobxResult("ensureAdminGirls served from cache", {
        adminProfiles: summarizeProfiles(this.adminProfiles),
      });
      return;
    }

    this.adminLoading = true;

    try {
      const girls = await appServices.getAllGirls();
      runInAction(() => {
        this.adminProfiles = girls;
        this.adminFetchedAt = Date.now();
      });
      logMobxResult("ensureAdminGirls after request", {
        adminProfiles: summarizeProfiles(girls),
      });
    } catch (error) {
      if (!this.handleAuthError(error, "ensureAdminGirls")) {
        throw error;
      }
    } finally {
      runInAction(() => {
        this.adminLoading = false;
      });
    }
  }

  async login(data: { email: string; password: string }) {
    try {
      this.authLoading = true;
      const payload = await appServices.login(data);
      runInAction(() => {
        this.user = payload.user;
      });
      await this.ensureSwipeData(true);
      return { success: true, user: payload.user };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Ошибка входа",
      };
    } finally {
      runInAction(() => {
        this.authLoading = false;
      });
    }
  }

  async register(data: { username: string; age: number; email: string; password: string }) {
    try {
      this.authLoading = true;
      const payload = await appServices.register(data);
      runInAction(() => {
        this.user = payload.user;
      });
      await this.ensureSwipeData(true);
      return { success: true, user: payload.user };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Ошибка регистрации",
      };
    } finally {
      runInAction(() => {
        this.authLoading = false;
      });
    }
  }

  async updateProfile(data: UpdateProfileInput) {
    try {
      this.authLoading = true;
      const user = await appServices.updateProfile(data);
      runInAction(() => {
        this.user = user;
      });
      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Ошибка обновления",
      };
    } finally {
      runInAction(() => {
        this.authLoading = false;
      });
    }
  }

  async logout() {
    try {
      await appServices.logout();
    } finally {
      runInAction(() => {
        this.resetSession();
      });
    }
  }

  async likeProfile(profile: Chan) {
    const previousMatches = this.matches;
    const previousAvailableProfiles = this.availableProfiles;
    const previousLikedProfiles = this.likedProfiles;
    const previousGirlsFetchedAt = this.girlsFetchedAt;
    const previousLikedFetchedAt = this.likedFetchedAt;

    runInAction(() => {
      this.matches = [...this.matches, profile];
      this.availableProfiles = this.availableProfiles.filter((item) => item.id !== profile.id);
      if (!this.likedProfiles.some((item) => item.id === profile.id)) {
        this.likedProfiles = [profile, ...this.likedProfiles];
      }
      this.likedFetchedAt = Date.now();
      this.girlsFetchedAt = Date.now();
    });

    try {
      await appServices.likeGirl(profile.id);
    } catch (error) {
      runInAction(() => {
        this.matches = previousMatches;
        this.availableProfiles = previousAvailableProfiles;
        this.likedProfiles = previousLikedProfiles;
        this.girlsFetchedAt = previousGirlsFetchedAt;
        this.likedFetchedAt = previousLikedFetchedAt;
      });

      if (!this.handleAuthError(error, "likeProfile")) {
        throw error;
      }
    }
  }

  async skipProfile(profile: Chan) {
    const previousMatches = this.matches;
    const previousAvailableProfiles = this.availableProfiles;
    const previousLikedProfiles = this.likedProfiles;
    const previousGirlsFetchedAt = this.girlsFetchedAt;
    const previousLikedFetchedAt = this.likedFetchedAt;

    runInAction(() => {
      this.availableProfiles = this.availableProfiles.filter((item) => item.id !== profile.id);
      this.likedProfiles = this.likedProfiles.filter((item) => item.id !== profile.id);
      this.matches = this.matches.filter((item) => item.id !== profile.id);
      this.girlsFetchedAt = Date.now();
      this.likedFetchedAt = Date.now();
    });

    try {
      await appServices.dislikeGirl(profile.id);
    } catch (error) {
      runInAction(() => {
        this.matches = previousMatches;
        this.availableProfiles = previousAvailableProfiles;
        this.likedProfiles = previousLikedProfiles;
        this.girlsFetchedAt = previousGirlsFetchedAt;
        this.likedFetchedAt = previousLikedFetchedAt;
      });

      if (!this.handleAuthError(error, "skipProfile")) {
        throw error;
      }
    }
  }

  async restartSwipe() {
    this.matches = [];
    await this.ensureSwipeData(true);
  }

  async createGirl(input: GirlFormInput) {
    try {
      const created = await appServices.createGirl(input);
      runInAction(() => {
        this.adminProfiles = [created, ...this.adminProfiles];
        this.adminFetchedAt = Date.now();
      });
      return created;
    } catch (error) {
      if (!this.handleAuthError(error, "createGirl")) {
        throw error;
      }
      throw error;
    }
  }

  async updateGirl(id: number, input: GirlFormInput) {
    try {
      const updated = await appServices.updateGirl(id, input);
      runInAction(() => {
        this.adminProfiles = this.adminProfiles.map((item) => (item.id === id ? updated : item));
        this.availableProfiles = this.availableProfiles.map((item) => (item.id === id ? updated : item));
        this.likedProfiles = this.likedProfiles.map((item) => (item.id === id ? updated : item));
        this.matches = this.matches.map((item) => (item.id === id ? updated : item));
        this.adminFetchedAt = Date.now();
        this.girlsFetchedAt = Date.now();
        this.likedFetchedAt = Date.now();
      });
      return updated;
    } catch (error) {
      if (!this.handleAuthError(error, "updateGirl")) {
        throw error;
      }
      throw error;
    }
  }

  async deleteGirl(id: number) {
    try {
      await appServices.deleteGirl(id);
      runInAction(() => {
        this.adminProfiles = this.adminProfiles.filter((item) => item.id !== id);
        this.availableProfiles = this.availableProfiles.filter((item) => item.id !== id);
        this.likedProfiles = this.likedProfiles.filter((item) => item.id !== id);
        this.matches = this.matches.filter((item) => item.id !== id);
        this.adminFetchedAt = Date.now();
        this.girlsFetchedAt = Date.now();
        this.likedFetchedAt = Date.now();
      });
    } catch (error) {
      if (!this.handleAuthError(error, "deleteGirl")) {
        throw error;
      }
      throw error;
    }
  }
}
```

Файл: `frontend-mobx/src/state/hooks.tsx`

```tsx
import { createContext, useContext, useEffect, useState } from "react";
import { useObserver } from "mobx-react-lite";
import type { ReactNode } from "react";
import type { GirlFormInput } from "../../../frontend/src/state/contracts";
import { AppStore } from "./store";

const StoreContext = createContext<AppStore | null>(null);

export const AppStateProvider = ({ children }: { children: ReactNode }) => {
  const [store] = useState(() => new AppStore());

  useEffect(() => {
    void store.bootstrapAuth();
  }, [store]);

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
};

const useStore = () => {
  const store = useContext(StoreContext);

  if (!store) {
    throw new Error("Store is not available");
  }

  return store;
};

export const useAuthContext = () => {
  const store = useStore();

  return useObserver(() => ({
    user: store.user,
    loading: store.authLoading,
    login: store.login,
    register: store.register,
    updateProfile: store.updateProfile,
    logout: store.logout,
  }));
};

export const useChan = () => {
  const store = useStore();

  useEffect(() => {
    if (store.user) {
      void store.ensureSwipeData();
    }
  }, [store, store.user]);

  return useObserver(() => ({
    availableProfiles: store.availableProfiles,
    likedProfiles: store.likedProfiles,
    matches: store.matches,
    loading: store.girlsLoading,
    handleLike: store.likeProfile,
    handleSkip: store.skipProfile,
    handleRestart: store.restartSwipe,
    refetch: () => store.ensureSwipeData(true),
  }));
};

export const useLiked = () => {
  const store = useStore();

  useEffect(() => {
    if (store.user) {
      void store.ensureLiked();
    }
  }, [store, store.user]);

  return useObserver(() => ({
    likedProfiles: store.likedProfiles,
    loading: store.likedLoading || store.girlsLoading,
    refetch: () => store.ensureLiked(true),
  }));
};

export const useAdminGirls = () => {
  const store = useStore();

  useEffect(() => {
    if (store.user?.is_admin) {
      void store.ensureAdminGirls();
    }
  }, [store, store.user?.is_admin]);

  return useObserver(() => ({
    profiles: store.adminProfiles,
    loadingProfiles: store.adminLoading,
    refetch: () => store.ensureAdminGirls(true),
    createGirl: (input: GirlFormInput) => store.createGirl(input),
    updateGirl: (id: number, input: GirlFormInput) => store.updateGirl(id, input),
    deleteGirl: (id: number) => store.deleteGirl(id),
  }));
};
```

## 5. Скриншоты

PNG-скриншоты с ключевыми фрагментами кода сохранены в директории:

`rtk-mobx-materials/screenshots/`

- `rtk-store.png`
- `rtk-appApi-core.png`
- `rtk-appApi-mutations.png`
- `rtk-hooks.png`
- `mobx-store-bootstrap-cache.png`
- `mobx-store-liked-admin.png`
- `mobx-store-auth-actions.png`
- `mobx-store-swipe-admin-actions.png`
- `mobx-hooks.png`
