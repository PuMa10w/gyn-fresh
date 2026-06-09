# Content Blueprint

## Goal

Превратить каталог сайта из справочника в клиническую базу, где каждая сущность строится по `guideline-first` модели и опирается только на актуальные клинические протоколы `2025-2026`, а при отсутствии обновлений - на последний действующий guideline с явной пометкой `latest available active guideline`.

## Source Policy

### Allowed Sources

- `ACOG`
- `SMFM`
- `ASRM`
- `SGO`
- `NCCN`
- `ESHRE`
- `ESGO`
- `EAU`
- `FIGO`
- `RANZCOG`

### Fallback Rule

Если по теме нет документов `2025-2026`, использовать только последний действующий документ профильной организации и явно помечать его статус.

### Not Allowed As Primary Sources

- маркетинговые статьи
- SEO-агрегаторы
- patient leaflets как единственный источник
- старые narrative review вместо guideline
- вторичные пересказы без первичной ссылки на протокол

## Master Template: Disease

### Core Identity

- `id`
- `name`
- `icd`
- `subtitle`
- `description`
- `icon`

### Overview

- `definition`
- `overview.quickTake`
- `overview.prevalence`
- `overview.riskLevel`
- `overview.practiceFocus`

### Clinical Core

- `clinicalSummary.quickSummary`
- `clinicalSummary.redFlags`
- `clinicalSummary.firstLineActions`
- `clinicalSummary.diagnosticMinimum`
- `clinicalSummary.whenToEscalate`
- `clinicalSummary.clinicalPearls`

### New Mandatory Blocks

- `guidelineBasis`
- `diagnosticCriteria`
- `severityStratification`
- `differentialDiagnosis`
- `managementAlgorithm`
- `contraindicatedOrAvoid`
- `followUpTriggers`
- `patientCounseling`
- `specialPopulations`

### Existing Structured Blocks To Keep And Expand

- `epidemiology`
- `etiology`
- `symptoms`
- `classification`
- `diagnostics`
- `treatment`
- `ultrasound`
- `recommendations`
- `prognosis`
- `followUp`
- `clinicalCases`

## Disease Field Definitions

### `guidelineBasis`

Массив источников, каждый источник должен содержать:

- `organization`: `ACOG`, `ESHRE`, `RANZCOG` и т.д.
- `year`: `2025`, `2026` или год последнего активного документа
- `title`
- `documentType`: `Practice Bulletin`, `Guideline`, `Committee Opinion`, `Consensus`, `Position Statement`
- `scope`: кратко, что именно взято из документа
- `status`: `current` или `latest available active guideline`
- `usedFor`: например `diagnosis`, `treatment`, `delivery timing`, `follow-up`

### `diagnosticCriteria`

Рекомендуемая структура:

- `clinical`
- `laboratory`
- `imaging`
- `pathology`
- `diagnosisConfirmedWhen`
- `diagnosisExcludedWhen`
- `notes`

Поле должно давать ответ на вопрос: по каким критериям диагноз действительно ставится по guideline.

### `severityStratification`

Рекомендуемая структура:

- `title`
- `tiers`
  - `name`
  - `criteria`
  - `clinicalMeaning`
  - `managementImpact`

### `differentialDiagnosis`

Массив объектов:

- `condition`
- `whyConfused`
- `howToDistinguish`
- `testsIfNeeded`

Нужно покрывать реально конкурирующие диагнозы, а не теоретический максимум.

### `managementAlgorithm`

Рекомендуемая структура:

- `initialAssessment`
- `confirmDiagnosis`
- `startTreatment`
- `reassess`
- `escalateWhen`
- `referWhen`

Поле должно быть кратким и пригодным для быстрого чтения.

### `contraindicatedOrAvoid`

Массив тезисов:

- что не рекомендуется
- что устарело
- что не является первой линией
- что опасно в конкретной клинической ситуации

### `followUpTriggers`

Рекомендуемая структура:

- `routineReview`
- `earlierReviewIf`
- `switchTreatmentIf`
- `urgentReassessmentIf`

### `patientCounseling`

Массив тезисов:

- что сказать пациентке о диагнозе
- чего ожидать от лечения
- какие риски и ограничения важны
- когда срочно обращаться повторно

### `specialPopulations`

Рекомендуемая структура по подгруппам:

- `adolescents`
- `pregnancy`
- `postpartum`
- `perimenopause`
- `postmenopause`
- `obesity`
- `fertilityPlanning`

Заполняются только релевантные подблоки.

## Disease Content Rules

### Symptoms

Разделить на подгруппы:

- `typical`
- `early`
- `late`
- `alarm`
- `atypical`

### Diagnostics

Разделить на:

- `initialEvaluation`
- `requiredMinimum`
- `confirmatoryTests`
- `testsByIndication`
- `avoidOvertesting`

### Treatment

Разделить на:

- `firstLine`
- `secondLine`
- `proceduralOrSurgical`
- `inpatientManagement`
- `whatNotToDo`

### Follow-Up

Нужно явно указывать:

- сроки
- цели контроля
- критерии пересмотра тактики

## Master Template: Obstetrics Extensions

Для акушерских нозологий обязательны дополнительные поля:

- `timingOfDelivery`
- `maternalMonitoring`
- `fetalMonitoring`
- `inpatientVsOutpatient`
- `deliveryIndications`
- `postpartumManagement`

