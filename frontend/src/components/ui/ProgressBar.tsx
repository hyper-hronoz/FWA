interface ProgressBarProps {
  currentIndex: number
  totalProfiles: number
  className?: string
  showLabels?: boolean
}

export default function ProgressBar({
  currentIndex,
  totalProfiles,
  className = "",
  showLabels = true
}: ProgressBarProps) {

  // защита от NaN / undefined / отрицательных значений
  const safeIndex = Number.isFinite(currentIndex) ? Math.max(0, currentIndex) : 0
  const safeTotal = Number.isFinite(totalProfiles) && totalProfiles > 0 ? totalProfiles : 1

  // нормализуем индекс чтобы не выйти за границы
  const normalizedIndex = Math.min(safeIndex, safeTotal)

  const progress = Math.max(
    0,
    Math.min(((normalizedIndex + 1) / safeTotal) * 100, 100)
  )

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      
      {showLabels && (
        <span className="text-anime-textSoft text-sm whitespace-nowrap">
          Прогресс
        </span>
      )}

      <div className="relative w-32 lg:w-48 h-2 bg-anime-background rounded-full overflow-hidden">

        <div
          className="h-full bg-gradient-to-r from-anime-primary to-anime-secondary transition-all duration-500"
          style={{ width: `${progress}%` }}
        />

        {/* glow effect */}
        <div className="absolute inset-0 bg-white/20 animate-pulse pointer-events-none" />

      </div>

      {showLabels && (
        <span className="text-anime-textSoft text-sm whitespace-nowrap">
          {Math.min(normalizedIndex + 1, safeTotal)}/{safeTotal}
        </span>
      )}

    </div>
  )
}
