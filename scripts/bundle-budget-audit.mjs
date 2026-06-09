import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const assetsDir = path.join(root, 'dist', 'assets');
const budgetsKb = {
  index: 330,
  vendor: 340,
  threeVendor: 570,
  diseaseModal: 105,
  pharmacologyModal: 195,
  largestContentChunk: 280,
  initialCss: 320,
};

const files = await fs.readdir(assetsDir).catch(() => {
  console.error('dist/assets is missing. Run npm.cmd run build before audit:bundle:budget.');
  process.exit(1);
});

const stats = [];
for (const file of files) {
  const fullPath = path.join(assetsDir, file);
  const stat = await fs.stat(fullPath);
  stats.push({ file, kb: Number((stat.size / 1024).toFixed(2)) });
}

const pick = (pattern) => stats.find((entry) => pattern.test(entry.file));
const largestMatching = (pattern) =>
  stats.filter((entry) => pattern.test(entry.file)).sort((a, b) => b.kb - a.kb)[0];

const measured = {
  index: pick(/^index-.*\.js$/),
  vendor: pick(/^vendor-.*\.js$/),
  threeVendor: pick(/^three-vendor-.*\.js$/),
  diseaseModal: pick(/^DiseaseModal-.*\.js$/),
  pharmacologyModal: pick(/^PharmacologyModal-.*\.js$/),
  largestContentChunk: largestMatching(/^(gynChunk|obsChunk)\d+-.*\.js$/),
  initialCss: pick(/^index-.*\.css$/),
};

const findings = Object.entries(budgetsKb).flatMap(([key, budgetKb]) => {
  const entry = measured[key];
  if (!entry) return [{ key, severity: 'error', message: 'chunk not found', budgetKb }];
  if (entry.kb > budgetKb) {
    return [{
      key,
      file: entry.file,
      kb: entry.kb,
      budgetKb,
      severity: 'error',
      message: `chunk exceeds budget by ${(entry.kb - budgetKb).toFixed(2)} kB`,
    }];
  }
  const warningAt = budgetKb * 0.9;
  if (entry.kb > warningAt) {
    return [{
      key,
      file: entry.file,
      kb: entry.kb,
      budgetKb,
      severity: 'warning',
      message: 'chunk is close to the budget',
    }];
  }
  return [];
});

const blockingFindings = findings.filter((entry) => entry.severity === 'error');
const report = {
  ok: blockingFindings.length === 0,
  budgetsKb,
  measured,
  findings,
};

await fs.mkdir(path.join(root, 'artifacts'), { recursive: true });
await fs.writeFile(path.join(root, 'artifacts', 'bundle-budget-audit.json'), `${JSON.stringify(report, null, 2)}\n`);

if (blockingFindings.length > 0) {
  console.error(JSON.stringify(report, null, 2));
  process.exit(1);
}

console.log(JSON.stringify(report, null, 2));