### `timingOfDelivery`

Рекомендуемая структура:

- `expectantManagementUntil`
- `deliverNowWhen`
- `gestationalAgeModifiers`
- `modeOfDeliveryNotes`

### `maternalMonitoring`

- vital signs
- labs
- warning symptoms
- reassessment interval

### `fetalMonitoring`

- ultrasound schedule
- doppler / CTG / BPP indications
- growth monitoring
- escalation triggers

## Master Template: Gynecology Extensions

Для гинекологических нозологий при необходимости добавлять:

- `fertilityImpact`
- `malignancyRisk`
- `recurrenceRisk`
- `screeningAndPrevention`
- `whenBiopsyNeeded`

## Master Template: Drug

### Core

- `id`
- `name`
- `nameEn`
- `category`
- `forms`
- `dosage`
- `indications`
- `contraindications`
- `sideEffects`
- `interactions`

### New Mandatory Drug Blocks

- `firstLineStatus`
- `pregnancyLactation`
- `monitoring`
- `clinicalUseCases`
- `majorPracticePoints`
- `comparativeRole`
- `routeAndSetting`
- `guidelineBasis`

### Drug Field Definitions

#### `firstLineStatus`

- `role`: `first-line`, `second-line`, `adjunct`, `reserve`
- `forConditions`
- `notFirstLineWhen`

#### `pregnancyLactation`

- `pregnancyStatus`
- `pregnancyNotes`
- `lactationStatus`
- `lactationNotes`
- `trimesterSpecificNotes`

#### `monitoring`

- `beforeStart`
- `duringTreatment`
- `stopOrReviewIf`

#### `clinicalUseCases`

Массив сценариев:

- `scenario`
- `whyChosen`
- `importantNotes`

#### `majorPracticePoints`

Краткие, клинически важные тезисы:

- частые ошибки назначения
- ситуации, где препарат часто трактуют неправильно
- ограничения по безопасности

#### `comparativeRole`

- `preferredOver`
- `lessUsefulThan`
- `chooseWhen`
- `avoidWhen`

#### `routeAndSetting`

- `route`
- `setting`: `outpatient`, `day care`, `inpatient`, `emergency`
- `prescriberLevel`

## Master Template: Questionnaire

### Core

- `id`
- `name`
- `fullName`
- `category`
- `description`
- `questions`
- `options`
- `scoring`

### New Mandatory Questionnaire Blocks

- `clinicalPurpose`
- `targetPopulation`
- `cutoffInterpretation`
- `nextStepByScore`
- `limitations`
- `evidenceNote`

### Questionnaire Field Definitions

#### `clinicalPurpose`

- `screening`
- `severityAssessment`
- `followUpUse`
- `triageUse`

#### `targetPopulation`

- `intendedFor`
- `notValidatedFor`
- `specialNotes`

#### `cutoffInterpretation`

Массив объектов:

- `range`
- `meaning`
- `clinicalAction`

#### `nextStepByScore`

- `low`
- `intermediate`
- `high`
- `critical`

#### `limitations`

Должно явно объяснять:

- что шкала не заменяет диагноз
- когда результат может быть ложно интерпретирован
- в каких группах она ограниченно применима

## Master Template: Ultrasound Block

### Core Structure

- `protocols`
- `findings`
- `imagingTips`
- `normalValues`

### New Ultrasound Blocks

- `pitfalls`
- `whenMRIorCTNeeded`
- `reportingChecklist`

### Ultrasound Field Definitions

#### `protocols`

Каждый протокол:

- `method`
- `indications`
- `preparation`
- `optimalTiming`
- `limitations`

#### `findings`

Каждая находка:

- `location`
- `description`
- `measurements`
- `normal`
- `pathology`
- `clinicalSignificance`

#### `pitfalls`

Массив коротких тезисов:

- типичные ошибки интерпретации
- когда УЗИ недостаточно
- что требует экспертного исследования

#### `whenMRIorCTNeeded`

- `indications`
- `whyEscalateImaging`

#### `reportingChecklist`

Массив обязательных пунктов, которые должны попасть в описание исследования.

## Clinical Case Format

Для всех новых и обновляемых кейсов использовать единый формат:

- `presentation`
- `history`
- `findings`
- `decisionPoints`
- `diagnosis`
- `treatment`
- `whyThisPlan`
- `outcome`
- `guidelineJustification`

## Editorial Quality Gates

Карточка проходит QA только если:

1. Есть `guidelineBasis`.
2. Указан год и организация источника.
3. Есть критерии диагноза, а не только описание.
4. Есть дифдиагноз.
5. Есть алгоритм действий.
6. Есть раздел, что не делать.
7. Follow-up описан сроками и триггерами.
8. Нет формулировок без практической ценности.
9. Формулировки не противоречат действующим полям карточки.

## Minimal Upgrade Order Per Card

1. Проверить актуальный guideline.
2. Добавить `guidelineBasis`.
3. Обновить `diagnosticCriteria`.
4. Обновить `managementAlgorithm`.
5. Добавить `differentialDiagnosis`.
6. Добавить `contraindicatedOrAvoid`.
7. Усилить follow-up и counseling.
8. Проверить согласованность с фармакологией и опросниками.
