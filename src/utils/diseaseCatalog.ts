import type { CategoryId, Disease, TabType } from '../types';
import { isObstetricsLabel, repairText } from './textRepair';

type NonAllCategory = Exclude<CategoryId, 'all'>;

type CategorizedDisease = {
  item: Disease;
  category: NonAllCategory;
  searchTarget: string;
};

const weightedKeywords = new Set(['спкя', 'впч', 'вич', 'cin', 'hpv', 'pre-eclampsia']);

const categoryOverrides: Record<string, NonAllCategory> = {
  'breast-cancer': 'oncology',
  'cervical-cancer': 'oncology',
  'endometrial-cancer': 'oncology',
  'ovarian-cancer': 'oncology',
  'uterine-sarcoma': 'oncology',
  'vaginal-cancer': 'oncology',
  'vulvar-cancer': 'oncology',
  vin: 'oncology',
  vain: 'oncology',
  'pelvic-inflammatory-disease': 'infection',
  endometritis: 'infection',
  salpingitis: 'infection',
  'genital-tuberculosis': 'infection',
  syphilis: 'infection',
  gonorrhea: 'infection',
  'genital-herpes': 'infection',
  'genital-warts': 'infection',
  'chlamydial-cervicitis': 'infection',
  'urogenital-trichomoniasis': 'infection',
  'urinary-tract-infection': 'infection',
  'recurrent-cystitis': 'infection',
  'recurrent-bv': 'infection',
  'recurrent-candidiasis': 'infection',
  mastitis: 'infection',
  amenorrhea: 'hormonal',
  anovulation: 'hormonal',
  'female-infertility': 'hormonal',
  'tubal-factor-infertility': 'hormonal',
  'endometriosis-infertility': 'hormonal',
  ivf: 'hormonal',
  iui: 'hormonal',
  icsi: 'hormonal',
  pgd: 'hormonal',
  'donor-programs': 'hormonal',
  menopause: 'hormonal',
  hrt: 'hormonal',
  hypothyroidism: 'hormonal',
  'premature-ovarian-failure': 'hormonal',
  'diminished-ovarian-reserve': 'hormonal',
  'menopausal-syndrome': 'hormonal',
  'genitourinary-syndrome-menopause': 'hormonal',
  chorioamnionitis: 'infection',
  'torch-infections': 'infection',
  'hiv-pregnancy': 'infection',
  listeriosis: 'infection',
  'postpartum-endometritis': 'infection',
  'postpartum-sepsis': 'infection',
  'postpartum-infection': 'infection',
  'pyelonephritis-pregnancy': 'infection',
  gbs: 'infection',
  torch: 'infection',
};

const categoryKeywords: Record<NonAllCategory, string[]> = {
  oncology: ['рак', 'онколог', 'опухол', 'неоплаз', 'карцином', 'малигн', 'злокаче', 'сарком', 'метастаз', 'дисплаз', 'cin', 'c53'],
  infection: ['инфек', 'вирус', 'бактер', 'гриб', 'впч', 'hpv', 'вич', 'hiv', 'герпес', 'хламид', 'гоноре', 'трихомон', 'микоплаз', 'уреаплаз', 'вагиноз', 'кандид', 'цервицит', 'эндометрит', 'сальпингит'],
  hormonal: ['гормон', 'эндокрин', 'спкя', 'ановуля', 'гиперандроген', 'гиперпролактин', 'эстроген', 'прогестерон', 'инсулинорезист', 'тиреоид', 'диабет'],
  inflammatory: ['воспал', 'эндометриоз', 'аднексит', 'сальпинго', 'вагинит', 'вульвит', 'цервицит', 'тазов', 'боль', 'спайк'],
  pregnancy: ['беремен', 'гестаци', 'род', 'плод', 'плацент', 'выкидыш', 'аборт', 'преэкламп', 'экламп', 'послеродов', 'трофобласт', 'акушер', 'o14'],
};

export const categoryPriority: NonAllCategory[] = ['pregnancy', 'oncology', 'infection', 'hormonal', 'inflammatory'];
export const gynecologyCategories: CategoryId[] = ['all', 'oncology', 'infection', 'hormonal', 'inflammatory', 'pregnancy'];
export const obstetricsCategories: CategoryId[] = ['all', 'infection', 'hormonal', 'inflammatory', 'pregnancy'];

