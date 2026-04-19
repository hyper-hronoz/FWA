import { useEffect, useRef, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom" 
import { useAppPaths } from "../../routing/AppPathsContext"

import type { User } from "@shared/Profile"
import type { NavbarProps } from "../../types/Navbar"

export default function Navbar({
  user,
  totalProfiles,
  onLogout
}: NavbarProps) {
  const [showMenu, setShowMenu] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const paths = useAppPaths()
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }

    window.addEventListener("pointerdown", handlePointerDown)

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown)
    }
  }, [])

  useEffect(() => {
    setShowMenu(false)
  }, [location.pathname])

  const navItems = [
    {
      label: "Свайп",
      path: paths.mainSwipe,
      isVisible: true
    },
    {
      label: "Лайкнутые",
      path: paths.liked,
      isVisible: true
    },
    {
      label: "Админ",
      path: paths.admin,
      isVisible: user.is_admin === true
    }
  ].filter((item) => item.isVisible)

  const isActiveRoute = (path: string) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`)

  return (
    <nav className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/55 backdrop-blur-2xl shadow-[0_1px_0_rgba(255,255,255,0.04),0_18px_45px_rgba(6,6,16,0.42)]">
      <div className="mx-auto flex max-w-[1600px] items-center gap-4 px-4 py-3 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={() => navigate(paths.mainSwipe)}
            className="group flex min-w-0 items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 transition hover:border-anime-primary/30 hover:bg-white/[0.05]"
          >
            <div className="h-10 w-10 rounded-2xl bg-[linear-gradient(135deg,rgba(255,105,180,0.26),rgba(59,130,246,0.16))] shadow-[0_0_30px_rgba(255,105,180,0.18)]" />
            <div className="min-w-0 text-left">
              <div className="truncate text-xl font-bold tracking-tight bg-gradient-to-r from-anime-primary via-pink-300 to-anime-secondary bg-clip-text text-transparent font-anime">
                Anime Love
              </div>
              <div className="truncate text-[11px] uppercase tracking-[0.28em] text-anime-textSoft/70">
                Аниме знакомства
              </div>
            </div>
          </button>

        </div>

        <div className="hidden flex-1 justify-center lg:flex">
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] p-1 shadow-inner shadow-black/20">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  isActiveRoute(item.path)
                    ? "bg-gradient-to-r from-anime-primary to-anime-secondary text-white shadow-[0_10px_35px_rgba(255,105,180,0.24)]"
                    : "text-anime-textSoft hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2 md:gap-3">
          <div className="hidden items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 sm:flex">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-anime-primary/85 to-anime-secondary/90 text-lg shadow-[0_8px_30px_rgba(255,105,180,0.24)]">
              {user.avatar || "👤"}
            </div>
            <div className="min-w-0 text-left">
              <div className="truncate text-sm font-semibold text-white">{user.username}</div>
              <div className="truncate text-xs text-anime-textSoft/70">{user.email}</div>
            </div>
          </div>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu((prev) => !prev)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-gradient-to-br from-anime-primary/80 to-anime-secondary/80 text-lg shadow-[0_12px_32px_rgba(155,89,182,0.25)] transition hover:scale-105 hover:shadow-[0_14px_36px_rgba(255,105,180,0.28)]"
              aria-label="User menu"
            >
              ⚙️
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-3 w-64 overflow-hidden rounded-[24px] border border-white/10 bg-slate-950/90 p-2 shadow-[0_20px_60px_rgba(5,5,15,0.48)] backdrop-blur-2xl animate-slide-up">
                <div className="mb-2 rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3 text-left sm:hidden">
                  <div className="text-sm font-semibold text-white">{user.username}</div>
                  <div className="text-xs text-anime-textSoft/70">{user.email}</div>
                </div>

                <button
                  onClick={() => navigate(paths.mainSwipe)}
                  className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-anime-textSoft transition hover:bg-white/[0.05] hover:text-white"
                >
                  <span>Главная</span>
                  <span className="text-white/60">↗</span>
                </button>

                <button
                  onClick={() => navigate(paths.liked)}
                  className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-anime-textSoft transition hover:bg-white/[0.05] hover:text-white"
                >
                  <span>Лайкнутые</span>
                  <span className="text-white/60">♥</span>
                </button>

                <button
                  onClick={() => navigate(paths.settings)}
                  className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-anime-textSoft transition hover:bg-white/[0.05] hover:text-white"
                >
                  <span>Настройки</span>
                  <span className="text-white/60">⚙</span>
                </button>

                {user["is_admin"] === true && (
                  <button
                    onClick={() => navigate(paths.admin)}
                    className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-anime-textSoft transition hover:bg-white/[0.05] hover:text-white"
                  >
                    <span>Админ-зона</span>
                    <span className="text-white/60">✦</span>
                  </button>
                )}

                <div className="my-2 h-px bg-white/8" />

                <button
                  onClick={onLogout}
                  className="flex w-full items-center justify-between rounded-2xl bg-gradient-to-r from-rose-500/85 to-fuchsia-500/80 px-4 py-3 text-left font-semibold text-white shadow-[0_10px_30px_rgba(244,63,94,0.24)] transition hover:brightness-105"
                >
                  <span>Выйти</span>
                  <span>⇢</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
