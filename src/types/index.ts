export interface UltrasoundProtocol {
  method: string;
  indications: string[];
  preparation?: string;
  optimalTiming?: string;
  limitations?: string[];
}

export interface UltrasoundFinding {
  location: string;
  description: string;
  measurements?: Record<string, string>;
  normal?: string;
  pathology?: string;
  clinicalSignificance?: string;
}

export interface GuidelineReference {
  organization: string;
  year?: number | string;
  title?: string;
  documentType?: string;
  url?: string;
  accessedAt?: string;
  scope?: string;
  status?: 'current' | 'latest available active guideline' | 'legacy' | string;
  usedFor?: string[];
}

export interface SourceQuality {
  level: 'verified' | 'reviewed' | 'needs-source-review' | 'fallback' | string;
  label: string;
  note?: string;
}

export interface DiseaseOverview {
  quickTake?: string;
  prevalence?: string;
  riskLevel?: 'low' | 'moderate' | 'high' | 'critical' | string;
  practiceFocus?: string;
}

export interface DiseaseDiagnosticCriteria {
  clinical?: string[];
  laboratory?: string[];
  imaging?: string[];
  pathology?: string[];
  diagnosisConfirmedWhen?: string[];
  diagnosisExcludedWhen?: string[];
  notes?: string[];
}

export interface DiseaseSeverityTier {
  name: string;
  criteria: string[];
  clinicalMeaning?: string;
  managementImpact?: string;
}

export interface DiseaseSeverityStratification {
  title?: string;
  tiers: DiseaseSeverityTier[];
}

export interface DifferentialDiagnosisItem {
  condition: string;
  whyConfused?: string;
  howToDistinguish?: string;
  testsIfNeeded?: string[];
}

export interface DiseaseManagementAlgorithm {
  initialAssessment?: string[];
  confirmDiagnosis?: string[];
  startTreatment?: string[];
  reassess?: string[];
  escalateWhen?: string[];
  referWhen?: string[];
}

export interface DiseaseFollowUpTriggers {
  routineReview?: string[];
  earlierReviewIf?: string[];
  switchTreatmentIf?: string[];
  urgentReassessmentIf?: string[];
}

export interface DiseaseSpecialPopulations {
  adolescents?: string[];
  pregnancy?: string[];
  postpartum?: string[];
  perimenopause?: string[];
  postmenopause?: string[];
  obesity?: string[];
  fertilityPlanning?: string[];
}

export interface TimingOfDelivery {
  expectantManagementUntil?: string[];
  deliverNowWhen?: string[];
  gestationalAgeModifiers?: string[];
  modeOfDeliveryNotes?: string[];
}

export interface MonitoringPlan {
  vitalSigns?: string[];
  labs?: string[];
  imaging?: string[];
  warningSymptoms?: string[];
  reassessmentInterval?: string[];
}

export interface InpatientOutpatientPlan {
  outpatientWhen?: string[];
  inpatientWhen?: string[];
}

export interface TreatmentGuidelines {
  eau: string;
  acog: string;
  ranzcog: string;
  ru: string;
}

export interface DiseasePrognosis {
  general?: string;
  factors?: string[];
  survival?: string;
}

export interface DiseaseFollowUp {
  frequency?: string;
  duration?: string;
  tests?: string[];
}

export interface DiseaseClinicalCase {
  presentation: string;
  findings: string;
  diagnosis: string;
  treatment: string;
  outcome: string;
  history?: string;
  decisionPoints?: string[];
  whyThisPlan?: string;
  guidelineJustification?: string;
}

export interface DiseaseUltrasound {
  protocols: UltrasoundProtocol[];
  findings: UltrasoundFinding[];
  echogenicity?: string;
  vascularization?: string;
  dopplerFindings?: string;
  imagingTips?: string[];
  normalValues?: Record<string, string>;
  pitfalls?: string[];
  whenMRIorCTNeeded?: string[];
  reportingChecklist?: string[];
}

export interface DiseaseClinicalSummary {
  quickSummary?: string;
  redFlags?: string[];
  firstLineActions?: string[];
  diagnosticMinimum?: string[];
  whenToEscalate?: string[];
  clinicalPearls?: string[];
}

export interface PatientExplanation {
  plainLanguageSummary?: string;
  whatToWatch?: string[];
  selfCareBoundaries?: string[];
  whenToSeekCare?: string[];
}

