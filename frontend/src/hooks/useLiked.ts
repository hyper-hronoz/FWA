import { API_BASE_URL, ROUTES } from "../config/api";
import { normalizeGirlListPayload } from "../utils/girlListPayload";

import { useState, useEffect } from "react";
import { useAuthContext } from "../context/AuthContext";

import type { Chan } from "@shared/Profile";

export function useLiked() {
  const { user } = useAuthContext();
  const [likedProfiles, setLikedProfiles] = useState<Chan[]>([]);
  const [loading, setLoading] = useState(true);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("animeAccessToken");
    return {
      Authorization: `Bearer ${token}`,
    };
  };

  const fetchLikedProfiles = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}${ROUTES.girls.liked}`, {
        headers: getAuthHeaders(),
      });

      if (!res.ok) throw new Error("Ошибка загрузки лайкнутых тян");

      const data: unknown = await res.json();
      setLikedProfiles(normalizeGirlListPayload(data));
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
