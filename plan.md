# iPhone Adaptive Improvement Plan

## Goal
Довести мобильную версию сайта до уровня нативного premium-интерфейса для iPhone: без горизонтальных переполнений, наездов между секциями, рваных отступов, нестабильной навигации и перегруженных мобильных экранов.

## Primary Targets
- Чистая и стабильная верстка на iPhone без бокового скролла.
- Быстрая и удобная навигация большим пальцем.
- Компактные, но читаемые карточки нозологий.
- Нативное ощущение модалок и сложных экранов.
- Единый премиальный визуальный ритм на всех мобильных страницах.

## Device Focus

### Core iPhone widths
- `390px` — iPhone 12 / 13 / 14
- `393px` — iPhone 15 / 16
- `430px` — iPhone Pro Max / Plus

### Additional states
- portrait
- landscape
- Safari safe areas
- long-scroll screens
- modal-open screens

## Main Problems To Eliminate
1. Периодические переполнения по ширине.
2. Конфликты между fixed header, sticky controls и контентом.
3. Слишком тяжелая и местами нестабильная мобильная шапка.
4. Неровный вертикальный ритм между секциями и карточками.
5. Слишком крупные или хаотично собранные карточки нозологий.
6. Плохая адаптация длинного клинического контента в модалках.
7. Непоследовательное поведение touch-элементов.
8. Избыточный визуальный шум на маленьком экране.

## Work Sequence

### Phase 1. Mobile Audit
Цель: получить точную карту проблем, а не править вслепую.

Tasks:
1. Проверить главную страницу на `390px`, `393px`, `430px`.
2. Проверить каталог гинекологии и акушерства.
3. Проверить поиск, фильтры, карточки, избранное, историю.
4. Проверить модалки нозологий, фармакологию и опросники.
5. Зафиксировать:
   - где появляется горизонтальный скролл
   - где элементы наезжают друг на друга
   - где слишком маленькие или слишком плотные tap-зоны
   - где текст теряет читаемость

Files involved:
- `src/App.css`
- `src/App.tsx`
- `src/components/*`

### Phase 2. Stabilize Mobile Header
Цель: сделать шапку компактной, предсказуемой и удобной на iPhone.

Tasks:
1. Привести `navbar` к одной жесткой мобильной схеме.
2. Сохранить читаемый бренд без лишней высоты.
3. Разделить:
   - верхний уровень: бренд + тема
   - средний уровень: быстрые действия
   - нижний уровень: основные разделы
4. Убрать случайные переполнения кнопок по ширине.
5. Выровнять размеры touch-элементов до безопасного минимума `44px`.
6. Настроить мобильные размеры текста, чтобы кнопки не ломали сетку.

Files involved:
- `src/components/Navbar.tsx`
- `src/App.css`

### Phase 3. Rebuild iPhone Spacing System
Цель: убрать хаос в отступах и наездах между header, секциями и карточками.

Tasks:
1. Зафиксировать единый mobile offset от header до контента.
2. Убрать конфликтующие локальные `margin-top` и `padding-top`.
3. Настроить safe-area отступы сверху и снизу.
4. Привести секции к общему вертикальному ритму:
   - header -> intro
   - intro -> controls
   - controls -> cards
   - cards -> footer
5. Исключить случаи, когда sticky или fixed блоки перекрывают контент.

Files involved:
- `src/App.css`
- `src/App.tsx`

### Phase 4. Refine Home Screen For iPhone
Цель: сделать стартовый экран легким, премиальным и удобным для первого тапа.

Tasks:
1. Проверить композицию двух основных входов: гинекология и акушерство.
2. Упростить мобильную подачу заголовков и описаний.
3. Стабилизировать высоты и радиусы карточек разделов.
4. Убрать лишний шум из вторичных элементов.
5. Сделать CTA-поведение очевидным без лишних кнопок внутри карточек.
6. Сохранить премиальную асимметрию, но без перекоса на маленьком экране.

Files involved:
- `src/components/HomeSection.tsx`
- `src/config/appContent.ts`
- `src/App.css`

### Phase 5. Rebuild Catalog Controls
Цель: сделать каталог удобным для одной руки и быстрым в использовании.

Tasks:
1. Упростить блок поиска и фильтров под iPhone.
2. Проверить высоту и внутренние отступы поля поиска.
3. Убедиться, что clear-кнопка и счетчик результатов не давят на input.
4. Сделать chips фильтров компактными, но удобными.
5. Исключить конфликт между sticky controls и сеткой карточек.
6. Настроить поведение controls на длинном скролле.

Files involved:
- `src/components/SearchBar.tsx`
- `src/components/CategoryFilter.tsx`
- `src/components/CatalogSection.tsx`
- `src/App.css`

### Phase 6. Compact Disease Cards
Цель: добиться идеальной мобильной карточки нозологии.

Tasks:
1. Уменьшить карточки по высоте без потери читаемости.
2. Зафиксировать порядок и иерархию:
   - раздел
   - МКБ
   - сердечко
   - иконка
   - заголовок
   - описание
