import { API_BASE_URL, ROUTES } from "../config/api";
import { useEffect, useState } from "react";
import { useAuthContext } from "../context/AuthContext";

import type { Chan } from "@shared/Profile";

export function useChan() {
  const { user } = useAuthContext();

  const [matches, setMatches] = useState<Chan[]>([]);
  const [availableProfiles, setAvailableProfiles] = useState<Chan[]>([]);
  const [likedProfiles, setLikedProfiles] = useState<Chan[]>([]);
  const [loading, setLoading] = useState(true);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("animeAccessToken");
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  const fetchChans = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}${ROUTES.girls.unliked}?page=1&limit=10`,
        { headers: getAuthHeaders() }
      );

      if (!res.ok) throw new Error("Ошибка загрузки всех тян");

      const data = await res.json();
      setAvailableProfiles(data.data);
    } catch (err) {
      console.error("Ошибка загрузки профилей:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLikedChans = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API_BASE_URL}${ROUTES.girls.liked}`, {
        headers: getAuthHeaders(),
      });

      if (!res.ok) throw new Error("Ошибка загрузки лайкнутых тян");

      const data = await res.json();
      setLikedProfiles(data.data);
    } catch (err) {
      console.error("Ошибка получения лайкнутых профилей:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchChans();
  }, [user]);

  const removeProfile = (id: number) => {
    setAvailableProfiles((prev) => prev.filter((p) => p.id !== id));
  };

  const sendLikeToServer = async (profile: Chan) => {
    try {
      await fetch(`${API_BASE_URL}${ROUTES.girls.like(profile.id)}`, {
        method: "POST",
        headers: getAuthHeaders(),
      });
    } catch (err) {
      console.error("Ошибка лайка:", err);
    }
  };

  const sendDislikeToServer = async (profile: Chan) => {
    try {
      await fetch(`${API_BASE_URL}${ROUTES.girls.unlike(profile.id)}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
    } catch (err) {
      console.error("Ошибка дизлайка:", err);
    }
  };

  const handleLike = async (profile: Chan) => {
    setMatches((prev) => [...prev, profile]);

    await sendLikeToServer(profile);

    removeProfile(profile.id);
  };

  const handleSkip = async (profile: Chan) => {
    await sendDislikeToServer(profile);

    removeProfile(profile.id);
  };

  const handleRestart = () => {
    setMatches([]);
    fetchChans();
  };

  const refetch = async () => {
    setLoading(true);
    await fetchChans();
  };

  return {
    availableProfiles,
    matches,
    likedProfiles,
    loading,
    handleLike,
    handleSkip,
    handleRestart,
    refetch
  };
}
