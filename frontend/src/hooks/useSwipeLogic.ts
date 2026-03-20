import { API_BASE_URL, ROUTES } from "../config/api";
import { useEffect, useState } from "react";
import type { Chan } from "@shared/Profile";
import { useAuthContext } from "../context/AuthContext";

export function useSwipeLogic() {
  const { user } = useAuthContext();
  const [index, setIndex] = useState(0);
  const [matches, setMatches] = useState<Chan[]>([]);
  const [availableProfiles, setAvailableProfiles] = useState<Chan[]>([]);
  const [likedProfiles, setLikedProfiles] = useState<Chan[]>([]);
  const [loading, setLoading] = useState(true);

  const profile: Chan | undefined = availableProfiles[index];

  const getAuthHeaders = () => {
    const token = localStorage.getItem("animeToken");
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  const fetchProfiles = async () => {
    try {
      const page = 1;
      const limit = 10;

      const res = await fetch(
      `${API_BASE_URL}${ROUTES.girls.all}?page=${page}&limit=${limit}`,
      {
        headers: getAuthHeaders(),
      });

      if (!res.ok) throw new Error("Ошибка загрузки всех тян");

      const data = await res.json();
      console.log("Тянки прилетели!", data)
      setAvailableProfiles(data.data);
    } catch (err) {
      console.error("Ошибка загрузки профилей:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLikedProfiles = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}${ROUTES.girls.liked}`, {
        headers: getAuthHeaders(),
      });

      console.log("OUTPUT LIKED GIRLS", res)
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
    fetchProfiles();
  }, [user]);

  const next = () => {
    setIndex((prev) => {
      if (availableProfiles.length === 0) return prev;

      const newIndex = prev + 1;

      if (newIndex >= availableProfiles.length) {
        alert("🎉 Вы просмотрели всех!");
        return prev;
      }

      return newIndex;
    });
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
      console.log("SENDING DISLIKE TO SERVER")

      const response = await fetch(`${API_BASE_URL}${ROUTES.girls.dislike(profile.id)}`, {
        method: "POST",
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      console.log("DISLIKE MATAFA", data, profile.id)
    } catch (err) {
      console.error("Ошибка дизлайка:", err);
    }
  };

  const handleLike = async () => {
    if (!profile) return;

    setMatches((prev) => [...prev, profile]);

    await sendLikeToServer(profile);

    next();
  };

  const handleSkip = async () => {
    if (profile) {
      await sendDislikeToServer(profile);
    }

    next();
  };

  const handleRestart = () => {
    setIndex(0);
    setMatches([]);
  };

  return {
    profile,
    index,
    matches,
    likedProfiles,
    loading,
    total: availableProfiles.length,
    handleLike,
    handleSkip,
    handleRestart,
  };
}
