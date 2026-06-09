import type {
  ClinicalPathwayStep,
  DifferentialDiagnosisItem,
  Disease,
  DiseaseAtlasHotspotContract,
  DiseaseClinicalSummary,
  DiseaseDiagnosticCriteria,
  DiseaseFollowUpTriggers,
  DiseaseManagementAlgorithm,
  DiseaseUltrasound,
  GuidelineReference,
  PatientExplanation,
} from '../types';
import { repairText } from './textRepair.ts';

const REVIEW_DATE = '2026-05-29';
const REVISION_DUE = '2026-08-29';
const SOURCE_ACCESSED_AT = '2026-05-31';

const SOURCE_URLS = {
  ACOG: 'https://www.acog.org/clinical',
  WHO: 'https://www.who.int/health-topics/sexual-and-reproductive-health-and-rights',
  RCOG_NICE: 'https://www.rcog.org.uk/guidance/browse-all-guidance/green-top-guidelines/',
  GYN_STACK: 'https://www.eshre.eu/Guidelines-and-Legal/Guidelines/Endometriosis-guideline?ContensisTextOnly=true',
  CDC_WHO: 'https://www.cdc.gov/std/treatment-guidelines/default.htm',
  MINZDRAV: 'https://cr.minzdrav.gov.ru/',
} as const;

const clean = (value: unknown) => repairText(String(value ?? '')).replace(/\s+/g, ' ').trim();

const hasValue = (value: unknown): boolean => {
  if (Array.isArray(value)) return value.length > 0;
  if (value && typeof value === 'object') return Object.keys(value).length > 0;
  return typeof value === 'string' ? value.trim().length > 0 : Boolean(value);
};

const firstText = (...values: unknown[]) => values.flatMap((value) => (Array.isArray(value) ? value : [value])).map(clean).find(Boolean) ?? '';

const isObstetrics = (disease: Disease) => clean(disease.subtitle).toLowerCase().includes('акушер');

const sourceStackFor = (disease: Disease): GuidelineReference[] => {
  const obstetrics = isObstetrics(disease);

  const base: GuidelineReference[] = obstetrics
    ? [
        {
          organization: 'ACOG',
          year: '2024-2026',
          title: 'Clinical Guidance по акушерским состояниям',
          documentType: 'clinical guidance',
          url: SOURCE_URLS.ACOG,
          accessedAt: SOURCE_ACCESSED_AT,
          scope: 'Диагностика, маршрутизация, ведение беременности и послеродового периода.',
          status: 'latest available active guideline',
          usedFor: ['diagnosis', 'management', 'triage'],
        },
        {
          organization: 'WHO',
          year: '2024-2026',
          title: 'Sexual and reproductive health guidance',
          documentType: 'guideline',
          url: SOURCE_URLS.WHO,
          accessedAt: SOURCE_ACCESSED_AT,
          scope: 'Безопасная маршрутизация, материнские риски и репродуктивное здоровье.',
          status: 'latest available active guideline',
          usedFor: ['triage', 'patient counseling'],
        },
        {
          organization: 'RCOG / NICE',
          year: '2024-2026',
          title: 'Green-top Guidelines и NICE maternity guidance',
          documentType: 'guideline',
          url: SOURCE_URLS.RCOG_NICE,
          accessedAt: SOURCE_ACCESSED_AT,
          scope: 'Акушерская тактика, осложнения беременности и критерии эскалации.',
          status: 'latest available active guideline',
          usedFor: ['management', 'follow-up'],
        },
      ]
    : [
        {
          organization: 'ESHRE / ESGO / NICE',
          year: '2022-2026',
          title: 'Guideline stack for gynecology care',
          documentType: 'guideline',
          url: SOURCE_URLS.GYN_STACK,
          accessedAt: SOURCE_ACCESSED_AT,
          scope: 'Диагностика, лечение, репродуктивное планирование и контроль риска.',
          status: 'latest available active guideline',
          usedFor: ['diagnosis', 'treatment', 'follow-up'],
        },
        {
          organization: 'ACOG',
          year: '2024-2026',
          title: 'Clinical Guidance по гинекологическим состояниям',
          documentType: 'clinical guidance',
          url: SOURCE_URLS.ACOG,
          accessedAt: SOURCE_ACCESSED_AT,
          scope: 'Клиническая маршрутизация, дифференциальный диагноз и практические ограничения.',
          status: 'latest available active guideline',
          usedFor: ['diagnosis', 'management'],
        },
        {
          organization: 'CDC / WHO',
          year: '2024-2026',
          title: 'STI and reproductive health guidance',
          documentType: 'guideline',
          url: SOURCE_URLS.CDC_WHO,
          accessedAt: SOURCE_ACCESSED_AT,
          scope: 'Инфекции, профилактика, консультирование и безопасные next steps.',
          status: 'latest available active guideline',
          usedFor: ['infection care', 'patient counseling'],
        },
      ];

  return [
    ...base,
    {
      organization: 'Минздрав РФ',
      year: '2024-2026',
      title: 'Рубрикатор клинических рекомендаций',
      documentType: 'national guideline registry',
      url: SOURCE_URLS.MINZDRAV,
      accessedAt: SOURCE_ACCESSED_AT,
      scope: 'Локальная сверка маршрутизации, терминологии и требований к очному ведению.',
      status: 'requires source-specific review',
      usedFor: ['localization', 'source review'],
    },
  ];
};

