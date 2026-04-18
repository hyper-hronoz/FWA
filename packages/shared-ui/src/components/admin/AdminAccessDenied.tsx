import { ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuthContext } from "../../context/AuthContext";
import { useAppPaths } from "../../routing/AppPathsContext";

export default function AdminAccessDenied() {
  const navigate = useNavigate();
  const { user, logout } = useAuthContext();
  const paths = useAppPaths();

  return (
    <div className="min-h-screen bg-gradient-to-br from-anime-background via-[#221537] to-anime-card px-6 py-12">
      <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center">
        <div className="w-full overflow-hidden rounded-[36px] border border-white/10 bg-slate-950/70 p-8 text-center shadow-[0_30px_90px_rgba(5,5,15,0.48)] backdrop-blur-2xl md:p-12">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[28px] border border-amber-300/20 bg-amber-300/10 text-amber-100 shadow-[0_0_40px_rgba(251,191,36,0.15)]">
            <ShieldAlert size={40} />
          </div>

          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.34em] text-anime-textSoft/60">
            Access Restricted
          </p>
          <h1 className="mt-3 text-3xl font-bold text-white md:text-4xl">
            У этой учетной записи нет доступа к админ-зоне
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-anime-textSoft">
            Админский микрофронт загружается только для пользователей с ролью администратора.
            Сейчас ты вошел как <span className="font-semibold text-white">{user?.email}</span>.
          </p>

          <div className="mt-8 rounded-[28px] border border-white/8 bg-white/[0.04] px-6 py-5 text-left">
            <div className="text-sm font-semibold text-white">Что можно сделать</div>
            <div className="mt-3 space-y-2 text-sm leading-6 text-anime-textSoft">
              <p>1. Войти под аккаунтом, email которого включен в `backend/services/service-auth/src/config/admins.json`.</p>
              <p>2. Или добавить свой email в список админов и заново выполнить логин.</p>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              onClick={() => navigate(paths.mainSwipe)}
              className="rounded-full bg-gradient-to-r from-anime-primary to-anime-secondary px-6 py-3 font-semibold text-white shadow-[0_14px_40px_rgba(255,105,180,0.24)] transition hover:brightness-105"
            >
              Вернуться в приложение
            </button>
            <button
              onClick={logout}
              className="rounded-full border border-white/12 bg-white/[0.04] px-6 py-3 font-semibold text-anime-textSoft transition hover:bg-white/[0.08] hover:text-white"
            >
              Сменить аккаунт
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