export function getVisibleCategories(activeTab: TabType): CategoryId[] {
  return activeTab === 'gynecology' ? gynecologyCategories : obstetricsCategories;
}

function clean(value: unknown) {
  return repairText(value).toLowerCase().replace(/ё/g, 'е');
}

function buildSearchableText(item: Disease) {
  const structuredDifferential = item.differentialDiagnosis?.flatMap((entry) => [
    entry.condition,
    entry.whyConfused ?? '',
    entry.howToDistinguish ?? '',
    ...(entry.testsIfNeeded ?? []),
  ]) ?? [];
  const guidelineBasis = item.guidelineBasis?.flatMap((entry) => [
    entry.organization,
    entry.title ?? '',
    entry.documentType ?? '',
    entry.scope ?? '',
    ...(entry.usedFor ?? []),
  ]) ?? [];
  const sourceStack = item.sourceStack?.flatMap((entry) => [
    entry.organization,
    entry.title ?? '',
    entry.documentType ?? '',
    entry.scope ?? '',
    ...(entry.usedFor ?? []),
  ]) ?? [];
  const pathwayText = [
    ...(item.clinicalPathway ?? []),
    ...(item.urgentPathway ?? []),
    ...(item.treatmentPathway ?? []),
  ].flatMap((entry) => [entry.title, entry.detail, entry.priority ?? '', entry.linkedTab ?? '']);
  const atlasText = item.atlasHotspots?.flatMap((entry) => [
    entry.label,
    entry.organ,
    entry.clinicalMeaning,
    entry.risk,
    entry.linkedTab ?? '',
  ]) ?? [];
  const aiPromptText = item.aiPrompts
    ? Object.values(item.aiPrompts).flatMap((entry) => entry ?? [])
    : [];

  return [
    item.name,
    item.icd,
    item.icdDetail ?? '',
    item.subtitle,
    item.description,
    item.definition,
    item.overview?.quickTake ?? '',
    item.overview?.prevalence ?? '',
    item.overview?.practiceFocus ?? '',
    item.epidemiology,
    item.classification?.title ?? '',
    item.diagnostics.markers,
    ...(item.diagnosticCriteria?.clinical ?? []),
    ...(item.diagnosticCriteria?.laboratory ?? []),
    ...(item.diagnosticCriteria?.imaging ?? []),
    ...(item.diagnosticCriteria?.diagnosisConfirmedWhen ?? []),
    ...(item.diagnosticCriteria?.diagnosisExcludedWhen ?? []),
    ...item.etiology,
    ...item.symptoms,
    ...(item.symptomGroups?.typical ?? []),
    ...(item.symptomGroups?.alarm ?? []),
    ...(item.classification?.stages ?? []),
    ...(item.diagnostics.steps ?? []),
    ...(item.managementAlgorithm?.initialAssessment ?? []),
    ...(item.managementAlgorithm?.startTreatment ?? []),
    ...(item.managementAlgorithm?.escalateWhen ?? []),
    ...(item.treatment.conservative ?? []),
    ...(item.treatment.surgical ?? []),
    ...(item.contraindicatedOrAvoid ?? []),
    ...(item.patientCounseling ?? []),
    ...(item.ultrasoundChecklist ?? []),
    ...pathwayText,
    ...atlasText,
    ...aiPromptText,
    ...structuredDifferential,
    ...guidelineBasis,
    ...sourceStack,
    item.sourceDate ?? '',
    item.revisionDue ?? '',
    item.treatment.guidelines.eau,
    item.treatment.guidelines.acog,
    item.treatment.guidelines.ranzcog,
    item.treatment.guidelines.ru,
  ].map(clean).join(' ');
}

function getCategoryScore(text: string, category: NonAllCategory) {
  return categoryKeywords[category].reduce((score, keyword) => {
    if (!text.includes(keyword)) return score;
    return score + (keyword.length >= 8 || weightedKeywords.has(keyword) ? 2 : 1);
  }, 0);
}

