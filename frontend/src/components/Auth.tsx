import { useState, useEffect } from 'react'

interface AuthProps {
  onLogin: (user: { name: string, age: number, avatar?: string }) => void
}

export default function Auth({ onLogin }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    age: 18,
    email: '',
    password: '',
    confirmPassword: '',
    avatar: ''
  })
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Аниме-аватарки по умолчанию
  const defaultAvatars = [
    '🌸', '⭐', '✨', '🎀', '🍡', '🍒', '💫', '🌟'
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isLogin) {
      if (formData.password !== formData.confirmPassword) {
        setError('Пароли не совпадают, отаку-сан!')
        return
      }
      if (formData.age < 18) {
        setError('Вам должно быть 18+ для входа в мир аниме знакомств')
        return
      }
    }

    // Выбираем случайную аватарку если не выбрана
    const avatar = formData.avatar || defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)]
    
    onLogin({
      name: formData.name,
      age: formData.age,
      avatar: avatar
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-anime-background to-purple-900 flex items-center justify-center p-4">
      {/* Анимированные элементы фона */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 text-6xl animate-float">🌸</div>
        <div className="absolute bottom-20 right-10 text-6xl animate-float delay-1000">✨</div>
        <div className="absolute top-40 right-20 text-4xl animate-spin-slow">🎀</div>
        <div className="absolute bottom-40 left-20 text-5xl animate-bounce-slow">⭐</div>
      </div>

      <div className="bg-anime-card bg-opacity-80 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md relative z-10 animate-slide-up shadow-2xl border border-anime-primary border-opacity-30">
        {/* Заголовок с анимацией */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-anime-primary to-anime-secondary bg-clip-text text-transparent font-anime animate-pulse-glow">
            Anime Love
          </h1>
          <p className="text-anime-textSoft mt-2 font-cute">
            {isLogin ? 'Вход в мир аниме знакомств' : 'Создание анкеты отаку'}
          </p>
        </div>

        {/* Переключатель режимов */}
        <div className="flex justify-center mb-8 bg-anime-background rounded-full p-1">
          <button
            className={`flex-1 py-2 px-4 rounded-full font-cute transition-all duration-300 ${
              isLogin 
                ? 'bg-gradient-to-r from-anime-primary to-anime-secondary text-white shadow-lg' 
                : 'text-anime-textSoft hover:text-white'
            }`}
            onClick={() => setIsLogin(true)}
          >
            Вход
          </button>
          <button
            className={`flex-1 py-2 px-4 rounded-full font-cute transition-all duration-300 ${
              !isLogin 
                ? 'bg-gradient-to-r from-anime-primary to-anime-secondary text-white shadow-lg' 
                : 'text-anime-textSoft hover:text-white'
            }`}
            onClick={() => setIsLogin(false)}
          >
            Регистрация
          </button>
        </div>

        {/* Форма */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-xl">
              {formData.avatar || '👤'}
            </span>
            <input
              type="text"
              name="name"
              placeholder="Ваше имя (как у персонажа аниме)"
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-anime-background text-anime-text rounded-lg pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-anime-primary border border-anime-primary border-opacity-20 font-cute"
              required
            />
          </div>

          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-xl">🎂</span>
            <input
              type="number"
              name="age"
              min="18"
              max="100"
              value={formData.age}
              onChange={handleChange}
              className="w-full bg-anime-background text-anime-text rounded-lg pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-anime-primary border border-anime-primary border-opacity-20 font-cute"
              required
            />
          </div>

          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-xl">📧</span>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-anime-background text-anime-text rounded-lg pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-anime-primary border border-anime-primary border-opacity-20 font-cute"
              required
            />
          </div>

          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-xl">🔒</span>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Пароль"
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-anime-background text-anime-text rounded-lg pl-12 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-anime-primary border border-anime-primary border-opacity-20 font-cute"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-anime-textSoft hover:text-anime-primary"
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>

          {!isLogin && (
            <>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-xl">🔒</span>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Подтвердите пароль"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full bg-anime-background text-anime-text rounded-lg pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-anime-primary border border-anime-primary border-opacity-20 font-cute"
                  required
                />
              </div>

              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-xl">🎨</span>
                <input
                  type="text"
                  name="avatar"
                  placeholder="Ваш аватар (эмодзи) или оставьте пустым"
                  value={formData.avatar}
                  onChange={handleChange}
                  className="w-full bg-anime-background text-anime-text rounded-lg pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-anime-primary border border-anime-primary border-opacity-20 font-cute"
                />
              </div>

              {/* Быстрый выбор аватарок */}
              <div className="flex gap-2 justify-center flex-wrap">
                {defaultAvatars.map(avatar => (
                  <button
                    key={avatar}
                    type="button"
                    onClick={() => setFormData({...formData, avatar})}
                    className="text-2xl hover:scale-150 transition-transform duration-300 hover:animate-heart-beat"
                  >
                    {avatar}
                  </button>
                ))}
              </div>
            </>
          )}

          {error && (
            <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-500 p-3 rounded-lg text-center font-cute animate-pulse">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-anime-primary to-anime-secondary text-white py-3 rounded-lg font-bold text-lg hover:opacity-90 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl font-anime"
          >
            {isLogin ? '✨ Войти в мир аниме ✨' : '🌸 Создать анкету 🌸'}
          </button>
        </form>

        {/* Забавный текст */}
        <p className="text-center mt-6 text-anime-textSoft text-sm font-cute">
          {isLogin 
            ? 'Найди свою вайфу уже сегодня! ⭐' 
            : 'Присоединяйся к тысячам отаку! 🎀'}
        </p>
      </div>
    </div>
  )
}
