import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import type { AuthResponse, LoginData, RegisterData } from "@shared/Auth";
import type { Chan, User } from "@shared/Profile";
import type { GirlFormInput, UpdateProfileInput } from "../../../frontend/src/state/contracts";
import { ApiError } from "../../../frontend/src/state/shared/apiClient";
import { appServices } from "../../../frontend/src/state/shared/services";

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

export const appApi = createApi({
  reducerPath: "appApi",
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
      queryFn: () => tryRequest(() => appServices.me()),
      providesTags: ["Auth"],
    }),
    updateProfile: builder.mutation<User, UpdateProfileInput>({
      queryFn: (data) => tryRequest(() => appServices.updateProfile(data)),
      invalidatesTags: ["Auth"],
    }),
    getUnlikedGirls: builder.query<Chan[], void>({
      queryFn: () => tryRequest(() => appServices.getUnlikedGirls()),
      providesTags: ["Girls"],
    }),
    getLikedGirls: builder.query<Chan[], void>({
      queryFn: () => tryRequest(() => appServices.getLikedGirls()),
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
      queryFn: () => tryRequest(() => appServices.getAllGirls()),
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
