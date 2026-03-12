import type { Profile } from "../../types/Profile"

type Props = {
  matches: Profile[]
  total: number
  onRestart: () => void
}

export default function FinishScreen({ matches, total, onRestart }: Props) {
  const successRate = Math.round((matches.length / total) * 100)

  const message = () => {
    if (matches.length === 0) return "😢 Не нашлось ни одной вайфу..."
    if (matches.length === 1) return "💖 Начало прекрасной истории!"
    if (matches.length === 2) return "🌸 Две половинки!"
    if (matches.length === 3) return "✨ Популярный отаку!"
    return "👑 Легендарный коллекционер сердец!"
  }

  return (
    <div className="text-center animate-slide-up">
      <h2 className="text-4xl md:text-5xl font-bold text-anime-text mb-4 font-anime">
        Анкеты закончились! 🌸
      </h2>

      <p className="text-xl text-anime-textSoft mb-10 font-cute">
        Ты просмотрел всех аниме-персонажей!
      </p>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-12">
        <StatCard
          icon="💕"
          value={matches.length}
          label="Всего мэтчей"
        />

        <StatCard
          icon="👀"
          value={total}
          label="Просмотрено"
        />

        <StatCard
          icon="💘"
          value={`${successRate}%`}
          label="Успешность"
        />
      </div>

      {/* Message */}
      <div className="bg-anime-card p-8 rounded-2xl max-w-lg mx-auto mb-8 border-2 border-anime-primary">
        <p className="text-xl text-anime-textSoft font-cute mb-4">
          {message()}
        </p>

        {matches.length > 0 && (
          <p className="text-anime-text">
            В твоем гареме уже{" "}
            <span className="text-anime-primary font-bold text-2xl">
              {matches.length}
            </span>{" "}
            человек!
          </p>
        )}
      </div>

      {/* Restart button */}
      <button
        onClick={onRestart}
        className="bg-gradient-to-r from-anime-primary to-anime-secondary text-white px-10 py-5 rounded-full font-bold text-xl hover:opacity-90 transition-all duration-300 transform hover:scale-110 shadow-2xl font-anime inline-flex items-center gap-3 group"
      >
        <span className="group-hover:animate-spin-slow">🌸</span>
        Начать заново
        <span className="group-hover:animate-spin-slow">✨</span>
      </button>
    </div>
  )
}

function StatCard({
  icon,
  value,
  label
}: {
  icon: string
  value: string | number
  label: string
}) {
  return (
    <div className="bg-anime-card p-6 rounded-2xl border-2 border-anime-primary border-opacity-30 transform hover:scale-105 transition-all duration-300">
      <div className="text-5xl mb-3">{icon}</div>
      <div className="text-3xl font-bold text-anime-primary">
        {value}
      </div>
      <div className="text-anime-textSoft">{label}</div>
    </div>
  )
}

