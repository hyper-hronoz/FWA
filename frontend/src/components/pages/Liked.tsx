import ChanCard from "../profile/ChanCard";
import { useLiked } from "@state/hooks";

interface LikedProps {
  onSkip: (chan: import("@shared/Profile").Chan) => Promise<void>;
}

export default function Liked({ onSkip }: LikedProps) {
  const { likedProfiles, loading, refetch } = useLiked();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-anime-textSoft text-lg">
        Загрузка лайкнутых тян...
      </div>
    );
  }

  if (!likedProfiles.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-anime-textSoft text-lg gap-4">
        <p>Пока нет лайкнутых тян 😢</p>
        <button
          onClick={() => void refetch()}
          className="px-4 py-2 bg-purple-700 text-white rounded hover:bg-purple-800 transition"
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-anime-background to-purple-900 p-8">
      <h2 className="text-2xl md:text-3xl font-bold text-anime-text mb-6 text-center">
        Лайкнутые тян
      </h2>

      <div className="mx-auto w-full max-w-[1200px] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
        {likedProfiles.map((chan) => (
          <div key={chan.id} className="w-full max-w-[360px] h-full">
            <ChanCard
              chan={chan}
              onSkip={() => void onSkip(chan)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
