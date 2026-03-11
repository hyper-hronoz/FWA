import { useState, useEffect } from "react"
import { profiles } from "./data/profiles"
import ProfileCard from "./components/ProfileCard"
import MatchList from "./components/MatchList"
import Auth from "./components/Auth"
import { useSwipe } from "./hooks/useSwipe"
import type { Profile, User } from "./types/Profile"

function App() {
  const [index, setIndex] = useState(0)
  const [matches, setMatches] = useState<Profile[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [showMenu, setShowMenu] = useState(false)
  const [showWelcome, setShowWelcome] = useState(true)

  // Проверка авторизации при загрузке
  useEffect(() => {
    const savedUser = localStorage.getItem('animeUser')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    
    // Скрываем приветствие через 3 секунды
    const timer = setTimeout(() => setShowWelcome(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  const profile = profiles[index]

  const next = () => setIndex(prev => prev + 1)

  const handleLike = () => {
    setMatches([...matches, profile])
    next()
    
    // Анимация уведомления
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Новый лайк! ❤️', {
        body: `Ты лайкнул(а) ${profile.name}`,
        icon: profile.image,
        badge: profile.image
      })
    }

    // Вибрируем если поддерживается
    if (navigator.vibrate) {
      navigator.vibrate([50, 30, 50])
    }
  }

  const handleSkip = () => {
    next()
    
    if (navigator.vibrate) {
      navigator.vibrate(30)
    }
  }

  const handleLogin = (userData: User) => {
    setUser(userData)
    localStorage.setItem('animeUser', JSON.stringify(userData))
    
    // Запрос разрешения на уведомления
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('animeUser')
    setIndex(0)
    setMatches([])
  }

  // Хук для свайпов
  const { elementRef } = useSwipe({
    onLike: handleLike,
    onSkip: handleSkip
  })

  if (!user) {
    return <Auth onLogin={handleLogin} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-anime-background via-purple-900 to-pink-900 text-anime-text overflow-hidden">
      {/* Приветственное сообщение для нового пользователя */}
      {showWelcome && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 backdrop-blur-sm animate-fade-in">
          <div className="bg-anime-card p-8 rounded-2xl text-center max-w-md mx-4 border-4 border-anime-primary animate-float">
            <div className="text-6xl mb-4 animate-bounce">🌸</div>
            <h2 className="text-3xl font-bold text-anime-primary mb-2 font-anime">
              Добро пожаловать, {user.name}!
            </h2>
            <p className="text-anime-textSoft mb-4 font-cute">
              Пришло время найти свою вайфу!
            </p>
            <div className="flex justify-center gap-2 text-3xl">
              <span className="animate-spin-slow">✨</span>
              <span className="animate-bounce delay-100">💕</span>
              <span className="animate-pulse delay-200">⭐</span>
            </div>
          </div>
        </div>
      )}

      {/* Фоновые анимации */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 text-6xl animate-float opacity-20">🌸</div>
        <div className="absolute bottom-20 right-10 text-6xl animate-float opacity-20">✨</div>
        <div className="absolute top-40 right-20 text-7xl animate-spin-slow opacity-10">🎀</div>
        <div className="absolute bottom-40 left-20 text-8xl animate-bounce-slow opacity-10">⭐</div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-9xl animate-pulse opacity-5">💕</div>
      </div>

      {/* Навигация */}
      <nav className="bg-anime-card bg-opacity-80 backdrop-blur-lg border-b border-anime-primary border-opacity-30 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-anime-primary via-pink-400 to-anime-secondary bg-clip-text text-transparent font-anime animate-pulse-glow">
            Anime Love
          </h1>
          
          <div className="flex items-center gap-4 md:gap-6">
            {/* Прогресс бар */}
            <div className="hidden md:block">
              <div className="flex items-center gap-3">
                <span className="text-anime-textSoft text-sm">Прогресс:</span>
                <div className="w-32 lg:w-48 h-2 bg-anime-background rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-anime-primary to-anime-secondary transition-all duration-500 relative"
                    style={{ width: `${(index / profiles.length) * 100}%` }}
                  >
                    <div className="absolute inset-0 bg-white opacity-30 animate-pulse"></div>
                  </div>
                </div>
                <span className="text-anime-textSoft text-sm">
                  {index + 1}/{profiles.length}
                </span>
              </div>
            </div>

            {/* Мобильный прогресс */}
            <div className="md:hidden text-anime-textSoft text-sm">
              {index + 1}/{profiles.length}
            </div>

            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-anime-textSoft font-cute">
                {user.name}
              </span>
              <span className="text-2xl">{user.avatar || '👤'}</span>
              
              {/* Меню пользователя */}
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="w-10 h-10 rounded-full bg-gradient-to-r from-anime-primary to-anime-secondary flex items-center justify-center text-xl hover:scale-110 transition-transform duration-300 border-2 border-white border-opacity-30 focus:outline-none focus:ring-2 focus:ring-anime-primary"
                  aria-label="Меню пользователя"
                >
                  ⚙️
                </button>
                
                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-anime-card rounded-xl overflow-hidden shadow-2xl border border-anime-primary border-opacity-30 animate-slide-up z-50">
                    <div className="px-4 py-3 bg-gradient-to-r from-anime-primary to-anime-secondary bg-opacity-20">
                      <p className="text-sm text-anime-textSoft">В сети</p>
                      <p className="font-bold font-anime text-anime-text">{user.name}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-3 text-left text-anime-text hover:bg-anime-background transition-colors duration-300 flex items-center gap-2 font-cute group"
                    >
                      <span className="group-hover:animate-spin">🚪</span>
                      Выйти
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Основной контент */}
      <div className="container mx-auto px-4 py-4 md:py-8">
        {!profile ? (
          // Экран завершения
          <div className="text-center animate-slide-up">
            <div className="mb-8">
              <h2 className="text-4xl md:text-5xl font-bold text-anime-text mb-4 font-anime">
                Анкеты закончились! 🌸
              </h2>
              <p className="text-xl text-anime-textSoft mb-8 font-cute">
                Ты просмотрел всех аниме-персонажей!
              </p>
              
              {/* Статистика */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-12">
                <div className="bg-anime-card p-6 rounded-2xl border-2 border-anime-primary border-opacity-30 transform hover:scale-105 transition-all duration-300">
                  <div className="text-5xl mb-3 animate-float">💕</div>
                  <div className="text-3xl font-bold text-anime-primary">{matches.length}</div>
                  <div className="text-anime-textSoft">Всего мэтчей</div>
                </div>
                <div className="bg-anime-card p-6 rounded-2xl border-2 border-anime-primary border-opacity-30 transform hover:scale-105 transition-all duration-300">
                  <div className="text-5xl mb-3 animate-bounce-slow">👀</div>
                  <div className="text-3xl font-bold text-anime-primary">{profiles.length}</div>
                  <div className="text-anime-textSoft">Просмотрено</div>
                </div>
                <div className="bg-anime-card p-6 rounded-2xl border-2 border-anime-primary border-opacity-30 transform hover:scale-105 transition-all duration-300">
                  <div className="text-5xl mb-3 animate-pulse">💘</div>
                  <div className="text-3xl font-bold text-anime-primary">
                    {Math.round((matches.length / profiles.length) * 100)}%
                  </div>
                  <div className="text-anime-textSoft">Успешность</div>
                </div>
              </div>

              {/* Сообщение в зависимости от количества мэтчей */}
              <div className="bg-anime-card p-8 rounded-2xl max-w-lg mx-auto mb-8 border-2 border-anime-primary">
                <p className="text-xl text-anime-textSoft font-cute mb-4">
                  {matches.length === 0 && "😢 Не нашлось ни одной вайфу..."}
                  {matches.length === 1 && "💖 Начало прекрасной истории!"}
                  {matches.length === 2 && "🌸 Две половинки!"}
                  {matches.length === 3 && "✨ Популярный отаку!"}
                  {matches.length >= 4 && "👑 Легендарный коллекционер сердец!"}
                </p>
                {matches.length > 0 && (
                  <p className="text-anime-text">
                    В твоем гареме уже <span className="text-anime-primary font-bold text-2xl">{matches.length}</span> человек!
                  </p>
                )}
              </div>
            </div>

            {/* Кнопка сброса */}
            <button
              onClick={() => {
                setIndex(0)
                setMatches([])
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              className="bg-gradient-to-r from-anime-primary to-anime-secondary text-white px-10 py-5 rounded-full font-bold text-xl hover:opacity-90 transition-all duration-300 transform hover:scale-110 hover:rotate-2 shadow-2xl font-anime inline-flex items-center gap-3 group"
            >
              <span className="group-hover:animate-spin-slow">🌸</span>
              Начать заново
              <span className="group-hover:animate-spin-slow">✨</span>
            </button>
          </div>
        ) : (
          // Карточка профиля с рефом для свайпа
          <div ref={elementRef} className="transition-transform duration-100 ease-out">
            <ProfileCard
              profile={profile}
              onLike={handleLike}
              onSkip={handleSkip}
            />
          </div>
        )}
      </div>

      {/* Список мэтчей */}
      <MatchList matches={matches} />

      {/* Музыкальный плеер (пасхалка) */}
      <button
        onClick={() => {
          const audio = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3')
          audio.volume = 0.3
          audio.play().catch(() => {})
        }}
        className="fixed bottom-4 left-4 bg-anime-card p-3 rounded-full shadow-2xl border-2 border-anime-primary border-opacity-30 hover:scale-110 transition-all duration-300 z-40 group"
        aria-label="Включить музыку"
      >
        <span className="text-2xl group-hover:animate-spin">🎵</span>
      </button>

      {/* Кнопка возврата наверх */}
      {index > 2 && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-20 left-4 bg-anime-card p-3 rounded-full shadow-2xl border-2 border-anime-primary border-opacity-30 hover:scale-110 transition-all duration-300 z-40 animate-float"
          aria-label="Наверх"
        >
          <span className="text-2xl">⬆️</span>
        </button>
      )}
    </div>
  )
}

export default App
