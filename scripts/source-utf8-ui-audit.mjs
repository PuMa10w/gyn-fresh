import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { repairText } from '../src/utils/textRepair.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const scanRoots = ['src', 'public', 'scripts'];
const rootFiles = ['README.md', 'index.html', 'vite.config.js', 'vite.config.ts', 'package.json'];
const textExtensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.json', '.html', '.css', '.md', '.mjs', '.cjs']);
const allowedFiles = new Set([
  path.join(root, 'src', 'utils', 'textRepair.ts'),
  path.join(root, 'scripts', 'source-mojibake-audit.mjs'),
  path.join(root, 'scripts', 'source-utf8-ui-audit.mjs'),
]);

const userFacingLinePattern =
  /(<(title|meta|button|span|p|h[1-6]|label|small|strong|li|summary|option)\b|aria-label|placeholder|title=|content=|message:|description|fallback|error|loading|toast|Helmet|Копировать|Закрыть|Обновить|Загрузка|Ошибка)/i;
const mojibakePattern = new RegExp([
  '[\\u0420\\u0421\\u0432][\\u0080-\\u009f\\u00a0\\u00a4\\u00a9\\u00ae\\u00b0\\u00b7\\u0402-\\u040f\\u0452-\\u045f\\u2018-\\u201d\\u2020-\\u2022\\u20ac\\u2122]',
  '[\\u00d0\\u00d1\\u00c2\\u00e2][\\u0080-\\u00ff\\u201a-\\u201e\\u2020-\\u2022\\u2013\\u2014\\u20ac\\u2122]',
  '\\u0420\\u045f',
  '\\u0432\\u0402',
  '\\u0413\\u2014',
  '\\u0412[\\u00a9\\u00ae]',
  '\\ufffd',
].join('|'), 'g');
const legacyEnglishPattern = /Premium Clinical|Clinical command center|TRUST LAYER|GYNA/g;
const unexpectedCjkPattern = /[\u3400-\u9fff]/g;

async function walk(dir, files = []) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', 'dist', '.git', 'artifacts'].includes(entry.name)) continue;
      await walk(fullPath, files);
    } else if (entry.isFile() && textExtensions.has(path.extname(entry.name))) {
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
      userFacing: true,
      snippet: 'File starts with UTF-8 BOM; remove it to avoid hidden metadata/UI regressions.',
    });
  }

  content.split(/\r?\n/).forEach((line, index) => {
    const isUserFacing = userFacingLinePattern.test(line);
    const repaired = repairText(line);
    const hasMojibakePattern = mojibakePattern.test(line);
    mojibakePattern.lastIndex = 0;
    const changedByRepair =
      hasMojibakePattern &&
      repaired.trim() !== line.trim() &&
      !line.includes('repairText') &&
      !line.includes('mojibake');
    const matches = [
      ...line.matchAll(legacyEnglishPattern),
      ...line.matchAll(mojibakePattern),
      ...line.matchAll(unexpectedCjkPattern),
      ...(isUserFacing && changedByRepair ? [{ 0: 'repairable UI text' }] : []),
    ];

    for (const match of matches) {
      findings.push({
        file: path.relative(root, file),
        line: index + 1,
        match: match[0],
        userFacing: isUserFacing,
        snippet: line.trim().slice(0, 220),
        repairedSnippet: changedByRepair ? repaired.trim().slice(0, 220) : undefined,
      });
    }
    mojibakePattern.lastIndex = 0;
    legacyEnglishPattern.lastIndex = 0;
    unexpectedCjkPattern.lastIndex = 0;
  });
}

const report = {
  ok: findings.length === 0,
  scannedFiles: files.length,
  findings,
};

await fs.mkdir(path.join(root, 'artifacts'), { recursive: true });
await fs.writeFile(path.join(root, 'artifacts', 'source-utf8-ui-audit.json'), `${JSON.stringify(report, null, 2)}\n`);

if (findings.length > 0) {
  console.error(JSON.stringify(report, null, 2));
  process.exit(1);
}

console.log(JSON.stringify(report, null, 2));
