import type {
  DifferentialDiagnosisItem,
  Disease,
  DiseaseClinicalSummary,
  DiseaseDiagnosticCriteria,
  DiseaseFollowUpTriggers,
  DiseaseManagementAlgorithm,
  DiseaseOverview,
  DiseaseSeverityStratification,
  DiseaseSpecialPopulations,
  GuidelineReference,
  InpatientOutpatientPlan,
  MonitoringPlan,
  PatientExplanation,
  SourceQuality,
  TimingOfDelivery,
  UltrasoundFinding,
  UltrasoundProtocol,
} from '../types';
import { applyClinicalSourceOverlay } from './clinicalSourceOverlay';
import { repairText } from './textRepair';

type DiseaseInput = Disease & {
  diagnostics?: Disease['diagnostics'] | string[];
  treatment?: Partial<Disease['treatment']> & {
    guidelines?: Partial<Disease['treatment']['guidelines']>;
  };
};

type GynecologyCluster =
  | 'endometriosis'
  | 'uterine'
  | 'adnexal'
  | 'infection'
  | 'urogyne'
  | 'fertility'
  | 'endocrine'
  | 'oncology'
  | 'breast'
  | 'menopause'
  | 'vulvar'
  | 'general';

type ObstetricsCluster =
  | 'hypertension'
  | 'diabetes'
  | 'placenta'
  | 'preterm'
  | 'pregnancy-loss'
  | 'fetal'
  | 'infection'
  | 'postpartum'
  | 'thrombosis'
  | 'medical'
  | 'labor'
  | 'general';

const cleanText = (value: string) => repairText(value).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

const asStringArray = (value: unknown) =>
  Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string').map(cleanText) : [];

const withFallback = (value: string[] | undefined, fallback: string[]) => (value && value.length > 0 ? value : fallback);
const CURRENT_CONTENT_REVIEW_DATE = '2026-05-08';

const normalizeDiagnostics = (disease: DiseaseInput): Disease['diagnostics'] => {
  if (Array.isArray(disease.diagnostics)) {
    return {
      steps: asStringArray(disease.diagnostics),
      markers: 'Клиническая и инструментальная оценка в динамике.',
    };
  }

  const diagnostics = disease.diagnostics ?? { steps: [], markers: '' };

  return {
    steps: asStringArray(diagnostics.steps),
    markers:
      typeof diagnostics.markers === 'string' && diagnostics.markers.trim().length > 0
        ? cleanText(diagnostics.markers)
        : 'Клиническая и инструментальная оценка в динамике.',
    imaging: asStringArray(diagnostics.imaging),
    differential: asStringArray(diagnostics.differential),
  };
};

const normalizeTreatment = (disease: DiseaseInput): Disease['treatment'] => {
  const treatment = disease.treatment ?? { guidelines: { eau: '', acog: '', ranzcog: '', ru: '' } };
  const guidelines = (treatment.guidelines ?? {}) as Partial<Disease['treatment']['guidelines']>;

  return {
    conservative: asStringArray(treatment.conservative),
    surgical: asStringArray(treatment.surgical),
    firstLine: asStringArray(treatment.firstLine),
    secondLine: asStringArray(treatment.secondLine),
    proceduralOrSurgical: asStringArray(treatment.proceduralOrSurgical),
    inpatientManagement: asStringArray(treatment.inpatientManagement),
    whatNotToDo: asStringArray(treatment.whatNotToDo),
    guidelines: {
      eau: typeof guidelines.eau === 'string' ? cleanText(guidelines.eau) : '',
      acog: typeof guidelines.acog === 'string' ? cleanText(guidelines.acog) : '',
      ranzcog: typeof guidelines.ranzcog === 'string' ? cleanText(guidelines.ranzcog) : '',
      ru: typeof guidelines.ru === 'string' ? cleanText(guidelines.ru) : '',
    },
  };
};

const buildOverview = (disease: Disease): DiseaseOverview => ({
  quickTake: disease.clinicalSummary?.quickSummary ?? `${disease.name} требует структурированной оценки по симптомам, критериям диагноза и тактике ведения.`,
  prevalence: disease.epidemiology,
  riskLevel: disease.subtitle === 'Акушерство' ? 'high' : 'moderate',
  practiceFocus:
    disease.subtitle === 'Акушерство'
      ? 'Быстро оценить риски для матери и плода, подтвердить диагноз и определить сроки эскалации или родоразрешения.'
      : 'Подтвердить диагноз, исключить основные альтернативы и выбрать тактику с учетом симптомов, фертильности и онкорисков.',
});

const buildGuidelineBasis = (
  disease: Disease,
  guidelines: Disease['treatment']['guidelines'] = disease.treatment.guidelines,
): GuidelineReference[] => {
  const guidelineMap: Array<{ organization: string; summary?: string; usedFor: string[] }> = [
    { organization: disease.subtitle === 'Акушерство' ? 'WHO / SMFM / RCOG' : 'ESHRE / ESGO / European guidance', summary: guidelines.eau, usedFor: ['diagnosis', 'treatment'] },
    { organization: 'ACOG', summary: guidelines.acog, usedFor: ['diagnosis', 'treatment'] },
    { organization: disease.subtitle === 'Акушерство' ? 'RCOG / NICE / national obstetric guidance' : 'RANZCOG / Australian guidance', summary: guidelines.ranzcog, usedFor: ['diagnosis', 'treatment'] },
    { organization: 'Клинические рекомендации РФ / локальная маршрутизация', summary: guidelines.ru, usedFor: ['diagnosis', 'treatment'] },
  ];

  return guidelineMap
    .filter(({ summary }) => typeof summary === 'string' && summary.trim().length > 0)
    .map(({ organization, summary, usedFor }) => ({
      organization,
      year: '2023-2026',
      scope: cleanText(summary ?? ''),
      status: 'current',
      usedFor,
    }));
};

const buildDiagnosticCriteria = (disease: Disease): DiseaseDiagnosticCriteria => ({
  clinical: withFallback(
    disease.symptomGroups?.typical,
    [`Клиническая картина должна соответствовать типичным жалобам и признакам ${disease.name.toLowerCase()}.`],
  ),
  laboratory: [cleanText(disease.diagnostics.markers)],
  imaging: withFallback(disease.diagnostics.imaging, [cleanText(getPrimaryDiagnosticStep(disease))]),
  diagnosisConfirmedWhen: [
    `Клинические данные согласуются с диагнозом ${disease.name.toLowerCase()}.`,
    `Подтверждающие исследования соответствуют ожидаемой картине по guideline-first модели.`,
  ],
  diagnosisExcludedWhen: [
    `Объективные данные не поддерживают диагноз ${disease.name.toLowerCase()}.`,
    'Выявлено альтернативное состояние, лучше объясняющее симптомы и результаты обследования.',
  ],
  notes: ['Критерии диагноза требуют привязки к актуальному guideline при редакционном обновлении карточки.'],
});

const buildSeverityStratification = (disease: Disease): DiseaseSeverityStratification => ({
  title: disease.subtitle === 'Акушерство' ? 'Стратификация тяжести и акушерского риска' : 'Стратификация тяжести и клинического риска',
  tiers: [
    {
      name: 'Клинически стабильное течение',
      criteria: ['Нет признаков быстрой декомпенсации.', 'Возможна плановая диагностика и стартовая терапия первой линии.'],
      clinicalMeaning: 'Допустимо стандартное обследование и поэтапное ведение.',
      managementImpact: 'Наблюдение по плану с ранним контролем эффективности лечения.',
    },
    {
      name: 'Течение с повышенным риском',
      criteria: ['Есть красные флаги, атипичное течение или отсутствие ответа на стартовую тактику.'],
      clinicalMeaning: 'Требуется ускоренное уточнение диагноза и пересмотр маршрута.',
      managementImpact: 'Нужна эскалация диагностики, консультация профильного специалиста или госпитализация по показаниям.',
    },
  ],
});

const buildStructuredDifferential = (disease: Disease): DifferentialDiagnosisItem[] =>
  withFallback(disease.diagnostics.differential, buildDifferential(disease)).map((entry) => ({
    condition: cleanText(entry),
    whyConfused: `Может имитировать ${disease.name.toLowerCase()} по жалобам, данным осмотра или визуализации.`,
    howToDistinguish: 'Требует сопоставления клиники, подтверждающих тестов и динамики состояния.',
    testsIfNeeded: [cleanText(getPrimaryDiagnosticStep(disease))],
  }));

const buildManagementAlgorithm = (disease: Disease): DiseaseManagementAlgorithm => ({
  initialAssessment: [
    `Оценить жалобы, анамнез и клинические риски при подозрении на ${disease.name.toLowerCase()}.`,
    cleanText(getPrimaryDiagnosticStep(disease)),
  ],
  confirmDiagnosis: [
    'Подтвердить диагноз по совокупности клиники, лабораторных данных и визуализации.',
    cleanText(disease.diagnostics.markers),
  ],
  startTreatment: withFallback(disease.treatment.firstLine, withFallback(disease.treatment.conservative, [cleanText(getPrimaryTreatment(disease))])),
  reassess: ['Оценить клинический ответ, переносимость лечения и соответствие исходной гипотезы.'],
  escalateWhen: withFallback(disease.clinicalSummary?.whenToEscalate, ['Эскалировать при красных флагах, ухудшении состояния или отсутствии эффекта от первой линии.']),
  referWhen: [
    disease.subtitle === 'Акушерство'
      ? 'Направить в стационар или перинатальный центр при материнско-плодовом риске.'
      : 'Направить к профильному специалисту при сложном течении, неясном диагнозе или необходимости процедуры/операции.',
  ],
});

const buildFollowUpTriggers = (disease: Disease): DiseaseFollowUpTriggers => ({
  routineReview: [disease.followUp?.frequency ?? 'Контроль по стандартному плану наблюдения после старта терапии.'],
  earlierReviewIf: ['Симптомы нарастают, появляются красные флаги или ухудшается переносимость лечения.'],
  switchTreatmentIf: ['Нет клинического ответа на терапию первой линии или меняется профиль риска/цель лечения.'],
  urgentReassessmentIf: withFallback(disease.clinicalSummary?.redFlags, ['Появляются признаки осложненного или жизнеугрожающего течения.']),
});

const buildPatientCounseling = (disease: Disease) =>
  withFallback(disease.recommendations, [
    `Объяснить пациентке ожидаемое течение ${disease.name.toLowerCase()} и цель каждого этапа лечения.`,
    'Согласовать признаки, при которых нужно срочно обратиться повторно.',
  ]);

const buildSourceQuality = (disease: Disease): SourceQuality => {
  const hasSpecificGuidelines = Array.isArray(disease.guidelineBasis) && disease.guidelineBasis.length > 0;
  const hasStructuredClinicalFields = Boolean(
    disease.diagnosticCriteria &&
      disease.managementAlgorithm &&
      disease.followUpTriggers &&
      disease.clinicalSummary,
  );

  if (hasSpecificGuidelines && hasStructuredClinicalFields) {
    return {
      level: 'reviewed',
      label: 'Клиническая структура заполнена',
      note: 'Карточка содержит основные клинические блоки и привязку к источникам уровня карточки.',
    };
  }

  return {
    level: 'needs-source-review',
    label: 'Требует проверки источника',
    note: 'Runtime-enrichment даёт безопасную структуру; точные клинические утверждения нужно сверить с актуальными рекомендациями.',
  };
};

const buildPatientExplanation = (disease: Disease): PatientExplanation => ({
  plainLanguageSummary:
    disease.patientExplanation?.plainLanguageSummary ??
    `${disease.name}: краткое объяснение для пациентки должно помогать понять цель обследования, лечения и наблюдения без замены очной консультации.`,
  whatToWatch: withFallback(disease.patientExplanation?.whatToWatch, disease.clinicalSummary?.redFlags ?? [
    'Усиление боли, кровотечения, лихорадки, слабости или появление новых тревожных симптомов.',
  ]),
  selfCareBoundaries: withFallback(disease.patientExplanation?.selfCareBoundaries, [
    'Самонаблюдение допустимо только при стабильном состоянии и понятном плане follow-up.',
    'Не начинать рецептурное лечение и не откладывать очную оценку при красных флагах.',
  ]),
  whenToSeekCare: withFallback(disease.patientExplanation?.whenToSeekCare, disease.clinicalSummary?.whenToEscalate ?? [
    'Обратиться за медицинской помощью при ухудшении состояния, беременности, выраженной боли, кровотечении или признаках инфекции.',
  ]),
});
const buildSpecialPopulations = (disease: Disease): DiseaseSpecialPopulations => {
  if (disease.subtitle === 'Акушерство') {
    return {
      pregnancy: ['Тактика определяется балансом пользы и риска для матери и плода.'],
      postpartum: ['После родов требуется отдельная переоценка рисков, симптомов и показаний к продолжению терапии.'],
    };
  }

  return {
    adolescents: ['У подростков важно учитывать влияние на цикл, развитие и долгосрочную репродуктивную функцию.'],
    fertilityPlanning: ['При планировании беременности тактика должна учитывать влияние заболевания и лечения на фертильность.'],
    perimenopause: ['В перименопаузе требуется учитывать изменение онкорисков и профиль аномальных кровотечений.'],
  };
};

const buildTimingOfDelivery = (disease: Disease): TimingOfDelivery | undefined => {
  if (disease.subtitle !== 'Акушерство') {
    return undefined;
  }

  return {
    expectantManagementUntil: ['Беременность пролонгируют только пока это безопасно для матери и плода.'],
    deliverNowWhen: ['Родоразрешение показано при декомпенсации материнского состояния, ухудшении состояния плода или исчерпании безопасного окна ожидания.'],
    gestationalAgeModifiers: ['Срок гестации влияет на баланс между ожиданием, кортикостероидами, переводом и срочным родоразрешением.'],
    modeOfDeliveryNotes: ['Способ родоразрешения определяется акушерской ситуацией и срочностью вмешательства.'],
  };
};

const buildMaternalMonitoring = (disease: Disease): MonitoringPlan | undefined => {
  if (disease.subtitle !== 'Акушерство') {
    return undefined;
  }

  return {
    vitalSigns: ['Контроль артериального давления, пульса, температуры и общего состояния по клиническим показаниям.'],
    labs: [cleanText(disease.diagnostics.markers)],
    warningSymptoms: withFallback(disease.clinicalSummary?.redFlags, ['Нарастание симптомов, признаки органной дисфункции или кровотечения.']),
    reassessmentInterval: ['Частота переоценки зависит от тяжести состояния и условий ведения.'],
  };
};

const buildFetalMonitoring = (disease: Disease): MonitoringPlan | undefined => {
  if (disease.subtitle !== 'Акушерство') {
    return undefined;
  }

  return {
    imaging: withFallback(disease.diagnostics.imaging, buildImaging(disease)),
    warningSymptoms: ['Признаки дистресса плода, патологический допплер, отклонения КТГ или нарушение роста.'],
    reassessmentInterval: ['Кратность мониторинга определяется риском и сроком беременности.'],
  };
};

const buildInpatientVsOutpatient = (disease: Disease): InpatientOutpatientPlan | undefined => {
  if (disease.subtitle !== 'Акушерство') {
    return undefined;
  }

  return {
    outpatientWhen: ['Амбулаторное ведение допустимо только при стабильном течении и отсутствии показаний к круглосуточному мониторингу.'],
    inpatientWhen: ['Госпитализация нужна при тяжелом течении, нестабильности, риске срочного родоразрешения или необходимости интенсивного наблюдения.'],
  };
};

const buildDeliveryIndications = (disease: Disease) =>
  disease.subtitle === 'Акушерство'
    ? ['Показания к родоразрешению определяются тяжестью состояния матери, статусом плода и сроком беременности.']
    : undefined;

const buildPostpartumManagement = (disease: Disease) =>
  disease.subtitle === 'Акушерство'
    ? ['После родов требуется пересмотр диагноза, остаточных рисков и необходимости продолжения мониторинга или терапии.']
    : undefined;

const buildFertilityImpact = (disease: Disease) =>
  disease.subtitle === 'Гинекология'
    ? ['Оценить влияние заболевания и лечения на овуляцию, имплантацию, проходимость труб и сроки планирования беременности.']
    : undefined;

const buildMalignancyRisk = (disease: Disease) =>
  disease.subtitle === 'Гинекология'
    ? ['Онкориск оценивается по возрасту, симптомам, визуализации, гистологии и наличию предраковых состояний.']
    : undefined;

const buildRecurrenceRisk = (disease: Disease) =>
  disease.subtitle === 'Гинекология'
    ? ['Риск рецидива зависит от биологии заболевания, полноты лечения и длительности поддерживающей терапии.']
    : undefined;

const buildScreeningAndPrevention = (disease: Disease) =>
  disease.subtitle === 'Гинекология'
    ? ['Профилактика и скрининг должны учитывать возраст, симптомы, ВПЧ-статус, репродуктивные планы и онкоанамнез.']
    : undefined;

const buildWhenBiopsyNeeded = (disease: Disease) =>
  disease.subtitle === 'Гинекология'
    ? ['Биопсия нужна при подозрении на неоплазию, предрак, атипичные кровотечения или несоответствии клиники и визуализации.']
    : undefined;

