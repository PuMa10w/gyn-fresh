import React from 'react';

interface ModalErrorBoundaryProps {
  children: React.ReactNode;
  title: string;
  onClose: () => void;
}

interface ModalErrorBoundaryState {
  error: Error | null;
}

const isChunkLoadError = (error: Error | null) => {
  const message = error?.message.toLowerCase() ?? '';
  return (
    message.includes('loading chunk') ||
    message.includes('failed to fetch dynamically imported module') ||
    message.includes('importing a module script failed') ||
    message.includes('module script load') ||
    message.includes('dynamically imported module')
  );
};

async function clearRuntimeCaches() {
  await Promise.allSettled([
    'serviceWorker' in navigator
      ? navigator.serviceWorker
          .getRegistrations()
          .then((registrations) => Promise.all(registrations.map((registration) => registration.unregister())))
      : Promise.resolve(),
    'caches' in window
      ? window.caches
          .keys()
          .then((cacheNames) => Promise.all(cacheNames.map((cacheName) => window.caches.delete(cacheName))))
      : Promise.resolve(),
  ]);
}

class ModalErrorBoundary extends React.Component<ModalErrorBoundaryProps, ModalErrorBoundaryState> {
  constructor(props: ModalErrorBoundaryProps) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): ModalErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error(`[ModalErrorBoundary] ${this.props.title} failed`, error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ error: null });
  };

  handleRefresh = async () => {
    await clearRuntimeCaches();
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set('cacheReset', '1');
    window.location.replace(nextUrl.toString());
  };

  render() {
    if (!this.state.error) return this.props.children;

    const chunkError = isChunkLoadError(this.state.error);

    return (
      <div className="modal-overlay" role="presentation">
        <section
          className="modal-content mobile-sheet premium-modal-recovery"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-recovery-title"
        >
          <button type="button" className="modal-close" onClick={this.props.onClose} aria-label="Закрыть окно">
            ×
          </button>
          <div className="premium-recovery-card">
            <span className="clinical-tool-eyebrow">Восстановление карточки</span>
            <h2 id="modal-recovery-title">
              {chunkError ? 'Нужно обновить PWA-кэш' : 'Карточка временно не открылась'}
            </h2>
            <p>
              Основной каталог остаётся доступным. Можно повторить открытие карточки или обновить локальный кэш, если
              iPhone держит старый bundle после деплоя.
            </p>
            <div className="premium-recovery-actions">
              <button type="button" className="premium-button premium-button--secondary" onClick={this.handleRetry}>
                Повторить
              </button>
              <button type="button" className="premium-button premium-button--primary" onClick={this.handleRefresh}>
                Обновить кэш
              </button>
            </div>
            <details className="premium-error-details">
              <summary>Технические детали</summary>
              <pre>{this.state.error.toString()}</pre>
            </details>
          </div>
        </section>
      </div>
    );
  }
}

export default ModalErrorBoundary;
