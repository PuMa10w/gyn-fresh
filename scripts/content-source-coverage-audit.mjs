import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { applyClinicalSourceOverlay } from '../src/utils/clinicalSourceOverlay.ts';
import { repairText } from '../src/utils/textRepair.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const sourceFields = [
  'clinicalSummary',
  'diagnosticCriteria',
  'differentialDiagnosis',
  'managementAlgorithm',
  'treatment',
  'ultrasound',
  'followUpTriggers',
  'patientCounseling',
  'guidelineBasis',
  'lastReviewed',
];

const essentialFields = ['clinicalSummary', 'diagnostics', 'treatment', 'definition', 'symptoms'];

const hasValue = (value) => {
  if (Array.isArray(value)) return value.length > 0;
  if (value && typeof value === 'object') return Object.keys(value).length > 0;
  return typeof value === 'string' ? value.trim().length > 0 : Boolean(value);
};

const importChunks = async (dirName) => {
  const dir = path.join(root, 'src', 'data', dirName);
  const files = (await fs.readdir(dir))
    .filter((file) => file.endsWith('.js'))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  const chunks = await Promise.all(files.map((file) => import(pathToFileURL(path.join(dir, file)).href)));
  return chunks.flatMap((chunk) => chunk.default ?? []);
};

const count = (items, fields) => ({
  total: items.length,
  fields: Object.fromEntries(
    fields.map((field) => [
      field,
      {
        present: items.filter((item) => hasValue(item[field])).length,
        percent: items.length ? Math.round((items.filter((item) => hasValue(item[field])).length / items.length) * 100) : 0,
      },
    ]),
  ),
  complete: items.filter((item) => fields.every((field) => hasValue(item[field]))).length,
});

const normalizeSearchText = (item) =>
  repairText(`${item.name ?? ''} ${item.icd ?? ''} ${item.icdDetail ?? ''} ${item.subtitle ?? ''} ${item.description ?? ''}`)
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

const hasAny = (text, patterns) => patterns.some((pattern) => pattern.test(text));

const clinicalCluster = (item) => {
  const text = normalizeSearchText(item);
  const primaryText = repairText(`${item.name ?? ''} ${item.icd ?? ''} ${item.icdDetail ?? ''}`).toLowerCase();
  if (hasAny(text, [/беремен/, /акушер/, /\bo\d{2}/i, /преэкламп/, /экламп/, /роды/, /плацент/, /послерод/])) return 'obstetrics';
  if (hasAny(text, [/кровотеч/, /остр(ый|ая|ое|ые|ого|ому|ым|ую)?\b/, /сепсис/, /перекрут/, /внематоч/, /разрыв/])) return 'urgent';
  if (hasAny(text, [/инфекц/, /воспал/, /вагинит/, /цервицит/, /сальпинг/, /зппп|иппп/, /взомт/])) return 'infection';
  if (hasAny(primaryText, [/(^|\s)рак(\s|$)/, /онко/, /карцином/, /неоплаз/, /\bc5/i, /\bc6/i, /\bd0/i])) return 'oncology';
  if (hasAny(text, [/эндометриоз/, /миома/, /аденомиоз/, /бесплод/, /репродук/, /спкя|поликистоз/])) return 'reproductive-endocrine';
  if (hasAny(text, [/узи/, /эндометр/, /яичник/, /матк/, /шейк/, /кист/])) return 'gynecology-core';
  return 'general';
};

const priorityScore = (item) => {
  const text = normalizeSearchText(item);
  const cluster = clinicalCluster(item);
  let score = 0;
  if (cluster === 'oncology') score += 5;
  if (cluster === 'urgent') score += 5;
  if (cluster === 'obstetrics') score += 4;
  if (cluster === 'infection') score += 3;
  if (cluster === 'reproductive-endocrine') score += 3;
  if (cluster === 'gynecology-core') score += 2;
  if (/кровотеч|беремен|преэкламп|экламп|сепсис|перекрут|внематоч|(^|\s)рак(\s|$)|онко/.test(text)) score += 2;
  if (item.guidelineBasis?.length) score += 2;
  if (item.lastReviewed) score += 2;
  if (item.clinicalSummary) score += 1;
  return score;
};

const summarizeClusters = (items) =>
  items.reduce((acc, item) => {
    const cluster = clinicalCluster(item);
    const current = acc[cluster] ?? { total: 0, rawComplete: 0, sourceAwareComplete: 0 };
    current.total += 1;
    if (sourceFields.every((field) => hasValue(item[field]))) current.rawComplete += 1;
    const sourceAware = applyClinicalSourceOverlay(item);
    if (sourceFields.every((field) => hasValue(sourceAware[field]))) current.sourceAwareComplete += 1;
    acc[cluster] = current;
    return acc;
  }, {});

