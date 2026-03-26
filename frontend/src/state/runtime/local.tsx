import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Chan, User } from "@shared/Profile";
import type {
  AdminGirlsState,
  AuthResult,
  AuthState,
  ChanState,
  GirlFormInput,
  LikedState,
  UpdateProfileInput,
} from "../contracts";
import { appServices } from "../shared/services";
import { authStorage } from "../shared/authStorage";

type LocalStateContextValue = {
  auth: AuthState;
  chan: ChanState;
  liked: LikedState;
  admin: AdminGirlsState;
};

const LocalStateContext = createContext<LocalStateContextValue | undefined>(undefined);

const toAuthResult = (user: User): AuthResult => ({
  success: true,
  user,
});

const toAuthError = (error: unknown): AuthResult => ({
  success: false,
  error: error instanceof Error ? error.message : "Неизвестная ошибка",
});

export const AppStateProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => authStorage.getSavedUser());
  const [authLoading, setAuthLoading] = useState(true);
  const [availableProfiles, setAvailableProfiles] = useState<Chan[]>([]);
  const [likedProfiles, setLikedProfiles] = useState<Chan[]>([]);
  const [allGirls, setAllGirls] = useState<Chan[]>([]);
  const [matches, setMatches] = useState<Chan[]>([]);
  const [girlsLoading, setGirlsLoading] = useState(false);
  const [likedLoading, setLikedLoading] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);

  const loadAuth = async () => {
    const savedUser = authStorage.getSavedUser();

    if (!savedUser && !authStorage.getRefreshToken() && !authStorage.getAccessToken()) {
      setUser(null);
      setAuthLoading(false);
      return;
    }

    try {
      setAuthLoading(true);
      const currentUser = await appServices.me();
      setUser(currentUser);
    } catch {
      setUser(savedUser);
    } finally {
      setAuthLoading(false);
    }
  };

  const loadSwipeData = async () => {
    if (!user) {
      setAvailableProfiles([]);
      setLikedProfiles([]);
      return;
    }

    setGirlsLoading(true);

    try {
      const [unliked, liked] = await Promise.all([
        appServices.getUnlikedGirls(),
        appServices.getLikedGirls(),
      ]);

      setAvailableProfiles(unliked);
      setLikedProfiles(liked);
    } finally {
      setGirlsLoading(false);
    }
  };

  const loadAllGirls = async () => {
    if (!user?.is_admin) {
      setAllGirls([]);
      return;
    }

    setAdminLoading(true);

    try {
      setAllGirls(await appServices.getAllGirls());
    } finally {
      setAdminLoading(false);
    }
  };

  useEffect(() => {
    void loadAuth();
  }, []);

  useEffect(() => {
    void loadSwipeData();
    void loadAllGirls();
  }, [user]);

  const auth = useMemo<AuthState>(() => ({
    user,
    loading: authLoading,
    async login(data) {
      try {
        setAuthLoading(true);
        const payload = await appServices.login(data);
        setUser(payload.user);
        return toAuthResult(payload.user);
      } catch (error) {
        return toAuthError(error);
      } finally {
        setAuthLoading(false);
      }
    },
    async register(data) {
      try {
        setAuthLoading(true);
        const payload = await appServices.register(data);
        setUser(payload.user);
        return toAuthResult(payload.user);
      } catch (error) {
        return toAuthError(error);
      } finally {
        setAuthLoading(false);
      }
    },
    async updateProfile(data: UpdateProfileInput) {
      try {
        setAuthLoading(true);
        const updatedUser = await appServices.updateProfile(data);
        setUser(updatedUser);
        return toAuthResult(updatedUser);
      } catch (error) {
        return toAuthError(error);
      } finally {
        setAuthLoading(false);
      }
    },
    async logout() {
      await appServices.logout();
      setUser(null);
      setMatches([]);
      setAvailableProfiles([]);
      setLikedProfiles([]);
      setAllGirls([]);
    },
  }), [authLoading, user]);

  const chan = useMemo<ChanState>(() => ({
    availableProfiles,
    matches,
    likedProfiles,
    loading: girlsLoading,
    async handleLike(profile) {
      setMatches((current) => [...current, profile]);
      setAvailableProfiles((current) => current.filter((item) => item.id !== profile.id));
      setLikedProfiles((current) =>
        current.some((item) => item.id === profile.id) ? current : [profile, ...current],
      );
      await appServices.likeGirl(profile.id);
    },
    async handleSkip(profile) {
      setAvailableProfiles((current) => current.filter((item) => item.id !== profile.id));
      setLikedProfiles((current) => current.filter((item) => item.id !== profile.id));
      await appServices.dislikeGirl(profile.id);
    },
    async handleRestart() {
      setMatches([]);
      await loadSwipeData();
    },
    async refetch() {
      await loadSwipeData();
    },
  }), [availableProfiles, girlsLoading, likedProfiles, matches]);

  const liked = useMemo<LikedState>(() => ({
    likedProfiles,
    loading: likedLoading || girlsLoading,
    async refetch() {
      setLikedLoading(true);
      try {
        setLikedProfiles(await appServices.getLikedGirls());
      } finally {
        setLikedLoading(false);
      }
    },
  }), [girlsLoading, likedLoading, likedProfiles]);

  const admin = useMemo<AdminGirlsState>(() => ({
    profiles: allGirls,
    loadingProfiles: adminLoading,
    async refetch() {
      await loadAllGirls();
    },
    async createGirl(input: GirlFormInput) {
      const created = await appServices.createGirl(input);
      setAllGirls((current) => [created, ...current]);
      return created;
    },
    async updateGirl(id: number, input: GirlFormInput) {
      const updated = await appServices.updateGirl(id, input);
      setAllGirls((current) => current.map((item) => (item.id === id ? updated : item)));
      setAvailableProfiles((current) => current.map((item) => (item.id === id ? updated : item)));
      setLikedProfiles((current) => current.map((item) => (item.id === id ? updated : item)));
      setMatches((current) => current.map((item) => (item.id === id ? updated : item)));
      return updated;
    },
    async deleteGirl(id: number) {
      await appServices.deleteGirl(id);
      setAllGirls((current) => current.filter((item) => item.id !== id));
      setAvailableProfiles((current) => current.filter((item) => item.id !== id));
      setLikedProfiles((current) => current.filter((item) => item.id !== id));
      setMatches((current) => current.filter((item) => item.id !== id));
    },
  }), [adminLoading, allGirls]);

  const value = useMemo<LocalStateContextValue>(() => ({
    auth,
    chan,
    liked,
    admin,
  }), [admin, auth, chan, liked]);

  return <LocalStateContext.Provider value={value}>{children}</LocalStateContext.Provider>;
};

const useLocalState = () => {
  const context = useContext(LocalStateContext);

  if (!context) {
    throw new Error("State hooks must be used within AppStateProvider");
  }

  return context;
};

export const useAuthContext = () => useLocalState().auth;
export const useChan = () => useLocalState().chan;
export const useLiked = () => useLocalState().liked;
export const useAdminGirls = () => useLocalState().admin;
