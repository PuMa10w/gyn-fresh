import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { medications } from '../src/data/pharmacology.js';
import { questionnaires } from '../src/data/questionnaires.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const hasValue = (value) => {
  if (Array.isArray(value)) return value.length > 0;
  if (value && typeof value === 'object') return Object.keys(value).length > 0;
  return typeof value === 'string' ? value.trim().length > 0 : Boolean(value);
};

const countCoverage = (items, fields) => {
  const total = items.length;
  const fieldsCoverage = Object.fromEntries(
    fields.map((field) => [
      field,
      {
        present: items.filter((item) => hasValue(item[field])).length,
        total,
      },
    ]),
  );

  const complete = items.filter((item) => fields.every((field) => hasValue(item[field]))).length;

  return {
    total,
    complete,
    completePercent: total === 0 ? 0 : Math.round((complete / total) * 100),
    fields: fieldsCoverage,
    missing: items
      .map((item) => ({
        id: item.id,
        name: item.name,
        missing: fields.filter((field) => !hasValue(item[field])),
      }))
      .filter((item) => item.missing.length > 0),
  };
};

const importChunks = async (dirName) => {
  const dir = path.join(root, 'src', 'data', dirName);
  const files = (await fs.readdir(dir)).filter((file) => file.endsWith('.js')).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  const chunks = await Promise.all(files.map((file) => import(pathToFileURL(path.join(dir, file)).href)));
  return chunks
    .flatMap((chunk) => chunk.default ?? [])
    .filter((item) => item && typeof item.id === 'string' && typeof item.name === 'string');
};

const diseaseFields = [
  'guidelineBasis',
  'sourceQuality',
  'redFlags',
  'diagnosticCriteria',
  'differentialDiagnosis',
  'managementAlgorithm',
  'followUpTriggers',
  'clinicalSummary',
  'patientExplanation',
  'lastReviewed',
  'guidelineStatus',
];

const medicationFields = [
  'firstLineStatus',
  'pregnancyLactation',
  'monitoring',
  'clinicalUseCases',
  'majorPracticePoints',
  'comparativeRole',
  'routeAndSetting',
  'guidelineBasis',
  'lastReviewed',
];

const questionnaireFields = [
  'clinicalPurpose',
  'targetPopulation',
  'cutoffInterpretation',
  'nextStepByScore',
  'limitations',
  'evidenceNote',
  'guidelineBasis',
  'lastReviewed',
];

const [rawGynecology, rawObstetrics] = await Promise.all([importChunks('gynChunks'), importChunks('obsChunks')]);

const report = {
  generatedAt: new Date().toISOString(),
  note: 'Raw disease coverage is source-file coverage; runtime disease enrichment is verified by src/utils/__tests__/clinicalToolsEnrichment.test.ts.',
  runtimeDiseases: {
    verifiedBy: 'npm run test:run -- src/utils/__tests__/clinicalToolsEnrichment.test.ts',
    requiredFields: diseaseFields,
  },
  rawDiseases: countCoverage([...rawGynecology, ...rawObstetrics], diseaseFields),
  medications: countCoverage(medications, medicationFields),
  questionnaires: countCoverage(questionnaires, questionnaireFields),
};

await fs.mkdir(path.join(root, 'artifacts'), { recursive: true });
await fs.writeFile(path.join(root, 'artifacts', 'content-quality-audit.json'), `${JSON.stringify(report, null, 2)}\n`);

console.log(JSON.stringify({
  rawDiseases: {
    total: report.rawDiseases.total,
    complete: report.rawDiseases.complete,
    completePercent: report.rawDiseases.completePercent,
  },
  medications: {
    total: report.medications.total,
    complete: report.medications.complete,
    completePercent: report.medications.completePercent,
  },
  questionnaires: {
    total: report.questionnaires.total,
    complete: report.questionnaires.complete,
    completePercent: report.questionnaires.completePercent,
  },
  artifact: 'artifacts/content-quality-audit.json',
}, null, 2));

if (process.argv.includes('--strict')) {
  const failed = [report.medications, report.questionnaires].some((section) => section.complete !== section.total);
  if (failed) {
    process.exitCode = 1;
  }
}