const [gyn, obs] = await Promise.all([importChunks('gynChunks'), importChunks('obsChunks')]);
const all = [...gyn, ...obs].filter((item) => item?.name);
const top150 = [...all].sort((a, b) => priorityScore(b) - priorityScore(a)).slice(0, 150);
const sourceAwareAll = all.map((item) => applyClinicalSourceOverlay(item));
const sourceAwareTop150 = top150.map((item) => applyClinicalSourceOverlay(item));
const essentialCoverage = count(all, essentialFields);
const premiumCoverage = count(all, sourceFields);
const topCoverage = count(top150, sourceFields);
const sourceAwareCoverage = count(sourceAwareAll, sourceFields);
const sourceAwareTopCoverage = count(sourceAwareTop150, sourceFields);
const missingTop = top150
  .map((item) => ({
    id: item.id,
    name: repairText(item.name),
    icd: repairText(item.icd),
    cluster: clinicalCluster(item),
    priorityScore: priorityScore(item),
    missing: sourceFields.filter((field) => !hasValue(item[field])),
  }))
  .filter((entry) => entry.missing.length > 0);

const immediateManualReviewQueue = missingTop
  .filter((entry) => ['oncology', 'urgent', 'obstetrics', 'reproductive-endocrine', 'infection'].includes(entry.cluster))
  .slice(0, 30);

const findDuplicateCandidates = (items) =>
  Object.values(
    items.reduce((acc, item) => {
      const key = repairText(`${item.id ?? ''}::${item.icd ?? ''}`).toLowerCase();
      const entry = acc[key] ?? { key, count: 0, cards: [] };
      entry.count += 1;
      entry.cards.push({
        id: item.id,
        name: repairText(item.name),
        icd: repairText(item.icd),
        subtitle: repairText(item.subtitle),
        cluster: clinicalCluster(item),
      });
      acc[key] = entry;
      return acc;
    }, {}),
  )
    .filter((entry) => entry.count > 1)
    .slice(0, 40);

const essentialThreshold = 80;
const ratchetBaselines = {
  essentialComplete: 1261,
  premiumComplete: 3,
  rawTop150Complete: 3,
  sourceAwareTop150Complete: 150,
};

const ratchetFailures = [
  essentialCoverage.complete < ratchetBaselines.essentialComplete
    ? `essentialComplete: ${essentialCoverage.complete} < ${ratchetBaselines.essentialComplete}`
    : null,
  premiumCoverage.complete < ratchetBaselines.premiumComplete
    ? `premiumComplete: ${premiumCoverage.complete} < ${ratchetBaselines.premiumComplete}`
    : null,
  topCoverage.complete < ratchetBaselines.rawTop150Complete
    ? `rawTop150Complete: ${topCoverage.complete} < ${ratchetBaselines.rawTop150Complete}`
    : null,
  sourceAwareTopCoverage.complete < ratchetBaselines.sourceAwareTop150Complete
    ? `sourceAwareTop150Complete: ${sourceAwareTopCoverage.complete} < ${ratchetBaselines.sourceAwareTop150Complete}`
    : null,
].filter(Boolean);

const criticalFailures = [
  ...Object.entries(essentialCoverage.fields)
    .filter(([, value]) => value.percent < essentialThreshold)
    .map(([field, value]) => `${field}: ${value.percent}% < ${essentialThreshold}%`),
  ...ratchetFailures,
];

const report = {
  ok: criticalFailures.length === 0,
  generatedAt: new Date().toISOString(),
  note: 'This report separates raw chunk coverage from conservative source-aware editorial overlay coverage. Runtime enrichment remains a safety net, not a substitute for verified clinical source review.',
  essentialThreshold,
  ratchetBaselines,
  totals: {
    allDiseases: all.length,
    prioritySample: top150.length,
  },
  essentialCoverage,
  premiumCoverage,
  sourceAwareCoverage,
  priorityTop150: {
    ...topCoverage,
    clusters: summarizeClusters(top150),
    duplicateCandidates: findDuplicateCandidates(top150),
    missing: missingTop.slice(0, 80),
    immediateManualReviewQueue,
  },
  sourceAwarePriorityTop150: {
    ...sourceAwareTopCoverage,
    clusters: summarizeClusters(sourceAwareTop150),
    editorialStatus: 'needs-source-review unless the raw card already declares a stronger status',
  },
  criticalFailures,
};

await fs.mkdir(path.join(root, 'artifacts'), { recursive: true });
await fs.writeFile(path.join(root, 'artifacts', 'content-source-coverage-audit.json'), `${JSON.stringify(report, null, 2)}\n`);

console.log(JSON.stringify({
  ok: report.ok,
  totals: report.totals,
  essentialComplete: essentialCoverage.complete,
  premiumComplete: premiumCoverage.complete,
  rawTop150Complete: topCoverage.complete,
  sourceAwareTop150Complete: sourceAwareTopCoverage.complete,
  artifact: 'artifacts/content-source-coverage-audit.json',
}, null, 2));

if (!report.ok) process.exit(1);