import { Component, Suspense, type ReactNode } from "react";

import { MicrofrontendFallback } from "./MicrofrontendFallback";

type Props = {
  children: ReactNode;
  title: string;
};

type State = {
  hasError: boolean;
};

class RemoteErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false
  };

  static getDerivedStateFromError() {
    return {
      hasError: true
    };
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.title !== this.props.title && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return <MicrofrontendFallback title={this.props.title} />;
    }

    return this.props.children;
  }
}

export function MicrofrontendBoundary({ children, title }: Props) {
  return (
    <RemoteErrorBoundary title={title}>
      <Suspense
        fallback={
          <div className="flex min-h-[320px] items-center justify-center text-anime-textSoft">
            Подключаем модуль...
          </div>
        }
      >
        {children}
      </Suspense>
    </RemoteErrorBoundary>
  );
}