3. Проверить, что сердечко не конфликтует с кодом и title.
4. Поднять иконку туда, где она лучше читается визуально.
5. Стабилизировать перенос длинных названий.
6. Ограничить описание `clamp`-ом без рваного обрыва.
7. Добиться единого ритма для всех карточек в сетке.

Files involved:
- `src/components/DiseaseCard.tsx`
- `src/App.css`

### Phase 7. Fix Horizontal Overflow Globally
Цель: полностью убрать любой боковой скролл на iPhone.

Tasks:
1. Проверить все контейнеры на `100vw` и конфликтующие паддинги.
2. Проверить grid/flex-родителей на min-content overflow.
3. Проверить чипы, табы, шапку, модалки, таблицы, pills и action rows.
4. Настроить `min-width: 0` и `max-width: 100%` там, где это нужно.
5. Убедиться, что ни одна секция не вылезает за экран на `390px`.

Files involved:
- `src/App.css`
- `src/components/*`

### Phase 8. Rebuild Mobile Modals
Цель: сделать модалки похожими на аккуратные нативные iPhone sheets.

Tasks:
1. Проверить высоту, радиусы и safe-area-bottom.
2. Настроить шапку модалки и кнопки закрытия.
3. Привести quick summary, tabs и body к мобильной иерархии.
4. Сделать длинный контент комфортным для скролла.
5. Убрать переполнения в таблицах, карточках режимов и списках взаимодействий.
6. Настроить sticky/tab зоны так, чтобы они не конфликтовали с body.

Files involved:
- `src/components/DiseaseModal*`
- `src/components/PharmacologyModal*`
- `src/components/Questionnaire*`
- `src/App.css`

### Phase 9. Optimize Complex Screens
Цель: привести фармакологию и опросники к реальному мобильному использованию.

Tasks:
1. Перевести сложные desktop-сетки в вертикальные мобильные карточки.
2. Проверить длинные названия препаратов и режимов.
3. Упростить таблицы до мобильных stacked blocks.
4. Проверить кнопки навигации в опросниках.
5. Убедиться, что действия всегда доступны без визуального перегруза.

Files involved:
- `src/components/PharmacologyModal.tsx`
- `src/components/Questionnaire.tsx`
- `src/App.css`

### Phase 10. Final Visual Polish
Цель: чтобы мобильная версия выглядела не адаптированной, а специально спроектированной под iPhone.

Tasks:
1. Согласовать радиусы карточек, полей, табов и модалок.
2. Проверить плотность текста на мобильных экранах.
3. Выровнять размеры иконок, бейджей, сердечек и чипов.
4. Ослабить лишние тени и тяжелые эффекты на iPhone.
5. Сохранить клинически спокойную палитру без визуальной грязи.

Files involved:
- `src/App.css`
- `src/index.css`

## File Priority

### Highest priority
- `src/App.css`
- `src/components/Navbar.tsx`
- `src/components/HomeSection.tsx`
- `src/components/CatalogSection.tsx`
- `src/components/DiseaseCard.tsx`

### Medium priority
- `src/components/SearchBar.tsx`
- `src/components/CategoryFilter.tsx`
- `src/App.tsx`
- `src/config/appContent.ts`

### Final pass
- `src/components/DiseaseModal*`
- `src/components/PharmacologyModal*`
- `src/components/Questionnaire*`
- `src/index.css`

## Breakpoint Strategy

### Base desktop/tablet styles
- keep existing larger-screen layout stable

### Mobile layer 1
- `@media (max-width: 768px)`
- structural mobile layout

### Mobile layer 2
- `@media (max-width: 480px)`
- iPhone compact tuning

### If needed
- narrow override for `390px` class devices
- only for real issues, not by default

## Acceptance Criteria
1. На iPhone нет горизонтального скролла ни на одном основном экране.
2. Header всегда помещается в экран и не ломает layout.
3. Контент не уезжает под fixed/sticky элементы.
4. Карточки нозологий выглядят компактно и одинаково аккуратно.
5. Главная страница читается спокойно и выглядит премиально.
6. Модалки ощущаются нативно и не перегружены.
7. Опросники и фармакология полностью читаемы на iPhone.
8. Навигация и все tap-зоны удобны для пальца.
9. Не возникает ошибок перехода по карточкам и разделам.
10. После всех правок проходят:
    - `npm run test:run`
    - `npm run typecheck`
    - `npm run build`

## Final QA Checklist
- Главная на `390px`
- Главная на `430px`
- Каталог гинекологии на `390px`
- Каталог акушерства на `390px`
- Поиск и фильтры на узком экране
- Избранное
- История
- Открытие карточки нозологии
- Модалка болезни
- Опросники
- Фармакология
- Scroll-to-top
- Footer
- Portrait / landscape

## Execution Order
1. Mobile audit
2. Header stabilization
3. Offset and spacing system
4. Home screen polish
5. Catalog controls
6. Disease cards
7. Global overflow cleanup
8. Modal rebuild
9. Complex screen optimization
10. Final visual polish
11. QA
12. Deploy