const normalizeDisease = (disease: DiseaseInput): Disease => {
  const name = typeof disease.name === 'string' && disease.name.trim().length > 0 ? cleanText(disease.name) : 'Клиническое состояние';
  const subtitle = disease.subtitle === 'Акушерство' || disease.subtitle === 'Гинекология' ? disease.subtitle : 'Гинекология';

  return {
    ...disease,
    id: typeof disease.id === 'string' && disease.id.trim().length > 0 ? disease.id : slugifyIdPart(name),
    name,
    icd: typeof disease.icd === 'string' && disease.icd.trim().length > 0 ? cleanText(disease.icd) : 'МКБ-10',
    subtitle,
    description:
      typeof disease.description === 'string' && disease.description.trim().length > 0
        ? cleanText(disease.description)
        : `${name}: клиническая карточка для быстрой оценки, диагностики и выбора тактики ведения.`,
    icon: typeof disease.icon === 'string' && disease.icon.trim().length > 0 ? disease.icon : 'card',
    definition:
      typeof disease.definition === 'string' && disease.definition.trim().length > 0
        ? cleanText(disease.definition)
        : `${name} требует сопоставления жалоб, анамнеза, объективных данных и профильных исследований.`,
    epidemiology:
      typeof disease.epidemiology === 'string' && disease.epidemiology.trim().length > 0
        ? cleanText(disease.epidemiology)
        : 'Частота и клиническая значимость зависят от возраста, репродуктивного статуса, факторов риска и маршрута выявления.',
    etiology: withFallback(asStringArray(disease.etiology), ['Мультифакторные причины, уточняемые по клиническому контексту и данным обследования.']),
    symptoms: withFallback(asStringArray(disease.symptoms), ['Жалобы и признаки уточняются при очной клинической оценке.']),
    diagnostics: normalizeDiagnostics(disease),
    treatment: normalizeTreatment(disease),
  };
};

const getPrimaryTreatment = (disease: Disease) => {
  const entry = disease.treatment.conservative?.[0] ?? disease.treatment.surgical?.[0] ?? 'персонифицированная терапия';
  return cleanText(entry);
};

const getPrimarySymptom = (disease: Disease) => disease.symptoms[0] ?? 'клинические симптомы';

const getPrimaryDiagnosticStep = (disease: Disease) => disease.diagnostics.steps[0] ?? 'клиническая оценка';

const getDifferentialSignal = (disease: Disease) => disease.diagnostics.differential?.[0] ?? 'атипичное течение или отсутствие ответа на стартовую тактику';

const buildClinicalSummary = (disease: Disease): DiseaseClinicalSummary => {
  const primarySymptom = cleanText(getPrimarySymptom(disease));
  const primaryDiagnosticStep = cleanText(getPrimaryDiagnosticStep(disease));
  const primaryTreatment = cleanText(getPrimaryTreatment(disease));
  const primaryDifferentialSignal = cleanText(getDifferentialSignal(disease));
  const conservativeAction = disease.treatment.conservative?.[0];
  const surgicalAction = disease.treatment.surgical?.[0];

  return {
    quickSummary:
      disease.subtitle === 'Акушерство'
        ? `${disease.name} требует быстрой акушерской оценки, подтверждения через ${primaryDiagnosticStep} и раннего выбора тактики ведения.`
        : `${disease.name} следует заподозрить при жалобах на ${primarySymptom}; базовый шаг подтверждения - ${primaryDiagnosticStep}.`,
    redFlags: [
      `Быстрое ухудшение симптомов или нетипичное течение при ${disease.name.toLowerCase()}.`,
      `Признаки тяжелого осложнения, требующие немедленной очной оценки и пересмотра тактики.`,
    ],
    firstLineActions: [
      `Провести стартовую клиническую оценку и подтвердить диагноз через ${primaryDiagnosticStep}.`,
      conservativeAction ? cleanText(conservativeAction) : `Рассмотреть стартовую тактику: ${primaryTreatment}.`,
    ],
    diagnosticMinimum: [
      primaryDiagnosticStep,
      cleanText(disease.diagnostics.markers),
    ],
    whenToEscalate: [
      surgicalAction ? `Если стартовая тактика недостаточна, рассмотреть эскалацию: ${cleanText(surgicalAction)}.` : 'При отсутствии эффекта от терапии первой линии требуется пересмотр диагноза и эскалация ведения.',
      `Эскалировать тактику при подозрении на ${primaryDifferentialSignal}.`,
    ],
    clinicalPearls: [
      `Оценивайте ${disease.name.toLowerCase()} по совокупности жалоб, клиники и подтверждающих исследований.`,
      `Решения по лечению должны учитывать репродуктивные планы, возраст и клинические риски пациента.`,
    ],
  };
};

const getGynecologyCluster = (disease: Disease): GynecologyCluster => {
  const target = `${disease.id} ${disease.name} ${disease.icon}`.toLowerCase();

  if (
    /(cancer|sarcoma|vin|vain|dysplasia|рак|неоплаз|carcinoma|onc)/.test(target) &&
    !/(breast-cancer|молочной железы)/.test(target)
  ) {
    return 'oncology';
  }

  if (/(breast|mast|fibroadenoma|ductal-ectasia|маст|молочной железы)/.test(target)) {
    return 'breast';
  }

  if (/(endometri|adenomy|эндометри|аденоми)/.test(target)) {
    return 'endometriosis';
  }

  if (/(pid|cervic|vaginit|barth|syphilis|gonorrhea|herpes|warts|chlam|trich|candid|bv|tuberculosis|endometritis|salping|toa|pelvioperiton)/.test(target)) {
    return 'infection';
  }

  if (/(prolapse|cystocele|rectocele|incontinence|bladder|cystitis|fistula|physio|congestion)/.test(target)) {
    return 'urogyne';
  }

  if (/(infert|ivf|iui|icsi|pgd|donor|hydrosalpinx|ectopic|muller|asherman|anomaly|tubal-factor|pregnancy-loss|miscarriage)/.test(target)) {
    return 'fertility';
  }

  if (/(pcos|amenorr|oligomen|hyperprol|hypogonad|ovarian-resistance|anovulation|diminished-ovarian|premature-ovarian|poi|pof|pms|pmdr|dysmenorr|menorrh|hypermen|hypomen|metrorrh)/.test(target)) {
    return 'endocrine';
  }

  if (/(menopause|postmenop|hrt|osteoporosis|genitourinary|atrophy)/.test(target)) {
    return 'menopause';
  }

  if (/(vulvodynia|lichen|dystrophy|circumcision|vulvar)/.test(target)) {
    return 'vulvar';
  }

  if (/(fibroid|myoma|polyp|hyperplasia|aub|uterine|cervical|шейк|эндометри|матк)/.test(target)) {
    return 'uterine';
  }

  if (/(cyst|torsion|apoplexy|ovarian|adnex)/.test(target)) {
    return 'adnexal';
  }

  return 'general';
};

const getObstetricsCluster = (disease: Disease): ObstetricsCluster => {
  const target = `${disease.id} ${disease.name} ${disease.icon}`.toLowerCase();

  if (/(preeclampsia|eclampsia|hellp|hypertension|отеки|edema)/.test(target)) {
    return 'hypertension';
  }

  if (/(gestational-diabetes|type1-diabetes|type2-diabetes|diabetes|гсд)/.test(target)) {
    return 'diabetes';
  }

  if (/(placenta|abruption|accreta|previa|старение плаценты|placental)/.test(target)) {
    return 'placenta';
  }

  if (/(preterm|pprom|premature|угроза преждевременных|преждевременные роды)/.test(target)) {
    return 'preterm';
  }

  if (/(miscarriage|abortion|ectopic-pregnancy|mole|пузырный занос|невынаш|выкидыш|внематочная)/.test(target)) {
    return 'pregnancy-loss';
  }

  if (/(fgr|ttts|breech|macrosomia|fetal|rh|hemolytic|олигогидрам|polyhydramnios|oligohydramnios|twin|двойн|гипоксия плода|антенатальная гибель)/.test(target)) {
    return 'fetal';
  }

  if (/(uti|pyelonephritis|chorioamnionitis|torch|hepatitis|hiv|gbs|listeriosis|infection)/.test(target)) {
    return 'infection';
  }

  if (/(postpartum|subinvolution|mastitis|depression|лактостаз|субинволюция)/.test(target)) {
    return 'postpartum';
  }

  if (/(dvt|embolism|thrombosis|тромб)/.test(target)) {
    return 'thrombosis';
  }

  if (/(thyroid|anemia|asthma|epilepsy|lupus|antiphospholipid|cardiac|obesity|medical)/.test(target)) {
    return 'medical';
  }

  if (/(labor|cesarean|shoulder|uterine-rupture|родовой|кесар|дистоци|потуги)/.test(target)) {
    return 'labor';
  }

  return 'general';
};

const buildObstetricsImaging = (cluster: ObstetricsCluster) => {
  switch (cluster) {
    case 'hypertension':
      return [
        'УЗИ плода с биометрией, оценкой околоплодных вод и зрелости плаценты в динамике.',
        'Допплерометрия маточных артерий, артерии пуповины и средней мозговой артерии.',
        'КТГ и биофизический профиль плода как дополнение к ультразвуковому мониторингу.',
      ];
    case 'diabetes':
      return [
        'Серийная фетометрия для оценки макросомии или диспропорционального роста.',
        'Оценка количества околоплодных вод и признаков диабетической фетопатии.',
        'Допплерометрия и КТГ по акушерским показаниям при декомпенсации.',
      ];
    case 'placenta':
      return [
        'Трансабдоминальное и трансвагинальное УЗИ для оценки локализации плаценты и отношения к внутреннему зеву.',
        'Цветовой допплер для поиска лакун, аномальной васкуляризации и признаков врастания.',
        'МРТ при подозрении на placenta accreta spectrum или неясной глубине инвазии.',
      ];
    case 'preterm':
      return [
        'Трансвагинальная цервикометрия для оценки длины шейки матки.',
        'УЗИ плода и околоплодных вод при угрозе преждевременных родов или ПРПО.',
        'Допплерометрия и КТГ при ухудшении состояния плода.',
      ];
    case 'pregnancy-loss':
      return [
        'Трансвагинальное УЗИ как основной метод подтверждения локализации и жизнеспособности беременности.',
        'Динамическое УЗИ в сочетании с ХГЧ при беременности неизвестной локализации.',
        'Оценка полости матки и придатков после завершения беременности или при осложнениях.',
      ];
    case 'fetal':
      return [
        'Фетометрия, анатомическая оценка плода и определение объема околоплодных вод.',
        'Допплерометрия фетоплацентарного комплекса в динамике.',
        'Целевое экспертное УЗИ при многоплодии, ЗРП, аномалиях положения и подозрении на дистресс.',
      ];
    case 'infection':
      return [
        'УЗИ плода, плаценты и околоплодных вод при подозрении на внутриутробную инфекцию.',
        'Оценка состояния почек и мочевых путей матери при урологической инфекции.',
        'Динамический контроль плода после начала антибактериальной или противовирусной терапии.',
      ];
    case 'postpartum':
      return [
        'УЗИ матки в послеродовом периоде для оценки полости, размеров и остаточных тканей.',
        'УЗИ молочных лез при подозрении на лактостаз, мастит или абсцесс.',
        'Дополнительная визуализация таза при сохраняющейся боли, лихорадке или кровотечении.',
      ];
    case 'thrombosis':
      return [
        'Компрессионное дуплексное УЗИ вен нижних конечностей как метод первой линии.',
        'Эхокардиография и лучевая диагностика по показаниям при подозрении на ТЭЛА.',
        'УЗИ плода по стандартному акушерскому протоколу на фоне антикоагуляции.',
      ];
    case 'medical':
      return [
        'Стандартное УЗИ плода с оценкой роста и плаценты в сроки, определяемые материнской патологией.',
        'Целевой мониторинг плода при декомпенсации материнского заболевания.',
        'Допплерометрия и КТГ при повышении перинатального риска.',
      ];
    case 'labor':
      return [
        'Интранатальное УЗИ по показаниям для оценки положения, вставления головки и предполагаемой массы плода.',
        'УЗИ плаценты и полости матки при послеродовом кровотечении или подозрении на остатки.',
        'Функциональный мониторинг плода обязателен вместе с клинической оценкой родов.',
      ];
    default:
      return [
        'УЗИ плода и плаценты по акушерским показаниям.',
        'Допплерометрия при подозрении на нарушение маточно-плацентарного или фетоплацентарного кровотока.',
      ];
  }
};

const buildObstetricsDifferential = (cluster: ObstetricsCluster) => {
  switch (cluster) {
    case 'hypertension':
      return ['Хроническая артериальная гипертензия без преэклампсии.', 'Почечная патология, аутоиммунные заболевания и вторичные гипертензии.', 'Другие причины тромбоцитопении, цитолиза и неврологической симптоматики при беременности.'];
    case 'diabetes':
      return ['Прегестационный диабет 1 или 2 типа.', 'Транзиторная гипергликемия и лабораторные пограничные нарушения.', 'Другие причины макросомии и многоводия.'];
    case 'placenta':
      return ['Плацентарная дисфункция другой этиологии, краевое расположение плаценты.', 'Преждевременная отслойка плаценты.', 'Послеродовое кровотечение иной причины.'];
    case 'preterm':
      return ['Ложные схватки и тренировочная маточная активность.', 'Истмико-цервикальная недостаточность без активных родов.', 'Хориоамнионит, ПРПО и другие причины болевого синдрома.'];
    case 'pregnancy-loss':
      return ['Жизнеспособная ранняя маточная беременность с неопределенной датировкой.', 'Беременность неизвестной локализации.', 'Трофобластическая болезнь, внематочная беременность и неполный аборт.'];
    case 'fetal':
      return ['Конституционально малый плод против истинной ЗРП.', 'Плацентарная недостаточность, врожденные аномалии и инфекции плода.', 'Ошибки датировки беременности или особенности многоплодия.'];
    case 'infection':
      return ['Неспецифическая лихорадка и экстрагенитальные инфекции.', 'Акушерские осложнения без инфекционной природы.', 'Колонизация без инвазивного процесса и истинная клинически значимая инфекция.'];
    case 'postpartum':
      return ['Физиологические послеродовые изменения против патологии.', 'Задержка остатков плаценты, эндометрит, субинволюция.', 'Тромботические, хирургические и лактационные осложнения.'];
    case 'thrombosis':
      return ['Физиологические отёки беременности.', 'Мышечно-скелетная боль и поверхностный тромбофлебит.', 'ТЭЛА, сердечно-легочная патология и инфекционные причины одышки.'];
    case 'medical':
      return ['Физиологические изменения беременности, маскирующие соматическую патологию.', 'Обострение хронического заболевания против впервые возникшей патологии.', 'Акушерские осложнения, вторично влияющие на соматический статус.'];
    case 'labor':
      return ['Нормальный вариант течения родов против истинной дистоции.', 'Несоответствие размеров таза и плода.', 'Острые акушерские осложнения, требующие немедленного родоразрешения.'];
    default:
      return ['Физиологические изменения беременности, имитирующие патологию', 'Экстрагенитальная патология матери со сходной симптоматикой', 'Другие акушерские осложнения со сходными клиническими и ультразвуковыми признаками'];
  }
};

const buildObstetricsProtocols = (cluster: ObstetricsCluster): UltrasoundProtocol[] => {
  switch (cluster) {
    case 'preterm':
      return [
        { method: 'трансабдоминальное', indications: ['Оценка состояния плода', 'Контроль околоплодных вод', 'Мониторинг осложнений'], preparation: 'Специальная подготовка обычно не требуется' },
        { method: 'трансвагинальное', indications: ['Цервикометрия', 'Оценка длины шейки матки', 'Стратификация риска преждевременных родов'], preparation: 'Выполняется при пустом мочевом пузыре' },
      ];
    case 'placenta':
      return [
        { method: 'трансабдоминальное', indications: ['Локализация плаценты', 'Оценка кровотечения', 'Контроль положения плода'], preparation: 'По стандартному акушерскому протоколу' },
        { method: 'трансвагинальное', indications: ['Точная оценка расстояния до внутреннего зева', 'Подозрение на предлежание плаценты'], preparation: 'Безопасно при соблюдении техники, мочевой пузырь опорожнен' },
        { method: 'допплерометрия', indications: ['Подозрение на врастание плаценты', 'Оценка патологической васкуляризации'], preparation: 'В составе экспертного УЗИ' },
      ];
    case 'thrombosis':
      return [
        { method: 'дуплексное сканирование вен', indications: ['Подозрение на ТГВ', 'Контроль тромбоза', 'Оценка венозного кровотока'], preparation: 'Специальная подготовка не требуется' },
      ];
    default:
      return [
        { method: 'трансабдоминальное', indications: ['Первичная оценка состояния матери и плода', 'Динамическое наблюдение', 'Контроль осложнений'], preparation: 'Специальная подготовка обычно не требуется' },
        { method: 'допплерометрия', indications: ['Оценка плацентарного и плодового кровотока', 'Стратификация перинатального риска'], preparation: 'Выполняется во время стандартного ультразвукового исследования' },
      ];
  }
};

