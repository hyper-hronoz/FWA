export default function BackgroundEffects() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,105,180,0.18),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(96,165,250,0.12),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(34,211,238,0.12),_transparent_24%),linear-gradient(180deg,_rgba(11,10,24,0.9),_rgba(19,16,33,0.96))]" />
      <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.18)_1px,transparent_1px)] [background-size:120px_120px]" />
      <div className="absolute left-[-12%] top-[8%] h-[360px] w-[360px] rounded-full bg-anime-primary/18 blur-[120px]" />
      <div className="absolute right-[-8%] top-[18%] h-[320px] w-[320px] rounded-full bg-sky-400/10 blur-[130px]" />
      <div className="absolute bottom-[-14%] left-[30%] h-[400px] w-[400px] rounded-full bg-anime-secondary/16 blur-[150px]" />

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
