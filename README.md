# GYN Clinical

Профессиональный iPhone-first PWA-справочник по гинекологии и акушерству на React, Vite и TypeScript.

## Clean Launch

Новая продуктовая линия начинается с версии `v1.0.0`.

Основной production-домен: `https://gyn-clinical.pages.dev`.

Старые проекты и домены `gyn-premium`, `gyn`, `gynecology`, `https://gyn-premium.pages.dev`, `https://gynecology.pages.dev` и `https://gyn-76a.pages.dev` считаются архивом. Новые production deploys туда не отправляются.

Новый GitHub source of truth должен быть отдельным репозиторием с чистой историей. Старый репозиторий не переписывается force-push, чтобы не ломать старые ссылки, checks и аудит.

## Локальный запуск

```bash
npm install
npm run dev
```

По умолчанию dev-сервер доступен на `http://localhost:3000`.

## Проверки качества

Перед production deploy обязательно запускать:

```bash
npm.cmd run typecheck
npm.cmd run test:run
npm.cmd run audit:content -- --strict
npm.cmd run audit:icd -- --strict
npm.cmd run audit:mojibake:source
npm.cmd run audit:source:utf8-ui
npm.cmd run build
npm.cmd run verify:premium
```

Дополнительные production/PWA проверки:

```bash
npm.cmd run audit:pwa:freshness
npm.cmd run audit:production:freshness
```

## Production deploy

Deploy выполняется только в Cloudflare Pages project `gyn-clinical`:

```bash
npm.cmd run build
npm.cmd run deploy:production
```

`deploy:production` содержит guard и откажется деплоить, если `wrangler.toml` указывает на legacy project `gyn`, `gynecology`, `gyn-premium` или другой неправильный target.

После deploy проверить:

```bash
npx.cmd wrangler pages deployment list --project-name gyn-clinical
npm.cmd run audit:production:freshness
```

## PWA обновление на iPhone

PWA-панель показывает реальную сборку `version + commit`. Кнопка `Обновить базу` обновляет service worker, очищает PWA-кэш, добавляет `cacheReset=1` и перезагружает приложение, чтобы iPhone получил свежий bundle.

Cloudflare headers настроены так:

- `/`, `/index.html`, `/sw.js`, `/registerSW.js`, `/manifest.webmanifest` не кэшируются агрессивно.
- `/assets/*` кэшируются как hashed immutable assets.

## Чистая история GitHub

Для clean launch используется новый репозиторий:

```bash
git remote remove origin
git remote add origin https://github.com/<owner>/gyn-clinical.git
git push -u origin master
```

Если нужен один root commit без старой истории, создать отдельную clean working copy и импортировать только актуальные source/config/docs файлы. Browser artifacts, logs, screenshots, `dist`, `test-results` и временные профили Chrome не переносить.

## Архитектура

- `src/App.tsx` - корневая композиция приложения и маршрутизация разделов.
- `src/components` - UI-компоненты, карточки, модальные окна и клинические инструменты.
- `src/hooks` - состояние темы, избранного, истории, каталога и модалок.
- `src/data` - нозологии, опросники и фармакология.
- `src/utils` - категоризация, enrichment, repair legacy text и вспомогательная логика.
- `scripts` - QA-аудиты, iPhone-проверки, PWA freshness и deploy guard.

## Рабочее правило

Не коммитить browser artifacts, временные профили Chrome, screenshots, logs и generated audit reports. Перед commit stage добавлять только намеренно изменённые source/config/script/docs файлы.