const buildObstetricsFindings = (cluster: ObstetricsCluster, disease: Disease): UltrasoundFinding[] => {
  const name = disease.name.toLowerCase();

  switch (cluster) {
    case 'hypertension':
      return [
        { location: 'плод', description: `При ${name} оценивают темпы роста плода, количество околоплодных вод, биофизический профиль и признаки плацентарной недостаточности.`, measurements: { 'биометрия': 'сопоставить с гестационным возрастом', 'воды': 'AFI или максимальный вертикальный карман' }, normal: 'Рост плода соответствует сроку, воды в пределах нормы.', pathology: 'ЗРП, маловодие, снижение двигательной активности и нарушения биофизического профиля.', clinicalSignificance: 'Позволяет определить интенсивность наблюдения и сроки родоразрешения.' },
        { location: 'допплерометрия', description: 'Оценивают маточные артерии, артерию пуповины и церебральный кровоток плода.', measurements: { 'пупочная_артерия': 'ИР, PI, наличие диастолического компонента', 'мозговая_артерия': 'PI, признаки централизации' }, normal: 'Индексы соответствуют сроку, диастолический кровоток сохранен.', pathology: 'Повышение сопротивления, отсутствие или реверс диастолы, цереброплацентарная диссоциация.', clinicalSignificance: 'Маркер декомпенсации плацентарной функции и необходимости ускорить родоразрешение.' },
      ];
    case 'diabetes':
      return [
        { location: 'плод', description: `При ${name} оценивают диспропорциональный рост, окружность живота, предполагаемую массу плода и признаки диабетической фетопатии.`, measurements: { efw: 'расчет предполагаемой массы плода', 'окружность_живота': 'сравнить с перцентилями' }, normal: 'Рост плода соответствует сроку без диспропорции.', pathology: 'Макросомия, увеличенная окружность живота, кардиомегалия, гепатомегалия.', clinicalSignificance: 'Нужно для определения маршрута родоразрешения и уровня гликемического контроля.' },
        { location: 'околоплодные воды и плацента', description: 'Оценивают индекс амниотической жидкости и вторичные признаки плацентарной дисфункции.', normal: 'Количество вод и структура плаценты соответствуют сроку.', pathology: 'Многоводие, изменения плаценты, признаки хронической гипоксии при декомпенсации.', clinicalSignificance: 'Позволяет вовремя усилить мониторинг и скорректировать терапию.' },
      ];
    case 'placenta':
      return [
        { location: 'плацента и внутренний зев', description: `При ${name} определяют локализацию плаценты, расстояние от края до внутреннего зева, наличие лакун и зону инвазии в миометрий.`, measurements: { 'край_плаценты': 'расстояние до внутреннего зева в мм', 'миометрий': 'толщина ретроплацентарной зоны' }, normal: 'Плацента расположена вне нижнего сегмента, без признаков инвазии.', pathology: 'Предлежание, низкое расположение, множественные лакуны, утрата ретроплацентарной зоны, аномальная васкуляризация.', clinicalSignificance: 'Критично для выбора места и способа родоразрешения.' },
        { location: 'плод и кровотечение', description: 'Дополнительно оценивают положение плода, объем кровотечения, состояние околоплодных вод и признаки дистресса.', normal: 'Плод стабилен, признаков острого страдания нет.', pathology: 'Неправильное положение, острые изменения сердечного ритма, ретроплацентарная гематома.', clinicalSignificance: 'Влияет на срочность родоразрешения и подготовку к массивной кровопотере.' },
      ];
    case 'preterm':
      return [
        { location: 'шейка матки', description: `При ${name} оценивают длину шейки матки, форму внутреннего зева и динамику укорочения.`, measurements: { 'длина_шейки': 'в мм при ТВУЗИ', funneling: 'наличие V/U-образной деформации' }, normal: 'Шейка достаточной длины, внутренний зев закрыт.', pathology: 'Укорочение шейки, funneling, пролабирование оболочек.', clinicalSignificance: 'Используется для решения вопроса о госпитализации, токолизе, прогестероне и серкляже.' },
        { location: 'плод и околоплодные воды', description: 'Оценивают жизнеспособность плода, количество вод, признаки инфекции и последствия ПРПО.', normal: 'Состояние плода стабильно, количество вод достаточное.', pathology: 'Маловодие, гипоксия, косвенные признаки хориоамнионита или ухудшения состояния плода.', clinicalSignificance: 'Влияет на баланс между пролонгированием беременности и своевременным родоразрешением.' },
      ];
    case 'pregnancy-loss':
      return [
        { location: 'полость матки/придатки', description: `При ${name} уточняют локализацию беременности, наличие эмбриона, сердцебиения, размеры плодного яйца и состояние придатков.`, measurements: { 'плодное_яйцо': 'средний внутренний диаметр', 'ктр': 'копчико-теменной размер', 'хгч': 'сопоставить с ультразвуковой картиной' }, normal: 'Маточная беременность с ожидаемой ультразвуковой динамикой для срока.', pathology: 'Отсутствие сердцебиения при диагностических критериях, пустое плодное яйцо, внематочная локализация, ретенционные ткани.', clinicalSignificance: 'Позволяет выбрать выжидательную, медикаментозную или хирургическую тактику.' },
        { location: 'свободная жидкость и гемоперитонеум', description: 'При боли и нестабильности ищут жидкость в брюшной полости, гематому и признаки разрыва.', normal: 'Патологической жидкости нет.', pathology: 'Свободная жидкость, кровяные сгустки, тубарное образование, признаки разрыва.', clinicalSignificance: 'Определяет срочность оперативного вмешательства.' },
      ];
    case 'fetal':
      return [
        { location: 'фетометрия и анатомия плода', description: `При ${name} оценивают биометрию, анатомические особенности, положение плода и соответствие роста сроку беременности.`, measurements: { 'бпр': 'по сроку', 'ож': 'по перцентилям', efw: 'предполагаемая масса плода' }, normal: 'Параметры роста и положения соответствуют сроку и клинической ситуации.', pathology: 'ЗРП, макросомия, неправильное положение, анатомические осложнения многоплодия.', clinicalSignificance: 'Определяет кратность наблюдения и стратегию родоразрешения.' },
        { location: 'плацента, воды и допплер', description: 'Оценивают плаценту, воды и кровоток в фетоплацентарной системе.', normal: 'Плацента и воды соответствуют сроку, кровоток сохранен.', pathology: 'Маловодие/многоводие, плацентарная дисфункция, патологический допплер.', clinicalSignificance: 'Нужно для прогноза внутриутробного состояния и времени вмешательства.' },
      ];
    case 'infection':
      return [
        { location: 'мать и плод', description: `При ${name} оценивают признаки внутриутробной инфекции, состояние плаценты, воды, почки матери или другие органы-мишени по клинической ситуации.`, measurements: { 'воды': 'объем и эхогенность', 'плацента': 'толщина и структура' }, normal: 'Плод и плацента без косвенных признаков инфекционного поражения.', pathology: 'Эхогенные воды, плацентомегалия, многоводие, гидропс, пиелоэктазия, воспалительные изменения у матери.', clinicalSignificance: 'Помогает определить тяжесть инфекции и риск вертикальной передачи.' },
        { location: 'дополнительные органы', description: 'При урологических и системных инфекциях оценивают почки, мочевые пути и возможные осложнения терапии.', normal: 'Без дилатации и обструкции.', pathology: 'Гидронефроз, воспалительные изменения, косвенные признаки обструкции.', clinicalSignificance: 'Влияет на выбор антибактериальной терапии и необходимость урологического вмешательства.' },
      ];
    case 'postpartum':
      return [
        { location: 'матка/полость матки', description: `При ${name} оценивают размеры матки, содержимое полости, толщину эндометрия, наличие сгустков или остатков плацентарной ткани.`, measurements: { 'полость_матки': 'эхогенное содержимое, толщина эндометрия', 'матка': 'размеры в послеродовом периоде' }, normal: 'Матка сокращается по сроку послеродового периода, без значимого патологического содержимого.', pathology: 'Субинволюция, остаточные ткани, жидкость, признаки эндометрита.', clinicalSignificance: 'Определяет необходимость утеротоников, антибиотиков или эвакуации полости матки.' },
        { location: 'молочные железы/таз', description: 'По показаниям оценивают лактостаз, абсцесс, тазовые коллекции и осложнения после операций.', normal: 'Без абсцесса и патологических полостей.', pathology: 'Абсцесс молочной железы, тазовый инфильтрат, гематома, серома.', clinicalSignificance: 'Нужно для дренирования и коррекции послеродовой тактики.' },
      ];
    case 'thrombosis':
      return [
        { location: 'венозная система', description: `При ${name} оценивают сжимаемость вен, наличие тромботических масс, протяженность тромбоза и признаки реканализации.`, measurements: { 'вена': 'диаметр, компрессия, протяженность тромба' }, normal: 'Вены полностью компрессируются, кровоток ламинарный.', pathology: 'Отсутствие компрессии, эхоплотные массы, нарушение кровотока.', clinicalSignificance: 'Определяет длительность антикоагуляции и риск эмболических осложнений.' },
      ];
    case 'labor':
      return [
        { location: 'плод и родовые пути', description: `При ${name} УЗИ используют для оценки положения, вставления головки, массы плода и послеродовых осложнений.`, measurements: { 'головка': 'уровень стояния и позиция', efw: 'предполагаемая масса плода' }, normal: 'Положение плода и течение родов соответствуют ожидаемому сценарию.', pathology: 'Высокое стояние головки, тазовое предлежание, признаки диспропорции, остатки плацентарной ткани.', clinicalSignificance: 'Помогает своевременно сменить тактику родоразрешения.' },
      ];
    default:
      return [
        { location: 'плод и плацента', description: `Ультразвуковая картина при ${name} оценивается в динамике: размеры плода, состояние плаценты, количество околоплодных вод и наличие признаков осложнений беременности.`, measurements: { 'биометрия': 'сопоставить со сроком гестации', 'плацента': 'оценить толщину, структуру и степень зрелости', 'околоплодные_воды': 'оценить AFI или максимальный вертикальный карман' }, normal: 'Параметры соответствуют сроку гестации, без признаков дистресса и плацентарной дисфункции.', pathology: 'Отставание биометрии, изменение объема вод, структурные изменения плаценты или маркеры ухудшения состояния плода.', clinicalSignificance: 'Определяет частоту наблюдения, потребность в госпитализации и сроки родоразрешения.' },
        { location: 'допплерометрия', description: 'При наличии риска оценивают маточные артерии, артерию пуповины, среднюю мозговую артерию и венозный проток по стандартным индексам сопротивления.', normal: 'Кровоток соответствует сроку беременности, конечный диастолический компонент сохранен.', pathology: 'Повышение сосудистого сопротивления, отсутствие или реверс диастолического кровотока, признаки централизации кровообращения.', clinicalSignificance: 'Позволяет вовремя выявить плацентарную недостаточность и скорректировать акушерскую тактику.' },
      ];
  }
};

const buildObstetricsNormalValues = (cluster: ObstetricsCluster) => {
  switch (cluster) {
    case 'preterm':
      return { 'длина_шейки': 'обычно 25 мм и более во втором-третьем триместре, интерпретация по сроку и клинике', 'воды': 'объем соответствует сроку беременности' };
    case 'placenta':
      return { 'плацента': 'без перекрытия внутреннего зева и без признаков патологической инвазии', 'кровоток': 'без турбулентной аномальной васкуляризации' };
    case 'thrombosis':
      return { 'вены': 'полностью компрессируются, патологические тромботические массы не определяются' };
    default:
      return { 'биометрия': 'соответствует сроку гестации по используемым таблицам', 'плацента': 'структура без патологических включений, зрелость соответствует сроку', 'кровоток': 'индексы сопротивления в нормативном диапазоне для срока беременности' };
  }
};

const buildObstetricsTips = (cluster: ObstetricsCluster) => {
  switch (cluster) {
    case 'hypertension':
      return ['Сравнивайте биометрию и допплерометрию в динамике, а не по одному исследованию.', 'Фиксируйте состояние плаценты, воды и кровоток в одном протоколе.', 'При пограничных изменениях сопоставляйте УЗИ с КТГ и клиникой матери.'];
    case 'placenta':
      return ['При подозрении на предлежание или врастание обязательно указывайте расстояние до зева и признаки аномальной васкуляризации.', 'Трансвагинальное УЗИ безопасно и точнее для оценки плаценты в нижнем сегменте.', 'Любое кровотечение интерпретируйте вместе с гемодинамикой матери и состоянием плода.'];
    case 'preterm':
      return ['Длину шейки матки измеряйте только при корректной ТВ-технике и пустом мочевом пузыре.', 'Не делайте вывод о риске преждевременных родов по одному пограничному измерению без клиники.', 'При ПРПО отдельно документируйте объем вод и признаки инфекции.'];
    case 'fetal':
      return ['Оценка плода должна быть серийной и основанной на тренде роста.', 'При многоплодии и ЗРП используйте один и тот же подход к измерениям в динамике.', 'Допплер всегда интерпретируйте вместе с биометрией, водами и КТГ.'];
    case 'postpartum':
      return ['В послеродовом периоде ультразвуковая картина должна интерпретироваться с учетом дня после родов.', 'Не любое содержимое полости матки означает необходимость выскабливания.', 'При лихорадке и боли ищите не только внутриматочную патологию, но и тазовые коллекции.'];
    default:
      return ['Сравнивайте биометрию и допплерометрию в динамике, а не по одному исследованию.', 'Фиксируйте признаки декомпенсации плода и состояние плаценты в одном протоколе.', 'При пограничных изменениях сопоставляйте данные УЗИ, КТГ и клиническую картину.'];
  }
};

