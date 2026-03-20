import ChanCard from "../profile/ChanCard"

import { useEffect, useRef } from "react"
import { WelcomeVideo } from "../ui/WelcomeVideo"

import type { Chan } from "@shared/Profile"
import type { ChanCardProps } from "../../types/Profile"

export default function SwipeScreen({ chan, onLike, onSkip, refetch }: ChanCardProps & { refetch: () => void }) {
  const elementRef = useRef<HTMLDivElement>(null)
  const hasRetried = useRef(false);

  useEffect(() => {
    if (!chan && !hasRetried.current) {
      console.log("No more profiles, retrying fetch...");
      hasRetried.current = true;
      refetch();
    }
  }, [chan, refetch]);

  if (!chan) {
  return (
      <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-gradient-to-br from-anime-background to-purple-900 text-center px-6 relative overflow-hidden">

        <div className="bg-anime-card bg-opacity-80 backdrop-blur-xl border border-anime-primary border-opacity-30 rounded-3xl p-10 shadow-2xl animate-slide-up max-w-lg">
          
          <div className="text-7xl mb-4 animate-bounce">🎉</div>

          <h1 className="text-4xl font-bold text-anime-text font-anime mb-4">
            Омэдэто! 🎊
          </h1>

          <p className="text-anime-textSoft text-lg mb-6">
            Ты собрал всех аниме-тян в этом мире...
          </p>

          <p className="text-anime-textSoft italic mb-6">
            🫠 Похоже, ты слишком хорош...  
            Даже сенпай уже заметил тебя...
          </p>

          <div className="text-2xl animate-pulse">
            ❤️✨
          </div>

          <p className="mt-6 text-sm text-anime-textSoft">
            Попробуй зайти позже — новые тянки обязательно появятся 👀
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-screen flex bg-gradient-to-br from-anime-background to-purple-900">
      <div
        ref={elementRef}
        className="flex-1 flex items-center justify-center p-8"
      >
        <ChanCard
          chan={chan}
          onLike={onLike}
          onSkip={onSkip}
        />
      </div>

      <div className="flex-1 relative min-h-screen">
        <WelcomeVideo videoSrc={chan.video}/>
      </div>
    </div>
  )
}
