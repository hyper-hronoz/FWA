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