function resolveDiseaseCategory(item: Disease, searchableText: string): NonAllCategory {
  const ruleId = item.id.trim().toLowerCase().split('__')[0];
  const overriddenCategory = categoryOverrides[ruleId];
  if (overriddenCategory) return overriddenCategory;

  const scores = categoryPriority.map((category) => ({ category, score: getCategoryScore(searchableText, category) }));
  const topScore = Math.max(...scores.map(({ score }) => score));
  if (topScore === 0) return isObstetricsLabel(item.subtitle) ? 'pregnancy' : 'inflammatory';

  return scores.find(({ score }) => score === topScore)?.category ?? 'inflammatory';
}

export function categorizeDiseases(items: Disease[]): CategorizedDisease[] {
  return items.map((item) => {
    const searchTarget = buildSearchableText(item);
    return { item, category: resolveDiseaseCategory(item, searchTarget), searchTarget };
  });
}

export function getCategoryCounts(categorizedData: CategorizedDisease[]): Record<NonAllCategory, number> {
  return categoryPriority.reduce((result, category) => {
    result[category] = categorizedData.filter((entry) => entry.category === category).length;
    return result;
  }, {} as Record<NonAllCategory, number>);
}

type FilterDiseasesParams = {
  activeCategory: CategoryId;
  categorizedData: CategorizedDisease[];
  historyIds: Set<string>;
  favoriteIds: Set<string>;
  normalizedSearch: string;
  showFavorites: boolean;
  showHistory: boolean;
};

export function filterDiseases({
  activeCategory,
  categorizedData,
  historyIds,
  favoriteIds,
  normalizedSearch,
  showFavorites,
  showHistory,
}: FilterDiseasesParams): Disease[] {
  let data = categorizedData;

  if (normalizedSearch) {
    const searchTerms = clean(normalizedSearch).split(' ').filter(Boolean);

    data = data.filter(({ searchTarget, item }) => {
      const targetText = clean(searchTarget);
      const nameText = clean(item.name);

      return searchTerms.every((term) => {
        if (targetText.includes(term)) return true;
        if (nameText.includes(term)) return true;
        return getFuzzyMatch(term, targetText);
      });
    });
  }

  if (showFavorites) data = data.filter(({ item }) => favoriteIds.has(item.id));
  if (showHistory) data = data.filter(({ item }) => historyIds.has(item.id));
  if (activeCategory !== 'all') data = data.filter(({ category }) => category === activeCategory);

  return data.map(({ item }) => item);
}

function getFuzzyMatch(term: string, target: string): boolean {
  if (term.length < 3) return false;
  if (term.length > 12) return false;
  if (/^(.)\1{3,}$/.test(term)) return false;

  const synonyms: Record<string, string[]> = {
    миома: ['лейомиома', 'фиброма', 'd25'],
    эрозия: ['эктопия', 'цервицит'],
    эндометриоз: ['n80', 'аденомиоз', 'тазовая боль'],
    впч: ['папилломавирус', 'hpv', 'cin'],
    вич: ['вирус иммунодефицита', 'hiv'],
    кок: ['оральные контрацептивы', 'комбинированные'],
    вми: ['инсеминация'],
    икси: ['icsi'],
    эко: ['экстракорпоральное', 'ivf'],
    пгд: ['предимплантационная'],
    пн: ['недостаточность яичников'],
    преэклампсия: ['o14', 'гипертензия', 'белок', 'давление'],
    кровотечение: ['n92', 'o46', 'меноррагия', 'гемостаз'],
    инфекция: ['хламид', 'гоноре', 'трихомон', 'воспал'],
  };

  const lowerTerm = clean(term);
  for (const [key, values] of Object.entries(synonyms)) {
    if (key.includes(lowerTerm) || lowerTerm.includes(key)) {
      return values.some((value) => target.includes(clean(value)));
    }
    if (values.some((value) => clean(value).includes(lowerTerm))) return true;
  }

  let termIndex = 0;
  for (let i = 0; i < target.length && termIndex < term.length; i += 1) {
    if (target[i] === term[termIndex]) termIndex += 1;
  }

  return termIndex >= Math.floor(term.length * 0.7);
}
