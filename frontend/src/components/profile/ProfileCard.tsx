import type { Profile } from "../types/Profile"
import { useState } from "react"

interface ProfileCardProps {
  profile: Profile
  onLike: () => void
  onSkip: () => void
}

export default function ProfileCard({
  profile,
  onLike,
  onSkip
}: ProfileCardProps) {

  const [imageError, setImageError] = useState(false)

  const handleLikeClick = () => {
    onLike()

    const heart = document.createElement("div")
    heart.innerHTML = "❤️"
    heart.className = "fixed text-5xl animate-heart-beat pointer-events-none"
    heart.style.left = "50%"
    heart.style.top = "50%"
    heart.style.transform = "translate(-50%, -50%)"

    document.body.appendChild(heart)

    setTimeout(() => heart.remove(), 1200)
  }

  return (
    <div className="relative w-full max-w-md bg-anime-card bg-opacity-80 backdrop-blur-lg border border-anime-primary border-opacity-30 rounded-2xl shadow-2xl overflow-hidden animate-slide-up">

      {/* INFO - без аватара */}
      <div className="p-6">

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-3xl font-bold text-anime-text font-anime">
            {profile.name}
          </h2>

          <span className="bg-anime-background text-anime-textSoft px-4 py-2 rounded-full text-sm border border-anime-primary border-opacity-30">
            {profile.age} лет
          </span>
        </div>

        {/* INTERESTS */}
        <div className="flex flex-wrap gap-2 mb-4">
          {profile.interests?.map((interest, i) => (
            <span
              key={i}
              className="bg-gradient-to-r from-anime-primary to-anime-secondary text-white px-3 py-1 rounded-full text-sm"
            >
              {interest}
            </span>
          ))}
        </div>

        {/* BIO */}
        <p className="text-anime-textSoft mb-4 border-l-4 border-anime-primary pl-4 italic">
          {profile.bio || "Этот отаку пока не написал о себе..."}
        </p>

        {profile.favoriteAnime && (
          <div className="bg-anime-background p-3 rounded-xl border border-anime-primary border-opacity-30 mb-4">
            <span className="text-anime-textSoft text-sm block">
              Любимое аниме
            </span>

            <span className="text-anime-text font-bold">
              🎬 {profile.favoriteAnime}
            </span>
          </div>
        )}

        {/* ACTION BUTTONS - одинакового размера */}
        <div className="flex justify-center gap-6 mt-6">

          <button
            onClick={onSkip}
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
