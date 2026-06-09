import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { repairText } from '../src/utils/textRepair.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const scanRoots = ['src', 'public', 'scripts'];
const rootFiles = ['README.md', 'index.html', 'package.json', 'package-lock.json', 'vite.config.js', 'vite.config.ts'];
const allowedFiles = new Set([
  path.join(root, 'src', 'utils', 'textRepair.ts'),
  path.join(root, 'scripts', 'source-mojibake-audit.mjs'),
  path.join(root, 'scripts', 'source-utf8-ui-audit.mjs'),
]);
const textExtensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.json', '.html', '.css', '.md', '.cjs', '.mjs']);
const legacyEnglishPattern = /Premium Clinical|Clinical command|TRUST LAYER|GYNA/g;
const obviousBrokenPattern = new RegExp([
  '[\\u0420\\u0421\\u0432][\\u0080-\\u009f\\u00a0\\u00a4\\u00a9\\u00ae\\u00b0\\u00b7\\u0402-\\u040f\\u0452-\\u045f\\u2018-\\u201d\\u2020-\\u2022\\u20ac\\u2122]',
  '\\u0420\\u045f',
  '\\u0420\\u00a0',
  '\\u0420\\u2014',
  '\\u0420\\u00a4',
  '\\u0432\\u0402',
  '\\u0413\\u2014',
  '\\u0440\\u045f',
  '\\u0412[\\u00a9\\u00ae]',
  '\\u043f\\u0457\\u0405',
  '\\ufffd',
].join('|'), 'g');
const encodedLatinPattern = new RegExp('[\\u00d0\\u00d1\\u00c2\\u00e2][\\u0080-\\u00ff\\u201a-\\u201e\\u2020-\\u2022\\u2013\\u2014\\u2030\\u2039\\u203a\\u20ac\\u2122]', 'g');
const unexpectedCjkPattern = /[\u3400-\u9fff]/g;

async function walk(dir, files = []) {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', 'dist', '.git', 'artifacts'].includes(entry.name)) continue;
      await walk(fullPath, files);
      continue;
    }

    if (entry.isFile() && textExtensions.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }

  return files;
}

const files = [
  ...(await Promise.all(scanRoots.map((entry) => walk(path.join(root, entry))))).flat(),
  ...rootFiles.map((entry) => path.join(root, entry)),
];
const findings = [];

for (const file of files) {
  if (allowedFiles.has(file)) continue;
  let content = '';
  try {
    content = await fs.readFile(file, 'utf8');
  } catch (error) {
    if (error?.code === 'ENOENT') continue;
    throw error;
  }

  if (content.charCodeAt(0) === 0xfeff) {
    findings.push({
      file: path.relative(root, file),
      line: 1,
      match: 'utf8-bom',
      snippet: 'File starts with UTF-8 BOM; hidden encoding markers are not allowed in UI/source files.',
    });
  }

  const lines = content.split(/\r?\n/);

  lines.forEach((line, index) => {
    const repaired = repairText(line);
    const hasEncodedLatin = encodedLatinPattern.test(line);
    encodedLatinPattern.lastIndex = 0;
    const repairChangedLine = hasEncodedLatin && repaired.trim() !== line.trim() && !line.includes('repairText') && !line.includes('mojibake');
    const matches = [
      ...line.matchAll(legacyEnglishPattern),
      ...line.matchAll(obviousBrokenPattern),
      ...line.matchAll(unexpectedCjkPattern),
      ...(repairChangedLine ? [{ 0: 'repairable mojibake' }] : []),
    ];

    for (const match of matches) {
      findings.push({
        file: path.relative(root, file),
        line: index + 1,
        match: match[0],
        snippet: line.trim().slice(0, 180),
        repairedSnippet: repairChangedLine ? repaired.trim().slice(0, 180) : undefined,
      });
    }
    unexpectedCjkPattern.lastIndex = 0;
  });
}

const report = {
  ok: findings.length === 0,
  scannedFiles: files.length,
  findings,
};

await fs.mkdir(path.join(root, 'artifacts'), { recursive: true });
await fs.writeFile(path.join(root, 'artifacts', 'source-mojibake-audit.json'), `${JSON.stringify(report, null, 2)}\n`);

if (findings.length > 0) {
  console.error(JSON.stringify(report, null, 2));
  process.exit(1);
}

console.log(JSON.stringify(report, null, 2));
