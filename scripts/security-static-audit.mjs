import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const scanRoots = ['src', 'public'];
const textExtensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.css', '.html', '.svg']);
const findings = [];

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

function addFinding(file, line, rule, snippet) {
  findings.push({
    file: path.relative(root, file),
    line,
    rule,
    snippet: snippet.trim().slice(0, 180),
  });
}

const files = (await Promise.all(scanRoots.map((entry) => walk(path.join(root, entry))))).flat();

for (const file of files) {
  const content = await fs.readFile(file, 'utf8');
  const lines = content.split(/\r?\n/);

  lines.forEach((line, index) => {
    if (line.includes('dangerouslySetInnerHTML')) {
      addFinding(file, index + 1, 'dangerouslySetInnerHTML', line);
    }

    if (line.includes('.innerHTML') || line.includes('innerHTML =')) {
      addFinding(file, index + 1, 'innerHTML mutation', line);
    }

    if (/script\.src\s*=\s*['"]https?:\/\//.test(line)) {
      addFinding(file, index + 1, 'external script injection', line);
    }

    if (/@import\s+url\(['"]https?:\/\//.test(line)) {
      addFinding(file, index + 1, 'remote css import', line);
    }
  });
}

const headersPath = path.join(root, 'public', '_headers');
const headers = await fs.readFile(headersPath, 'utf8');

if (/fonts\.googleapis|fonts\.gstatic|cdnjs|unpkg|jsdelivr/.test(headers)) {
  addFinding(headersPath, 1, 'external CSP allowlist', headers);
}

if (/script-src[^;\n]*https?:\/\//.test(headers)) {
  addFinding(headersPath, 1, 'external script CSP source', headers);
}

const report = {
  ok: findings.length === 0,
  scannedFiles: files.length,
  findings,
};

await fs.mkdir(path.join(root, 'artifacts'), { recursive: true });
await fs.writeFile(path.join(root, 'artifacts', 'security-static-audit.json'), `${JSON.stringify(report, null, 2)}\n`);

if (findings.length) {
  console.error(JSON.stringify(report, null, 2));
  process.exit(1);
}

console.log(JSON.stringify(report, null, 2));
