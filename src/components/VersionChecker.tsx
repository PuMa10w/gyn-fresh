import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { PremiumButton } from './PremiumButton';
import { clinicalSourceStack } from '../config/clinicalSourceStack';

interface VersionInfo {
  version: string;
  releaseDate: string;
  changelog: string[];
}

interface VersionCheckerProps {
  currentVersion: string;
  currentCommit: string;
  buildTime: string;
  className?: string;
}

const RELEASE_NOTES = [
  'Сборка связана с актуальным production commit и показывает реальную версию в PWA-панели.',
  'Обновление очищает service worker, Workbox-кэш и перезагружает iPhone PWA без review-ссылок.',
  'Cloudflare headers разделяют app shell без кэша и hashed assets с immutable-кэшем.',
  'Production freshness audit проверяет HTML, assets, manifest и cache-control основного домена.',
];

const latestVersionFor = (currentVersion: string, buildTime: string): VersionInfo => ({
  version: currentVersion,
  releaseDate: buildTime.slice(0, 10),
  changelog: [
    ...RELEASE_NOTES,
  ],
});

type UpdateState = 'idle' | 'checking' | 'available' | 'updating' | 'updated' | 'error';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice?: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

const compareVersions = (v1: string, v2: string): number => {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);

  for (let i = 0; i < 3; i += 1) {
    if ((parts1[i] || 0) < (parts2[i] || 0)) return -1;
    if ((parts1[i] || 0) > (parts2[i] || 0)) return 1;
  }

  return 0;
};

