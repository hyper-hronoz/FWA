type Props = {
  title: string;
  description?: string;
};

export function MicrofrontendFallback({ title, description }: Props) {
  return (
    <div className="flex min-h-[420px] items-center justify-center px-6 py-10">
      <div className="max-w-xl rounded-[32px] border border-rose-400/20 bg-white/8 p-8 text-center shadow-2xl backdrop-blur-xl">
        <div className="mb-4 text-5xl">🛠️</div>
        <h2 className="text-3xl font-bold text-white">{title}</h2>
        <p className="mt-4 text-base leading-7 text-anime-textSoft">
          {description || "Один из микрофронтов сейчас недоступен. Похоже, что-то упало, скоро все починим."}
        </p>
      </div>
    </div>
  );
}
