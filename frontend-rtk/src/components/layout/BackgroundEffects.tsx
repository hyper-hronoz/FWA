export default function BackgroundEffects() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <div className="absolute top-20 left-10 text-6xl animate-float opacity-20">
        🌸
      </div>

      <div className="absolute bottom-20 right-10 text-6xl animate-float opacity-20">
        ✨
      </div>

      <div className="absolute top-40 right-20 text-7xl animate-spin-slow opacity-10">
        🎀
      </div>

      <div className="absolute bottom-40 left-20 text-8xl animate-bounce-slow opacity-10">
        ⭐
      </div>
    </div>
  )
}

