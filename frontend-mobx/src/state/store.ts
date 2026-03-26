import { makeAutoObservable, runInAction } from "mobx";
import type { Chan, User } from "@shared/Profile";
import type { GirlFormInput, UpdateProfileInput } from "../../../frontend/src/state/contracts";
import { authStorage } from "../../../frontend/src/state/shared/authStorage";
import { appServices } from "../../../frontend/src/state/shared/services";

const CACHE_TTL = 60_000;

const isFresh = (timestamp: number) => Date.now() - timestamp < CACHE_TTL;

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
      const currentUser = await appServices.me();
      runInAction(() => {
        this.user = currentUser;
      });
    } catch {
      runInAction(() => {
        this.user = authStorage.getSavedUser();
      });
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

    if (!force && isFresh(this.girlsFetchedAt) && isFresh(this.likedFetchedAt)) {
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

    if (!force && isFresh(this.likedFetchedAt)) {
      return;
    }

    this.likedLoading = true;

    try {
      const likedProfiles = await appServices.getLikedGirls();
      runInAction(() => {
        this.likedProfiles = likedProfiles;
        this.likedFetchedAt = Date.now();
      });
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

    if (!force && isFresh(this.adminFetchedAt)) {
      return;
    }

    this.adminLoading = true;

    try {
      const girls = await appServices.getAllGirls();
      runInAction(() => {
        this.adminProfiles = girls;
        this.adminFetchedAt = Date.now();
      });
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
    await appServices.logout();
    runInAction(() => {
      this.user = null;
      this.availableProfiles = [];
      this.likedProfiles = [];
      this.adminProfiles = [];
      this.matches = [];
      this.girlsFetchedAt = 0;
      this.likedFetchedAt = 0;
      this.adminFetchedAt = 0;
    });
  }

  async likeProfile(profile: Chan) {
    runInAction(() => {
      this.matches = [...this.matches, profile];
      this.availableProfiles = this.availableProfiles.filter((item) => item.id !== profile.id);
      if (!this.likedProfiles.some((item) => item.id === profile.id)) {
        this.likedProfiles = [profile, ...this.likedProfiles];
      }
      this.likedFetchedAt = Date.now();
      this.girlsFetchedAt = Date.now();
    });

    await appServices.likeGirl(profile.id);
  }

  async skipProfile(profile: Chan) {
    runInAction(() => {
      this.availableProfiles = this.availableProfiles.filter((item) => item.id !== profile.id);
      this.likedProfiles = this.likedProfiles.filter((item) => item.id !== profile.id);
      this.matches = this.matches.filter((item) => item.id !== profile.id);
      this.girlsFetchedAt = Date.now();
      this.likedFetchedAt = Date.now();
    });

    await appServices.dislikeGirl(profile.id);
  }

  async restartSwipe() {
    this.matches = [];
    await this.ensureSwipeData(true);
  }

  async createGirl(input: GirlFormInput) {
    const created = await appServices.createGirl(input);
    runInAction(() => {
      this.adminProfiles = [created, ...this.adminProfiles];
      this.adminFetchedAt = Date.now();
    });
    return created;
  }

  async updateGirl(id: number, input: GirlFormInput) {
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
  }

  async deleteGirl(id: number) {
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
  }
}