const buildClinicalSummary = (disease: Disease): DiseaseClinicalSummary => {
  const diagnosticStep = firstText(disease.diagnostics?.requiredMinimum, disease.diagnostics?.steps, disease.diagnostics?.markers, 'клиническая оценка');
  const firstLine = firstText(disease.treatment?.firstLine, disease.treatment?.conservative, 'персонализированная тактика после подтверждения диагноза');
  const warning = isObstetrics(disease)
    ? 'Любое ухудшение состояния матери, плода, кровотечение, выраженная боль или признаки инфекции требуют срочной очной оценки.'
    : 'Быстрое ухудшение, выраженная боль, кровотечение, лихорадка, онконастороженность или беременность требуют срочной очной оценки.';

  return {
    quickSummary: `${clean(disease.name)}: сначала подтвердите клиническую гипотезу через ${diagnosticStep}, затем выбирайте тактику с учетом риска, репродуктивных планов и статуса источников.`,
    redFlags: [warning, `Если картина не соответствует ожидаемому течению ${clean(disease.name).toLowerCase()}, нужен пересмотр диагноза и маршрутизации.`],
    firstLineActions: [`Минимальный старт: ${diagnosticStep}.`, `Первая практическая линия: ${firstLine}.`],
    diagnosticMinimum: [diagnosticStep, firstText(disease.diagnostics?.markers, 'лабораторная или инструментальная верификация по клиническому вопросу')],
    whenToEscalate: [warning, 'Эскалировать при неэффективности стартовой тактики, нетипичном течении или недостаточной уверенности источника.'],
    clinicalPearls: [
      'Решение должно опираться на сочетание жалоб, осмотра, визуализации и клинического риска, а не на один изолированный признак.',
      'Карточка содержит редакционный шаблон; точные назначения сверяйте с актуальными рекомендациями и локальными протоколами.',
    ],
  };
};

const buildDiagnosticCriteria = (disease: Disease): DiseaseDiagnosticCriteria => {
  const primary = firstText(disease.diagnostics?.steps, disease.diagnostics?.requiredMinimum, 'клинический осмотр и уточнение жалоб');
  const imaging = firstText(disease.diagnostics?.imaging, disease.ultrasound?.protocols?.map((item) => item.method), 'визуализация по показаниям');

  return {
    clinical: [
      `Жалобы, анамнез и объективные данные должны поддерживать гипотезу: ${clean(disease.name)}.`,
      'Оцените беременность, возраст, репродуктивные планы, онкориск, инфекционные риски и срочность состояния.',
    ],
    laboratory: [firstText(disease.diagnostics?.markers, 'лабораторные тесты назначаются по клинической гипотезе и риску осложнений')],
    imaging: [primary, imaging],
    diagnosisConfirmedWhen: ['Клиническая картина, минимальный набор обследований и динамика согласуются между собой.'],
    diagnosisExcludedWhen: ['Есть альтернативное состояние, которое лучше объясняет симптомы, осмотр или данные визуализации.'],
    notes: ['Критерии являются редакционным структурным шаблоном и требуют сверки с актуальной профильной рекомендацией для финального назначения.'],
  };
};

