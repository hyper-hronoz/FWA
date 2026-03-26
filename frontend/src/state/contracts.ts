import type { ReactNode } from "react";
import type { LoginData, RegisterData } from "@shared/Auth";
import type { Chan, User } from "@shared/Profile";

export type AuthResult = {
  success: boolean;
  user?: User;
  error?: string;
};

export type UpdateProfileInput = Partial<User> & {
  password?: string;
};

export type GirlFormInput = {
  username: string;
  age: number;
  bio: string;
  favoriteAnime: string;
  interests: string[];
  avatarFile?: File | null;
  videoFile?: File | null;
};

export type AuthState = {
  user: User | null;
  loading: boolean;
  login: (data: LoginData) => Promise<AuthResult>;
  register: (data: RegisterData) => Promise<AuthResult>;
  updateProfile: (data: UpdateProfileInput) => Promise<AuthResult>;
  logout: () => Promise<void> | void;
};

export type ChanState = {
  availableProfiles: Chan[];
  matches: Chan[];
  likedProfiles: Chan[];
  loading: boolean;
  handleLike: (profile: Chan) => Promise<void>;
  handleSkip: (profile: Chan) => Promise<void>;
  handleRestart: () => Promise<void> | void;
  refetch: () => Promise<void>;
};

export type LikedState = {
  likedProfiles: Chan[];
  loading: boolean;
  refetch: () => Promise<void>;
};

export type AdminGirlsState = {
  profiles: Chan[];
  loadingProfiles: boolean;
  refetch: () => Promise<void>;
  createGirl: (input: GirlFormInput) => Promise<Chan>;
  updateGirl: (id: number, input: GirlFormInput) => Promise<Chan>;
  deleteGirl: (id: number) => Promise<void>;
};

export type AppStateHooks = {
  AppStateProvider: ({ children }: { children: ReactNode }) => ReactNode;
  useAuthContext: () => AuthState;
  useChan: () => ChanState;
  useLiked: () => LikedState;
  useAdminGirls: () => AdminGirlsState;
};
