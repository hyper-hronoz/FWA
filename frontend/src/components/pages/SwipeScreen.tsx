import ChanCard from "../profile/ChanCard"

import { useEffect, useRef, useState } from "react"
import { WelcomeVideo } from "../ui/WelcomeVideo"
import { resolveMediaUrl } from "../../utils/media"

import type { Chan } from "@shared/Profile"
import type { ChanCardProps } from "../../types/Profile"

export default function SwipeScreen({ chan, onLike, onSkip, refetch }: ChanCardProps & { refetch: () => void }) {
  const elementRef = useRef<HTMLDivElement>(null)
  const hasRetried = useRef(false)
  const transitionTimerRef = useRef<number | null>(null)
  const [transitionState, setTransitionState] = useState<"idle" | "liking" | "skipping" | "entering">("idle")

  useEffect(() => {
    if (!chan && !hasRetried.current) {
      console.log("No more profiles, retrying fetch...")
      hasRetried.current = true
      refetch()
    }
  }, [chan, refetch])

  useEffect(() => {
    if (!chan) return

    setTransitionState("entering")

    if (transitionTimerRef.current) {
      window.clearTimeout(transitionTimerRef.current)
    }

    transitionTimerRef.current = window.setTimeout(() => {
      setTransitionState("idle")
      transitionTimerRef.current = null
    }, 280)

    return () => {
      if (transitionTimerRef.current) {
        window.clearTimeout(transitionTimerRef.current)
        transitionTimerRef.current = null
      }
    }
  }, [chan?.id])

  const runCardTransition = (action: "liking" | "skipping", callback?: (currentChan: Chan) => void) => {
    if (!chan || transitionState === "liking" || transitionState === "skipping") return

    setTransitionState(action)

    if (transitionTimerRef.current) {
      window.clearTimeout(transitionTimerRef.current)
    }

    transitionTimerRef.current = window.setTimeout(() => {
      callback?.(chan)
      transitionTimerRef.current = null
    }, 280)
  }

  const cardTransitionClass = transitionState === "liking"
    ? "card-flip card-flip-like"
    : transitionState === "skipping"
      ? "card-flip card-flip-skip"
      : transitionState === "entering"
        ? "card-flip card-flip-enter"
        : ""

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

  const avatarSrc = resolveMediaUrl(chan.avatar)
  const videoSrc = resolveMediaUrl(chan.video)

  return (
    <div className="min-h-screen w-screen flex bg-gradient-to-br from-anime-background to-purple-900">
      <div
        ref={elementRef}
        className="relative flex flex-1 items-center justify-center overflow-hidden p-8"
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full opacity-25 blur-3xl">
            <img
              src={avatarSrc}
              alt=""
              aria-hidden="true"
              className="h-full w-full scale-150 object-cover saturate-150"
            />
          </div>

          <div className="absolute left-[12%] top-[12%] h-36 w-36 rounded-full bg-anime-primary/20 blur-3xl animate-pulse" />
          <div className="absolute bottom-[14%] right-[10%] h-44 w-44 rounded-full bg-cyan-300/15 blur-3xl animate-pulse" />
          <div className="absolute left-[14%] bottom-[18%] h-24 w-24 rounded-full border border-white/10 bg-white/5 backdrop-blur-md animate-float" />
          <div className="absolute right-[16%] top-[18%] h-16 w-16 rounded-full border border-white/10 bg-anime-secondary/10 backdrop-blur-md animate-float" />
          <div className="absolute left-1/2 top-1/2 h-[680px] w-[680px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5" />
          <div className="absolute left-1/2 top-1/2 h-[760px] w-[760px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5" />
        </div>

        <div className={`relative z-10 ${cardTransitionClass}`}>
          <ChanCard
            chan={chan}
            onLike={onLike ? (currentChan) => runCardTransition("liking", onLike) : undefined}
            onSkip={onSkip ? (currentChan) => runCardTransition("skipping", onSkip) : undefined}
          />
        </div>
      </div>

      <div className="relative min-h-screen flex-[1.12]">
        <WelcomeVideo videoSrc={videoSrc} />
      </div>
    </div>
  )
}