export interface DiseaseClinicalTimeline {
  suspicion?: string[];
  confirmation?: string[];
  treatmentStart?: string[];
  review?: string[];
}

export interface DiseaseImmediateActionPlan {
  now?: string[];
  urgentIf?: string[];
  avoid?: string[];
  followUp?: string[];
}

export interface DiseaseSourceConfidence {
  level?: 'high' | 'moderate' | 'limited' | 'requires-review' | string;
  reviewedBy?: string;
  note?: string;
}

export type DiseaseSubtitle =
  | 'Гинекология'
  | 'Акушерство';

export type EditorialStatus = 'verified' | 'reviewed' | 'needs-source-review' | 'fallback' | string;

export interface ClinicalPathwayStep {
  title: string;
  detail: string;
  priority?: 'routine' | 'attention' | 'urgent' | string;
  linkedTab?: string;
}

export interface DiseaseAtlasHotspotContract {
  id: string;
  label: string;
  organ: string;
  clinicalMeaning: string;
  risk: 'routine' | 'attention' | 'urgent' | string;
  linkedTab?: string;
}

export interface DiseaseAiPrompts {
  clinicalPearls?: string[];
  differential?: string[];
  workupPlan?: string[];
  patientMemo?: string[];
  dischargeSummary?: string[];
  triage?: string[];
  followUp?: string[];
  doctorQuestions?: string[];
}

export interface Disease {
  id: string;
  name: string;
  icd: string;
  icdDetail?: string;
  editorialStatus?: EditorialStatus;
  canonicalIcd?: string;
  relatedIcdCodes?: string[];
  duplicateOf?: string;
  clinicalPathway?: ClinicalPathwayStep[];
  urgentPathway?: ClinicalPathwayStep[];
  ultrasoundChecklist?: string[];
  treatmentPathway?: ClinicalPathwayStep[];
  atlasScene?: string;
  atlasHotspots?: DiseaseAtlasHotspotContract[];
  aiPrompts?: DiseaseAiPrompts;
  subtitle: DiseaseSubtitle;
  description: string;
  icon: string;
  definition: string;
  overview?: DiseaseOverview;
  epidemiology: string;
  etiology: string[];
  symptoms: string[];
  symptomGroups?: {
    typical?: string[];
    early?: string[];
    late?: string[];
    alarm?: string[];
    atypical?: string[];
  };
  classification?: {
    title: string;
    stages: string[];
  };
  diagnosticCriteria?: DiseaseDiagnosticCriteria;
  severityStratification?: DiseaseSeverityStratification;
  differentialDiagnosis?: DifferentialDiagnosisItem[];
  diagnostics: {
    steps: string[];
    markers: string;
    differential?: string[];
    imaging?: string[];
    initialEvaluation?: string[];
    requiredMinimum?: string[];
    confirmatoryTests?: string[];
    testsByIndication?: string[];
    avoidOvertesting?: string[];
  };
  ultrasound?: DiseaseUltrasound;
  treatment: {
    conservative?: string[];
    surgical?: string[];
    firstLine?: string[];
    secondLine?: string[];
    proceduralOrSurgical?: string[];
    inpatientManagement?: string[];
    whatNotToDo?: string[];
    guidelines: TreatmentGuidelines;
  };
  sourceQuality?: SourceQuality;
  redFlags?: string[];
  guidelineBasis?: GuidelineReference[];
  sourceStack?: GuidelineReference[];
  sourceDate?: string;
  revisionDue?: string;
  guidelineStatus?: string;
  lastReviewed?: string;
  managementAlgorithm?: DiseaseManagementAlgorithm;
  contraindicatedOrAvoid?: string[];
  recommendations?: string[];
  prognosis?: DiseasePrognosis;
  followUp?: DiseaseFollowUp;
  followUpTriggers?: DiseaseFollowUpTriggers;
  clinicalSummary?: DiseaseClinicalSummary;
  clinicalCases?: DiseaseClinicalCase[];
  patientExplanation?: PatientExplanation;
  clinicalTimeline?: DiseaseClinicalTimeline;
  immediateActionPlan?: DiseaseImmediateActionPlan;
  sourceConfidence?: DiseaseSourceConfidence;
  patientCounseling?: string[];
  specialPopulations?: DiseaseSpecialPopulations;
  timingOfDelivery?: TimingOfDelivery;
  maternalMonitoring?: MonitoringPlan;
  fetalMonitoring?: MonitoringPlan;
  inpatientVsOutpatient?: InpatientOutpatientPlan;
  deliveryIndications?: string[];
  postpartumManagement?: string[];
  fertilityImpact?: string[];
  malignancyRisk?: string[];
  recurrenceRisk?: string[];
  screeningAndPrevention?: string[];
  whenBiopsyNeeded?: string[];
}