export const VersionChecker: React.FC<VersionCheckerProps> = ({
  currentVersion,
  currentCommit,
  buildTime,
  className = '',
}) => {
  const [latestVersion, setLatestVersion] = useState<VersionInfo | null>(null);
  const [showChangelog, setShowChangelog] = useState(false);
  const [updateState, setUpdateState] = useState<UpdateState>('idle');
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isOnline, setIsOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine));
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem('gyn-db-last-sync');
  });
  const [lastSyncedCommit, setLastSyncedCommit] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem('gyn-db-last-commit');
  });

  const isChecking = updateState === 'checking';
  const isUpdating = updateState === 'updating';
  const isUpdateAvailable = updateState === 'available' || updateState === 'updated';

  const checkForUpdates = async () => {
    setUpdateState('checking');
    await new Promise((resolve) => window.setTimeout(resolve, 450));

    const latest = latestVersionFor(currentVersion, buildTime);
    setLatestVersion(latest);
    const hasNewCommit = Boolean(currentCommit && currentCommit !== 'local' && currentCommit !== lastSyncedCommit);
    setUpdateState(hasNewCommit || compareVersions(currentVersion, latest.version) <= 0 ? 'available' : 'updated');
  };

  useEffect(() => {
    void checkForUpdates();
    const interval = window.setInterval(() => void checkForUpdates(), 24 * 60 * 60 * 1000);
    return () => window.clearInterval(interval);
  }, [buildTime, currentCommit, currentVersion, lastSyncedCommit]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    const handleInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };
    const handleInstalled = () => setInstallPrompt(null);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('beforeinstallprompt', handleInstallPrompt);
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const refreshAppCache = async () => {
    setUpdateState('updating');

    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(async (registration) => {
          await registration.update();
          if (registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          }
        }));
      }

      if ('caches' in window) {
        const cacheNames = await window.caches.keys();
        await Promise.all(
          cacheNames
            .filter((cacheName) => /gyn|gynecology|workbox|precache|vite|pwa/i.test(cacheName))
            .map((cacheName) => window.caches.delete(cacheName)),
        );
      }

      const syncedAt = new Date().toISOString();
      window.localStorage.setItem('gyn-db-last-sync', syncedAt);
      window.localStorage.setItem('gyn-db-last-commit', currentCommit);
      setLastSyncAt(syncedAt);
      setLastSyncedCommit(currentCommit);
      setShowChangelog(false);
      setUpdateState('updated');

      const nextUrl = new URL(window.location.href);
      nextUrl.searchParams.set('cacheReset', '1');
      nextUrl.searchParams.set('build', currentCommit || currentVersion);
      window.setTimeout(() => window.location.replace(nextUrl.toString()), 650);
    } catch (error) {
      console.error('[VersionChecker] Не удалось обновить PWA-кэш:', error);
      setUpdateState('error');
    }
  };

  const installPwa = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    await installPrompt.userChoice?.catch(() => undefined);
    setInstallPrompt(null);
  };

  const lastSyncLabel = lastSyncAt
    ? new Intl.DateTimeFormat('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(lastSyncAt))
    : 'ещё не выполнялась';

  const buildLabel = currentCommit && currentCommit !== 'local'
    ? `${currentVersion} · ${currentCommit}`
    : currentVersion;

  return (
    <motion.section
      className={`version-checker glass ${className}`}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: 'easeOut' }}
      aria-live="polite"
    >
      <div className="version-checker-head">
        <div>
          <span className="version-kicker">PWA-контур</span>
          <h4>Система обновлений</h4>
        </div>

        <PremiumButton
          onClick={checkForUpdates}
          variant="ghost"
          size="sm"
          shimmer={false}
          disabled={isChecking || isUpdating}
        >
          {isChecking ? 'Проверяем...' : 'Проверить'}
        </PremiumButton>
      </div>

      <div className="version-meta-grid">
        <div>
          <span>Текущая сборка</span>
          <strong>{buildLabel}</strong>
        </div>
        <div>
          <span>Последняя синхронизация</span>
          <strong>{lastSyncLabel}</strong>
        </div>
        <div>
          <span>Сеть</span>
          <strong>{isOnline ? 'онлайн' : 'офлайн'}</strong>
        </div>
      </div>

      <div className="version-source-stack" aria-label="Редакционный source stack">
        <span>Source stack</span>
        <div>
          {clinicalSourceStack.map((source) => (
            source.url ? (
              <a className="version-source-link" href={source.url} target="_blank" rel="noreferrer" key={source.id}>
                <abbr title={`${source.scope}. Проверено: ${source.accessedAt}`}>{source.label}</abbr>
              </a>
            ) : (
              <abbr key={source.id} title={source.scope}>{source.label}</abbr>
            )
          ))}
        </div>
        <small>Высокорисковые утверждения без точной сверки маркируются как требующие ревизии.</small>
      </div>

      {installPrompt && (
        <div className="version-ready-state version-install-state">
          <span>Можно установить GYN как приложение на iPhone или рабочий стол.</span>
          <PremiumButton onClick={installPwa} variant="secondary" size="sm" shimmer={false}>
            Установить PWA
          </PremiumButton>
        </div>
      )}

      {isUpdateAvailable && latestVersion && (
        <motion.div
          className="version-update-card"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="version-update-title">
            <strong>{updateState === 'updated' ? 'PWA-кэш можно обновить' : 'Доступна свежая сборка'}</strong>
            <span>Версия {latestVersion.version} · {currentCommit}</span>
          </div>

          <p>Сборка от {latestVersion.releaseDate}. Обновление перезапрашивает service worker, очищает PWA-кэш и перезагружает приложение, чтобы iPhone получил свежий bundle.</p>

          <div className="version-actions">
            <PremiumButton onClick={() => setShowChangelog((value) => !value)} variant="secondary" size="sm" shimmer={false}>
              {showChangelog ? 'Скрыть детали' : 'Что изменилось'}
            </PremiumButton>
            <PremiumButton onClick={refreshAppCache} variant="primary" size="sm" shimmer={!isUpdating} disabled={isUpdating}>
              {isUpdating ? 'Очищаем кэш...' : 'Обновить базу'}
            </PremiumButton>
          </div>

          {showChangelog && (
            <motion.ul
              className="version-changelog"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
              {latestVersion.changelog.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </motion.ul>
          )}
        </motion.div>
      )}

      {updateState === 'updated' && latestVersion && (
        <div className="version-ready-state">
          Кэш очищен. Если страница не перезагрузилась автоматически, закройте и откройте GYN ещё раз.
        </div>
      )}

      {updateState === 'error' && (
        <div className="version-error-state">
          Не удалось обновить кэш автоматически. Проверьте сеть и нажмите «Проверить» ещё раз.
        </div>
      )}
    </motion.section>
  );
};
