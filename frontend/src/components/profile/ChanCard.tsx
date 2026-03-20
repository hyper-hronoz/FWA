import { useState } from "react"

import type { Chan } from "@shared/Profile"
import type { ChanCardProps } from "../../types/Profile"

export default function ChanCard({
  chan,
  onLike,
  onSkip
}: ChanCardProps) {
  const [imageError, setImageError] = useState(false)

  const handleLikeClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    onLike(chan.id)

    const heart = document.createElement("div")
    heart.innerHTML = "❤️"
    heart.className = "fixed text-5xl animate-heart-beat pointer-events-none"
    heart.style.left = "50%"
    heart.style.top = "50%"
    heart.style.transform = "translate(-50%, -50%)"

    document.body.appendChild(heart)
    setTimeout(() => heart.remove(), 1200)
  }

  const handleSkipClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    onSkip(chan.id)
  }

  return (
    <div className="relative w-full max-w-md bg-anime-card bg-opacity-80 backdrop-blur-lg border border-anime-primary border-opacity-30 rounded-2xl shadow-2xl overflow-hidden animate-slide-up">

      <div className="relative w-full h-80 overflow-hidden">
        {!imageError ? (
          <img
            src={chan.avatar}
            alt={chan.username}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-anime-background text-6xl">
            🫠
          </div>
        )}
        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute inset-0 border-2 border-anime-primary border-opacity-40 rounded-t-2xl pointer-events-none"></div>
      </div>

      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-3xl font-bold text-anime-text font-anime">
            {chan.username}
          </h2>

          <span className="bg-anime-background text-anime-textSoft px-4 py-2 rounded-full text-sm border border-anime-primary border-opacity-30">
            {chan.age} лет
          </span>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {chan.interests?.map((interest: string, i: number) => (
            <span
              key={i}
              className="
                bg-gradient-to-r from-anime-primary to-anime-secondary 
                text-white px-3 py-1 rounded-full text-sm
                border border-white/30
                shadow-md shadow-anime-primary/30
                backdrop-blur-sm
                transition hover:scale-105 hover:shadow-lg
              "
            >
              {interest}
            </span>
          ))}
        </div>

        <p className="text-anime-textSoft mb-4 border-l-4 border-anime-primary pl-4 italic">
          {chan.bio || "Этот отаку пока не написал о себе..."}
        </p>

        {chan.favoriteAnime && (
          <div className="bg-anime-background p-3 rounded-xl border border-anime-primary border-opacity-30 mb-4">
            <span className="text-anime-textSoft text-sm block">
              Любимое аниме
            </span>
            <span className="text-anime-text font-bold">
              🎬 {chan.favoriteAnime}
            </span>
          </div>
        )}

        <div className="flex justify-center gap-6 mt-6">
          <button
            onClick={handleSkipClick}
            className="bg-red-500 text-white w-20 h-20 rounded-full flex items-center justify-center text-3xl transition hover:scale-110 shadow-xl"
          >
            ✕
          </button>

          <button
            onClick={handleLikeClick}
            className="bg-gradient-to-r from-anime-primary to-anime-secondary text-white w-20 h-20 rounded-full flex items-center justify-center text-4xl shadow-2xl transition hover:scale-110 animate-pulse-glow"
          >
            ❤️
          </button>
        </div>

        <p className="text-center mt-4 text-anime-textSoft text-sm">
          👉 Свайп вправо — лайк, влево — пропуск
        </p>
      </div>
    </div>
  )
}