const buildObstetricsGuidelines = (cluster: ObstetricsCluster): Disease['treatment']['guidelines'] => {
  switch (cluster) {
    case 'hypertension':
      return {
        eau: 'Современная акушерская тактика при гипертензивных расстройствах строится на ранней стратификации тяжести, лабораторном поиске органной дисфункции и параллельном мониторинге плода. При тяжелых признаках требуется стационарное ведение, магния сульфат для профилактики судорог и своевременное родоразрешение.',
        acog: 'ACOG поддерживает амбулаторное ведение только для гестационной гипертензии/преэклампсии без тяжелых признаков при тесном наблюдении; родоразрешение обычно обсуждают с 37 недель, а при тяжелых признаках - после стабилизации с 34 недель или раньше при ухудшении матери/плода.',
        ranzcog: 'RCOG/NICE-подход близок: частота наблюдения зависит от АД, симптомов, лабораторных показателей и состояния плода; антигипертензивная терапия не заменяет решение о сроках родоразрешения при прогрессировании.',
        ru: 'Российская маршрутизация также требует быстрой госпитализации при тяжелой преэклампсии, HELLP, неврологических симптомах, органной дисфункции или ухудшении состояния плода.',
      };
    case 'diabetes':
      return {
        eau: 'Международные рекомендации по диабету беременных опираются на диету, самоконтроль гликемии, раннюю инсулинотерапию при недостижении целей и серийную оценку роста плода.',
        acog: 'ACOG подчеркивает контроль гликемии, оценку макросомии и послеродовый скрининг диабета через 4-12 недель с последующим тестированием каждые 1-3 года при нормальном результате.',
        ranzcog: 'Австралийские и NICE-подходы используют stepped-care: lifestyle, метформин/инсулин по локальным протоколам, планирование родоразрешения по компенсации, массе плода и сопутствующим рискам.',
        ru: 'Российская практика требует совместного ведения акушера и эндокринолога, контроля целевых показателей, профилактики макросомии и послеродового метаболического наблюдения.',
      };
    case 'placenta':
      return {
        eau: 'Современные рекомендации при предлежании, отслойке и placenta accreta spectrum требуют экспертного УЗИ с допплером, МРТ по показаниям и заранее подготовленного маршрута родоразрешения в центре с ресурсами для массивной кровопотери.',
        acog: 'ACOG/SMFM рекомендуют избегать ненужных влагалищных вмешательств при предлежании, планировать роды с учетом кровотечения и зрелости плода, а при accreta spectrum заранее подключать мультидисциплинарную команду.',
        ranzcog: 'RCOG/NICE делают акцент на антенатальном выявлении низкой плацентации и врастания, подготовке крови/операционной команды и индивидуальном сроке планового кесарева сечения.',
        ru: 'Российские протоколы также ориентированы на госпитальную маршрутизацию, оценку кровопотери, готовность к хирургическому гемостазу и неонатальной помощи.',
      };
    case 'preterm':
      return {
        eau: 'Актуальная тактика при угрозе преждевременных родов и ПРПО сочетает ТВ-цервикометрию, исключение инфекции, антенатальные кортикостероиды по сроку, токолиз только для выигрыша времени и магния сульфат для нейропротекции до 32 недель.',
        acog: 'ACOG/SMFM поддерживают короткое целевое применение токолиза, антибиотики при ПРПО по показаниям и отказ от пролонгирования при хориоамнионите, кровотечении, тяжелой преэклампсии или дистрессе плода.',
        ranzcog: 'RCOG/NICE-подход требует неонатального маршрута, оценки шейки матки и оболочек, а также повторной стратификации после купирования угрозы.',
        ru: 'Российские рекомендации в целом совпадают: госпитализация при высоком риске, профилактика РДС плода, нейропротекция магнием и родоразрешение при инфекционных или материнско-плодовых показаниях.',
      };
    case 'pregnancy-loss':
      return {
        eau: 'NICE/RCOG-подход к ранней потере беременности требует надежных ультразвуковых критериев, динамики ХГЧ при беременности неизвестной локализации и совместного выбора выжидательной, медикаментозной или хирургической тактики.',
        acog: 'ACOG подчеркивает недопустимость поспешного диагноза нежизнеспособной беременности и необходимость учитывать гемодинамику, инфекционные признаки, боль и предпочтения пациентки.',
        ranzcog: 'Австралийские и британские рекомендации при повторных потерях предлагают этапное обследование без избыточных тестов и раннюю поддержку в следующей беременности.',
        ru: 'Российская практика требует исключить внематочную беременность, оценить резус-статус по показаниям и дать понятный план наблюдения после завершения беременности.',
      };
    case 'fetal':
      return {
        eau: 'SMFM 2024 reaffirmed-подход к ЗРП определяет FGR как EFW или AC ниже 10-го перцентиля, требует серийного роста и допплера пупочной артерии, а при AEDV/REDV - усиленного наблюдения и раннего родоразрешения.',
        acog: 'ACOG/SMFM рекомендуют не лечить ЗРП постельным режимом, sildenafil или LMWH без отдельного показания; срок родоразрешения зависит от перцентиля, допплера, КТГ и клинической картины.',
        ranzcog: 'RCOG/NICE-подход при многоплодии, ЗРП, многоводии/маловодии и неправильном положении требует экспертного УЗИ, оценки плаценты и планирования места родов.',
        ru: 'Российская маршрутизация ориентирована на динамическую фетометрию, допплер, КТГ и перевод в перинатальный центр при высоком перинатальном риске.',
      };
    case 'infection':
      return {
        eau: 'WHO/CDC-совместимый подход к инфекциям беременности требует ранней этиотропной терапии, оценки вертикальной передачи и выбора препаратов с доказанной безопасностью для плода.',
        acog: 'ACOG поддерживает активное лечение пиелонефрита, хориоамнионита и значимых ИППП без задержки, с учетом срока беременности и риска преждевременных родов.',
        ranzcog: 'RCOG/NICE рекомендуют госпитализацию при системной инфекции, лихорадке с акушерскими симптомами или угрозе сепсиса; контроль эффективности включает клинику матери и состояние плода.',
        ru: 'Российская практика требует лабораторной верификации, безопасной антибактериальной/противовирусной схемы и маршрутизации в стационар при системных признаках или ухудшении плода.',
      };
    case 'postpartum':
      return {
        eau: 'WHO 2023 рекомендует объективную оценку кровопотери и treatment bundle при послеродовом кровотечении; транексамовую кислоту используют как можно раньше при PPH вместе с утеротониками, массажем матки, жидкостями и поиском причины.',
        acog: 'ACOG-подход к послеродовому периоду требует активного исключения кровотечения, инфекции, тромбоза, гипертензивных осложнений и психических расстройств, а не списания симптомов на физиологию.',
        ranzcog: 'RCOG/NICE-подход поддерживает раннюю эскалацию при PPH, сепсисе, мастите с абсцессом, задержке остатков и ВТЭ; грудное вскармливание сохраняют, когда это клинически безопасно.',
        ru: 'Российские протоколы ориентированы на быструю госпитальную помощь при кровотечении, лихорадке, боли, субинволюции, лактационных осложнениях и тромботическом риске.',
      };
    case 'thrombosis':
      return {
        eau: 'RCOG Green-top 37a/37b остается активной основой для оценки ВТЭ в беременности и послеродовом периоде: риск пересматривают антенатально, интранатально и после родов, а подозрение на ТГВ/ТЭЛА требует немедленной диагностики.',
        acog: 'Американская практика поддерживает LMWH как базовый антикоагулянт при подтвержденной ВТЭ в беременности, с планированием родов и нейроаксиальной анестезии вокруг времени последней дозы.',
        ranzcog: 'Британско-австралийский подход использует компрессионное УЗИ при подозрении на ТГВ, визуализацию при подозрении на ТЭЛА и послеродовую профилактику по сумме факторов риска.',
        ru: 'Российские рекомендации требуют ранней антикоагуляции при подтвержденном диагнозе, оценки кровотечения и междисциплинарного плана родоразрешения.',
      };
    case 'medical':
      return {
        eau: 'Современная акушерская тактика при экстрагенитальной патологии строится на совместном ведении с профильным специалистом, оценке компенсации заболевания и адаптации частоты мониторинга плода.',
        acog: 'ACOG рекомендует заранее планировать беременность при хронических заболеваниях, пересматривать безопасность препаратов и не задерживать госпитализацию при декомпенсации.',
        ranzcog: 'RCOG/NICE-подход акцентирует индивидуальный план родов, анестезии, тромбопрофилактики и послеродового наблюдения для соматически сложных пациенток.',
        ru: 'Российская маршрутизация зависит от класса риска, компенсации заболевания и доступности перинатального центра с профильной консультативной поддержкой.',
      };
    case 'labor':
      return {
        eau: 'Современные рекомендации по осложнениям родов требуют непрерывной оценки матери и плода, раннего распознавания дистоции, кровотечения, разрыва матки и плечевой дистоции.',
        acog: 'ACOG поддерживает профилактику первичного кесарева сечения при безопасном течении родов, но требует быстрой эскалации при патологическом КТГ, остановке прогресса или угрозе жизни матери/плода.',
        ranzcog: 'RCOG/NICE-подход использует partogram/динамическую оценку родов, доказательную индукцию и четкие критерии оперативного родоразрешения.',
        ru: 'Российская практика ориентирована на своевременную диагностику клинически узкого таза, слабости родовой деятельности, гипоксии плода и готовность к экстренному кесареву сечению.',
      };
    default:
      return {
        eau: 'Актуальные международные акушерские рекомендации требуют оценки материнского риска, состояния плода, срока гестации и доступности нужного уровня помощи перед выбором тактики.',
        acog: 'ACOG-подход строится на shared decision-making, своевременной эскалации при ухудшении и документированном балансе между пролонгированием беременности и безопасностью матери/плода.',
        ranzcog: 'RCOG/NICE/RANZCOG-подходы подчеркивают маршрутизацию по уровню риска, перинатальный мониторинг и понятные критерии госпитализации или родоразрешения.',
        ru: 'Российские клинические рекомендации требуют учитывать локальную маршрутизацию, срок беременности, тяжесть состояния и возможности стационара/перинатального центра.',
      };
  }
};

const buildObstetricsRecommendations = (cluster: ObstetricsCluster, disease: Disease) => {
  switch (cluster) {
    case 'hypertension':
      return ['Рано стратифицировать материнский и перинатальный риск и не затягивать госпитализацию при ухудшении.', 'Параллельно контролировать состояние матери и плода, а не только уровень АД.', 'Порог для родоразрешения определять по сумме клинических и допплерометрических признаков.', 'После родов обязательно продолжать мониторинг из-за риска поздних осложнений.'];
    case 'diabetes':
      return ['Ориентироваться на целевые показатели гликемии и рост плода в динамике.', 'При признаках макросомии заранее обсуждать план родоразрешения.', 'Не откладывать инсулинотерапию при недостаточном эффекте диеты.', 'После родов организовать метаболический контроль и профилактику диабета 2 типа.'];
    case 'placenta':
      return ['Любое кровотечение при беременности рассматривать как потенциально опасное до исключения плацентарной причины.', 'При подозрении на placenta accreta spectrum маршрутизировать пациентку в центр, готовый к массивной кровопотере.', 'Тактику родоразрешения планировать заранее с учетом локализации плаценты и зрелости плода.', 'Избегать ненужных влагалищных манипуляций при предлежании плаценты.'];
    case 'preterm':
      return ['Угроза преждевременных родов требует быстрой оценки шейки матки, оболочек и инфекционного триггера.', 'Пролонгирование беременности оправдано только при стабильном состоянии матери и плода.', 'Кортикостероиды, токолиз и нейропротекция использовать по срокам и показаниям.', 'После купирования угрозы пересматривать риск повторного эпизода.'];
    case 'pregnancy-loss':
      return ['Подтверждать диагноз потери беременности по валидным ультразвуковым критериям без поспешных выводов.', 'Выбор между выжидательной, медикаментозной и хирургической тактикой делать совместно с пациенткой.', 'При повторных потерях переходить к расширенному дообследованию без затяжки.', 'После осложненной потери беременности давать четкий план наблюдения и следующего репродуктивного шага.'];
    case 'fetal':
      return ['Оценивать не только разовый параметр, а траекторию внутриутробного состояния плода.', 'При многоплодии и ЗРП чаще использовать специализированные центры и экспертное УЗИ.', 'Тактику родоразрешения определять по сроку, допплеру и биофизическому статусу.', 'Родителям заранее разъяснять перинатальные риски и критерии ухудшения.'];
    case 'infection':
      return ['Инфекции при беременности лечить с учетом риска вертикальной передачи и безопасности для плода.', 'Контроль эффективности должен включать материнскую клинику и ультразвуковое состояние плода.', 'При лихорадке без явного источника исключать акушерскую инфекцию и внутриутробное поражение.', 'Не откладывать госпитализацию при системной инфекции или признаках хориоамнионита.'];
    case 'postpartum':
      return ['Послеродовые жалобы оценивать активно, не списывая лихорадку, боль и кровотечение на физиологию.', 'На раннем этапе исключать остатки плаценты, эндометрит, мастит и тромботические осложнения.', 'Поддерживать грудное вскармливание там, где это безопасно и клинически оправдано.', 'После тяжелых осложнений планировать реабилитацию и индивидуальный риск следующей беременности.'];
    case 'thrombosis':
      return ['Оценку риска ВТЭ проводить до родов и повторять в послеродовом периоде.', 'При подозрении на ТГВ или ТЭЛА не откладывать визуализацию из-за беременности.', 'Антикоагуляцию и сроки лечения определять по подтвержденному диагнозу и факторам риска.', 'Разъяснять пациентке важность ранней мобилизации и симптомов тревоги.'];
    case 'medical':
      return ['Экстрагенитальную патологию вести совместно с профильным специалистом.', 'Частоту акушерского мониторинга адаптировать к степени компенсации основного заболевания.', 'При ухудшении соматического статуса пересматривать акушерскую тактику без промедления.', 'Планировать послеродовой контроль не менее тщательно, чем антенатальный.'];
    case 'labor':
      return ['При затяжном или осложненном течении родов регулярно пересматривать гипотезу о механической причине.', 'Документировать показания к смене тактики от консервативного ведения к оперативному родоразрешению.', 'Фетальный мониторинг должен идти параллельно оценке прогресса родов.', 'После осложненных родов заранее оценивать риск кровотечения и травмы родовых путей.'];
    default:
      return [`Оценивать ${disease.name.toLowerCase()} по совокупности жалоб, осмотра, лабораторных и инструментальных данных.`, `Использовать ${getPrimaryDiagnosticStep(disease).toLowerCase()} как часть поэтапной верификации диагноза.`, 'Тактику лечения соотносить с тяжестью процесса, сроком беременности и риском осложнений.', `Контроль эффективности проводить на фоне терапии: ${getPrimaryTreatment(disease).toLowerCase()}.`];
  }
};

const buildObstetricsPrognosis = (cluster: ObstetricsCluster, disease: Disease) => {
  switch (cluster) {
    case 'hypertension':
      return { general: `Прогноз при ${disease.name.toLowerCase()} определяется сроком манифестации, тяжестью материнской дисфункции и степенью плацентарной недостаточности.`, factors: ['Срок беременности на момент дебюта', 'Тяжесть гипертензии и органной дисфункции', 'Наличие ЗРП и патологического допплера', 'Время до безопасного родоразрешения'], survival: 'Материнский и перинатальный риск значительно возрастает при раннем дебюте и тяжелом течении.' };
    case 'placenta':
      return { general: `Прогноз при ${disease.name.toLowerCase()} зависит от объема кровопотери, глубины плацентарной инвазии и доступности своевременного оперативного родоразрешения.`, factors: ['Массивность кровотечения', 'Наличие accreta spectrum', 'Срок гестации и зрелость плода', 'Готовность стационара к массивной гемотрансфузии'], survival: 'Основной риск связан с материнской кровопотерей и преждевременным родоразрешением.' };
    case 'fetal':
      return { general: `Прогноз при ${disease.name.toLowerCase()} определяется гестационным возрастом, скоростью ухудшения состояния плода и возможностью безопасно пролонгировать беременность.`, factors: ['Срок гестации', 'Тренд роста плода и биофизический профиль', 'Показатели допплерометрии', 'Сопутствующая материнская патология'], survival: 'Перинатальный прогноз зависит от баланса между риском недоношенности и внутриутробной декомпенсации.' };
    case 'postpartum':
      return { general: `Прогноз при ${disease.name.toLowerCase()} обычно благоприятный при раннем выявлении, но может быстро ухудшаться при кровотечении, инфекции или задержке диагностики.`, factors: ['Скорость распознавания осложнения', 'Объем кровопотери или выраженность инфекции', 'Необходимость хирургического вмешательства', 'Фоновая соматическая нагрузка'], survival: 'Материнский риск возрастает при позднем начале интенсивной терапии и мультиорганной дисфункции.' };
    default:
      return { general: `Прогноз при ${disease.name.toLowerCase()} зависит от раннего выявления осложнений и своевременной коррекции акушерской тактики.`, factors: ['Срок гестации на момент манифестации', 'Тяжесть состояния матери и плода', 'Своевременность госпитализации и лечения'], survival: 'Материнский и перинатальный прогноз определяется скоростью диагностики и качеством мониторинга.' };
  }
};

const buildObstetricsFollowUp = (cluster: ObstetricsCluster, disease: Disease) => {
  switch (cluster) {
    case 'postpartum':
      return { frequency: 'Повторная оценка в ближайшие дни после начала лечения, затем по клинической динамике и стандартным послеродовым визитам', duration: 'До полного клинического разрешения осложнения и стабилизации состояния', tests: ['Клинический осмотр и витальные показатели', 'ОАК, CRP или коагулограмма по ситуации', 'УЗИ матки/молочных желез/таза по показаниям'] };
    case 'thrombosis':
      return { frequency: 'На старте лечения часто, затем по протоколу антикоагуляции', duration: 'Обычно не менее 6 недель послеродово и суммарно не менее 3 месяцев', tests: ['Клиническая оценка симптомов ВТЭ', 'Контроль антикоагуляции по схеме лечения', 'Повторное дуплексное УЗИ по показаниям'] };
    default:
      return { frequency: 'По акушерскому риску, обычно каждые 1-4 недели', duration: 'До родоразрешения и в раннем послеродовом периоде', tests: [getPrimaryDiagnosticStep(disease), 'Контроль клинических симптомов и объективного статуса', ...buildObstetricsImaging(cluster).slice(0, 2)] };
  }
};

const buildObstetricsCases = (cluster: ObstetricsCluster, disease: Disease) => {
  switch (cluster) {
    case 'placenta':
      return [{ presentation: `Беременная поступила с жалобами, типичными для ${disease.name.toLowerCase()}, и риском массивного акушерского кровотечения.`, findings: 'Экспертное УЗИ уточнило локализацию плаценты и признаки возможной инвазии/отслойки, оценено состояние плода.', diagnosis: disease.name, treatment: 'Проведена госпитализация, подготовка крови и компонентов, сформирован план родоразрешения мультидисциплинарной командой.', outcome: 'Материнские и перинатальные риски были снижены за счет заранее спланированной тактики и готовности к кровопотере.' }];
    case 'preterm':
      return [{ presentation: `Беременная обратилась с жалобами на ${getPrimarySymptom(disease).toLowerCase()} до доношенного срока.`, findings: 'Цервикометрия, оценка оболочек и состояние плода позволили уточнить истинный риск преждевременных родов.', diagnosis: disease.name, treatment: 'Назначены кортикостероиды/токолиз/антибактериальная терапия по показаниям и организован динамический контроль.', outcome: 'Удалось либо безопасно пролонгировать беременность, либо своевременно перейти к родоразрешению при ухудшении ситуации.' }];
    case 'postpartum':
      return [{ presentation: `В послеродовом периоде пациентка предъявила жалобы на ${getPrimarySymptom(disease).toLowerCase()} и ухудшение общего состояния.`, findings: 'Осмотр, лабораторные показатели и целевое УЗИ позволили локализовать источник осложнения.', diagnosis: disease.name, treatment: 'Проведена медикаментозная коррекция и, при необходимости, инвазивное вмешательство без задержки.', outcome: 'На фоне лечения достигнута стабилизация состояния, сформирован план раннего послеродового наблюдения.' }];
    default:
      return [{ presentation: `Пациентка обратилась с жалобами на ${getPrimarySymptom(disease).toLowerCase()} и типичную для ${disease.name.toLowerCase()} клиническую симптоматику.`, findings: `${getPrimaryDiagnosticStep(disease)}. Дополнительная визуализация подтвердила признаки заболевания без альтернативной причины симптомов.`, diagnosis: disease.name, treatment: `Начата терапия: ${getPrimaryTreatment(disease)}. Тактика уточнена с учетом клинической динамики.`, outcome: 'На фоне наблюдения состояние стабилизировано, акушерская тактика выполнена своевременно.' }];
  }
};

