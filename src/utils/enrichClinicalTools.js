import { repairText } from './textRepair.ts';

const REVIEW_DATE = '2026-05-18';

const hasText = (value) => typeof value === 'string' && value.trim().length > 0;
const cleanText = (value) => repairText(value).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const deepRepair = (value) => {
  if (typeof value === 'string') return repairText(value);
  if (Array.isArray(value)) return value.map(deepRepair);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [repairText(key), deepRepair(entry)]));
  }

  return value;
};
const toList = (value) => {
  if (Array.isArray(value)) {
    return value.map(cleanText).filter(Boolean);
  }

  return hasText(value) ? [cleanText(value)] : [];
};

const withListFallback = (value, fallback) => {
  const list = toList(value);
  return list.length > 0 ? list : fallback;
};

const getPrimaryIndication = (medication) => medication.indications?.[0] ?? medication.category ?? medication.name;

const inferRouteAndSetting = (medication) => {
  const forms = toList(medication.forms);
  const route = forms.length > 0 ? forms : ['Уточняется по лекарственной форме и клиническому сценарию.'];
  const emergencyKeywords = /окситоцин|транексам|магни|нифедипин|лабеталол|мизопростол/i;

  return {
    route,
    setting: emergencyKeywords.test(`${medication.name} ${medication.nameEn}`) ? ['inpatient', 'emergency'] : ['outpatient'],
    prescriberLevel: ['Назначается специалистом с учетом показаний, противопоказаний и локального протокола.'],
  };
};

const buildMedicationGuidelineFallback = (medication) => [
  {
    organization: 'Editorial guideline-first baseline',
    year: REVIEW_DATE.slice(0, 4),
    title: `Source-specific review required for ${medication.nameEn || medication.name}`,
    documentType: 'Quality marker',
    scope: 'Поле заполнено как редакционный маркер: перед клиническим использованием требуется сверка с профильным guideline по показанию.',
    status: 'requires source-specific review',
    usedFor: ['safety', 'monitoring', 'clinical role'],
  },
];