const buildDifferentialDiagnosis = (disease: Disease): DifferentialDiagnosisItem[] => {
  const primary = firstText(disease.diagnostics?.differential, 'альтернативная причина симптомов');
  return [
    {
      condition: primary,
      whyConfused: `Может имитировать ${clean(disease.name).toLowerCase()} по жалобам, осмотру или данным визуализации.`,
      howToDistinguish: 'Сопоставьте временной профиль симптомов, объективные данные, визуализацию и лабораторные маркеры.',
      testsIfNeeded: [firstText(disease.diagnostics?.steps, 'прицельное дообследование по клиническому вопросу')],
    },
    {
      condition: isObstetrics(disease) ? 'Другое акушерское осложнение с материнско-плодовым риском' : 'Ургентное, инфекционное или опухолевое состояние',
      whyConfused: 'Может требовать более быстрой маршрутизации, чем плановое ведение.',
      howToDistinguish: 'Ищите красные флаги, системные симптомы, беременность, кровотечение, лихорадку и признаки декомпенсации.',
      testsIfNeeded: ['очный осмотр, витальные показатели и профильная визуализация/лабораторная проверка по показаниям'],
    },
  ];
};

const buildManagementAlgorithm = (disease: Disease): DiseaseManagementAlgorithm => ({
  initialAssessment: [
    `Определить срочность и ведущую клиническую проблему при подозрении на ${clean(disease.name).toLowerCase()}.`,
    firstText(disease.diagnostics?.requiredMinimum, disease.diagnostics?.steps, 'выполнить минимальный диагностический набор'),
  ],
  confirmDiagnosis: [
    'Сверить клиническую гипотезу с данными осмотра, визуализации и лабораторного блока.',
    'Отметить, какие утверждения требуют source-specific review перед финальным назначением.',
  ],
  startTreatment: [firstText(disease.treatment?.firstLine, disease.treatment?.conservative, 'выбрать стартовую тактику после подтверждения диагноза')],
  reassess: ['Оценить ответ, переносимость и изменение риска; при сомнениях пересмотреть дифференциальный диагноз.'],
  escalateWhen: ['Эскалировать при красных флагах, беременности, нарастании симптомов, подозрении на осложнение или недостаточной уверенности источника.'],
  referWhen: [
    isObstetrics(disease)
      ? 'Направить в стационар/перинатальный центр при материнско-плодовом риске, кровотечении, гипертензии, инфекции или признаках декомпенсации.'
      : 'Направить к профильному специалисту или в стационар при ургентном течении, онконастороженности, выраженной боли, кровотечении или неэффективности первой линии.',
  ],
});

const buildFollowUpTriggers = (): DiseaseFollowUpTriggers => ({
  routineReview: ['Плановый контроль по клинической динамике, переносимости лечения и статусу источников.'],
  earlierReviewIf: ['Нарастают симптомы, появляется новый красный флаг, меняются репродуктивные планы или результаты обследований.'],
  switchTreatmentIf: ['Нет ожидаемого эффекта, появились нежелательные явления или исходная гипотеза стала менее вероятной.'],
  urgentReassessmentIf: ['Беременность, сильная боль, кровотечение, лихорадка, обморок, гемодинамическая нестабильность или подозрение на осложнение.'],
});

