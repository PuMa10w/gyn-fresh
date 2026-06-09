import React from 'react';
import ReactDOM from 'react-dom/client';
import { MotionConfig } from 'framer-motion';
import { HelmetProvider } from 'react-helmet-async';
import './index.css';
import App from './App';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element was not found');
}

const resetReviewCaches = async () => {
  const params = new URLSearchParams(window.location.search);
  const isReviewSession = params.has('review') || params.has('clean');
  const isProductionCacheReset = !isReviewSession && params.get('cacheReset') === '1';

  if (!isReviewSession && !isProductionCacheReset) {
    return false;
  }

  const cacheToken = isProductionCacheReset
    ? `production:${import.meta.env.VITE_APP_COMMIT ?? 'local'}`
    : params.get('clean') || params.get('review') || 'local-preview';
  const flag = isProductionCacheReset
    ? `gyn-production-cache-reset:${cacheToken}`
    : `gyn-review-cache-reset:${cacheToken}`;

  if (window.sessionStorage.getItem(flag)) {
    return false;
  }

  window.sessionStorage.setItem(flag, '1');

  await Promise.allSettled([
    'serviceWorker' in navigator
      ? navigator.serviceWorker.getRegistrations().then((registrations) => Promise.all(registrations.map((registration) => registration.unregister())))
      : Promise.resolve(),
    'caches' in window
      ? window.caches.keys().then((cacheNames) => Promise.all(cacheNames.map((cacheName) => window.caches.delete(cacheName))))
      : Promise.resolve(),
  ]);

  const nextUrl = new URL(window.location.href);
  if (isProductionCacheReset) {
    nextUrl.searchParams.delete('cacheReset');
    nextUrl.searchParams.delete('build');
  } else {
    nextUrl.searchParams.set('cacheReset', '1');
  }
  window.location.replace(nextUrl.toString());
  return true;
};

resetReviewCaches().then((isReloading) => {
  if (isReloading) {
    return;
  }

  const root = ReactDOM.createRoot(rootElement);

  root.render(
    <React.StrictMode>
      <HelmetProvider>
        <MotionConfig reducedMotion="user">
          <App />
        </MotionConfig>
      </HelmetProvider>
    </React.StrictMode>
  );
});
