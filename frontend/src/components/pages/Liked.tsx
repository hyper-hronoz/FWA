import React, { useEffect, useState } from "react";
import ChanCard from "../profile/ChanCard";
import { useLiked } from "../../hooks/useLiked";

import type { Chan } from "@shared/Profile";

interface LikedProps {
  onLike: (chan: Chan) => void;
  onSkip: (chan: Chan) => void;
}

export default function Liked({ onLike, onSkip }: LikedProps) {
  const { likedProfiles, loading, refetch } = useLiked();
  const [localProfiles, setLocalProfiles] = useState<Chan[]>([]);

  useEffect(() => {
    if (likedProfiles) {
      setLocalProfiles(likedProfiles);
    }
  }, [likedProfiles]);

  const handleSkip = async (chan: Chan) => {
    onSkip(chan);
    setLocalProfiles((prev) => prev.filter((c) => c.id !== chan.id));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-anime-textSoft text-lg">
        Загрузка лайкнутых тян...
      </div>
    );
  }

  if (!localProfiles.length) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-anime-background to-purple-900 p-8">
      <h2 className="text-2xl md:text-3xl font-bold text-anime-text mb-6">
        Лайкнутые тян
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {localProfiles.map((chan: Chan) => (
          <ChanCard
            key={chan.id}
            chan={chan}
            onSkip={() => handleSkip(chan)}
          />
        ))}
      </div>
    </div>
  );
}
