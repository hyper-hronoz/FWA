import { useState } from "react"

import type { MatchListProps } from "../../types/Match.ts"
import { resolveMediaUrl } from "../../utils/media"

export default function MatchList({ matches }: MatchListProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (matches.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative bg-gradient-to-r from-anime-primary to-anime-secondary p-4 rounded-full shadow-2xl transform transition-all duration-300 hover:scale-110 animate-float"
      >
        <span className="text-3xl">💕</span>
        <span className="absolute -top-2 -right-2 bg-white text-anime-primary w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-lg border-2 border-anime-primary animate-pulse">
          {matches.length}
        </span>
      </button>

      {isOpen && (
        <div className="absolute bottom-20 right-0 w-80 bg-anime-card rounded-2xl overflow-hidden shadow-2xl border border-anime-primary border-opacity-30 animate-slide-up">
          <div className="bg-gradient-to-r from-anime-primary to-anime-secondary p-4">
            <h3 className="text-white font-bold text-xl flex items-center gap-2 font-anime">
              Твои мэтчи 💕
              <span className="text-sm bg-white bg-opacity-20 px-3 py-1 rounded-full">
                {matches.length} всего
              </span>
            </h3>
          </div>

          <div className="max-h-96 overflow-y-auto p-4 space-y-3">
            {matches.map((match, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-anime-background rounded-xl hover:bg-opacity-70 transition-all duration-300 transform hover:scale-105 hover:-translate-x-2 group border border-anime-primary border-opacity-20"
              >
                <div className="relative">
                  <img
                    src={resolveMediaUrl(match.avatar)}
                    alt={match.username}
                    className="w-16 h-16 rounded-full object-cover border-4 border-anime-primary border-opacity-50 group-hover:border-opacity-100 transition-all duration-300"
                  />
                  <span className="absolute -bottom-1 -right-1 text-2xl animate-bounce">
                    💕
                  </span>
                </div>
                <div className="flex-1">
                  <h4 className="text-anime-text font-bold font-anime flex items-center gap-1">
                    {match.username}
                    <span className="text-xs bg-anime-primary bg-opacity-30 px-2 py-1 rounded-full">
                      {match.age}
                    </span>
                  </h4>
                  <p className="text-anime-textSoft text-sm font-cute truncate">
                    {match.interests?.slice(0, 2).join(' • ')}
                  </p>
                </div>
                <span className="text-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  💘
                </span>
              </div>
            ))}
          </div>

          <div className="p-4 bg-anime-background border-t border-anime-primary border-opacity-30">
            <p className="text-anime-textSoft text-center text-sm font-cute">
              {matches.length === 1 ? '💖 Начало прекрасной истории!' :
               matches.length < 3 ? '🌸 У тебя уже есть мэтчи!' :
               matches.length < 5 ? '✨ Популярный отаку!' :
               '👑 Легендарный коллекционер сердец!'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