const buildGynecologyImaging = (cluster: GynecologyCluster) => {
  switch (cluster) {
    case 'endometriosis':
      return [
        'Трансвагинальное УЗИ органов малого таза с прицельной оценкой яичников, миометрия и позадиматочного пространства.',
        'МРТ малого таза при глубоком инфильтративном процессе, ретроцервикальных очагах или подозрении на вовлечение кишечника/мочевого пузыря.',
        'Экспертное УЗИ в динамике для оценки ответа на гормональную терапию и риска рецидива.',
      ];
    case 'uterine':
      return [
        'Трансвагинальное УЗИ как первый метод оценки эндометрия, миометрия и полости матки.',
        'Соногистерография или гистероскопия при очаговой внутриматочной патологии.',
        'МРТ малого таза при неясной ультразвуковой картине или планировании органосохраняющего лечения.',
      ];
    case 'adnexal':
      return [
        'Трансвагинальное УЗИ с описанием морфологии образования по стандартам IOTA.',
        'Цветовой допплер для оценки перфузии, признаков перекрута и солидных компонентов.',
        'МРТ при сомнительной структуре образования или необходимости дооперационного уточнения.',
      ];
    case 'infection':
      return [
        'УЗИ малого таза для исключения тубоовариального абсцесса, гидросальпинкса и свободной жидкости.',
        'Осмотр в зеркалах и лабораторная верификация возбудителя обязательны до оценки ответа на лечение.',
        'При осложненном течении использовать повторное УЗИ для контроля регресса воспалительных изменений.',
      ];
    case 'urogyne':
      return [
        'Транслабильное/трансперинеальное или трансвагинальное УЗИ тазового дна по показаниям.',
        'УЗИ мочевого пузыря с оценкой остаточной мочи и подвижности уретры.',
        'Уродинамическая и функциональная оценка дополняют визуализацию при смешанной симптоматике.',
      ];
    case 'fertility':
      return [
        'Базовое УЗИ на 2-5 день цикла для подсчета антральных фолликулов и оценки полости матки.',
        'Фолликулометрия для подтверждения овуляции и выбора времени вмешательства.',
        'ГСГ, Эхо-ГСГ или лапароскопия по показаниям для уточнения трубного фактора.',
      ];
    case 'endocrine':
      return [
        'УЗИ малого таза для оценки овариальной морфологии, толщины эндометрия и косвенных признаков ановуляции.',
        'Фолликулометрия при нарушениях цикла и подозрении на ановуляцию.',
        'МРТ гипофиза или другие методы визуализации применяются по эндокринным показаниям, а не рутинно.',
      ];
    case 'oncology':
      return [
        'Экспертное УЗИ с допплером для описания размеров опухоли, инвазии и подозрительных узлов.',
        'МРТ малого таза для локального стадирования.',
        'КТ/ПЭТ-КТ используются для оценки распространенности и планирования онкологической тактики.',
      ];
    case 'breast':
      return [
        'УЗИ молочных лез с оценкой формы, контуров, эхоструктуры и подмышечных лимфоузлов.',
        'Маммография или томосинтез по возрасту и онкориску.',
        'МРТ молочных лез при высокой плотности ткани, генетическом риске или неясной картине.',
      ];
    case 'menopause':
      return [
        'Трансвагинальное УЗИ для оценки толщины эндометрия, размеров матки и структуры яичников.',
        'При кровянистых выделениях обязательна прицельная оценка эндометрия и полости матки.',
        'Денситометрия и метаболический скрининг дополняют гинекологическое ведение, но не заменяют УЗИ.',
      ];
    case 'vulvar':
      return [
        'Основной метод оценки — клинический осмотр и вульвоскопия; УЗИ мягких тканей используется ограниченно.',
        'УЗИ применяют при подозрении на кистозные, инфильтративные или абсцедирующие изменения вульвы.',
        'Биопсия остается ключевым методом верификации при хронических дерматозах и подозрении на неоплазию.',
      ];
    default:
      return [
        'Трансвагинальное УЗИ органов малого таза как базовый метод визуализации.',
        'Трансабдоминальное сканирование дополняет оценку при крупных образованиях и ограниченной визуализации.',
      ];
  }
};

const buildGynecologyDifferential = (cluster: GynecologyCluster) => {
  switch (cluster) {
    case 'endometriosis':
      return ['Аденомиоз, функциональные кисты и миома матки.', 'Хронические воспалительные заболевания малого таза.', 'Синдром хронической тазовой боли иной этиологии, включая урологические и кишечные причины.'];
    case 'uterine':
      return ['Полипы, гиперплазия и рак эндометрия.', 'Подслизистая миома, аденомиоз и очаговая внутриматочная патология.', 'Беременность и акушерские причины кровотечения у женщин репродуктивного возраста.'];
    case 'adnexal':
      return ['Функциональные кисты, эндометриома и доброкачественные опухоли яичника.', 'Внематочная беременность и острые хирургические состояния.', 'Злокачественные опухоли яичника и метастатические поражения.'];
    case 'infection':
      return ['Неспецифический вагинит и ИППП со сходной клиникой.', 'Острый аппендицит, урологическая инфекция и кишечные воспалительные заболевания.', 'Опухолевые и неинфекционные воспалительные процессы малого таза.'];
    case 'urogyne':
      return ['Стрессовое, ургентное и смешанное недержание мочи.', 'Пролапс тазовых органов разного компартмента.', 'Интерстициальный цистит, нейрогенные нарушения и обструктивная урологическая патология.'];
    case 'fertility':
      return ['Трубный, овуляторный, маточный и мужской фактор бесплодия.', 'Снижение овариального резерва и эндокринная дисфункция.', 'Генетические причины, аномалии матки и привычное невынашивание.'];
    case 'endocrine':
      return ['СПКЯ, гиперпролактинемия и гипоталамическая дисфункция.', 'Преждевременная недостаточность яичников и другие формы гипогонадизма.', 'Структурная внутриматочная патология при нарушениях цикла.'];
    case 'oncology':
      return ['Доброкачественные образования, имитирующие опухоль.', 'Предраковые изменения и воспалительные процессы со сходной визуализацией.', 'Метастатические поражения и синхронные опухоли гениталий или молочной железы.'];
    case 'breast':
      return ['Фиброаденома, кисты, мастопатия и постлактационные изменения.', 'Воспалительные заболевания молочной железы.', 'Злокачественные образования и внутрипротоковые процессы.'];
    case 'menopause':
      return ['Физиологическая менопауза и ятрогенный гипоэстрогенизм.', 'Гиперплазия или рак эндометрия при кровянистых выделениях.', 'Эндокринные, урологические и дерматологические причины урогенитальных симптомов.'];
    case 'vulvar':
      return ['Инфекции, контактный дерматит и хронические дерматозы.', 'VIN, рак вульвы и другие неопластические процессы.', 'Нейропатическая боль и тазовая дисфункция.'];
    default:
      return ['Функциональные и органические заболевания органов малого таза.', 'Воспалительные и неопластические процессы.', 'Комбинированная гинекологическая и экстрагенитальная патология.'];
  }
};

const buildGynecologyProtocols = (cluster: GynecologyCluster): UltrasoundProtocol[] => {
  switch (cluster) {
    case 'breast':
      return [
        {
          method: 'ультразвуковое исследование молочных желёз',
          indications: ['Очаговые изменения', 'Масталгия', 'Динамическое наблюдение после лечения'],
          preparation: 'Оптимально выполнять в первую фазу цикла у менструирующих пациенток',
        },
        {
          method: 'допплеровское картирование',
          indications: ['Оценка солидного компонента', 'Дифференциальная диагностика узловых образований'],
          preparation: 'Выполняется как часть стандартного УЗИ молочных желёз',
        },
      ];
    case 'urogyne':
      return [
        {
          method: 'трансабдоминальное',
          indications: ['Оценка мочевого пузыря', 'Измерение остаточной мочи', 'Скрининг сопутствующей патологии'],
          preparation: 'Умеренно наполненный мочевой пузырь',
        },
        {
          method: 'трансперинеальное',
          indications: ['Оценка тазового дна', 'Подвижность уретры', 'Пролапс тазовых органов'],
          preparation: 'Исследование в покое и при пробе Вальсальвы',
        },
      ];
    case 'vulvar':
      return [
        {
          method: 'ультразвуковое исследование мягких тканей',
          indications: ['Кистозные образования вульвы', 'Подозрение на абсцесс', 'Оценка инфильтрата'],
          preparation: 'Специальная подготовка не требуется',
        },
      ];
    case 'fertility':
      return [
        {
          method: 'трансвагинальное',
          indications: ['Базовая оценка яичников и эндометрия', 'Подсчёт антральных фолликулов', 'Фолликулометрия'],
          preparation: 'Оптимально на 2-5 день цикла или по протоколу ВРТ',
        },
        {
          method: 'трансабдоминальное',
          indications: ['Крупные образования малого таза', 'Оценка топографии при аномалиях матки'],
          preparation: 'Умеренно наполненный мочевой пузырь',
        },
      ];
    default:
      return [
        {
          method: 'трансвагинальное',
          indications: ['Первичная диагностика', 'Уточнение локализации процесса', 'Контроль лечения'],
          preparation: 'Опорожнить мочевой пузырь; по возможности учитывать фазу менструального цикла',
        },
        {
          method: 'трансабдоминальное',
          indications: ['Большие образования', 'Оценка распространенности процесса', 'Ограниченная визуализация при ТВУЗИ'],
          preparation: 'Умеренно наполненный мочевой пузырь',
        },
      ];
  }
};

const buildGynecologyFindings = (cluster: GynecologyCluster, disease: Disease): UltrasoundFinding[] => {
  const name = disease.name.toLowerCase();

  switch (cluster) {
    case 'endometriosis':
      return [
        {
          location: 'матка и миометрий',
          description: `При ${name} оценивают асимметрию стенок матки, неоднородность миометрия, мелкие миометриальные кисты, деформацию переходной зоны и признаки сопутствующего аденомиоза.`,
          measurements: { 'матка': 'длина, толщина стенок, передне-задний размер', junctional_zone: 'оценить толщину и неоднородность' },
          normal: 'Однородный миометрий без очаговых включений и асимметрии стенок.',
          pathology: 'Неоднородный миометрий, кистовидные включения, очаги типа "веерообразных" теней, фиксированные болезненные структуры.',
          clinicalSignificance: 'Позволяет отличить поверхностный процесс от глубокого инфильтративного и спланировать лечение.',
        },
        {
          location: 'яичники и позадиматочное пространство',
          description: 'Оценивают эндометриомы, спаечный процесс, фиксированность яичников, ретроцервикальные узлы и вовлечение связочного аппарата.',
          measurements: { 'киста': 'размеры в трёх плоскостях', 'дугласово_пространство': 'наличие спаек и свободной жидкости' },
          normal: 'Яичники подвижны, без стойких гипоэхогенных кист и ретроцервикальных инфильтратов.',
          pathology: 'Эндометриомы с содержимым типа матового стекла, фиксированные яичники, ретроцервикальные узлы, отсутствие скольжения органов.',
          clinicalSignificance: 'Влияет на прогноз боли, фертильности и объем хирургического вмешательства.',
        },
      ];
    case 'uterine':
      return [
        {
          location: 'эндометрий и полость матки',
          description: `При ${name} определяют толщину эндометрия, его однородность, контур полости, наличие очаговых включений и питающего сосуда.`,
          measurements: { 'эндометрий': 'толщина в мм в срединном срезе', 'полость': 'деформация, синехии, внутриматочные образования' },
          normal: 'Эндометрий соответствует фазе цикла, полость матки не деформирована.',
          pathology: 'Очаговое или диффузное утолщение, полиповидные структуры, подслизистый узел, внутриматочные синехии или расширение полости.',
          clinicalSignificance: 'Позволяет определить показания к гистероскопии, биопсии и органосохраняющему лечению.',
        },
        {
          location: 'миометрий и шейка матки',
          description: 'Оценивают размеры матки, узловые образования, деформацию серозного и слизистого контуров, а также состояние цервикального канала.',
          measurements: { 'узлы': 'размеры и FIGO-локализация', 'шейка': 'длина и состояние канала' },
          normal: 'Матка обычной формы и размеров, без деформации миометрия и цервикального канала.',
          pathology: 'Миоматозные узлы, диффузные изменения миометрия, цервикальные полипы, стриктуры или признаки опухолевой инфильтрации.',
          clinicalSignificance: 'Определяет риск кровотечения, нарушения репродукции и объем вмешательства.',
        },
      ];
    case 'adnexal':
      return [
        {
          location: 'яичники и придатки',
          description: `При ${name} описывают морфологию образования: стенку, перегородки, папиллярные разрастания, уровень жидкости, акустические эффекты и подвижность придатков.`,
          measurements: { 'образование': 'размеры в трёх плоскостях', 'солидный_компонент': 'наличие и размеры', 'кровоток': 'оценка по ЦДК' },
          normal: 'Яичники нормального объёма без стойких кистозных или солидных образований.',
          pathology: 'Персистирующие кисты, комплексные аднексальные массы, признаки перекрута, геморрагического содержимого или злокачественного потенциала.',
          clinicalSignificance: 'Нужно для стратификации риска и выбора между наблюдением, срочной операцией и плановой цистэктомией.',
        },
        {
          location: 'брюшина и свободная жидкость',
          description: 'Дополнительно оценивают наличие свободной жидкости, утолщение труб, реакцию брюшины и смещение соседних органов.',
          measurements: { 'жидкость': 'объём и локализация', 'труба': 'диаметр и толщина стенки' },
          normal: 'Патологической жидкости и трубных изменений нет.',
          pathology: 'Свободная жидкость, дилатированные трубы, периаднексальный инфильтрат, признаки гемоперитонеума или воспаления.',
          clinicalSignificance: 'Помогает выявить осложнение и срочность хирургической тактики.',
        },
      ];
    case 'infection':
      return [
        {
          location: 'матка, трубы и яичники',
          description: `При ${name} оценивают толщину эндометрия, расширение и утолщение маточных труб, наличие тубоовариальных комплексов и реакцию окружающих тканей.`,
          measurements: { 'труба': 'диаметр и толщина стенки', 'очаг': 'размер инфильтрата или абсцесса' },
          normal: 'Трубы не визуализируются как расширенные структуры, патологических конгломератов нет.',
          pathology: 'Гидро- или пиосальпинкс, неоднородные придаточные образования, гиперваскуляризация и свободная жидкость.',
          clinicalSignificance: 'Определяет тяжесть инфекционного процесса и необходимость госпитализации или дренирования.',
        },
        {
          location: 'малый таз',
          description: 'Оценивают количество свободной жидкости, признаки пельвиоперитонита, вовлечение параметрия и остаточные явления после лечения.',
          normal: 'Нет признаков выраженного воспалительного экссудата и конгломератов.',
          pathology: 'Экссудат, спаечный процесс, фиксированные болезненные структуры, остаточный абсцесс.',
          clinicalSignificance: 'Используется для оценки эффективности терапии и раннего выявления осложнений.',
        },
      ];
    case 'urogyne':
      return [
        {
          location: 'тазовое дно и уретровезикальный сегмент',
          description: `При ${name} оценивают подвижность уретры, положение шейки мочевого пузыря, пролабирование переднего или заднего компартмента и остаточную мочу.`,
          measurements: { 'остаточная_моча': 'объём после мочеиспускания', 'уретра': 'подвижность при пробе Вальсальвы' },
          normal: 'Шейка мочевого пузыря стабильна, остаточная моча минимальна, пролапса нет.',
          pathology: 'Гипермобильность уретры, значимая остаточная моча, пролапс переднего или заднего отдела, дефект тазового дна.',
          clinicalSignificance: 'Уточняет механизм симптомов и помогает выбрать консервативную или хирургическую коррекцию.',
        },
        {
          location: 'мочевой пузырь и соседние структуры',
          description: 'Дополнительно исключают органическую патологию мочевого пузыря, свищи, дивертикулы и сопутствующие изменения малого таза.',
          normal: 'Контуры мочевого пузыря ровные, дополнительных сообщений и образований нет.',
          pathology: 'Деформация стенки, свищевой ход, признаки хронической обструкции или воспаления.',
          clinicalSignificance: 'Позволяет не пропустить комбинированную урогинекологическую патологию.',
        },
      ];
    case 'fertility':
      return [
        {
          location: 'яичники и овуляторный резерв',
          description: `При ${name} оценивают объём яичников, антральный фолликулярный резерв, доминантный фолликул и косвенные признаки овуляции.`,
          measurements: { afc: 'подсчёт антральных фолликулов', 'фолликул': 'диаметр доминантного фолликула', 'эндометрий': 'толщина и структура' },
          normal: 'Яичники с сохранённым резервом, адекватный рост доминантного фолликула, трехслойный эндометрий.',
          pathology: 'Низкий AFC, отсутствие доминантного фолликула, несоответствие роста эндометрия или признаки тубо-перитонеальной патологии.',
          clinicalSignificance: 'Критично для выбора между ожиданием, индукцией овуляции и ВРТ.',
        },
        {
          location: 'матка и трубы',
          description: 'Оценивают форму полости матки, внутриматочные дефекты, косвенные признаки гидросальпинкса, синехий и врождённых аномалий.',
          normal: 'Полость матки не деформирована, трубные структуры без дилатации.',
          pathology: 'Синехии, перегородка, гидросальпинкс, деформирующие миомы или полипы.',
          clinicalSignificance: 'Определяет имплантационный потенциал и необходимость хирургической подготовки перед ВРТ.',
        },
      ];
    case 'endocrine':
      return [
        {
          location: 'яичники',
          description: `При ${name} оценивают объём яичников, количество антральных фолликулов, наличие доминантного фолликула и признаки хронической ановуляции.`,
          measurements: { 'объём': 'по формуле D1 × D2 × D3 × 0.523', 'фолликулы': 'число и распределение' },
          normal: 'Размеры и фолликулярный аппарат соответствуют возрасту и дню цикла.',
          pathology: 'Поликистозная морфология, истощение резерва, отсутствие овуляторной динамики.',
          clinicalSignificance: 'Помогает уточнить эндокринный механизм нарушений цикла и фертильности.',
        },
        {
          location: 'эндометрий',
          description: 'Оценивают толщину и структуру эндометрия на фоне олигоменореи, аменореи и длительной ановуляции.',
          normal: 'Толщина соответствует фазе цикла.',
          pathology: 'Тонкий эндометрий при гипоэстрогенизме или утолщение при длительной ановуляции и гиперэстрогении.',
          clinicalSignificance: 'Важно для профилактики гиперплазии и планирования индукции овуляции.',
        },
      ];
    case 'oncology':
      return [
        {
          location: 'первичный очаг',
          description: `При ${name} описывают размер, контур, солидность, зону инвазии, связь с соседними структурами и характеристики сосудистого рисунка.`,
          measurements: { 'опухоль': 'максимальный размер в трёх плоскостях', 'инвазия': 'глубина/распространение', 'узлы': 'размер подозрительных лимфоузлов' },
          normal: 'Опухолевидных образований с инфильтративным ростом нет.',
          pathology: 'Солидные и/или смешанные структуры, неровные контуры, патологическая васкуляризация, инвазия и асцит.',
          clinicalSignificance: 'Определяет необходимость срочной морфологической верификации и объем стадирования.',
        },
        {
          location: 'малый таз и брюшная полость',
          description: 'Оценивают асцит, импланты по брюшине, вовлечение параметрия, миометрия, лимфоузлов и соседних органов.',
          normal: 'Нет признаков локорегионарного или перитонеального распространения.',
          pathology: 'Асцит, узловые импланты, подозрительные лимфоузлы, инфильтрация соседних органов.',
          clinicalSignificance: 'Влияет на стадию, резектабельность и выбор между первичной операцией и неоадъювантной терапией.',
        },
      ];
    case 'breast':
      return [
        {
          location: 'молочная леза',
          description: `При ${name} оценивают форму, ориентацию, контуры, акустические тени, внутреннюю эхоструктуру и связь очага с протоками и кожей.`,
          measurements: { 'очаг': 'размеры в трёх плоскостях', birads: 'категория по данным комплексной оценки' },
          normal: 'Железистая ткань без очаговых изменений и патологической дилатации протоков.',
          pathology: 'Кисты, фиброаденомы, сложные солидные узлы, воспалительные изменения или признаки злокачественного роста.',
          clinicalSignificance: 'Определяет необходимость биопсии, маммографии, наблюдения или хирургического лечения.',
        },
        {
          location: 'регионарные лимфоузлы',
          description: 'Обязательно оценивают подмышечные, над- и подключичные зоны при подозрении на опухолевый или воспалительный процесс.',
          normal: 'Лимфоузлы с сохранённым жировым синусом и тонкой корой.',
          pathology: 'Утолщение коры, потеря ворот, округлая форма, патологическая васкуляризация.',
          clinicalSignificance: 'Важно для стадирования и маршрутизации пациентки.',
        },
      ];
    case 'menopause':
      return [
        {
          location: 'матка и эндометрий',
          description: `При ${name} оценивают размеры матки, толщину и однородность эндометрия, наличие внутриматочной жидкости и очаговых образований.`,
          measurements: { 'эндометрий': 'толщина в мм', 'матка': 'длина и передне-задний размер' },
          normal: 'Тонкий однородный эндометрий без очаговых структур и расширения полости матки.',
          pathology: 'Утолщение эндометрия, полип, субмукозный узел, внутриматочная жидкость или опухолевые признаки.',
          clinicalSignificance: 'Ключевой блок оценки у пациенток с кровянистыми выделениями и на фоне ЗГТ.',
        },
        {
          location: 'яичники',
          description: 'Оценивают размеры и наличие персистирующих кистозных или солидных образований в постменопаузе.',
          normal: 'Небольшие постменопаузальные яичники без объемных образований.',
          pathology: 'Персистирующие кисты, солидные образования, сложные опухолевидные структуры.',
          clinicalSignificance: 'Позволяет своевременно исключить онкопатологию и осложнения ЗГТ.',
        },
      ];
    case 'vulvar':
      return [
        {
          location: 'мягкие ткани вульвы',
          description: `При ${name} УЗИ используют как вспомогательный метод для оценки глубины инфильтрации, кист, абсцессов и крупных подкожных образований.`,
          measurements: { 'очаг': 'размер и глубина распространения' },
          normal: 'Мягкие ткани без инфильтрации, жидкостных полостей и объемных образований.',
          pathology: 'Подкожный инфильтрат, кистозное образование, абсцесс, подозрение на опухолевый узел.',
          clinicalSignificance: 'Помогает выбрать зону биопсии и исключить глубоко расположенный процесс.',
        },
      ];
    default:
      return [
        {
          location: 'орган-мишень',
          description: `При ${name} оценивают локализацию процесса, размеры очага, контуры, эхоструктуру и отношение к соседним структурам.`,
          measurements: { 'размер': 'измерить минимум в двух-трех плоскостях', 'кровоток': 'оценить при ЦДК по показаниям' },
          normal: 'Орган без очаговых изменений и с сохраненной анатомией.',
          pathology: 'Очаговые или диффузные изменения, соответствующие клинической картине заболевания.',
          clinicalSignificance: 'Нужно для подтверждения диагноза и выбора тактики ведения.',
        },
      ];
  }
};

