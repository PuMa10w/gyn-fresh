# Content Roadmap

## Goal

Системно углубить контент сайта по существующим разделам:

- `Гинекология`
- `Акушерство`
- `Фармакология`
- `Опросники`

Фокус - не расширение числа карточек, а повышение клинической полезности текущего каталога по документам `2025-2026` Европы, Америки и Австралии.

## Current Scope

- `139` гинекологических нозологий
- `115` акушерских нозологий
- `~70` фармакологических карточек
- `20` опросников

## Priority Matrix

### Very High Priority

- преэклампсия
- эклампсия
- HELLP-синдром
- гестационный диабет
- угроза преждевременных родов
- ПРПО
- послеродовое кровотечение
- предлежание плаценты
- отслойка плаценты
- задержка роста плода
- эндометриоз
- СПКЯ
- миома матки
- аномальные маточные кровотечения
- ВЗОМТ
- рак шейки матки
- менопаузальная гормональная терапия
- контрацепция
- антибиотики для гинекологических инфекций

### High Priority

- аденомиоз
- гиперплазия эндометрия
- цервициты и вагиниты
- онкогинекология второй линии приоритетов
- урогинекология
- гормональная фармакология
- антигипертензивные препараты при беременности
- утеротоники
- токолитики
- EPDS / PHQ-9 / GAD-7 / ICIQ-SF / FSFI / MENQOL

### Medium Priority

- редкие нозологии
- менее часто используемые препараты
- дополнительные опросники узкого профиля
- расширение кейсов по low-volume темам

## Implementation Waves

## Wave 1: Standardization

### Deliverables

- единый blueprint по сущностям
- единый checklist качества карточки
- единая источниковая политика
- единые требования к ultrasound-блокам

### Success Criteria

- команда использует одну схему полей
- новые карточки не создаются в произвольном формате
- есть однозначная логика, что считать завершенной карточкой

## Wave 2: High-Impact Obstetrics

### Topics

- hypertensive disorders of pregnancy
- postpartum hemorrhage
- placenta previa / abruption
- preterm labor / PPROM
- gestational diabetes
- fetal growth restriction

### Required Upgrades

- `diagnosticCriteria`
- `severityStratification`
- `managementAlgorithm`
- `timingOfDelivery`
- `maternalMonitoring`
- `fetalMonitoring`
- `postpartumManagement`
- `guidelineBasis`

### Expected Outcome

Карточки будут пригодны для быстрого клинического ориентирования, а не только для чтения описания.

## Wave 3: High-Impact Gynecology

### Topics

- endometriosis
- adenomyosis
- PCOS
- abnormal uterine bleeding
- fibroids
- endometrial hyperplasia
- PID
- cervical cancer
- menopause-related states

### Required Upgrades

- `differentialDiagnosis`
- `fertilityImpact`
- `malignancyRisk`
- `recurrenceRisk`
- `whenBiopsyNeeded`
- `managementAlgorithm`
- `guidelineBasis`

### Expected Outcome

Гинекологический раздел станет клинически более глубоким и удобным для маршрутизации.

## Wave 4: Pharmacology Layer

### Topics

- progesterone / progestins
- dienogest
- letrozole
- clomiphene
- metformin
- magnesium sulfate
- nifedipine
- labetalol
- oxytocin
- tranexamic acid
- LNG-IUS
- COC / POP
- azithromycin
- doxycycline
- ceftriaxone
- metronidazole

### Required Upgrades

- `firstLineStatus`
- `pregnancyLactation`
- `monitoring`
- `clinicalUseCases`
- `majorPracticePoints`
- `comparativeRole`
- `routeAndSetting`
- `guidelineBasis`

### Expected Outcome

Фармакология станет связанной с клиническими сценариями и перестанет быть только перечнем свойств препарата.

## Wave 5: Questionnaire Layer

### Topics

- EPDS
- PHQ-9
- GAD-7
- pain scales
- ICIQ-SF
- FSFI
- MENQOL

### Required Upgrades

- `clinicalPurpose`
- `targetPopulation`
- `cutoffInterpretation`
- `nextStepByScore`
- `limitations`
- `evidenceNote`

### Expected Outcome

Опросники начнут работать как инструмент маршрутизации и follow-up, а не только как score-calculator.

## Sprint Plan

## Sprint 1

1. Утвердить `docs/content-blueprint.md` как редакционный стандарт.
2. Утвердить перечень разрешенных guideline-источников.
3. Провести аудит top-30 карточек по шкале `A / B / C`.
4. Зафиксировать первую волну high-impact тем.

## Sprint 2

1. Обновить top-10 акушерских карточек.
2. Обновить top-8 гинекологических карточек.
3. Обновить top-12 фармакологических карточек.
4. Добавить `guidelineBasis` всем карточкам первой волны.

## Sprint 3

1. Унифицировать все `ultrasound`-блоки первой волны.
2. Добавить `diagnosticCriteria` и `differentialDiagnosis`.
3. Добавить `contraindicatedOrAvoid` и `followUpTriggers`.
4. Выравнять связь нозологий с препаратами.

## Sprint 4

1. Обновить оставшиеся карточки высокого приоритета.
2. Усилить опросники.
3. Проверить единообразие clinical cases.
4. Провести guideline QA по первой и второй волне.

## Sprint 5

1. Масштабировать стандарт на весь каталог.
2. Провести редакционный QA.
3. Подготовить регламент обновлений `2026+`.
4. Ввести флаг устаревания карточек по дате последнего пересмотра.

## Audit Model

Для каждой карточки использовать быструю оценку:

- `A`: структура сильная, нужен точечный guideline refresh
- `B`: нужна умеренная переработка нескольких ключевых блоков
- `C`: нужна глубокая переработка по шаблону

### Audit Questions

1. Есть ли актуальный guideline basis?
2. Есть ли четкие критерии диагноза?
3. Есть ли дифференциальный диагноз?
4. Есть ли практический алгоритм действий?
5. Есть ли раздел, что не рекомендуется?
6. Есть ли понятный follow-up?
7. Есть ли противоречия между разделами карточки?
8. Есть ли связь с фармакологическим модулем?

## Cross-Linking Rules

Каждая high-impact карточка должна ссылаться на:

- релевантные препараты
- релевантные опросники
- связанные заболевания
- смежные состояния для differential diagnosis

## Maintenance Policy

### Every Card Should Have

- `lastReviewed`
- `guidelineStatus`
- `guidelineBasis`

### Review Triggers

- выход нового документа 2025-2026 по теме
- изменение критериев диагноза
- изменение первой линии лечения
- изменение pregnancy/lactation safety
- изменение рекомендаций по срокам родоразрешения или follow-up

## Practical Next Step

Самый рациональный следующий шаг после принятия roadmap:

1. выбрать `10` акушерских карточек первой волны
2. выбрать `8` гинекологических карточек первой волны
3. выбрать `12` препаратов первой волны
4. внедрить в типы и данные новые обязательные поля
5. затем обновлять карточки кластерами, а не по одной случайным образом