export const enrichMedication = (rawMedication) => {
  const medication = deepRepair(rawMedication);
  const primaryIndication = getPrimaryIndication(medication);

  return {
    ...medication,
    nameEn: medication.nameEn ?? medication.name,
    category: medication.category ?? 'Клинический препарат / схема',
    forms: toList(medication.forms),
    dosage: medication.dosage ?? { standard: 'Дозировка уточняется по показанию и локальному протоколу.' },
    indications: toList(medication.indications),
    contraindications: toList(medication.contraindications),
    sideEffects: toList(medication.sideEffects),
    firstLineStatus: {
      role: medication.firstLineStatus?.role ?? 'adjunct',
      forConditions: withListFallback(medication.firstLineStatus?.forConditions, [primaryIndication]),
      notFirstLineWhen: withListFallback(
        medication.firstLineStatus?.notFirstLineWhen,
        toList(medication.contraindications).slice(0, 3).length
          ? toList(medication.contraindications).slice(0, 3)
          : ['Есть противопоказания, высокий лекарственный риск или отсутствует подтвержденное показание.'],
      ),
    },
    pregnancyLactation: {
      pregnancyStatus: medication.pregnancyLactation?.pregnancyStatus ?? 'Требует индивидуальной оценки',
      pregnancyNotes: withListFallback(medication.pregnancyLactation?.pregnancyNotes, [
        'Решение при беременности принимается только после оценки срока, показания, альтернатив и профиля безопасности.',
      ]),
      lactationStatus: medication.pregnancyLactation?.lactationStatus ?? 'Требует индивидуальной оценки',
      lactationNotes: withListFallback(medication.pregnancyLactation?.lactationNotes, [
        'При лактации требуется сверка совместимости, дозы и наблюдения за ребенком.',
      ]),
      trimesterSpecificNotes: toList(medication.pregnancyLactation?.trimesterSpecificNotes),
    },
    monitoring: {
      beforeStart: withListFallback(medication.monitoring?.beforeStart, [
        'Проверить показание, противопоказания, аллергоанамнез и лекарственные взаимодействия.',
      ]),
      duringTreatment: withListFallback(medication.monitoring?.duringTreatment, [
        'Оценивать клинический ответ, переносимость и появление нежелательных реакций.',
      ]),
      stopOrReviewIf: withListFallback(medication.monitoring?.stopOrReviewIf, [
        'Пересмотреть терапию при тяжелой нежелательной реакции, отсутствии эффекта или появлении нового противопоказания.',
      ]),
    },
    clinicalUseCases:
      Array.isArray(medication.clinicalUseCases) && medication.clinicalUseCases.length > 0
        ? medication.clinicalUseCases.map((useCase) => ({
            scenario: cleanText(useCase.scenario),
            whyChosen: hasText(useCase.whyChosen)
              ? cleanText(useCase.whyChosen)
              : `Используется в сценарии: ${primaryIndication}.`,
            importantNotes: withListFallback(useCase.importantNotes, ['Сверить дозу, путь введения и противопоказания перед назначением.']),
          }))
        : [
            {
              scenario: primaryIndication,
              whyChosen: `Клиническая роль связана с показанием: ${primaryIndication}.`,
              importantNotes: ['Перед использованием требуется сверка дозировки, противопоказаний и локального протокола.'],
            },
          ],
    majorPracticePoints: withListFallback(medication.majorPracticePoints, [
      'Не использовать как автоматическую замену клиническому решению.',
      'Перед назначением сверить дозу, путь введения, противопоказания и взаимодействия.',
    ]),
    comparativeRole: {
      preferredOver: toList(medication.comparativeRole?.preferredOver),
      lessUsefulThan: toList(medication.comparativeRole?.lessUsefulThan),
      chooseWhen: withListFallback(medication.comparativeRole?.chooseWhen, [`Подходит, когда подтверждено показание: ${primaryIndication}.`]),
      avoidWhen: withListFallback(medication.comparativeRole?.avoidWhen, toList(medication.contraindications).slice(0, 3)),
    },
    routeAndSetting: {
      ...inferRouteAndSetting(medication),
      ...medication.routeAndSetting,
      route: withListFallback(medication.routeAndSetting?.route, inferRouteAndSetting(medication).route),
      setting: withListFallback(medication.routeAndSetting?.setting, inferRouteAndSetting(medication).setting),
      prescriberLevel: withListFallback(medication.routeAndSetting?.prescriberLevel, inferRouteAndSetting(medication).prescriberLevel),
    },
    guidelineBasis:
      Array.isArray(medication.guidelineBasis) && medication.guidelineBasis.length > 0
        ? medication.guidelineBasis
        : buildMedicationGuidelineFallback(medication),
    lastReviewed: medication.lastReviewed ?? REVIEW_DATE,
  };
};

export const enrichMedications = (medications) => medications.map(enrichMedication).map(deepRepair);

const questionnaireProfiles = {
  'phq-9': {
    purpose: ['Скрининг и оценка выраженности депрессивных симптомов.', 'Повторная оценка динамики на фоне наблюдения или лечения.'],
    population: ['Взрослые пациенты при подозрении на депрессивные симптомы.'],
    high: ['Оценить риск самоповреждения, функциональное нарушение и необходимость срочной консультации специалиста.'],
  },
  'gad-7': {
    purpose: ['Скрининг генерализованной тревоги и оценка выраженности тревожных симптомов.'],
    population: ['Взрослые пациенты с тревогой, напряжением, соматическими проявлениями тревоги.'],
    high: ['Рассмотреть консультацию специалиста и оценку коморбидной депрессии или суицидального риска.'],
  },
  epds: {
    purpose: ['Скрининг послеродовой депрессии и тревожных симптомов после родов.'],
    population: ['Беременные и родильницы в перинатальном периоде.'],
    high: ['Проверить ответы на вопросы о самоповреждении и организовать срочную маршрутизацию при риске.'],
  },
};

const buildCutoffs = (questionnaire) => {
  const maxScore = questionnaire.questions.length * Math.max(1, questionnaire.options.length - 1);

  return [
    { range: `0-${Math.floor(maxScore * 0.25)}`, meaning: 'Низкая выраженность по шкале.', clinicalAction: 'Плановое наблюдение с учетом клинического контекста.' },
    {
      range: `${Math.floor(maxScore * 0.25) + 1}-${Math.floor(maxScore * 0.6)}`,
      meaning: 'Промежуточная зона, требующая клинической интерпретации.',
      clinicalAction: 'Сопоставить результат с жалобами, анамнезом и функциональным нарушением.',
    },
    {
      range: `${Math.floor(maxScore * 0.6) + 1}-${maxScore}`,
      meaning: 'Высокая выраженность по шкале.',
      clinicalAction: 'Рассмотреть расширенную оценку, повторный контакт и профильную маршрутизацию.',
    },
  ];
};

