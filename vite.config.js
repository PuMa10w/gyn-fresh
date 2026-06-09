import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const packageJson = JSON.parse(fs.readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

function readGitCommit() {
  try {
    return execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
  } catch {
    return process.env.CF_PAGES_COMMIT_SHA?.slice(0, 7) || 'local';
  }
}

const appCommit = process.env.CF_PAGES_COMMIT_SHA?.slice(0, 7) || readGitCommit();
const appVersion = process.env.CF_PAGES_COMMIT_SHA
  ? `${packageJson.version}+${process.env.CF_PAGES_COMMIT_SHA.slice(0, 7)}`
  : `${packageJson.version}+${appCommit}`;
const buildTime = process.env.BUILD_TIME || new Date().toISOString();

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'logo192.png', 'logo512.png'],
      manifest: {
        name: 'GYN Clinical - клинический справочник',
        short_name: 'GYN',
        description: 'Профессиональный клинический справочник по гинекологии и акушерству',
        theme_color: '#8d616c',
        background_color: '#fdf2f5',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '.',
        start_url: '.',
        prefer_related_applications: false,
        categories: ['medical', 'health', 'fitness'],
        lang: 'ru',
        icons: [
          {
            src: 'favicon.ico',
            sizes: '64x64 32x32 24x24 16x16',
            type: 'image/x-icon',
          },
          {
            src: 'logo192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: 'logo512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },
    }),
  ],
  esbuild: {
    loader: 'tsx',
    include: /src\/.*\.(ts|tsx|js|jsx)$/,
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'tsx',
        '.ts': 'tsx',
      },
      target: 'esnext',
    },
  },
  server: {
    port: 3000,
  },
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(appVersion),
    'import.meta.env.VITE_APP_COMMIT': JSON.stringify(appCommit),
    'import.meta.env.VITE_BUILD_TIME': JSON.stringify(buildTime),
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('framer-motion')) {
              return 'motion-vendor';
            }

            if (id.includes('three')) {
              return 'three-vendor';
            }

            if (id.includes('react-icons')) {
              return 'icons-vendor';
            }

            return 'vendor';
          }
        },
      },
    },
  },
});
