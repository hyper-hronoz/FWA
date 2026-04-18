type Props = {
  title: string;
  description?: string;
  onRetry?: () => void;
  isRecovering?: boolean;
};

export function MicrofrontendFallback({ title, description, onRetry, isRecovering = false }: Props) {
  return (
    <div className="flex min-h-[520px] items-center justify-center px-6 py-12">
      <div className="relative max-w-2xl overflow-hidden rounded-[36px] border border-white/10 bg-slate-950/70 p-8 text-center shadow-[0_30px_100px_rgba(6,6,16,0.5)] backdrop-blur-2xl md:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,105,180,0.18),_transparent_40%),linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0))]" />
        <div className="relative">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[28px] border border-anime-primary/25 bg-anime-primary/10 text-5xl shadow-[0_0_40px_rgba(255,105,180,0.18)]">
            🛠️
          </div>
          <div className="mb-3 text-xs font-semibold uppercase tracking-[0.34em] text-anime-textSoft/65">
            Microfrontend Recovery
          </div>
          <h2 className="text-3xl font-bold text-white md:text-4xl">{title}</h2>
          <p className="mt-4 text-base leading-7 text-anime-textSoft">
            {description || "Один из микрофронтов сейчас недоступен. Похоже, что-то упало, скоро все починим."}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {onRetry && (
              <button
                onClick={onRetry}
                disabled={isRecovering}
                className="rounded-full bg-gradient-to-r from-anime-primary to-anime-secondary px-6 py-3 font-semibold text-white shadow-[0_14px_40px_rgba(255,105,180,0.24)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isRecovering ? "Переподключаем модуль..." : "Повторить подключение"}
              </button>
            )}
            <button
              onClick={() => window.location.reload()}
              className="rounded-full border border-white/12 bg-white/[0.04] px-6 py-3 font-semibold text-anime-textSoft transition hover:bg-white/[0.08] hover:text-white"
            >
              Обновить страницу
            </button>
          </div>
          <div className="mt-6 text-sm text-anime-textSoft/70">
            Host остается живым и может заново подключить remote без полной перезагрузки.
          </div>
        </div>
      </div>
    </div>
  );
}
