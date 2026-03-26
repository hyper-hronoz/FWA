import { ROUTES } from "../../config/api";
import type { AuthResponse, LoginData, RegisterData } from "@shared/Auth";
import type { Chan, User } from "@shared/Profile";
import type { GirlFormInput, UpdateProfileInput } from "../contracts";
import { apiRequest, toFormData } from "./apiClient";
import { authStorage } from "./authStorage";

type GirlListResponse = {
  data: Chan[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

const buildGirlFormData = (input: GirlFormInput) =>
  toFormData({
    username: input.username.trim(),
    age: String(input.age),
    bio: input.bio.trim(),
    favoriteAnime: input.favoriteAnime.trim() || "Не указано",
    interests: JSON.stringify(input.interests),
    avatar: input.avatarFile || undefined,
    video: input.videoFile || undefined,
  });

export const appServices = {
  async login(data: LoginData) {
    const payload = await apiRequest<AuthResponse>(ROUTES.auth.login, {
      method: "POST",
      skipAuth: true,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    authStorage.saveAuth(payload);
    return payload;
  },
  async register(data: RegisterData) {
    const payload = await apiRequest<AuthResponse>(ROUTES.auth.register, {
      method: "POST",
      skipAuth: true,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    authStorage.saveAuth(payload);
    return payload;
  },
  async me() {
    const user = await apiRequest<User>(ROUTES.auth.me);
    authStorage.saveUser(user);
    return user;
  },
  async updateProfile(data: UpdateProfileInput) {
    const user = await apiRequest<User>(ROUTES.users.profile, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    authStorage.saveUser(user);
    return user;
  },
  async logout() {
    const refreshToken = authStorage.getRefreshToken();

    if (refreshToken) {
      try {
        await apiRequest(ROUTES.auth.logout, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refreshToken }),
        });
      } finally {
        authStorage.clear();
      }
      return;
    }

    authStorage.clear();
  },
  async getUnlikedGirls(limit = 10) {
    const response = await apiRequest<GirlListResponse>(`${ROUTES.girls.unliked}?page=1&limit=${limit}`);
    return response.data;
  },
  async getLikedGirls() {
    return apiRequest<Chan[]>(ROUTES.girls.liked);
  },
  async getAllGirls(limit = 100) {
    const response = await apiRequest<GirlListResponse>(`${ROUTES.girls.all}?page=1&limit=${limit}`);
    return response.data;
  },
  async likeGirl(id: number) {
    await apiRequest(ROUTES.girls.like(id), {
      method: "POST",
    });
  },
  async unlikeGirl(id: number) {
    await apiRequest(ROUTES.girls.unlike(id), {
      method: "DELETE",
    });
  },
  async dislikeGirl(id: number) {
    await apiRequest(ROUTES.girls.dislike(id), {
      method: "POST",
    });
  },
  async createGirl(input: GirlFormInput) {
    return apiRequest<Chan>(ROUTES.girls.create, {
      method: "POST",
      body: buildGirlFormData(input),
    });
  },
  async updateGirl(id: number, input: GirlFormInput) {
    return apiRequest<Chan>(ROUTES.girls.update(id), {
      method: "PUT",
      body: buildGirlFormData(input),
    });
  },
  async deleteGirl(id: number) {
    await apiRequest(ROUTES.girls.delete(id), {
      method: "DELETE",
    });
  },
};