const buildGynecologyNormalValues = (cluster: GynecologyCluster) => {
  switch (cluster) {
    case 'fertility':
    case 'endocrine':
      return {
        afc: 'обычно 8-15 суммарно у женщин с сохраненным резервом, с учетом возраста',
        'эндометрий_перед_овуляцией': 'примерно 7-12 мм, трехслойной структуры',
        'объём_яичника': 'зависит от возраста и фазы цикла, обычно до 10 см3',
      };
    case 'menopause':
      return {
        'эндометрий_в_постменопаузе': 'обычно до 4 мм при отсутствии ЗГТ и кровянистых выделений',
        'яичники': 'небольшого объема, без сложных образований',
        'матка': 'уменьшена по сравнению с репродуктивным возрастом',
      };
    case 'breast':
      return {
        'протоки': 'без патологической дилатации',
        'лимфоузлы': 'с сохраненным жировым синусом и тонкой корой',
        'очаги': 'отсутствуют или соответствуют доброкачественной визуализации',
      };
    case 'urogyne':
      return {
        'остаточная_моча': 'обычно менее 50 мл',
        'уретра': 'без выраженной гипермобильности и деформации',
        'тазовое_дно': 'без значимого пролабирования при натуживании',
      };
    default:
      return {
        'матка': 'размеры и форма соответствуют возрасту и репродуктивному статусу',
        'эндометрий': 'толщина оценивается с учетом дня менструального цикла',
        'яичники': 'объем и фолликулярный аппарат соответствуют возрасту и фазе цикла',
      };
  }
};

const buildGynecologyTips = (cluster: GynecologyCluster) => {
  switch (cluster) {
    case 'endometriosis':
      return [
        'Оценивайте симптом скольжения и фиксированность яичников в одном протоколе.',
        'При подозрении на глубокий инфильтративный процесс отдельно описывайте ретроцервикальную зону, связки и кишечник.',
        'Сравнивайте УЗИ-картину с болевым синдромом и репродуктивными планами пациентки.',
      ];
    case 'uterine':
      return [
        'Толщину эндометрия всегда интерпретируйте с учетом возраста, фазы цикла и приема гормонов.',
        'Для очаговой внутриматочной патологии полезно описывать питающий сосуд и деформацию полости.',
        'При кровотечении в постменопаузе любой сомнительный ультразвуковой признак требует морфологической верификации.',
      ];
    case 'adnexal':
      return [
        'Описывайте образование по единым морфологическим признакам: стенка, перегородки, солидные зоны, тени и кровоток.',
        'Не исключайте перекрут только по сохраненному кровотоку: сопоставляйте с клиникой.',
        'При функциональной кисте контролируйте регресс через 6-8 недель.',
      ];
    case 'infection':
      return [
        'Повторное УЗИ особенно важно при сохранении лихорадки и болевого синдрома на фоне терапии.',
        'Ищите не только очаг, но и признаки осложнений: абсцесс, пиосальпинкс, свободную жидкость.',
        'Ультразвук дополняет, но не заменяет лабораторную верификацию возбудителя.',
      ];
    case 'urogyne':
      return [
        'Оценку тазового дна выполняйте в покое и при пробе Вальсальвы.',
        'Остаточную мочу измеряйте после самостоятельного мочеиспускания.',
        'Результаты визуализации интерпретируйте вместе с дневником мочеиспускания и уродинамикой.',
      ];
    case 'fertility':
      return [
        'Для ВРТ используйте стандартизированный базовый осмотр на ранние дни цикла.',
        'Фолликулометрию проводите серийно, а не по одному измерению.',
        'Любой гидросальпинкс или деформация полости матки описывайте как фактор снижения имплантационного потенциала.',
      ];
    case 'oncology':
      return [
        'Всегда документируйте солидный компонент, патологический кровоток, асцит и лимфоузлы.',
        'При подозрении на злокачественность ориентируйтесь на экспертное описание, а не только на один маркёр.',
        'УЗИ должно помогать стадированию и маршрутизации к онкогинекологу, а не только подтверждать наличие образования.',
      ];
    case 'breast':
      return [
        'Сравнивайте данные УЗИ с клиникой, маммографией и BI-RADS-категорией.',
        'Оценивайте подмышечные лимфоузлы при любом подозрительном солидном очаге.',
        'У молодых пациенток УЗИ часто является первым методом, но не заменяет биопсию при сомнительной находке.',
      ];
    default:
      return [
        'Документируйте локализацию очага, его размеры и отношения с соседними структурами в одном протоколе.',
        'Сопоставляйте эхографическую картину с жалобами, фазой цикла и данными осмотра.',
        'При сомнительной картине планируйте контрольное УЗИ или уточняющую визуализацию.',
      ];
  }
};

