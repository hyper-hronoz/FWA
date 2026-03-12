import { useEffect } from "react"
import ProfileCard from "../profile/ProfileCard"
import { useSwipe } from "../../hooks/useSwipe"
import { WelcomeVideo } from "../ui/WelcomeVideo"

export default function SwipeScreen({ profile, onLike, onSkip }) {
  const { elementRef } = useSwipe({
    onLike,
    onSkip
  })

  useEffect(() => {
    console.log("📦 SwipeScreen mounted")
    return () => console.log("🧹 SwipeScreen unmounted")
  }, [])

  return (
    <div className="min-h-screen w-screen flex bg-gradient-to-br from-anime-background to-purple-900">

      <div
        ref={elementRef}
        className="flex-1 flex items-center justify-center p-8"
      >
        <ProfileCard
          profile={profile}
          onLike={onLike}
          onSkip={onSkip}
        />
      </div>

      <div className="flex-1 relative min-h-screen">
        <WelcomeVideo  videoSrc="../../../static/videos/index.mp4"/>

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 text-6xl animate-float">🌸</div>
          <div className="absolute bottom-20 right-10 text-6xl animate-float delay-1000">✨</div>
          <div className="absolute top-40 right-20 text-4xl animate-spin-slow">🎀</div>
          <div className="absolute bottom-40 left-20 text-5xl animate-bounce-slow">⭐</div>
        </div>

      </div>

    </div>
  )
}