const buildUltrasound = (disease: Disease): DiseaseUltrasound => ({
  protocols: [
    {
      method: isObstetrics(disease) ? 'Акушерское УЗИ по сроку и клиническому вопросу' : 'Трансвагинальное/тазовое УЗИ по клиническому вопросу',
      indications: [
        `Уточнение диагноза и риска при ${clean(disease.name).toLowerCase()}.`,
        'Контроль динамики, осложнений и необходимости дополнительной визуализации.',
      ],
      optimalTiming: isObstetrics(disease) ? 'По сроку гестации и срочности состояния.' : 'С учетом дня цикла, симптомов и клинической срочности.',
      limitations: ['УЗИ не интерпретируется изолированно от жалоб, осмотра и лабораторных данных.'],
    },
  ],
  findings: [
    {
      location: isObstetrics(disease) ? 'матка, плод, плацента и придатки по показаниям' : 'матка, эндометрий, яичники, трубы и зона боли',
      description: 'Описать локализацию, размеры, контуры, эхоструктуру, сосудистый рисунок и признаки осложнений.',
      clinicalSignificance: 'Находки должны отвечать на вопрос: подтверждают ли они диагноз, меняют ли срочность и тактику.',
    },
  ],
  imagingTips: ['Сформулируйте клинический вопрос до исследования и проверьте, отвечает ли заключение на этот вопрос.'],
  normalValues: {},
  pitfalls: ['Не заменять клиническое решение одной УЗИ-находкой без контекста.', 'При несоответствии УЗИ и клиники нужна повторная оценка или другой метод визуализации.'],
  whenMRIorCTNeeded: ['Неясная картина, подозрение на распространенный процесс, осложнение, опухоль или расхождение УЗИ с клиникой.'],
  reportingChecklist: ['локализация', 'размеры', 'структура', 'васкуляризация', 'признаки осложнений', 'сравнение с предыдущими данными', 'рекомендации по дальнейшей визуализации'],
});

const buildPatientExplanation = (disease: Disease): PatientExplanation => ({
  plainLanguageSummary: `${clean(disease.name)} требует очной оценки, потому что похожие симптомы могут иметь разные причины и разную срочность.`,
  whatToWatch: ['усиление боли', 'кровотечение', 'лихорадка', 'слабость/обморок', 'ухудшение при беременности или после процедуры'],
  selfCareBoundaries: ['Не начинать рецептурное лечение самостоятельно и не откладывать очную оценку при красных флагах.'],
  whenToSeekCare: ['Срочно обратиться за медицинской помощью при выраженной боли, кровотечении, температуре, беременности или быстром ухудшении.'],
});

const buildPathway = (disease: Disease): ClinicalPathwayStep[] => [
  {
    title: 'Сначала оценить срочность',
    detail: firstText(disease.clinicalSummary?.redFlags, 'исключить красные флаги и состояния, требующие срочной маршрутизации'),
    priority: 'urgent',
    linkedTab: 'Кратко',
  },
  {
    title: 'Подтвердить гипотезу',
    detail: firstText(disease.diagnostics?.requiredMinimum, disease.diagnostics?.steps, 'собрать минимальный диагностический набор'),
    priority: 'attention',
    linkedTab: 'Диагностика',
  },
  {
    title: 'Выбрать тактику',
    detail: firstText(disease.treatment?.firstLine, disease.treatment?.conservative, 'начать первую линию только после клинической проверки'),
    priority: 'routine',
    linkedTab: 'Лечение',
  },
];

const buildHotspots = (disease: Disease): DiseaseAtlasHotspotContract[] => {
  const obstetrics = isObstetrics(disease);
  return [
    {
      id: `${disease.id}-primary-zone`,
      label: obstetrics ? 'Материнско-плодовый контур' : 'Зона клинического интереса',
      organ: obstetrics ? 'матка/плацента/плод' : 'матка/придатки/таз',
      clinicalMeaning: `Связано с диагностикой и маршрутизацией при ${clean(disease.name).toLowerCase()}.`,
      risk: 'attention',
      linkedTab: '3D атлас',
    },
    {
      id: `${disease.id}-urgent-marker`,
      label: 'Красные флаги',
      organ: obstetrics ? 'акушерский риск' : 'клинический риск',
      clinicalMeaning: 'Показывает признаки, при которых нужна срочная очная оценка.',
      risk: 'urgent',
      linkedTab: 'Кратко',
    },
  ];
};

