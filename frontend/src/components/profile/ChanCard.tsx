import { useState } from "react"

import type { Chan } from "@shared/Profile"
import type { ChanCardProps } from "../../types/Profile"
import { resolveMediaUrl } from "../../utils/media"

export default function ChanCard({
  chan,
  onLike,
  onSkip
}: ChanCardProps) {
  const [imageError, setImageError] = useState(false)
  const avatarSrc = resolveMediaUrl(chan.avatar)

  const handleLikeClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (!onLike) return
    onLike(chan)
  }

  const handleSkipClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (!onSkip) return
    onSkip(chan)
  }

  return (
    <div className="relative flex h-full min-h-[600px] max-h-[600px] w-full max-w-[450px] min-w-[355px] flex-col overflow-hidden rounded-3xl border border-white/10 bg-anime-card/85 p-6 shadow-2xl backdrop-blur-lg animate-slide-up">
      <div className="mb-5 flex flex-col items-center text-center">
        {!imageError ? (
          <img
            src={avatarSrc}
            alt={chan.username}
            onError={() => setImageError(true)}
            className="h-32 w-32 shrink-0 rounded-full border border-white/15 object-cover shadow-lg"
          />
        ) : (
          <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-full bg-anime-background text-5xl shadow-lg">
            🫠
          </div>
        )}

        <div className="mt-4 min-w-0 w-full">
          <div className="mb-2 flex flex-col items-center gap-2">
            <h2 className="truncate text-3xl font-bold text-anime-text">
              {chan.username}
            </h2>

            <span className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-anime-textSoft">
              {chan.age} лет
            </span>
          </div>

          {chan.favoriteAnime && (
            <p className="text-sm text-anime-textSoft">
              Любимое аниме: <span className="font-semibold text-anime-text">{chan.favoriteAnime}</span>
            </p>
          )}
        </div>
      </div>

      <div className="mb-5 flex min-h-[48px] flex-wrap content-start gap-2">
        {chan.interests?.map((interest: string, i: number) => (
          <span
            key={i}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-anime-textSoft"
          >
            {interest}
          </span>
        ))}
      </div>

      <div className="rounded-2xl border border-white/8 bg-black/10 p-4">
        <p className="mb-2 text-xs uppercase tracking-[0.2em] text-anime-textSoft/70">
          О себе
        </p>
        <p className="min-h-[96px] text-sm leading-6 text-anime-textSoft">
          {chan.bio || "Этот отаку пока не написал о себе..."}
        </p>
      </div>

      <div className="mt-auto flex justify-center gap-4 pt-3">
        {onSkip && (
          <button
            onClick={handleSkipClick}
            className="flex h-16 w-16 aspect-square items-center justify-center rounded-full border border-white/18 bg-white/8 text-[1.6rem] text-anime-text shadow-[0_14px_30px_rgba(0,0,0,0.24)] backdrop-blur-xl transition hover:scale-105 hover:bg-white/12"
          >
            ✕
          </button>
        )}

        {onLike && (
          <button
            onClick={handleLikeClick}
            className="flex h-16 w-16 aspect-square items-center justify-center rounded-full border border-pink-200/45 bg-gradient-to-br from-anime-primary/80 via-anime-accent/70 to-anime-secondary/75 text-[1.6rem] text-white shadow-[0_18px_38px_rgba(255,20,147,0.42)] backdrop-blur-xl transition hover:scale-105 hover:brightness-110"
          >
            ❤️
          </button>
        )}
      </div>
    </div>
  )
}
