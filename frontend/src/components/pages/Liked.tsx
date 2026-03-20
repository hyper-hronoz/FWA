import React, { useState, useEffect } from "react";
import ChanCard from "../profile/ChanCard";
import { useLikedProfiles } from "../../hooks/useLikedProfiles";
import type { Chan } from "@shared/Profile";
import { API_BASE_URL, ROUTES } from "../../config/api";

interface LikedProps {
  onLike: (chan: Chan) => void;
  onSkip: (chanId: number) => void;
}

export default function Liked({ onLike, onSkip }: LikedProps) {
  const { likedProfiles: likedProfilesFromHook, loading, refetch } = useLikedProfiles();
  const [likedProfiles, setLikedProfiles] = useState<Chan[]>([]);

  useEffect(() => {
    if (likedProfilesFromHook) {
      setLikedProfiles(likedProfilesFromHook);
    }
  }, [likedProfilesFromHook]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-anime-textSoft text-lg">
        Загрузка лайкнутых тян...
      </div>
    );
  }

  if (!likedProfiles || likedProfiles.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-anime-textSoft text-lg gap-4">
        <p>Пока нет лайкнутых тян 😢</p>
        <button
          onClick={refetch}
          className="px-4 py-2 bg-purple-700 text-white rounded hover:bg-purple-800 transition"
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  const handleSkip = async (chanId: number) => {
    console.log("Удаляем локально:", chanId);
    setLikedProfiles((prev) => prev.filter((c) => c.id !== chanId));

    try {
      const token = localStorage.getItem("animeToken");
      const res = await fetch(`${API_BASE_URL}${ROUTES.girls.dislike(chanId)}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error("Ошибка при отправке дизлайка");

      const data = await res.json();
      console.log("Дизлайк отправлен успешно:", data, chanId);
    } catch (err) {
      console.error("Ошибка при удалении с сервера:", err);
    }
  };

  // const handleSkip = async (chanId: string) => {
  // console.log("УДИЛ", chanId)
  //   setLikedProfiles((prev) => prev.filter((c) => c.id !== chanId));
  //   try {
  //     console.log("Удаляем", chanId)
  //     await onSkip(chanId);
  //   } catch (err) {
  //     console.error("Ошибка при удалении с сервера:", err);
  //   }
  // };

  return (
    <div className="min-h-screen bg-gradient-to-br from-anime-background to-purple-900 p-8">
      <h2 className="text-2xl md:text-3xl font-bold text-anime-text mb-6">
        Лайкнутые тян
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {likedProfiles.map((chan: Chan) => (
          <ChanCard
            key={chan.id}
            chan={chan}
            onLike={() => onLike(chan)}
            onSkip={() => handleSkip(chan.id)}
          />
        ))}
      </div>
    </div>
  );
}
