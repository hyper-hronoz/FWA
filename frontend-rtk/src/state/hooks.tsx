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
