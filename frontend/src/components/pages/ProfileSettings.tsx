import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Save, UserRound, Mail, KeyRound, Cake } from "lucide-react"

import { useAuthContext, useLiked } from "@state/hooks"

export default function ProfileSettings() {
  const navigate = useNavigate()
  const { user, updateProfile, loading } = useAuthContext()
  const { likedProfiles } = useLiked()
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    age: 18,
    password: "",
  })
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    setFormData({
      username: user.username,
      email: user.email,
      age: user.age,
      password: "",
    })
  }, [user])

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target

    setFormData((prev) => ({
      ...prev,
      [name]: name === "age" ? Number(value) : value,
    }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setMessage(null)
    setError(null)

    const result = await updateProfile({
      username: formData.username.trim(),
      email: formData.email.trim(),
      age: formData.age,
      password: formData.password.trim() || undefined,
    })

    if (!result.success) {
      setError(result.error || "Не удалось обновить профиль")
      return
    }

    setMessage("Профиль обновлён")
    setFormData((prev) => ({ ...prev, password: "" }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-anime-background via-[#24183d] to-anime-card px-6 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-anime-text">Настройки профиля</h1>
            <p className="mt-2 text-sm text-anime-textSoft">
              Измени основные данные аккаунта.
            </p>
          </div>

          <button
            onClick={() => navigate("/swipe")}
            className="rounded-full bg-white/8 px-5 py-2 text-sm text-anime-text backdrop-blur-lg hover:bg-white/12"
          >
            Назад
          </button>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-anime-card/80 p-6 shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm text-anime-textSoft">
                <UserRound size={16} />
                Имя
              </span>
              <input
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-anime-text outline-none transition focus:border-anime-primary/60"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm text-anime-textSoft">
                <Mail size={16} />
                Email
              </span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-anime-text outline-none transition focus:border-anime-primary/60"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm text-anime-textSoft">
                <Cake size={16} />
                Возраст
              </span>
              <input
                type="number"
                min={18}
                max={120}
                name="age"
                value={formData.age}
                onChange={handleChange}
                className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-anime-text outline-none transition focus:border-anime-primary/60"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm text-anime-textSoft">
                <KeyRound size={16} />
                Новый пароль
              </span>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Оставь пустым, если менять не нужно"
                className="w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-anime-text outline-none transition focus:border-anime-primary/60"
              />
            </label>

            {message && (
              <div className="rounded-2xl border border-emerald-400/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                {message}
              </div>
            )}

            {error && (
              <div className="rounded-2xl border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-anime-primary to-anime-secondary px-5 py-3 text-white hover:brightness-110 disabled:opacity-60"
            >
              <Save size={18} />
              Сохранить изменения
            </button>
          </form>
        </div>

        <div className="mt-6 rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-anime-text">Твои лайкнутые тян</h2>
              <p className="mt-2 text-sm text-anime-textSoft">
                Эти данные переиспользуются здесь и на отдельной странице лайков.
              </p>
            </div>
            <div className="rounded-2xl bg-anime-primary/15 px-4 py-2 text-sm text-anime-text">
              Всего: {likedProfiles.length}
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            {likedProfiles.slice(0, 3).map((chan) => (
              <div
                key={chan.id}
                className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/10 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-anime-text">{chan.username}</p>
                  <p className="text-xs text-anime-textSoft">
                    {chan.age} лет • {chan.favoriteAnime}
                  </p>
                </div>
                <span className="text-xs text-anime-textSoft">
                  #{chan.interests.slice(0, 2).join(" • ") || "без интересов"}
                </span>
              </div>
            ))}

            {likedProfiles.length === 0 && (
              <div className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-sm text-anime-textSoft">
                Пока нет лайков. Они появятся здесь автоматически после свайпов.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
