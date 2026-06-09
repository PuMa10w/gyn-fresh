# GYNA Perfection Plan

## Summary

Цель - довести проект до production-grade уровня по двум направлениям:

- `clinical depth`: усилить и стандартизировать информацию во всех разделах сайта.
- `premium mobile UX`: улучшить дизайн, удобство и стабильность на современных iPhone.

Принятая стратегия:

- Сначала контентная надежность, затем UI-полировка.
- Глубина покрытия - 100% карточек и инструментов.
- Основной язык интерфейса и контента - русский.

## Content Standard

Для всех нозологий обязательны:

- `guidelineBasis`
- `diagnosticCriteria`
- `differentialDiagnosis`
- `managementAlgorithm`
- `followUpTriggers`
- `clinicalSummary`
- `lastReviewed`
- `guidelineStatus`

Для акушерских карточек дополнительно обязательны, если применимо:

- `timingOfDelivery`
- `maternalMonitoring`
- `fetalMonitoring`
- `deliveryIndications`
- `postpartumManagement`

Для фармакологии обязательны:

- `firstLineStatus`
- `pregnancyLactation`
- `monitoring`
- `clinicalUseCases`
- `majorPracticePoints`
- `comparativeRole`
- `routeAndSetting`
- `guidelineBasis`
- `lastReviewed`

Для опросников обязательны:

- `clinicalPurpose`
- `targetPopulation`
- `cutoffInterpretation`
- `nextStepByScore`
- `limitations`
- `evidenceNote`
- `guidelineBasis`
- `lastReviewed`

## UX Standard

Ключевые требования к мобильному интерфейсу:

- Нулевой горизонтальный overflow на `iPhone SE`, `iPhone 13/14`, `iPhone 15 Pro Max`.
- Корректная работа `safe-area` для notch и home indicator.
- Читаемые карточки и модальные окна без наложений текста.
- Крупные touch targets для навигации, вкладок, поиска и закрытия модалок.
- Sticky controls не должны перекрывать контент.
- Модальные окна должны работать как полноценные мобильные sheets.
- Дизайн должен сохранять премиальный медицинский характер: спокойная типографика, высокая читаемость, умеренная анимация, строгая иерархия.

## Implementation Priorities

1. Сохранить план и сделать автоматический аудит покрытия.
2. Внедрить безопасное обогащение недостающих контентных полей, чтобы 100% сущностей имели единый минимум.
3. Расширить отображение новых блоков в интерфейсе.
4. Укрепить mobile-first CSS и iPhone-аудит.
5. Прогнать `typecheck`, тесты, production build и визуальные проверки.
6. После успешных проверок выполнить деплой на Cloudflare Pages.

## Acceptance Criteria

- Все разделы сайта открываются без ошибок.
- Все карточки имеют единый клинический минимум.
- Опросники показывают не только score, но и назначение, ограничения и следующие шаги.
- Фармакология содержит клиническую роль, мониторинг, беременность/лактацию и сценарии применения.
- На iPhone нет горизонтальной прокрутки, наложений и сломанных touch-сценариев.
- Сборка и тесты проходят перед деплоем.

