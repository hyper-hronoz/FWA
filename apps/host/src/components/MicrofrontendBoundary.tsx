import {
  Component,
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ComponentType,
  type ReactNode
} from "react";
import { useLocation } from "react-router-dom";

import { MicrofrontendFallback } from "./MicrofrontendFallback";

type Loader = () => Promise<{ default: ComponentType }>;

type Props = {
  loader: Loader;
  title: string;
  description?: string;
  loadingLabel?: string;
};

type ErrorBoundaryProps = {
  children: ReactNode;
  description?: string;
  isRecovering: boolean;
  onRetry: () => void;
  resetKeys: Array<unknown>;
  title: string;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

const areResetKeysEqual = (prevKeys: Array<unknown>, nextKeys: Array<unknown>) =>
  prevKeys.length === nextKeys.length && prevKeys.every((key, index) => Object.is(key, nextKeys[index]));

class RemoteErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false
  };

  static getDerivedStateFromError() {
    return {
      hasError: true
    };
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (this.state.hasError && !areResetKeysEqual(prevProps.resetKeys, this.props.resetKeys)) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <MicrofrontendFallback
          title={this.props.title}
          description={this.props.description}
          isRecovering={this.props.isRecovering}
          onRetry={this.props.onRetry}
        />
      );
    }

    return this.props.children;
  }
}

function RemoteLoadingCard({ loadingLabel }: { loadingLabel: string }) {
  return (
    <div className="flex min-h-[520px] items-center justify-center px-6 py-12">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-[36px] border border-white/10 bg-slate-950/70 p-8 shadow-[0_30px_100px_rgba(6,6,16,0.5)] backdrop-blur-2xl md:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,105,180,0.16),_transparent_36%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.12),_transparent_32%)]" />
        <div className="relative">
          <div className="mb-3 text-xs font-semibold uppercase tracking-[0.34em] text-anime-textSoft/65">
            Почти готово
          </div>
          <div className="text-3xl font-bold text-white md:text-4xl">{loadingLabel}</div>
          <p className="mt-4 max-w-xl text-base leading-7 text-anime-textSoft">
            Подготавливаем экран и загружаем нужный раздел. Обычно это занимает всего пару секунд.
          </p>

          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-anime-primary shadow-[0_0_18px_rgba(255,105,180,0.7)] animate-pulse" />
              <div className="h-3 flex-1 rounded-full bg-white/8">
                <div className="h-3 w-2/3 rounded-full bg-gradient-to-r from-anime-primary via-pink-300 to-anime-secondary animate-pulse" />
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-4 text-left">
                <div className="text-xs uppercase tracking-[0.24em] text-anime-textSoft/60">Соединение</div>
                <div className="mt-2 text-sm font-semibold text-white">Проверяем доступ</div>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-4 text-left">
                <div className="text-xs uppercase tracking-[0.24em] text-anime-textSoft/60">Данные</div>
                <div className="mt-2 text-sm font-semibold text-white">Синхронизация</div>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-4 text-left">
                <div className="text-xs uppercase tracking-[0.24em] text-anime-textSoft/60">Открытие</div>
                <div className="mt-2 text-sm font-semibold text-white">Запускаем экран</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MicrofrontendBoundary({
  loader,
  title,
  description,
  loadingLabel = "Подключаем модуль..."
}: Props) {
  const location = useLocation();
  const [retryToken, setRetryToken] = useState(0);
  const [isRecovering, setIsRecovering] = useState(false);

  const RemoteComponent = useMemo(() => lazy(loader), [loader, retryToken]);

  useEffect(() => {
    setIsRecovering(false);
  }, [location.pathname, retryToken]);

  const handleRetry = useCallback(() => {
    setIsRecovering(true);
    setRetryToken((current) => current + 1);
  }, []);

  return (
    <RemoteErrorBoundary
      title={title}
      description={description}
      onRetry={handleRetry}
      isRecovering={isRecovering}
      resetKeys={[location.pathname, retryToken]}
    >
      <Suspense fallback={<RemoteLoadingCard loadingLabel={loadingLabel} />}>
        <RemoteComponent />
      </Suspense>
    </RemoteErrorBoundary>
  );
}
