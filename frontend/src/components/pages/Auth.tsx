import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { WelcomeVideo } from '../ui/WelcomeVideo'
import { useAuth } from '../../hooks/useAuth'
import { useAuthContext } from '../../context/AuthContext'
import AnimeLoading from "../ui/AnimeLoading.tsx"

import type { AuthProps } from '../../types/Auth.ts'

export default function Auth({ mode }: AuthProps) {
  const navigate = useNavigate()
  const {user, login, register, loading } = useAuthContext()
  const isLogin = mode === 'login'

  const [formData, setFormData] = useState({
    username: '',
    age: 18,
    email: '',
    password: '',
    confirmPassword: ''
  })

  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false)

  if (loading) return <AnimeLoading/>
  if (user) return <Navigate to="/swipe" replace />;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Starting...")
    setError('')

    if (!isLogin) {
      if (formData.password !== formData.confirmPassword) {
        console.log("Пароли не совпадали")
        setError('Пароли не совпадают, отаку-сан!')
        return
      }
      if (formData.age < 18) {
        console.log("Возраст!")
        setError('Вам должно быть 18+ для входа в мир аниме знакомств')
        return
      }

      const result = await register({
        username: formData.username,
        age: formData.age,
        email: formData.email,
        password: formData.password
      })

      if (!result.success) {
        setError(result.error!)
        return
      }

      navigate("/login");
    } else {
      const result = await login({
        email: formData.email,
        password: formData.password
      })

      if (!result.success) {
        if ('error' in result && result.error) {
          setError(result.error)
        } else {
          setError('Произошла неизвестная ошибка при входе')
        }
        return
      }
    }
  }

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-anime-background to-purple-900 flex">
      <div className="video flex-1 relative min-h-screen">
        <WelcomeVideo videoSrc="/videos/test1.mp4" />

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 text-6xl animate-float">🌸</div>
          <div className="absolute bottom-20 right-10 text-6xl animate-float delay-1000">✨</div>
          <div className="absolute top-40 right-20 text-4xl animate-spin-slow">🎀</div>
          <div className="absolute bottom-40 left-20 text-5xl animate-bounce-slow">⭐</div>
        </div>
      </div>

      <div className="w-[480px] min-h-screen overflow-y-auto bg-anime-card bg-opacity-80 backdrop-blur-lg border-l border-anime-primary border-opacity-30 shadow-2xl flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-slide-up">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-anime-primary to-anime-secondary bg-clip-text text-transparent font-anime animate-pulse-glow">
              Anime Love
            </h1>
            <p className="text-anime-textSoft mt-2 font-cute">
              {isLogin ? 'Вход в мир аниме знакомств' : 'Создание анкеты отаку'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-xl">👤</span>
                <input
                  type="text"
                  name="username"
                  placeholder="Ваше имя (как у персонажа аниме)"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full bg-anime-background text-anime-text rounded-lg pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-anime-primary border border-anime-primary border-opacity-20 font-cute"
                  required
                />
              </div>
            )}

            {!isLogin && (
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-xl">🎂</span>
                <input
                  type="number"
                  name="age"
                  min={18}
                  max={100}
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full bg-anime-background text-anime-text rounded-lg pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-anime-primary border border-anime-primary border-opacity-20 font-cute"
                  required
                />
              </div>
            )}

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
                type={showPassword ? 'text' : 'password'}
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
            )}

            {error && (
              <div className="bg-red-500 text-white bg-opacity-20 border border-red-500 text-red-500 p-3 rounded-lg text-center font-cute animate-pulse">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-anime-primary to-anime-secondary text-white py-3 rounded-lg font-bold text-lg hover:opacity-90 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl font-anime disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLogin ? '✨ Войти в мир аниме ✨' : '🌸 Создать анкету 🌸'}
            </button>
          </form>

          <p className="text-center mt-6 text-anime-textSoft text-sm font-cute">
            {isLogin ? 'Найди свою вайфу уже сегодня! ⭐' : 'Присоединяйся к тысячам отаку! 🎀'}
          </p>

          <div className="text-center mt-4">
            {isLogin ? (
              <button
                type="button"
                onClick={() => navigate('/auth/register')}
                className="text-anime-primary hover:underline font-cute"
              >
                Нет аккаунта? Создайте!
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate('/auth/login')}
                className="text-anime-primary hover:underline font-cute"
              >
                Уже есть аккаунт? Войти ✨
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