const buildGynecologyGuidelines = (cluster: GynecologyCluster): Disease['treatment']['guidelines'] => {
  switch (cluster) {
    case 'endometriosis':
      return {
        eau: 'Европейские рекомендации ESHRE поддерживают клинически ориентированный диагноз с опорой на ТВУЗИ/МРТ; лапароскопия не является обязательным первым шагом. Первая линия для боли: КОК, прогестины или LNG-IUS; агонисты/антагонисты ГнРГ обычно вторая линия с add-back терапией.',
        acog: 'ACOG допускает эмпирическое лечение при типичной симптоматике без немедленной лапароскопии. Гормональная супрессия остается базовой тактикой; хирургия показана при рефрактерной боли, органном вовлечении, крупных эндометриомах или изменении репродуктивной стратегии.',
        ranzcog: 'RANZCOG в living-guideline формате поддерживает imaging-first подход и длительное совместное принятие решений. После операции рекомендуется подавление рецидива, если беременность не планируется немедленно.',
        ru: 'Российская клиническая практика в целом совпадает: экспертное УЗИ и/или МРТ до инвазивной диагностики, длительная гормональная супрессия для контроля боли и профилактики рецидива, хирургия по строгим показаниям.',
      };
    case 'uterine':
      return {
        eau: 'Европейские гайдлайны по AUB, гиперплазии и внутриматочной патологии опираются на PALM-COEIN, ТВУЗИ как первый этап и гистероскопию при очаговом процессе. LNG-IUS рассматривается как наиболее эффективная медикаментозная опция при хроническом тяжелом кровотечении и гиперплазии без атипии.',
        acog: 'ACOG рекомендует классифицировать AUB по PALM-COEIN, выполнять биопсию эндометрия у пациенток 45+ или моложе при факторах риска, и начинать лечение с медикаментозной стабилизации, если пациентка гемодинамически стабильна. При EIN/AEH стандартом остается гистерэктомия, а при сохранении фертильности требуется строгий прогестиновый протокол и повторная морфология.',
        ranzcog: 'Австралийские рекомендации поддерживают TVUS-first подход, раннее использование офисной гистероскопии при подозрении на очаговую патологию и приоритет органосохраняющей тактики, если это безопасно. Эндометриальная абляция допустима только после исключения неоплазии и при отсутствии репродуктивных планов.',
        ru: 'Российские клинрек ориентируются на УЗИ, морфологическую верификацию гиперплазии и гистероскопическое удаление очаговой патологии. При атипической гиперплазии и высоком онкориске предпочтительно радикальное лечение.',
      };
    case 'adnexal':
      return {
        eau: 'Европейский подход опирается на экспертное ТВУЗИ и морфологические модели риска, включая IOTA, с МРТ для индетерминантных образований. Тактика зависит от структуры и онкориска: функциональные кисты наблюдают, подозрительные массы направляют к онкогинекологу.',
        acog: 'ACOG рекомендует ТВУЗИ как первый метод оценки аднексальных образований, а показания к операции определять по симптомам, персистенции, размерам и подозрению на злокачественность. При перекруте приоритетом остается срочная органосохраняющая деторсия, если это возможно.',
        ranzcog: 'Австралийская практика поддерживает минимально инвазивную хирургию для доброкачественных образований и раннее выделение пациенток с высоким риском рака. Наблюдение предпочтительно при типичных функциональных кистах без настораживающих признаков.',
        ru: 'В российских рекомендациях также сохраняется разделение на наблюдение функциональных кист и оперативное лечение персистирующих, симптомных или подозрительных образований. Для острых осложнений показана экстренная лапароскопическая тактика.',
      };
    case 'infection':
      return {
        eau: 'Европейские и CDC-совместимые подходы требуют низкого порога для эмпирического лечения PID, NAAT-верификации GC/CT и пересмотра через 48-72 часа. TOA рассматривается как тяжелая форма с обязательной госпитализацией и возможным дренированием.',
        acog: 'ACOG и CDC подчеркивают синдромный и ранний подход: цефтриаксон + доксициклин + метронидазол для амбулаторной PID, партнёр-менеджмент при ИППП и отказ от ожидания лабораторного подтверждения при типичной клинике. Рецидивирующий BV и кандидоз требуют подтверждения диагноза и длительных suppressive схем у отобранных пациенток.',
        ranzcog: 'Австралийские STI-guidelines близки к американским, но в некоторых разделах более активно обсуждают лечение постоянного партнера, особенно при рецидивирующем BV, и опираются на локальный AMR-контекст. Подчеркивается обязательный повторный контроль симптомов и профилактика реинфекции.',
        ru: 'Российские рекомендации обычно более госпитально ориентированы при восходящей инфекции и осложненном течении, но в целом совпадают по необходимости ранней антибактериальной терапии, лабораторной верификации возбудителя и лечению полового партнёра при подтвержденной ИППП.',
      };
    case 'urogyne':
      return {
        eau: 'EAU и европейская урогинекология рекомендуют клиническую диагностику пролапса и недержания с использованием POP-Q, дневников мочеиспускания и селективной уродинамики. Первая линия: supervised pelvic floor muscle training, pessary и коррекция факторов риска.',
        acog: 'ACOG также ставит консервативное лечение на первое место и не требует рутинной уродинамики перед неосложненной первичной операцией при стрессовом недержании. Midurethral sling сохраняет роль эффективной хирургии у отобранных пациенток.',
        ranzcog: 'RANZCOG поддерживает персонализированную коррекцию пролапса и недержания с осторожным отношением к трансвагинальным сеткам. Для OAB и mixed UI рекомендуется пошаговая эскалация от поведенческой терапии к медикаментам и затем к инвазивным методам.',
        ru: 'Российские клинрек также акцентируют упражнения тазового дна, пессарии и staged-подход к хирургии. При свищах и рецидивном пролапсе предпочтительно ведение в специализированных реконструктивных центрах.',
      };
    case 'fertility':
      return {
        eau: 'ESHRE/ASRM-консенсус требует структурированного, но не перегруженного обследования пары: подтверждение овуляции, оценка матки и труб, спермограмма, ограничение малоинформативных add-on тестов. При необъяснимом бесплодии Европа чаще поддерживает IUI с контролируемой стимуляцией как первый активный шаг.',
        acog: 'ACOG и ASRM рекомендуют начинать обследование через 12 месяцев, а после 35 лет через 6 месяцев или раньше при факторах риска. ICSI не должно использоваться рутинно вне мужского фактора, а PGT-A не считается универсально полезным для всех циклов IVF.',
        ranzcog: 'Австралийские рекомендации 2024 по необъяснимому бесплодию близко адаптируют ESHRE: staged-переход от IUI к IVF, emphasis на cumulative live birth и профилактику OHSS. Донорские программы и PGT требуют отдельного генетического и юридического консультирования.',
        ru: 'Российская практика в целом совпадает по последовательности: базовое обследование пары, коррекция выявленного фактора и переход к ВРТ без затяжки при возрастном или трубном факторе. Донорские программы и ЭКО используются по показаниям с учетом нормативных ограничений и маршрутизации в профильный центр.',
      };
    case 'endocrine':
      return {
        eau: 'Европейские рекомендации 2023-2024 по PCOS и POI обновили подход: в диагностике PCOS у взрослых может использоваться AMH вместо УЗИ, а диагноз POI допустим уже при клинической картине и одном FSH >25 IU/L. Для СПКЯ первой линией при бесплодии остается летрозол, а lifestyle и метаболический скрининг обязательны для всех фенотипов.',
        acog: 'ACOG/ASRM поддерживают этапный гормональный алгоритм при аменорее и хронической ановуляции: исключить беременность, ТТГ, пролактин, гипоэстрогенизм и гиперандрогению. При гиперпролактинемии препаратом первой линии остается каберголин; при хронической ановуляции важна защита эндометрия циклическими прогестинами или КОК.',
        ranzcog: 'Австралийский подход совпадает с международным консенсусом: осторожнее диагностировать PCOS у подростков, не опираться на УЗИ в этой группе и рассматривать менопаузальную гормональную терапию как стандарт для POI и симптомной менопаузы при отсутствии противопоказаний.',
        ru: 'Российские рекомендации по аменорее/олигоменорее и менопаузе в целом согласуются с международными алгоритмами: обязательна этиологическая диагностика, профилактика гиперплазии эндометрия при ановуляции и ЗГТ/МГТ при ПНЯ и выраженном гипоэстрогенизме с контролем рисков.',
      };
    case 'oncology':
      return {
        eau: 'Европейские ESGO/ESMO-гайдлайны требуют морфологической верификации, стадирования по современным FIGO-критериям и лечения в центрах с onco-surgical quality control. Для эндометрия и яичников всё большее значение имеет молекулярная стратификация и обязательное генетическое тестирование BRCA/MMR по показаниям.',
        acog: 'Американский подход близок по сути: биопсия до окончательной тактики, стадирующая хирургия или chemoradiation по стадии, sentinel mapping в ранних стадиях там, где это валидировано, и biomarker-driven системная терапия при рецидиве/метастазах. При CIN допускается risk-based triage и в отдельных сценариях expedited treatment.',
        ranzcog: 'Австралийские рекомендации поддерживают лечение в специализированных онкоцентрах, MRI/PET-CT по показаниям и органосохраняющие опции только у строго отобранных пациенток. Для VIN/vulvar cancer и rare tumors акцент сделан на длительном клиническом наблюдении и раннем выявлении рецидива.',
        ru: 'Российские клинрек в целом следуют тем же принципам: обязательная морфология, FIGO-стадирование, хирургия при резектабельных ранних стадиях и лучевая/химиолучевая или системная терапия при распространенном процессе. Доступ к молекулярным тестам и новым таргетным схемам может зависеть от центра.',
      };
    case 'breast':
      return {
        eau: 'Европейская и международная breast-oncology практика опирается на triple assessment: клинический осмотр, визуализация и core-biopsy. Для доброкачественных состояний предпочтительно избегать ненужных операций, если imaging-pathology concordant; для рака обязательны receptor status, стадирование по показаниям и subtype-based лечение.',
        acog: 'ACOG и американские breast guidelines поддерживают conservative management для стабильных fibroadenoma и benign fibrocystic changes после подтверждения доброкачественного характера. При раке молочной железы стандартом остаются breast-conserving surgery или mastectomy с учетом биологии опухоли, обязательной системной терапии по подтипу и без рутинного surveillance imaging у бессимптомных выживших.',
        ranzcog: 'Австралийский подход аналогичен: фокальные или стойкие изменения требуют imaging + biopsy, а diffuse mastalgia без подозрительной находки ведется преимущественно консервативно. При подозрении на злокачественный процесс обязательны маршрутизация в breast unit и oncofertility counseling у молодых пациенток.',
        ru: 'Российская практика также исходит из обязательного исключения рака при любом очаговом образовании, при этом биопсийно подтвержденные доброкачественные узлы чаще наблюдаются, если нет роста или атипии. Лечение рака молочной железы выстраивается по стадии и рецепторному профилю с ежегодной маммографией в follow-up.',
      };
    case 'menopause':
      return {
        eau: 'Европейские и IMS/ESHRE-согласованные документы считают менопаузальную гормональную терапию наиболее эффективным лечением вазомоторных симптомов и ранней потери костной массы. При GSM первой линией остаются локальные эстрогены, а рутинное лабораторное подтверждение менопаузы после 45 лет не требуется.',
        acog: 'ACOG рекомендует индивидуально назначать HT/MHT женщинам моложе 60 лет или в пределах 10 лет от менопаузы при благоприятном benefit-risk профиле, с ежегодным пересмотром. В обновлении 2026 по постменопаузальному кровотечению для большинства пациенток предпочтительна начальная оценка с ТВУЗИ и забором эндометриальной ткани, без ложного успокоения только по тонкому эндометрию.',
        ranzcog: 'RANZCOG подчеркивает выбор трансдермального пути при повышенном риске ВТЭ/метаболических осложнений и допускает продолжение терапии дольше стандартных сроков при сохраняющейся клинической пользе. Для POI гормональная терапия показана до возраста естественной менопаузы.',
        ru: 'Российские клинрек по менопаузе 2025 в целом совпадают: МГТ/ЗГТ показана при симптомном эстроген-дефиците и ПНЯ при отсутствии противопоказаний, а GSM ведется преимущественно локальной терапией и долговременным наблюдением.',
      };
    case 'vulvar':
      return {
        eau: 'Европейский подход требует биопсии любой стойкой, атипичной или язвенной вульварной зоны и различения HPV-related HSIL/VIN от dVIN, особенно на фоне lichen sclerosus. Для хронических дерматозов первой линией остаются высокоактивные топические стероиды и длительное наблюдение.',
        acog: 'ACOG подчеркивает, что диагноз вульводинии ставится только после исключения инфекции, дерматозов и неоплазии; pain management должен быть мультимодальным. Для VIN предпочтительны excision/ablation или imiquimod по показаниям, а для lichen sclerosus — длительная steroid maintenance.',
        ranzcog: 'Австралийские рекомендации сходятся с европейскими: ранняя биопсия, длительное наблюдение за рубцующимися дерматозами и осторожное отношение к позднему распознаванию dVIN/рака вульвы. При сексуально-болевых нарушениях рекомендован multidisciplinary pelvic pain подход.',
        ru: 'Российская практика также ориентирована на морфологическую верификацию подозрительных поражений вульвы и длительное лечение хронических дерматозов топическими стероидами. При дисплазии и раке показано профильное онкологическое лечение, а при вульводинии — комплексный подход с исключением органики.',
      };
    default:
      return {
        eau: 'Европейские рекомендации поддерживают поэтапную диагностику, приоритет минимально инвазивной визуализации и лечение по доминирующему симптому и риску осложнений.',
        acog: 'Американский подход ориентирован на risk-based диагностику, shared decision-making и раннее начало доказательной терапии при наличии клинических показаний.',
        ranzcog: 'Австралийские документы обычно близки к европейскому консенсусу и подчеркивают lived-guideline обновления, пациент-центричность и staged escalation.',
        ru: 'Российские клинические рекомендации в целом следуют тем же базовым принципам, но степень детализации и доступность современных опций может зависеть от конкретной нозологии и маршрутизации.',
      };
  }
};

const buildGynecologyRecommendations = (cluster: GynecologyCluster, disease: Disease) => {
  switch (cluster) {
    case 'endometriosis':
      return [
        'Оценивать выраженность боли, репродуктивные планы и риск рецидива до выбора тактики.',
        'Предпочитать органосохраняющий подход при желании беременности и контроле симптомов.',
        'После хирургии планировать профилактику рецидива гормональной терапией или репродуктивной стратегией без длительной паузы.',
        'При подозрении на глубокий инфильтративный процесс направлять в специализированный центр.',
      ];
    case 'uterine':
      return [
        'Любое аномальное маточное кровотечение вести с учетом возраста и онкологического риска.',
        'Очаговую внутриматочную патологию подтверждать гистологически при наличии показаний.',
        'Тактику выбирать с учетом выраженности кровопотери, анемии и желания сохранить фертильность.',
        `Контроль эффективности проводить на фоне терапии: ${getPrimaryTreatment(disease).toLowerCase()}.`,
      ];
    case 'adnexal':
      return [
        'Персистирующие аднексальные образования описывать по стандартам риска, а не только по размеру.',
        'При острой боли исключать перекрут, разрыв кисты и внематочную беременность в приоритетном порядке.',
        'Функциональные кисты наблюдать ограниченный срок с повторной визуализацией.',
        'Подозрительные по онкориску образования маршрутизировать без задержки к профильному хирургу.',
      ];
    case 'infection':
      return [
        'Антибактериальную терапию начинать своевременно, не дожидаясь поздних осложнений.',
        'Всегда оценивать и лечить полового партнера при подтвержденной ИППП.',
        'Повторно осматривать пациентку при отсутствии клинического ответа в ближайшие 48-72 часа.',
        'Разъяснять риск трубного бесплодия, хронической боли и рецидива при неполном лечении.',
      ];
    case 'urogyne':
      return [
        'Начинать с консервативной коррекции и объективной оценки доминирующего симптома.',
        'До операции документировать тип пролапса или недержания и ожидания пациентки от лечения.',
        'Учитывать сексуальную функцию, остаточную мочу и риск рецидива при выборе метода коррекции.',
        'После вмешательства планировать реабилитацию тазового дна, а не только хирургический контроль.',
      ];
    case 'fertility':
      return [
        'Обследовать пару как единую репродуктивную систему, а не только женщину.',
        'Переход к ВРТ не откладывать при возрасте, трубном факторе или снижении резерва.',
        'Перед ВРТ устранять гидросальпинкс, выраженную внутриматочную патологию и активное воспаление.',
        'Репродуктивный план пересматривать после каждого завершенного этапа лечения.',
      ];
    case 'endocrine':
      return [
        'Сопоставлять нарушения цикла с гормональным профилем, метаболическим статусом и данными УЗИ.',
        'При длительной ановуляции контролировать эндометрий и предупреждать гиперпластические осложнения.',
        'Учитывать метаболические и сердечно-сосудистые риски при СПКЯ и гипоэстрогенных состояниях.',
        'При фертильных запросах выбирать тактику, которая одновременно лечит причину и восстанавливает овуляцию.',
      ];
    case 'oncology':
      return [
        'Не ограничиваться симптоматическим лечением без морфологической верификации подозрительного очага.',
        'Стадирование и решение о первичной операции проводить в специализированном онкологическом маршруте.',
        'Обсуждать генетическое консультирование при соответствующем семейном или клиническом риске.',
        'После лечения выстраивать регулярное наблюдение с фокусом на рецидив и качество жизни.',
      ];
    case 'breast':
      return [
        'Любое узловое образование молочной железы оценивать по принципу triple assessment: осмотр, визуализация, морфология.',
        'Учитывать возраст, плотность ткани и семейный анамнез при выборе метода визуализации.',
        'Доброкачественные образования наблюдать только после уверенной верификации низкого риска.',
        'Пациентку обучать самоконтролю симптомов и графику скрининга.',
      ];
    case 'menopause':
      return [
        'Симптомы менопаузы вести персонифицированно с оценкой сердечно-сосудистого, онкологического и тромботического риска.',
        'При постменопаузальном кровотечении не ограничиваться только толщиной эндометрия: у большинства пациенток нужна морфологическая оценка вместе с ТВУЗИ.',
        'Локальные урогенитальные симптомы не требуют автоматического назначения системной терапии.',
        'Долгосрочно контролировать кости, метаболический профиль и качество жизни.',
      ];
    case 'vulvar':
      return [
        'Хронический зуд и боль вульвы не вести эмпирически без осмотра и, при необходимости, биопсии.',
        'Избегать агрессивных местных раздражителей и подробно разбирать уход за вульвой.',
        'При предраковых или рубцующихся процессах организовывать длительное наблюдение.',
        'Подключать психосексуальную и болевую поддержку при стойком снижении качества жизни.',
      ];
    default:
      return [
        `Оценивать ${disease.name.toLowerCase()} по совокупности жалоб, осмотра, лабораторных и инструментальных данных.`,
        `Использовать ${getPrimaryDiagnosticStep(disease).toLowerCase()} как часть поэтапной верификации диагноза.`,
        'Тактику лечения соотносить с тяжестью процесса, репродуктивными планами и риском осложнений.',
        `Контроль эффективности проводить на фоне терапии: ${getPrimaryTreatment(disease).toLowerCase()}.`,
      ];
  }
};

const buildGynecologyPrognosis = (cluster: GynecologyCluster, disease: Disease) => {
  switch (cluster) {
    case 'oncology':
      return {
        general: `Прогноз при ${disease.name.toLowerCase()} зависит прежде всего от стадии на момент диагностики, морфологического варианта и полноты первичного лечения.`,
        factors: ['Стадия и объем опухоли', 'Биологический подтип и морфология', 'Полнота хирургического стадирования или циторедукции', 'Ответ на системную и/или лучевую терапию'],
        survival: 'Онкологический прогноз требует индивидуальной оценки; ранняя диагностика принципиально улучшает исходы.',
      };
    case 'fertility':
      return {
        general: `Прогноз при ${disease.name.toLowerCase()} определяется возрастом пациентки, резервом яичников, длительностью бесплодия и возможностью устранить ведущий фактор.`,
        factors: ['Возраст и овариальный резерв', 'Трубный, маточный, эндокринный или мужской фактор', 'Длительность бесплодия и число предыдущих попыток', 'Ответ на индукцию овуляции или ВРТ'],
        survival: 'Заболевание не связано с летальностью, но имеет существенное влияние на репродуктивный исход и качество жизни.',
      };
    case 'urogyne':
      return {
        general: `Прогноз при ${disease.name.toLowerCase()} чаще благоприятный, но зависит от выраженности дефекта тазового дна и риска рецидива.`,
        factors: ['Степень пролапса или выраженность недержания', 'Качество тазового дна и наличие рецидивов', 'Сопутствующие урологические и кишечные симптомы', 'Приверженность реабилитации'],
        survival: 'Жизнеугрожающего риска обычно нет, но без коррекции выраженно страдает функция и качество жизни.',
      };
    case 'infection':
      return {
        general: `Прогноз при ${disease.name.toLowerCase()} хороший при раннем лечении, но ухудшается при восходящей инфекции и поздней верификации.`,
        factors: ['Своевременность начала терапии', 'Наличие осложнений: абсцесс, сальпингит, пельвиоперитонит', 'Повторные эпизоды и реинфекция', 'Приверженность лечению обоих партнеров'],
        survival: 'Летальность низкая, основной долгосрочный риск связан с хронической болью, трубным бесплодием и рецидивами.',
      };
    default:
      return {
        general: `Прогноз при ${disease.name.toLowerCase()} определяется своевременностью диагностики, выраженностью процесса и ответом на лечение.`,
        factors: ['Стадия или тяжесть заболевания на момент обращения', 'Наличие осложнений и сопутствующей патологии', 'Своевременность начала терапии и приверженность наблюдению'],
        survival: 'Для большинства доброкачественных гинекологических состояний прогноз благоприятный при полноценном наблюдении и контроле рецидива.',
      };
  }
};

const buildGynecologyFollowUp = (cluster: GynecologyCluster, disease: Disease) => {
  switch (cluster) {
    case 'oncology':
      return {
        frequency: 'Обычно каждые 3-6 месяцев в первые 2-3 года, затем реже по онкологическому протоколу',
        duration: 'Не менее 5 лет, далее индивидуально',
        tests: ['Клинический осмотр и оценка симптомов', 'Инструментальная визуализация по локализации и стадии', 'Морфологический и лабораторный контроль по показаниям'],
      };
    case 'fertility':
      return {
        frequency: 'Каждый цикл лечения или каждые 1-3 месяца в зависимости от этапа репродуктивной программы',
        duration: 'До достижения беременности или завершения выбранной стратегии',
        tests: ['УЗИ малого таза/фолликулометрия', 'Контроль овуляции, эндометрия и овариального резерва', 'Пересмотр репродуктивного плана пары'],
      };
    case 'infection':
      return {
        frequency: 'Контроль через 48-72 часа при тяжелом течении и повторная оценка после завершения терапии',
        duration: 'До клинического и лабораторного разрешения процесса',
        tests: ['Клиническая динамика боли, температуры и выделений', 'Повторная лабораторная верификация по показаниям', 'УЗИ малого таза при осложненном течении'],
      };
    case 'menopause':
      return {
        frequency: 'Через 3 месяца после старта терапии, далее обычно каждые 6-12 месяцев',
        duration: 'На протяжении периода симптомов и приема терапии',
        tests: ['Оценка симптомов и переносимости терапии', 'ТВУЗИ при кровянистых выделениях или факторах риска', 'Контроль молочных лез, костной ткани и метаболического профиля'],
      };
    default:
      return {
        frequency: 'Через 1-3 месяца после начала лечения, далее каждые 6-12 месяцев',
        duration: 'До клинической стабилизации, затем в плановом порядке',
        tests: [getPrimaryDiagnosticStep(disease), 'Контроль клинических симптомов и объективного статуса', ...buildGynecologyImaging(cluster).slice(0, 2)],
      };
  }
};