export interface Questionnaire {
  id: string;
  name: string;
  fullName: string;
  category: string;
  description: string;
  icon: string;
  questions: string[];
  options: string[];
  scoring: (answers: number[]) => ScoringResult;
  clinicalPurpose?: {
    screening?: string[];
    severityAssessment?: string[];
    followUpUse?: string[];
    triageUse?: string[];
  };
  targetPopulation?: {
    intendedFor?: string[];
    notValidatedFor?: string[];
    specialNotes?: string[];
  };
  cutoffInterpretation?: Array<{
    range: string;
    meaning: string;
    clinicalAction?: string;
  }>;
  nextStepByScore?: {
    low?: string[];
    intermediate?: string[];
    high?: string[];
    critical?: string[];
  };
  limitations?: string[];
  evidenceNote?: string[];
  guidelineBasis?: GuidelineReference[];
  sourceQuality?: SourceQuality;
  lastReviewed?: string;
  resultSummaryTemplate?: string;
  urgentCriteria?: string[];
  historyInterpretation?: string[];
  exportFields?: string[];
}

export type QuestionnaireData = Questionnaire;

export interface ScoringResult {
  level: string;
  severity: 'normal' | 'mild' | 'moderate' | 'severe' | 'critical' | string;
  color: string;
  recommendation: string;
}

export interface QuestionnaireHistory {
  id: string;
  name: string;
  fullName: string;
  date: string;
  score: number;
  level: string;
  severity: string;
  color: string;
}

export type CategoryId = 'all' | 'oncology' | 'infection' | 'hormonal' | 'inflammatory' | 'pregnancy';
export type TabType = 'home' | 'gynecology' | 'obstetrics';

export interface MedicationInteraction {
  drug: string;
  effect: string;
  level: 'low' | 'medium' | 'high' | string;
  severityNotes?: string[];
}

export interface Medication {
  id: string;
  name: string;
  nameEn: string;
  category: string;
  forms: string[];
  dosage: Record<string, string>;
  indications: string[];
  contraindications: string[];
  sideEffects: string[];
  interactions?: MedicationInteraction[];
  firstLineStatus?: {
    role?: 'first-line' | 'second-line' | 'adjunct' | 'reserve' | string;
    forConditions?: string[];
    notFirstLineWhen?: string[];
  };
  pregnancyLactation?: {
    pregnancyStatus?: string;
    pregnancyNotes?: string[];
    lactationStatus?: string;
    lactationNotes?: string[];
    trimesterSpecificNotes?: string[];
  };
  monitoring?: {
    beforeStart?: string[];
    duringTreatment?: string[];
    stopOrReviewIf?: string[];
  };
  scenarioTags?: string[];
  pregnancyTrimesterNotes?: string[];
  lactationNotes?: string[];
  monitoringChecklist?: string[];
  interactionSeverityNotes?: string[];
  pregnancyLactationDecision?: string[];
  regimenComparison?: Array<{
    regimen: string;
    bestFor?: string;
    avoidWhen?: string;
    monitoring?: string[];
  }>;
  clinicalUseCases?: Array<{
    scenario: string;
    whyChosen?: string;
    importantNotes?: string[];
  }>;
  majorPracticePoints?: string[];
  comparativeRole?: {
    preferredOver?: string[];
    lessUsefulThan?: string[];
    chooseWhen?: string[];
    avoidWhen?: string[];
  };
  routeAndSetting?: {
    route?: string[];
    setting?: Array<'outpatient' | 'day care' | 'inpatient' | 'emergency' | string>;
    prescriberLevel?: string[];
  };
  guidelineBasis?: GuidelineReference[];
  lastReviewed?: string;
}

export interface RegimenStep {
  day: string;
  drug: string;
  dose?: string;
  note?: string;
}

export interface Regimen {
  id: string;
  name: string;
  steps: RegimenStep[];
}

export interface RegimenData {
  id: string;
  name: string;
  steps?: RegimenStep[];
}

export type PharmaItem = Medication | Regimen | RegimenData;
