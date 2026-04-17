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