const buildGynecologyCases = (cluster: GynecologyCluster, disease: Disease) => {
  switch (cluster) {
    case 'oncology':
      return [
        {
          presentation: `Пациентка обратилась с симптомами, подозрительными на ${disease.name.toLowerCase()}, и прогрессирующим ухудшением состояния за последние месяцы.`,
          findings: 'По данным осмотра, экспертного УЗИ и стадирующей визуализации выявлен подозрительный первичный очаг с необходимостью морфологической верификации.',
          diagnosis: disease.name,
          treatment: 'Проведена биопсия/оперативная верификация, затем онкологическая тактика определена мультидисциплинарной командой.',
          outcome: 'Пациентка переведена на специализированное онкологическое наблюдение с контролем рецидива и качества жизни.',
        },
      ];
    case 'fertility':
      return [
        {
          presentation: 'Пациентка обратилась с отсутствием беременности в течение года регулярной половой жизни без контрацепции.',
          findings: 'УЗИ и этапное обследование выявили ведущий репродуктивный фактор; обследование партнера проведено параллельно.',
          diagnosis: disease.name,
          treatment: 'Проведена адресная коррекция причины бесплодия с последующим переходом к ВРТ при недостаточном эффекте.',
          outcome: 'После корректировки тактики получен репродуктивный результат или сформирован следующий шаг лечения без потери времени.',
        },
      ];
    case 'infection':
      return [
        {
          presentation: `Пациентка поступила с жалобами на ${getPrimarySymptom(disease).toLowerCase()} и признаки воспаления нижних или верхних половых путей.`,
          findings: 'Лабораторная верификация и УЗИ позволили подтвердить инфекционный процесс и исключить осложнения, требующие дренирования.',
          diagnosis: disease.name,
          treatment: 'Назначена этиотропная антибактериальная/противопротозойная терапия с лечением партнера и кратким клиническим контролем.',
          outcome: 'На фоне лечения симптомы регрессировали, пациентке разъяснены меры профилактики реинфекции и репродуктивных осложнений.',
        },
      ];
    case 'urogyne':
      return [
        {
          presentation: `Пациентка предъявляла жалобы на ${getPrimarySymptom(disease).toLowerCase()} с ограничением повседневной активности и снижением качества жизни.`,
          findings: 'Функциональная оценка, дневник симптомов и УЗИ тазового дна уточнили ведущий механизм нарушения.',
          diagnosis: disease.name,
          treatment: 'Начата консервативная реабилитация; при недостаточном эффекте обсуждена этапная хирургическая коррекция.',
          outcome: 'После подбора тактики достигнуто уменьшение симптомов и сформирован долгосрочный план профилактики рецидива.',
        },
      ];
    default:
      return [
        {
          presentation: `Пациентка обратилась с жалобами на ${getPrimarySymptom(disease).toLowerCase()} и типичную для ${disease.name.toLowerCase()} клиническую симптоматику.`,
          findings: `${getPrimaryDiagnosticStep(disease)}. Дополнительная визуализация подтвердила признаки заболевания без альтернативной причины симптомов.`,
          diagnosis: disease.name,
          treatment: `Начата терапия: ${getPrimaryTreatment(disease)}. Тактика уточнена с учетом клинической динамики.`,
          outcome: 'На фоне лечения достигнуто клиническое улучшение, рекомендовано плановое наблюдение для контроля рецидива.',
        },
      ];
  }
};

const buildImaging = (disease: Disease) => {
  const derived = disease.diagnostics.steps.filter((step) => /УЗИ|МРТ|КТ|допплер|КТГ|биометр/i.test(step));

  if (derived.length > 0) {
    return derived;
  }

  if (disease.subtitle === 'Акушерство') {
    return buildObstetricsImaging(getObstetricsCluster(disease));
  }

  return buildGynecologyImaging(getGynecologyCluster(disease));
};

const buildDifferential = (disease: Disease) => {
  if (disease.subtitle === 'Акушерство') {
    return buildObstetricsDifferential(getObstetricsCluster(disease));
  }

  return buildGynecologyDifferential(getGynecologyCluster(disease));
};

const buildProtocols = (disease: Disease): UltrasoundProtocol[] => {
  if (disease.subtitle === 'Акушерство') {
    return buildObstetricsProtocols(getObstetricsCluster(disease));
  }

  return buildGynecologyProtocols(getGynecologyCluster(disease));
};

const buildFindings = (disease: Disease): UltrasoundFinding[] => {
  if (disease.subtitle === 'Акушерство') {
    return buildObstetricsFindings(getObstetricsCluster(disease), disease);
  }

  return buildGynecologyFindings(getGynecologyCluster(disease), disease);
};

const buildNormalValues = (disease: Disease) => {
  if (disease.subtitle === 'Акушерство') {
    return buildObstetricsNormalValues(getObstetricsCluster(disease));
  }

  return buildGynecologyNormalValues(getGynecologyCluster(disease));
};

const buildImagingTips = (disease: Disease) => {
  if (disease.subtitle === 'Акушерство') {
    return buildObstetricsTips(getObstetricsCluster(disease));
  }

  return buildGynecologyTips(getGynecologyCluster(disease));
};

const buildRecommendations = (disease: Disease) => {
  if (disease.subtitle === 'Акушерство') {
    return buildObstetricsRecommendations(getObstetricsCluster(disease), disease);
  }

  return buildGynecologyRecommendations(getGynecologyCluster(disease), disease);
};

const buildPrognosis = (disease: Disease) => {
  if (disease.subtitle === 'Акушерство') {
    return buildObstetricsPrognosis(getObstetricsCluster(disease), disease);
  }

  return buildGynecologyPrognosis(getGynecologyCluster(disease), disease);
};

const buildFollowUp = (disease: Disease) => {
  if (disease.subtitle === 'Акушерство') {
    return buildObstetricsFollowUp(getObstetricsCluster(disease), disease);
  }

  return buildGynecologyFollowUp(getGynecologyCluster(disease), disease);
};

const buildClinicalCases = (disease: Disease) => {
  if (disease.subtitle === 'Акушерство') {
    return buildObstetricsCases(getObstetricsCluster(disease), disease);
  }

  return buildGynecologyCases(getGynecologyCluster(disease), disease);
};

const buildUltrasound = (disease: Disease) => ({
  protocols: buildProtocols(disease),
  findings: buildFindings(disease),
  echogenicity:
    disease.subtitle === 'Гинекология'
      ? 'Описание эхоструктуры должно включать однородность, контуры, акустические эффекты и связь с зоной предполагаемого поражения.'
      : undefined,
  vascularization:
    disease.subtitle === 'Гинекология'
      ? 'Васкуляризация оценивается при ЦДК/энергетическом допплере для уточнения активности процесса и онкориска.'
      : undefined,
  dopplerFindings:
    disease.subtitle === 'Акушерство'
      ? 'Допплерометрия используется для раннего выявления плацентарной недостаточности и ухудшения состояния плода.'
      : 'Допплер помогает оценить характер кровоснабжения очага, выявить перекрут, воспалительную гиперваскуляризацию или патологический опухолевый рисунок.',
  imagingTips: buildImagingTips(disease),
  normalValues: buildNormalValues(disease),
  pitfalls: ['Не интерпретировать УЗИ изолированно без клинического контекста и данных смежных исследований.', 'При неубедительной картине не повторять одно и то же исследование бесконечно, а эскалировать визуализацию по показаниям.'],
  whenMRIorCTNeeded: ['Нужна дополнительная визуализация при неясной картине, глубоком распространении процесса, онкоподозрении или расхождении УЗИ с клиникой.'],
  reportingChecklist: ['Локализация и размеры', 'Ключевые патологические признаки', 'Признаки осложнений', 'Клинически значимые измерения', 'Рекомендации по дальнейшей визуализации при необходимости'],
});

const mergeUltrasound = (disease: Disease) => {
  const fallback = buildUltrasound(disease);
  const current = disease.ultrasound;

  if (!current) {
    return fallback;
  }

  return {
    protocols: current.protocols?.length ? current.protocols : fallback.protocols,
    findings: current.findings?.length ? current.findings : fallback.findings,
    echogenicity: current.echogenicity ?? fallback.echogenicity,
    vascularization: current.vascularization ?? fallback.vascularization,
    dopplerFindings: current.dopplerFindings ?? fallback.dopplerFindings,
    imagingTips: current.imagingTips?.length ? current.imagingTips : fallback.imagingTips,
    normalValues: current.normalValues ?? fallback.normalValues,
    pitfalls: current.pitfalls?.length ? current.pitfalls : fallback.pitfalls,
    whenMRIorCTNeeded: current.whenMRIorCTNeeded?.length ? current.whenMRIorCTNeeded : fallback.whenMRIorCTNeeded,
    reportingChecklist: current.reportingChecklist?.length ? current.reportingChecklist : fallback.reportingChecklist,
  };
};

const deepRepair = <T,>(value: T): T => {
  if (typeof value === 'string') {
    return cleanText(value) as T;
  }

  if (Array.isArray(value)) {
    return value.map((entry) => deepRepair(entry)) as T;
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, entry]) => [cleanText(key), deepRepair(entry)]),
    ) as T;
  }

  return value;
};

export const enrichDisease = (rawDisease: DiseaseInput): Disease => {
  const disease = normalizeDisease(rawDisease);
  const finalGuidelines =
    disease.subtitle === 'Гинекология'
      ? buildGynecologyGuidelines(getGynecologyCluster(disease))
      : buildObstetricsGuidelines(getObstetricsCluster(disease));

  const enriched: Disease = {
    ...disease,
    overview: disease.overview ?? buildOverview(disease),
    diagnostics: {
      ...disease.diagnostics,
      imaging: disease.diagnostics.imaging?.length ? disease.diagnostics.imaging : buildImaging(disease),
      differential: disease.diagnostics.differential?.length ? disease.diagnostics.differential : buildDifferential(disease),
      initialEvaluation: disease.diagnostics.initialEvaluation?.length ? disease.diagnostics.initialEvaluation : [cleanText(getPrimaryDiagnosticStep(disease))],
      requiredMinimum: disease.diagnostics.requiredMinimum?.length ? disease.diagnostics.requiredMinimum : withFallback(disease.clinicalSummary?.diagnosticMinimum, [cleanText(getPrimaryDiagnosticStep(disease)), cleanText(disease.diagnostics.markers)]),
      confirmatoryTests: disease.diagnostics.confirmatoryTests?.length ? disease.diagnostics.confirmatoryTests : withFallback(disease.diagnostics.imaging, [cleanText(getPrimaryDiagnosticStep(disease))]),
      testsByIndication: disease.diagnostics.testsByIndication?.length ? disease.diagnostics.testsByIndication : withFallback(disease.diagnostics.differential, ['Дополнительные тесты назначаются при атипичном течении, осложнениях или необходимости уточнить альтернативный диагноз.']),
      avoidOvertesting: disease.diagnostics.avoidOvertesting?.length ? disease.diagnostics.avoidOvertesting : ['Не расширять обследование без клинического вопроса и влияния результата на тактику.'],
    },
    treatment: {
      ...disease.treatment,
      firstLine: disease.treatment.firstLine?.length ? disease.treatment.firstLine : disease.treatment.conservative,
      secondLine: disease.treatment.secondLine?.length ? disease.treatment.secondLine : disease.treatment.surgical,
      proceduralOrSurgical: disease.treatment.proceduralOrSurgical?.length ? disease.treatment.proceduralOrSurgical : disease.treatment.surgical,
      inpatientManagement: disease.treatment.inpatientManagement?.length ? disease.treatment.inpatientManagement : (disease.subtitle === 'Акушерство' ? ['При нестабильном течении требуется стационарное ведение и мониторинг.'] : []),
      whatNotToDo: disease.treatment.whatNotToDo?.length ? disease.treatment.whatNotToDo : ['Не продолжать неэффективную терапию без пересмотра диагноза и целей лечения.'],
      guidelines: finalGuidelines,
    },
    guidelineBasis: disease.guidelineBasis?.length ? disease.guidelineBasis : buildGuidelineBasis(disease, finalGuidelines),
    guidelineStatus: disease.guidelineStatus ?? 'current',
    lastReviewed: disease.lastReviewed ?? CURRENT_CONTENT_REVIEW_DATE,
    sourceQuality: disease.sourceQuality ?? buildSourceQuality(disease),
    redFlags: disease.redFlags?.length ? disease.redFlags : disease.clinicalSummary?.redFlags ?? buildClinicalSummary(disease).redFlags,
    diagnosticCriteria: disease.diagnosticCriteria ?? buildDiagnosticCriteria(disease),
    severityStratification: disease.severityStratification ?? buildSeverityStratification(disease),
    differentialDiagnosis: disease.differentialDiagnosis?.length ? disease.differentialDiagnosis : buildStructuredDifferential(disease),
    managementAlgorithm: disease.managementAlgorithm ?? buildManagementAlgorithm(disease),
    contraindicatedOrAvoid: disease.contraindicatedOrAvoid?.length ? disease.contraindicatedOrAvoid : disease.treatment.whatNotToDo?.length ? disease.treatment.whatNotToDo : ['Избегать задержки эскалации при ухудшении клинической картины.'],
    ultrasound: mergeUltrasound(disease),
    recommendations: disease.recommendations?.length ? disease.recommendations : buildRecommendations(disease),
    prognosis: disease.prognosis ?? buildPrognosis(disease),
    followUp: disease.followUp ?? buildFollowUp(disease),
    followUpTriggers: disease.followUpTriggers ?? buildFollowUpTriggers(disease),
    clinicalSummary: disease.clinicalSummary ?? buildClinicalSummary(disease),
    clinicalCases: disease.clinicalCases?.length ? disease.clinicalCases : buildClinicalCases(disease),
    patientExplanation: disease.patientExplanation ?? buildPatientExplanation(disease),
    patientCounseling: disease.patientCounseling?.length ? disease.patientCounseling : buildPatientCounseling(disease),
    specialPopulations: disease.specialPopulations ?? buildSpecialPopulations(disease),
    timingOfDelivery: disease.timingOfDelivery ?? buildTimingOfDelivery(disease),
    maternalMonitoring: disease.maternalMonitoring ?? buildMaternalMonitoring(disease),
    fetalMonitoring: disease.fetalMonitoring ?? buildFetalMonitoring(disease),
    inpatientVsOutpatient: disease.inpatientVsOutpatient ?? buildInpatientVsOutpatient(disease),
    deliveryIndications: disease.deliveryIndications?.length ? disease.deliveryIndications : buildDeliveryIndications(disease),
    postpartumManagement: disease.postpartumManagement?.length ? disease.postpartumManagement : buildPostpartumManagement(disease),
    fertilityImpact: disease.fertilityImpact?.length ? disease.fertilityImpact : buildFertilityImpact(disease),
    malignancyRisk: disease.malignancyRisk?.length ? disease.malignancyRisk : buildMalignancyRisk(disease),
    recurrenceRisk: disease.recurrenceRisk?.length ? disease.recurrenceRisk : buildRecurrenceRisk(disease),
    screeningAndPrevention: disease.screeningAndPrevention?.length ? disease.screeningAndPrevention : buildScreeningAndPrevention(disease),
    whenBiopsyNeeded: disease.whenBiopsyNeeded?.length ? disease.whenBiopsyNeeded : buildWhenBiopsyNeeded(disease),
  };

  return deepRepair(applyClinicalSourceOverlay(enriched));
};

const slugifyIdPart = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9а-яё]+/gi, '-')
    .replace(/^-+|-+$/g, '');

const ensureUniqueDiseaseIds = (diseases: Disease[]) => {
  const usedIds = new Set<string>();

  return diseases.map((disease) => {
    const baseId = disease.id.trim();

    if (!usedIds.has(baseId)) {
      usedIds.add(baseId);
      return disease;
    }

    const subtitlePart = slugifyIdPart(disease.subtitle);
    const icdPart = slugifyIdPart(disease.icdDetail ?? disease.icd);
    let candidateId = `${baseId}__${subtitlePart}-${icdPart}`;
    let duplicateIndex = 2;

    while (usedIds.has(candidateId)) {
      candidateId = `${baseId}__${subtitlePart}-${icdPart}-${duplicateIndex}`;
      duplicateIndex += 1;
    }

    usedIds.add(candidateId);

    return {
      ...disease,
      id: candidateId,
    };
  });
};

export const enrichDiseases = (diseases: Disease[]) => ensureUniqueDiseaseIds(diseases.map((disease) => enrichDisease(disease as DiseaseInput)));
