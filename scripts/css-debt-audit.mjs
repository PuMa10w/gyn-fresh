import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cssFiles = [
  'src/styles/design-tokens.css',
  'src/index.css',
  'src/App.css',
  'src/premium-unified.css',
  'src/styles/ultra-premium-v9.css',
  'src/styles/clinical-worktool.css',
  'src/styles/v1-premium-polish.css',
  'src/styles/clinical-v1-4-skin.css',
];

const budgets = {
  totalLines: 19000,
  important: 2700,
  rootBlocks: 80,
  mediaBlocks: 180,
};

const metrics = [];

for (const file of cssFiles) {
  const fullPath = path.join(root, file);
  let content = '';
  try {
    content = await fs.readFile(fullPath, 'utf8');
  } catch (error) {
    if (error?.code === 'ENOENT') continue;
    throw error;
  }

  metrics.push({
    file,
    lines: content.split(/\r?\n/).length,
    important: (content.match(/!important/g) ?? []).length,
    rootBlocks: (content.match(/(^|\n)\s*:root\b/g) ?? []).length,
    mediaBlocks: (content.match(/@media\b/g) ?? []).length,
  });
}

const totals = metrics.reduce(
  (result, item) => ({
    lines: result.lines + item.lines,
    important: result.important + item.important,
    rootBlocks: result.rootBlocks + item.rootBlocks,
    mediaBlocks: result.mediaBlocks + item.mediaBlocks,
  }),
  { lines: 0, important: 0, rootBlocks: 0, mediaBlocks: 0 },
);

const failures = [
  totals.lines > budgets.totalLines ? `CSS line count ${totals.lines} > ${budgets.totalLines}` : null,
  totals.important > budgets.important ? `!important count ${totals.important} > ${budgets.important}` : null,
  totals.rootBlocks > budgets.rootBlocks ? `:root blocks ${totals.rootBlocks} > ${budgets.rootBlocks}` : null,
  totals.mediaBlocks > budgets.mediaBlocks ? `@media blocks ${totals.mediaBlocks} > ${budgets.mediaBlocks}` : null,
].filter(Boolean);

const report = {
  ok: failures.length === 0,
  generatedAt: new Date().toISOString(),
  note: 'This audit prevents CSS debt from growing while the legacy layers are gradually collapsed into tokens and primitives.',
  budgets,
  totals,
  files: metrics,
  failures,
};

await fs.mkdir(path.join(root, 'artifacts'), { recursive: true });
await fs.writeFile(path.join(root, 'artifacts', 'css-debt-audit.json'), `${JSON.stringify(report, null, 2)}\n`);

console.log(JSON.stringify(report, null, 2));
if (!report.ok) process.exit(1);
