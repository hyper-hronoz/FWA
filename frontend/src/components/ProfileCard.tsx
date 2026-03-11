import type { Profile } from "../types/Profile"
import { useState } from "react"

interface ProfileCardProps {
  profile: Profile
  onLike: () => void
  onSkip: () => void
}

export default function ProfileCard({ profile, onLike, onSkip }: ProfileCardProps) {
  const [imageError, setImageError] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const handleLikeClick = () => {
    onLike()
    // Анимация лайка
    const heart = document.createElement('div')
    heart.innerHTML = '❤️'
    heart.className = 'fixed text-4xl animate-heart-beat pointer-events-none'
    heart.style.left = '50%'
    heart.style.top = '50%'
    heart.style.transform = 'translate(-50%, -50%)'
    document.body.appendChild(heart)
    setTimeout(() => heart.remove(), 1300)
  }

  return (
    <div 
      className="relative max-w-md mx-auto bg-anime-card rounded-2xl overflow-hidden shadow-2xl border border-anime-primary border-opacity-30 transform transition-all duration-500 hover:scale-105 hover:rotate-1 animate-slide-up"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Анимированный градиентный фон */}
      <div className="absolute inset-0 bg-gradient-to-t from-anime-background via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 z-10"></div>

      {/* Аниме-декор */}
      <div className="absolute top-4 right-4 text-3xl z-20 animate-float">
        {profile.gender === 'female' ? '🌸' : '⭐'}
      </div>

      {/* Изображение профиля */}
      <div className="relative h-96 overflow-hidden">
        {imageError ? (
          <div className="w-full h-full bg-gradient-to-br from-anime-primary to-anime-secondary flex items-center justify-center">
            <span className="text-8xl animate-float">
              {profile.gender === 'female' ? '👘' : '👺'}
            </span>
          </div>
        ) : (
          <img
            src={profile.image}
            alt={profile.name}
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
            onError={() => setImageError(true)}
          />
        )}
        
        {/* Градиентное затемнение */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-anime-card to-transparent"></div>
      </div>

      {/* Информация о профиле */}
      <div className="p-6 relative z-20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-3xl font-bold text-anime-text font-anime flex items-center gap-2">
            {profile.name}
            {isHovered && <span className="text-2xl animate-bounce">✨</span>}
          </h2>
          <div className="flex gap-2">
            <span className="bg-anime-background text-anime-textSoft px-4 py-2 rounded-full text-sm font-cute border border-anime-primary border-opacity-30">
              {profile.age} лет
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {profile.interests?.map((interest, i) => (
              <span
                key={i}
                className="bg-gradient-to-r from-anime-primary to-anime-secondary bg-opacity-20 text-white px-4 py-2 rounded-full text-sm font-cute border border-white border-opacity-20 shadow-lg transform hover:scale-110 transition-all duration-300 hover:rotate-3"
              >
                {interest}
              </span>
            ))}
          </div>

          <p className="text-anime-textSoft font-cute leading-relaxed border-l-4 border-anime-primary pl-4 italic">
            {profile.bio || 'Этот отаку пока не заполнил информацию о себе...'}
          </p>

          {profile.favoriteAnime && (
            <div className="bg-anime-background p-3 rounded-xl border border-anime-primary border-opacity-30">
              <span className="text-anime-textSoft text-sm block mb-1">Любимое аниме:</span>
              <span className="text-anime-text font-bold flex items-center gap-2">
                🎬 {profile.favoriteAnime}
              </span>
            </div>
          )}
        </div>

        {/* Кнопки действий */}
        <div className="flex justify-center gap-6 mt-8">
          <button
            onClick={onSkip}
            className="bg-anime-skip hover:bg-opacity-80 text-white w-16 h-16 rounded-full flex items-center justify-center text-3xl transform transition-all duration-300 hover:scale-110 hover:rotate-12 shadow-xl border-2 border-white border-opacity-20"
          >
            ✕
          </button>
          <button
            onClick={handleLikeClick}
            className="bg-anime-love hover:bg-opacity-80 text-white w-20 h-20 rounded-full flex items-center justify-center text-4xl transform transition-all duration-300 hover:scale-125 hover:-rotate-12 shadow-2xl animate-pulse-glow border-2 border-white border-opacity-30"
          >
            ❤️
          </button>
        </div>

        {/* Подсказка */}
        <p className="text-center mt-4 text-anime-textSoft text-sm font-cute animate-pulse">
          👆 Свайпай вправо если нравится, влево если пропускаешь
        </p>
      </div>
    </div>
  )
}
