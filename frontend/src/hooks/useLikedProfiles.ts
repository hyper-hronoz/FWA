import { useState, useEffect } from "react";
import { useAuthContext } from "../context/AuthContext";
import { API_BASE_URL, ROUTES } from "../config/api";
import type { Chan } from "@shared/Profile";

export function useLikedProfiles() {
  const { user } = useAuthContext();
  const [likedProfiles, setLikedProfiles] = useState<Chan[]>([]);
  const [loading, setLoading] = useState(true);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("animeToken");
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  const fetchLikedProfiles = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}${ROUTES.girls.liked}`, {
        headers: getAuthHeaders(),
      });

      if (!res.ok) throw new Error("Ошибка загрузки лайкнутых тян");

      const data = await res.json();
      
      console.log("[LIKED GIRLS]", data)

      setLikedProfiles(data);
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
