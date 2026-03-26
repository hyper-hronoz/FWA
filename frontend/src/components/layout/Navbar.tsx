import { useState } from "react"
import { useNavigate } from "react-router-dom" 
import type { NavbarProps } from "../../types/Navbar"

export default function Navbar({
  user,
  totalProfiles,
  onLogout
}: NavbarProps) {
  const [showMenu, setShowMenu] = useState(false)
  const navigate = useNavigate()

  return (
    <nav className="bg-anime-card bg-opacity-80 backdrop-blur-lg border-b border-anime-primary border-opacity-30 sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">

        <h1 
          onClick={() => navigate("/")}
          className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-anime-primary via-pink-400 to-anime-secondary bg-clip-text text-transparent font-anime animate-pulse-glow cursor-pointer hover:opacity-80 transition-opacity duration-300"
        >
          Anime Love
        </h1>

        <div className="flex items-center gap-4 md:gap-6">

          <div className="flex items-center gap-3">

            <button
              onClick={() => navigate("/liked")}
              className="hidden md:inline px-4 py-2 bg-anime-primary hover:bg-anime-secondary text-anime-text rounded-lg font-cute transition-colors duration-300"
            >
              ❤️ Лайкнутые тян
            </button>

            <span className="hidden lg:inline rounded-full bg-white/10 px-3 py-1 text-xs text-anime-textSoft">
              Осталось анкет: {totalProfiles}
            </span>

            <span className="hidden sm:inline text-anime-textSoft font-cute">
              {user.username}
            </span>

            <span className="text-2xl">
              {user.avatar || "👤"}
            </span>

            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="w-10 h-10 rounded-full bg-gradient-to-r from-anime-primary to-anime-secondary flex items-center justify-center text-xl hover:scale-110 transition-transform duration-300 border-2 border-white border-opacity-30 focus:outline-none focus:ring-2 focus:ring-anime-primary"
                aria-label="User menu"
              >
                ⚙️
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-anime-card rounded-xl overflow-hidden shadow-2xl border border-anime-primary border-opacity-30 animate-slide-up z-50">
                  <button
                    onClick={() => {
                      navigate("/settings")
                      setShowMenu(false)
                    }}
                    className="w-full !rounded-none px-4 py-3 text-left text-white bg-anime-secondary hover:bg-[#8748a1] bg-[#8748e1] transition-colors duration-300 flex items-center gap-2 font-cute"
                  >
                    Settings
                  </button>

                  <button
                    onClick={() => {
                      onLogout()
                      setShowMenu(false)
                    }}
                    className="w-full !rounded-none px-4 py-3 text-left text-white bg-anime-secondary hover:bg-[#8748a1] bg-[#8748e1] transition-colors duration-300 flex items-center gap-2 font-cute group border-t border-anime-primary border-opacity-20"
                  >
                    Logout
                  </button>

                  {user["is_admin"] === true && (
                    <button
                      onClick={() => {
                        navigate("/admin")
                        setShowMenu(false)
                      }}
                      className="w-full !rounded-none px-4 py-3 text-left text-white bg-anime-secondary hover:bg-[#8748a1] bg-[#8748e1] transition-colors duration-300 flex items-center gap-2 font-cute group border-t border-anime-primary border-opacity-20"
                    >
                      Admin Panel
                    </button>
                  )}

                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
