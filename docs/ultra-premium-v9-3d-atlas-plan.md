# Ultra Premium V9 + 3D Atlas: опорный план реализации

## Цель
Довести GYN до ultra premium iPhone-first PWA: убрать абракадабру, стабилизировать CSS, сделать все разделы читаемыми, усилить DiseaseModal, фарму, опросники и заменить слабый 3D-модуль полноценным интерактивным атласом женской анатомии.

## Базовые правила
- Production: `master` -> Cloudflare Pages project `gyn-clinical` -> `https://gyn-clinical.pages.dev`.
- Основной язык интерфейса: русский.
- Визуальный стиль: strict peach/beige/rose/champagne с cocoa-контрастом.
- QR не возвращается.
- Runtime `repairText` остается safety net, но не основной способ исправления UI.
- Деплой только после зеленого `verify:premium` и визуальной проверки iPhone.

## Фазы
1. CSS foundation: design tokens, readable light/dark surfaces, минимум хаотичных overrides.
2. Mojibake zero: source audit + visible DOM audit + нормализация старого localStorage.
3. DiseaseModal: theme-aware `Кратко`, `Диагностика`, `УЗИ`, `Лечение`, `Ведение`, `Пациентке`, `Источники`, AI и 3D.
4. iPhone UX: компактный navbar, text-only bottom bar, safe-area, horizontal tabs, 44px touch targets.
5. Cards/catalog: контрастные headers, search, chips, disease cards без шумного CTA.
6. Pharma/questionnaires/home: no blank screens, professional result summaries, readable cards.
7. AI assistant: шаблонный клинический помощник без inline styles и без mojibake.
8. 3D atlas: новый `FemaleAnatomy3DAtlas`/`Organ3DViewer` на Three.js dependency, lazy, WebGL fallback, hotspots, linked modal tabs.
9. QA gates: typecheck, tests, content, ICD, source/visible mojibake, build, iPhone, overlap, pastel, a11y, visual, readability.

## 3D Atlas Contract
- Сцены: `Обзор`, `Матка`, `Яичники`, `Трубы`, `Беременность`, `Онкогинекология`, `УЗИ-срез`.
- Органы: матка, шейка, эндометрий, миометрий, яичники, трубы, влагалище, плацента/плодное яйцо.
- Hotspots: миома, эндометриоз, аденомиоз, полип, киста, СПКЯ, перекрут, внематочная беременность, низкая плацентация, ИЦН, онкориски.
- Каждый hotspot показывает орган, риск, клинический смысл и переход к связанному разделу карточки.
- 3D является обучающей схемой, не диагностическим инструментом.

## Acceptance
- Нет видимой абракадабры во всех основных flow.
- На iPhone SE/13/15 Pro Max нет horizontal overflow и перекрытий bottom bar.
- Фарма не пустая, препараты видны, поиск работает.
- DiseaseModal открывается сверху, вкладки читаются и скроллятся.
- 3D-атлас не пустой, работает rotate/zoom/reset/hotspot, есть WebGL fallback.
- `gyn-clinical.pages.dev` показывает свежую production-сборку.
