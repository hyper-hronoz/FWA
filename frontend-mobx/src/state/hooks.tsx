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
