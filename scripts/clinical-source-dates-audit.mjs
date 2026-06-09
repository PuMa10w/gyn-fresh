import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { medications } from '../src/data/pharmacology.js';
import { questionnaires } from '../src/data/questionnaires.js';
import { applyClinicalSourceOverlay } from '../src/utils/clinicalSourceOverlay.ts';
import { repairText } from '../src/utils/textRepair.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const currentYear = new Date().getFullYear();

const importChunks = async (dirName) => {
  const dir = path.join(root, 'src', 'data', dirName);
  const files = (await fs.readdir(dir))
    .filter((file) => file.endsWith('.js'))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  const chunks = await Promise.all(files.map((file) => import(pathToFileURL(path.join(dir, file)).href)));
  return chunks.flatMap((chunk) => chunk.default ?? []);
};

const parseYear = (value) => {
  const match = String(value ?? '').match(/\b(20\d{2})\b/);
  return match ? Number(match[1]) : null;
};

const auditItems = (items, label) => {
  const stale = [];
  const missing = [];

  for (const item of items) {
    const year = parseYear(item.lastReviewed);
    if (!year) {
      missing.push({ id: item.id, name: repairText(item.name), lastReviewed: item.lastReviewed ?? null });
      continue;
    }
    if (currentYear - year > 3) {
      stale.push({ id: item.id, name: repairText(item.name), lastReviewed: item.lastReviewed });
    }
  }

  return {
    label,
    total: items.length,
    withLastReviewed: items.length - missing.length,
    missing: missing.slice(0, 80),
    stale: stale.slice(0, 80),
    missingCount: missing.length,
    staleCount: stale.length,
  };
};

const [gyn, obs] = await Promise.all([importChunks('gynChunks'), importChunks('obsChunks')]);
const diseaseItems = [...gyn, ...obs].filter((item) => item?.name);
const sourceAwareDiseaseItems = diseaseItems.map((item) => applyClinicalSourceOverlay(item));
const diseaseAudit = auditItems(diseaseItems, 'diseases');
const sourceAwareDiseaseAudit = auditItems(sourceAwareDiseaseItems, 'source-aware diseases');
const medicationAudit = auditItems(medications, 'medications');
const questionnaireAudit = auditItems(questionnaires, 'questionnaires');
const ratchetBaselines = {
  rawDiseasesWithLastReviewed: 18,
  sourceAwareDiseasesWithLastReviewed: 1533,
  medicationsWithLastReviewed: 566,
  questionnairesWithLastReviewed: 19,
};
const ratchetFailures = [
  diseaseAudit.withLastReviewed < ratchetBaselines.rawDiseasesWithLastReviewed
    ? `rawDiseasesWithLastReviewed: ${diseaseAudit.withLastReviewed} < ${ratchetBaselines.rawDiseasesWithLastReviewed}`
    : null,
  sourceAwareDiseaseAudit.withLastReviewed < ratchetBaselines.sourceAwareDiseasesWithLastReviewed
    ? `sourceAwareDiseasesWithLastReviewed: ${sourceAwareDiseaseAudit.withLastReviewed} < ${ratchetBaselines.sourceAwareDiseasesWithLastReviewed}`
    : null,
  medicationAudit.withLastReviewed < ratchetBaselines.medicationsWithLastReviewed
    ? `medicationsWithLastReviewed: ${medicationAudit.withLastReviewed} < ${ratchetBaselines.medicationsWithLastReviewed}`
    : null,
  questionnaireAudit.withLastReviewed < ratchetBaselines.questionnairesWithLastReviewed
    ? `questionnairesWithLastReviewed: ${questionnaireAudit.withLastReviewed} < ${ratchetBaselines.questionnairesWithLastReviewed}`
    : null,
].filter(Boolean);

const report = {
  ok: medicationAudit.missingCount === 0 && questionnaireAudit.missingCount === 0 && ratchetFailures.length === 0,
  generatedAt: new Date().toISOString(),
  currentYear,
  ratchetBaselines,
  ratchetFailures,
  diseases: diseaseAudit,
  sourceAwareDiseases: sourceAwareDiseaseAudit,
  medications: medicationAudit,
  questionnaires: questionnaireAudit,
};

await fs.mkdir(path.join(root, 'artifacts'), { recursive: true });
await fs.writeFile(path.join(root, 'artifacts', 'clinical-source-dates-audit.json'), `${JSON.stringify(report, null, 2)}\n`);

console.log(JSON.stringify({
  ok: report.ok,
  diseases: {
    total: report.diseases.total,
    withLastReviewed: report.diseases.withLastReviewed,
    missingCount: report.diseases.missingCount,
    staleCount: report.diseases.staleCount,
  },
  sourceAwareDiseases: {
    total: report.sourceAwareDiseases.total,
    withLastReviewed: report.sourceAwareDiseases.withLastReviewed,
    missingCount: report.sourceAwareDiseases.missingCount,
    staleCount: report.sourceAwareDiseases.staleCount,
  },
  medications: {
    total: report.medications.total,
    missingCount: report.medications.missingCount,
    staleCount: report.medications.staleCount,
  },
  questionnaires: {
    total: report.questionnaires.total,
    missingCount: report.questionnaires.missingCount,
    staleCount: report.questionnaires.staleCount,
  },
  ratchetFailures: report.ratchetFailures,
  artifact: 'artifacts/clinical-source-dates-audit.json',
}, null, 2));

if (!report.ok) process.exit(1);
