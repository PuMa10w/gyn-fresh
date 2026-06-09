import React from 'react';
import { motion } from 'framer-motion';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  isRecovering: boolean;
}

function isChunkLoadError(error: Error | null) {
  if (!error) {
    return false;
  }

  const message = error.message.toLowerCase();
  return (
    message.includes('loading chunk') ||
    message.includes('failed to fetch dynamically imported module') ||
    message.includes('importing a module script failed') ||
    message.includes('module script load') ||
    message.includes('dynamically imported module')
  );
}

async function clearRuntimeCaches() {
  await Promise.allSettled([
    'serviceWorker' in navigator
      ? navigator.serviceWorker.getRegistrations().then((registrations) => Promise.all(registrations.map((registration) => registration.unregister())))
      : Promise.resolve(),
    'caches' in window
      ? window.caches.keys().then((cacheNames) => Promise.all(cacheNames.map((cacheName) => window.caches.delete(cacheName))))
      : Promise.resolve(),
  ]);
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, isRecovering: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, isRecovering: false };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('ErrorBoundary caught:', error, errorInfo);

    if (isChunkLoadError(error)) {
      void this.recoverFromStaleChunk();
    }
  }

  recoverFromStaleChunk = async (): Promise<void> => {
    const flag = 'gyn-chunk-recovery-v1';

    if (window.sessionStorage.getItem(flag)) {
      return;
    }

    window.sessionStorage.setItem(flag, '1');
    this.setState({ isRecovering: true });
    await clearRuntimeCaches();
    window.location.reload();
  };

  handleReset = async (): Promise<void> => {
    if (isChunkLoadError(this.state.error)) {
      this.setState({ isRecovering: true });
      await clearRuntimeCaches();
      window.location.reload();
      return;
    }

    this.setState({ hasError: false, error: null, isRecovering: false });
  };

  render() {
    if (this.state.hasError) {
      const chunkLoadError = isChunkLoadError(this.state.error);
      const title = chunkLoadError ? 'Приложение обновилось' : 'Нужно восстановить экран';
      const message = chunkLoadError
        ? 'Некоторые файлы приложения устарели в PWA-кэше. Мы очистим кэш и загрузим свежую версию.'
        : 'Произошла ошибка в текущем экране. Попробуйте восстановить интерфейс или обновить страницу.';
      const buttonText = this.state.isRecovering
        ? 'Обновляем...'
        : chunkLoadError
          ? 'Обновить свежую версию'
          : 'Попробовать снова';

      return (
        <motion.div
          className="error-container premium-error-container"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          role="alert"
        >
          <section className="premium-error-card" aria-labelledby="app-error-title">
            <span className="premium-error-mark" aria-hidden="true">!</span>
            <p className="catalog-status-eyebrow">GYN</p>
            <h1 id="app-error-title">{title}</h1>
            <p>{message}</p>
            <button type="button" className="premium-button premium-button--primary" onClick={this.handleReset} disabled={this.state.isRecovering}>
              {buttonText}
            </button>
            {this.state.error && (
              <details className="premium-error-details">
                <summary>Технические детали</summary>
                <pre>{this.state.error.toString()}</pre>
              </details>
            )}
          </section>
        </motion.div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
