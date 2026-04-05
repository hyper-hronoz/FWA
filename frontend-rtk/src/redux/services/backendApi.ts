import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react"

import { API_BASE_URL, ROUTES } from "../../config/api"
import { persistTokens, readAccessToken, readRefreshToken, wipeTokens } from "../authStorage"
import { setSessionUser } from "../sessionSlice"

import type { Chan, User } from "@shared/Profile"
import type { AuthResponse, LoginData, RegisterData } from "@shared/Auth"

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers) => {
    const token = readAccessToken()
    if (token) headers.set("Authorization", `Bearer ${token}`)
    return headers
  },
})

const baseQueryWithRefresh: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions)
  if (result.error?.status !== 401 && result.error?.status !== 403) {
    return result
  }

  const refresh = readRefreshToken()
  if (!refresh) {
    wipeTokens()
    api.dispatch(setSessionUser(null))
    return result
  }

  const refreshed = await rawBaseQuery(
    {
      url: ROUTES.auth.refresh,
      method: "POST",
      body: { refreshToken: refresh },
      headers: { "Content-Type": "application/json" },
    },
    api,
    extraOptions
  )

  if (refreshed.error || !refreshed.data) {
    wipeTokens()
    api.dispatch(setSessionUser(null))
    return result
  }

  const tokens = refreshed.data as { accessToken: string; refreshToken: string }
  persistTokens(tokens.accessToken, tokens.refreshToken)
  return rawBaseQuery(args, api, extraOptions)
}

export const backendApi = createApi({
  reducerPath: "backendApi",
  baseQuery: baseQueryWithRefresh,
  tagTypes: ["Session", "SwipeQueue", "Favorites", "AdminCatalog"],
  endpoints: (builder) => ({
    getSession: builder.query<User, void>({
      query: () => ({ url: ROUTES.auth.me, method: "GET" }),
      providesTags: ["Session"],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          dispatch(setSessionUser(data))
        } catch {
          wipeTokens()
          dispatch(setSessionUser(null))
        }
      },
    }),

    login: builder.mutation<AuthResponse, LoginData>({
      query: (body) => ({
        url: ROUTES.auth.login,
        method: "POST",
        body,
        headers: { "Content-Type": "application/json" },
      }),
      invalidatesTags: ["SwipeQueue", "Favorites", "AdminCatalog"],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled
        persistTokens(data.accessToken, data.refreshToken)
        dispatch(setSessionUser(data.user))
        if ("Notification" in window && Notification.permission === "default") {
          void Notification.requestPermission()
        }
      },
    }),

    register: builder.mutation<AuthResponse, RegisterData>({
      query: (body) => ({
        url: ROUTES.auth.register,
        method: "POST",
        body,
        headers: { "Content-Type": "application/json" },
      }),
      invalidatesTags: ["SwipeQueue", "Favorites", "AdminCatalog"],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled
        persistTokens(data.accessToken, data.refreshToken)
        dispatch(setSessionUser(data.user))
      },
    }),

    logout: builder.mutation<void, void>({
      query: () => ({
        url: ROUTES.auth.logout,
        method: "POST",
        body: { refreshToken: readRefreshToken() },
        headers: { "Content-Type": "application/json" },
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled
        } catch {
          /* выходим локально даже если сервер недоступен */
        } finally {
          wipeTokens()
          dispatch(setSessionUser(null))
          dispatch(backendApi.util.resetApiState())
        }
      },
    }),

    patchProfile: builder.mutation<User, Partial<User> & { password?: string }>({
      query: (body) => ({
        url: ROUTES.users.profile,
        method: "PATCH",
        body,
        headers: { "Content-Type": "application/json" },
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled
        dispatch(setSessionUser(data))
      },
    }),

    getSwipeQueue: builder.query<Chan[], void>({
      query: () => `${ROUTES.girls.unliked}?page=1&limit=10`,
      transformResponse: (response: { data: Chan[] }) => response.data ?? [],
      providesTags: ["SwipeQueue"],
    }),

    getFavorites: builder.query<Chan[], void>({
      query: () => ROUTES.girls.liked,
      transformResponse: (response: { data: Chan[] }) => response.data ?? [],
      providesTags: ["Favorites"],
    }),

    sendLike: builder.mutation<void, number>({
      query: (id) => ({ url: ROUTES.girls.like(id), method: "POST" }),
      invalidatesTags: ["SwipeQueue", "Favorites"],
    }),

    sendUnlike: builder.mutation<void, number>({
      query: (id) => ({ url: ROUTES.girls.unlike(id), method: "DELETE" }),
      invalidatesTags: ["SwipeQueue", "Favorites"],
    }),

    getAdminCatalog: builder.query<Chan[], void>({
      query: () => `${ROUTES.girls.all}?page=1&limit=100`,
      transformResponse: (response: { data: Chan[] }) => response.data ?? [],
      providesTags: ["AdminCatalog"],
    }),

    createChanAdmin: builder.mutation<Chan, FormData>({
      query: (body) => ({
        url: ROUTES.girls.create,
        method: "POST",
        body,
      }),
      invalidatesTags: ["AdminCatalog", "SwipeQueue"],
    }),

    updateChanAdmin: builder.mutation<Chan, { id: number; body: FormData }>({
      query: ({ id, body }) => ({
        url: ROUTES.girls.update(id),
        method: "PUT",
        body,
      }),
      invalidatesTags: ["AdminCatalog", "SwipeQueue", "Favorites"],
    }),

    deleteChanAdmin: builder.mutation<void, number>({
      query: (id) => ({ url: ROUTES.girls.delete(id), method: "DELETE" }),
      invalidatesTags: ["AdminCatalog", "SwipeQueue", "Favorites"],
    }),
  }),
})

export const {
  useGetSessionQuery,
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  usePatchProfileMutation,
  useGetSwipeQueueQuery,
  useGetFavoritesQuery,
  useSendLikeMutation,
  useSendUnlikeMutation,
  useGetAdminCatalogQuery,
  useCreateChanAdminMutation,
  useUpdateChanAdminMutation,
  useDeleteChanAdminMutation,
} = backendApi
