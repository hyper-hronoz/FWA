import { API_BASE_URL, ROUTES } from "../config/api";

import { useState, useEffect } from "react";
import { useAuthContext } from "../context/AuthContext";

import type { Chan } from "@shared/Profile";

const normalizeLikedPayload = (payload: unknown): Chan[] => {
  if (Array.isArray(payload)) {
    return payload as Chan[];
  }

  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    Array.isArray((payload as { data?: unknown }).data)
  ) {
    return (payload as { data: Chan[] }).data;
  }

  return [];
};

export function useLiked() {
  const { user, authFetch } = useAuthContext();
  const [likedProfiles, setLikedProfiles] = useState<Chan[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLikedProfiles = async () => {
    try {
      setLoading(true);
      const res = await authFetch(`${API_BASE_URL}${ROUTES.girls.liked}`);

      if (!res.ok) throw new Error("Ошибка загрузки лайкнутых тян");

      const data = await res.json();

      setLikedProfiles(normalizeLikedPayload(data));
    } catch (err) {
      console.error("Ошибка получения лайкнутых профилей:", err);
      setLikedProfiles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchLikedProfiles();
  }, [user]);

  return { likedProfiles, loading, refetch: fetchLikedProfiles };
}