const buildQuestionnaireGuidelineFallback = (questionnaire) => [
  {
    organization: 'Validated scale source / clinical guideline',
    year: REVIEW_DATE.slice(0, 4),
    title: `${questionnaire.name} validation and clinical interpretation review`,
    documentType: 'Quality marker',
    scope: 'Опросник требует использования валидированной версии, корректной шкалы подсчета и клинической интерпретации.',
    status: 'requires source-specific review',
    usedFor: ['screening', 'score interpretation', 'follow-up'],
  },
];

export const enrichQuestionnaire = (rawQuestionnaire) => {
  const questionnaire = deepRepair(rawQuestionnaire);
  const profile = questionnaireProfiles[questionnaire.id] ?? {};

  return {
    ...questionnaire,
    scoring: typeof questionnaire.scoring === 'function'
      ? (answers) => deepRepair(questionnaire.scoring(answers))
      : questionnaire.scoring,
    clinicalPurpose: {
      screening: withListFallback(questionnaire.clinicalPurpose?.screening, profile.purpose ?? ['Скрининг симптомов и первичная клиническая маршрутизация.']),
      severityAssessment: withListFallback(questionnaire.clinicalPurpose?.severityAssessment, ['Оценка выраженности симптомов по суммарному баллу.']),
      followUpUse: withListFallback(questionnaire.clinicalPurpose?.followUpUse, ['Повторное прохождение помогает оценивать динамику, но не заменяет клинический осмотр.']),
      triageUse: withListFallback(questionnaire.clinicalPurpose?.triageUse, ['Высокий балл или критический ответ требует очной клинической оценки.']),
    },
    targetPopulation: {
      intendedFor: withListFallback(questionnaire.targetPopulation?.intendedFor, profile.population ?? ['Пациенты, для которых шкала валидирована и клинически уместна.']),
      notValidatedFor: withListFallback(questionnaire.targetPopulation?.notValidatedFor, ['Группы вне валидированной версии шкалы и ситуации, где вопросник не соответствует клинической задаче.']),
      specialNotes: withListFallback(questionnaire.targetPopulation?.specialNotes, ['Результат интерпретируется вместе с анамнезом, осмотром и рисками безопасности.']),
    },
    cutoffInterpretation:
      Array.isArray(questionnaire.cutoffInterpretation) && questionnaire.cutoffInterpretation.length > 0
        ? questionnaire.cutoffInterpretation
        : buildCutoffs(questionnaire),
    nextStepByScore: {
      low: withListFallback(questionnaire.nextStepByScore?.low, ['Плановое наблюдение и повторная оценка при изменении симптомов.']),
      intermediate: withListFallback(questionnaire.nextStepByScore?.intermediate, ['Сопоставить балл с клиникой, факторами риска и функциональным нарушением.']),
      high: withListFallback(questionnaire.nextStepByScore?.high, profile.high ?? ['Рассмотреть профильную консультацию и более частый follow-up.']),
      critical: withListFallback(questionnaire.nextStepByScore?.critical, ['При риске самоповреждения, насилия, тяжелой боли или декомпенсации нужна срочная клиническая оценка.']),
    },
    limitations: withListFallback(questionnaire.limitations, [
      'Шкала не является самостоятельным диагнозом.',
      'Интерпретация может искажаться соматическими симптомами, острым стрессом, языковыми и культурными факторами.',
      'Критические ответы требуют отдельной оценки независимо от суммарного балла.',
    ]),
    evidenceNote: withListFallback(questionnaire.evidenceNote, [
      'Использовать только валидированную версию шкалы и актуальные правила подсчета.',
      'Клинические решения принимаются после сопоставления балла с жалобами, анамнезом и рисками.',
    ]),
    guidelineBasis:
      Array.isArray(questionnaire.guidelineBasis) && questionnaire.guidelineBasis.length > 0
        ? questionnaire.guidelineBasis
        : buildQuestionnaireGuidelineFallback(questionnaire),
    lastReviewed: questionnaire.lastReviewed ?? REVIEW_DATE,
  };
};

export const enrichQuestionnaires = (questionnaires) => questionnaires.map(enrichQuestionnaire);