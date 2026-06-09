import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const strict = process.argv.includes('--strict');

const chunkDirs = [
  { kind: 'gynecology', prefix: 'N', dir: path.join(root, 'src', 'data', 'gynChunks') },
  { kind: 'obstetrics', prefix: 'O', dir: path.join(root, 'src', 'data', 'obsChunks') },
];

const clinicallyRelevant = {
  gynecology: [
    'N70', 'N71', 'N72', 'N73', 'N75', 'N76', 'N80', 'N81', 'N82', 'N83',
    'N84', 'N85', 'N86', 'N87', 'N88', 'N89', 'N90', 'N91', 'N92', 'N93',
    'N94', 'N95', 'N96', 'N97', 'N98', 'N99',
  ],
  obstetrics: [
    'O00', 'O01', 'O02', 'O03', 'O10', 'O11', 'O12', 'O13', 'O14', 'O15',
    'O20', 'O21', 'O22', 'O23', 'O24', 'O26', 'O30', 'O32', 'O33', 'O34',
    'O35', 'O36', 'O40', 'O41', 'O42', 'O43', 'O44', 'O45', 'O46', 'O47',
    'O48', 'O60', 'O62', 'O63', 'O64', 'O66', 'O68', 'O70', 'O71', 'O72',
    'O73', 'O74', 'O75', 'O80', 'O82', 'O85', 'O86', 'O87', 'O88', 'O90',
    'O91', 'O92', 'O98', 'O99',
  ],
};

const icdPattern = /\bicd\s*:\s*(['"`])([^'"`]+)\1/g;
const codePattern = /\b([A-Z][0-9]{2}(?:\.[0-9A-Z]+)?)\b/g;

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(fullPath);
    return /\.(js|ts|tsx|json)$/i.test(entry.name) ? [fullPath] : [];
  });
}

function normalizeCode(raw) {
  return String(raw).trim().toUpperCase();
}

function extractCodesFromFile(file, prefix) {
  const text = fs.readFileSync(file, 'utf8');
  const entries = [];
  const duplicatesInFile = new Map();
  let match;

  while ((match = icdPattern.exec(text)) !== null) {
    const raw = match[2];
    const codes = [...raw.matchAll(codePattern)]
      .map((codeMatch) => normalizeCode(codeMatch[1]))
      .filter((code) => code.startsWith(prefix));

    for (const code of codes) {
      entries.push({ code, raw, file: path.relative(root, file), index: match.index });
      duplicatesInFile.set(code, (duplicatesInFile.get(code) || 0) + 1);
    }
  }

  return {
    entries,
    duplicates: [...duplicatesInFile.entries()]
      .filter(([, count]) => count > 1)
      .map(([code, count]) => ({ code, count, file: path.relative(root, file) })),
  };
}

function auditDir({ kind, prefix, dir }) {
  const files = walk(dir);
  const entries = [];
  const duplicates = [];

  for (const file of files) {
    const result = extractCodesFromFile(file, prefix);
    entries.push(...result.entries);
    duplicates.push(...result.duplicates);
  }

  const byCode = new Map();
  for (const entry of entries) {
    if (!byCode.has(entry.code)) byCode.set(entry.code, []);
    byCode.get(entry.code).push(entry);
  }

  const existingCodes = [...byCode.keys()].sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
  const expected = clinicallyRelevant[kind];
  const missingClinicallyRelevant = expected.filter((code) => {
    return !existingCodes.some((existing) => existing === code || existing.startsWith(`${code}.`));
  });

  const crossFileDuplicates = [...byCode.entries()]
    .filter(([, values]) => values.length > 1)
    .map(([code, values]) => ({
      code,
      count: values.length,
      files: [...new Set(values.map((value) => value.file))],
    }));

  const coverage = expected.length > 0
    ? Number((((expected.length - missingClinicallyRelevant.length) / expected.length) * 100).toFixed(1))
    : 0;

  return {
    kind,
    prefix,
    scannedFiles: files.length,
    totalIcdMentions: entries.length,
    uniqueCodes: existingCodes.length,
    existingCodes,
    coverage,
    missingClinicallyRelevant,
    duplicates: [...duplicates, ...crossFileDuplicates],
    priorities: missingClinicallyRelevant.slice(0, 20).map((code) => ({
      code,
      priority: code.startsWith('O') || ['N80', 'N83', 'N92', 'N93', 'N94', 'N97'].includes(code) ? 'high' : 'medium',
      action: 'Добавить source-aware карточку или подтвердить, что код намеренно не входит в клиническую базу.',
    })),
  };
}

const sections = chunkDirs.map(auditDir);
const report = {
  generatedAt: new Date().toISOString(),
  strict,
  sections,
  summary: {
    totalUniqueCodes: sections.reduce((sum, section) => sum + section.uniqueCodes, 0),
    totalMentions: sections.reduce((sum, section) => sum + section.totalIcdMentions, 0),
    lowestCoverage: Math.min(...sections.map((section) => section.coverage)),
  },
};

const artifactsDir = path.join(root, 'artifacts');
fs.mkdirSync(artifactsDir, { recursive: true });
const reportPath = path.join(artifactsDir, 'icd-audit-report.json');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');

console.log('ICD audit complete');
for (const section of sections) {
  console.log(
    `${section.kind}: ${section.uniqueCodes} unique codes, ${section.coverage}% clinically relevant coverage, ${section.missingClinicallyRelevant.length} gaps`,
  );
}
console.log(`Report: ${path.relative(root, reportPath)}`);

const failures = [];
for (const section of sections) {
  if (section.scannedFiles === 0) failures.push(`${section.kind}: chunk directory is empty or missing`);
  if (section.uniqueCodes === 0) failures.push(`${section.kind}: no ICD codes found`);
  if (strict && section.missingClinicallyRelevant.length > 0) {
    failures.push(`${section.kind}: missing clinically relevant ICD codes: ${section.missingClinicallyRelevant.join(', ')}`);
  }
}

if (failures.length > 0) {
  console.error('\nICD audit failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