export const applyClinicalSourceOverlay = <T extends Disease>(disease: T): T => {
  const guidelineBasis = hasValue(disease.guidelineBasis) ? disease.guidelineBasis : sourceStackFor(disease);
  const clinicalSummary = hasValue(disease.clinicalSummary) ? disease.clinicalSummary : buildClinicalSummary(disease);
  const diagnostics = disease.diagnostics ?? { steps: [], markers: '' };

  return {
    ...disease,
    editorialStatus: disease.editorialStatus ?? 'needs-source-review',
    sourceStack: disease.sourceStack?.length ? disease.sourceStack : sourceStackFor(disease),
    sourceDate: disease.sourceDate ?? REVIEW_DATE,
    revisionDue: disease.revisionDue ?? REVISION_DUE,
    sourceConfidence: disease.sourceConfidence ?? {
      level: 'requires-review',
      reviewedBy: 'GYN editorial safety overlay',
      note: 'Структура карточки усилена редакционным шаблоном; точные назначения и высокорисковые утверждения требуют сверки с актуальными рекомендациями.',
    },
    sourceQuality: disease.sourceQuality ?? {
      level: 'needs-source-review',
      label: 'Требует сверки источника',
      note: 'Карточка содержит безопасную клиническую структуру, но не должна заменять актуальную профильную рекомендацию.',
    },
    guidelineBasis,
    guidelineStatus: disease.guidelineStatus ?? 'requires source-specific review',
    lastReviewed: disease.lastReviewed ?? REVIEW_DATE,
    clinicalSummary,
    diagnosticCriteria: disease.diagnosticCriteria ?? buildDiagnosticCriteria({ ...disease, clinicalSummary, diagnostics }),
    differentialDiagnosis: disease.differentialDiagnosis?.length ? disease.differentialDiagnosis : buildDifferentialDiagnosis(disease),
    managementAlgorithm: disease.managementAlgorithm ?? buildManagementAlgorithm(disease),
    followUpTriggers: disease.followUpTriggers ?? buildFollowUpTriggers(),
    patientCounseling: disease.patientCounseling?.length ? disease.patientCounseling : [
      'Объяснить пациентке предполагаемую причину симптомов, план проверки диагноза и признаки срочного обращения.',
      'Подчеркнуть, что окончательная тактика зависит от очной оценки, результатов обследования и актуальных рекомендаций.',
    ],
    patientExplanation: disease.patientExplanation ?? buildPatientExplanation(disease),
    ultrasound: disease.ultrasound ?? buildUltrasound(disease),
    ultrasoundChecklist: disease.ultrasoundChecklist?.length ? disease.ultrasoundChecklist : [
      'клинический вопрос',
      'локализация и размеры',
      'эхоструктура',
      'васкуляризация',
      'признаки осложнений',
      'рекомендации по дальнейшей визуализации',
    ],
    clinicalPathway: disease.clinicalPathway?.length ? disease.clinicalPathway : buildPathway({ ...disease, clinicalSummary, diagnostics }),
    urgentPathway: disease.urgentPathway?.length ? disease.urgentPathway : [
      {
        title: 'Срочная очная оценка',
        detail: firstText(clinicalSummary.redFlags, 'красные флаги или быстрое ухудшение состояния'),
        priority: 'urgent',
        linkedTab: 'Кратко',
      },
    ],
    treatmentPathway: disease.treatmentPathway?.length ? disease.treatmentPathway : [
      {
        title: 'Первая линия после подтверждения',
        detail: firstText(disease.treatment?.firstLine, disease.treatment?.conservative, 'персонализированная тактика после подтверждения диагноза'),
        priority: 'attention',
        linkedTab: 'Лечение',
      },
    ],
    atlasScene: disease.atlasScene ?? (isObstetrics(disease) ? 'pregnancy-overview' : 'pelvic-overview'),
    atlasHotspots: disease.atlasHotspots?.length ? disease.atlasHotspots : buildHotspots(disease),
    aiPrompts: disease.aiPrompts ?? {
      clinicalPearls: clinicalSummary.clinicalPearls,
      differential: buildDifferentialDiagnosis(disease).map((item) => item.condition),
      workupPlan: diagnostics.requiredMinimum ?? diagnostics.steps,
      patientMemo: ['Сформировать краткую памятку без автономной диагностики и без финальных назначений без источника.'],
      triage: clinicalSummary.redFlags,
      followUp: ['Описать, когда нужен плановый и ранний повторный контакт.'],
      doctorQuestions: ['Какие красные флаги есть сейчас?', 'Какие данные подтверждают диагноз?', 'Что изменит тактику сегодня?'],
    },
  };
};

export const applyClinicalSourceOverlays = <T extends Disease>(diseases: T[]): T[] => diseases.map((disease) => applyClinicalSourceOverlay(disease));
