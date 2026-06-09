import { spawn } from 'node:child_process';

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';
const nodeCmd = isWindows ? 'node.exe' : 'node';
const auditBaseUrl = process.env.AUDIT_BASE_URL || 'http://127.0.0.1:4183';
const auditUrl = new URL(auditBaseUrl);

const preServerSteps = [
  ['typecheck', npmCmd, ['run', 'typecheck']],
  ['tests', npmCmd, ['run', 'test:run']],
  ['content strict', npmCmd, ['run', 'audit:content', '--', '--strict']],
  ['ICD strict', npmCmd, ['run', 'audit:icd', '--', '--strict']],
  ['source mojibake', npmCmd, ['run', 'audit:mojibake:source']],
  ['source UTF-8 UI', npmCmd, ['run', 'audit:source:utf8-ui']],
  ['clinical search index', npmCmd, ['run', 'audit:search:index']],
  ['content source coverage', npmCmd, ['run', 'audit:content:source-coverage']],
  ['clinical source dates', npmCmd, ['run', 'audit:clinical-source-dates']],
  ['CSS debt budget', npmCmd, ['run', 'audit:css-debt']],
  ['build', npmCmd, ['run', 'build']],
  ['bundle budget', npmCmd, ['run', 'audit:bundle:budget']],
  ['PWA freshness', npmCmd, ['run', 'audit:pwa:freshness']],
  ['static security', npmCmd, ['run', 'audit:security:static']],
  ['manual visual checklist artifact', npmCmd, ['run', 'audit:manual:visual-checklist']],
];

const browserSteps = [
  ['visible mojibake audit', npmCmd, ['run', 'audit:visible:mojibake']],
  ['iPhone audit', npmCmd, ['run', 'audit:iphone']],
  ['landscape iPhone audit', npmCmd, ['run', 'audit:landscape:iphone']],
  ['touch targets audit', npmCmd, ['run', 'audit:touch-targets']],
  ['pharmacology iPhone audit', npmCmd, ['run', 'audit:pharma:iphone']],
  ['questionnaires iPhone audit', npmCmd, ['run', 'audit:questionnaires:iphone']],
  ['atlas iPhone audit', npmCmd, ['run', 'audit:atlas:iphone']],
  ['clinical tools iPhone audit', npmCmd, ['run', 'audit:iphone:clinical-tools']],
  ['cards open audit', npmCmd, ['run', 'audit:cards:open']],
  ['workflow iPhone audit', npmCmd, ['run', 'audit:workflow:iphone']],
  ['iPhone overlap audit', npmCmd, ['run', 'audit:iphone:overlap']],
  ['pastel audit', npmCmd, ['run', 'audit:pastel']],
  ['accessibility audit', npmCmd, ['run', 'audit:a11y']],
  ['visual iPhone audit', npmCmd, ['run', 'audit:visual:iphone']],
  ['readability audit', npmCmd, ['run', 'audit:readability']],
];

function runStep(label, command, args, options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`\n[verify:premium] ${label}`);
    const child = spawn(command, args, {
      stdio: options.stdio || 'inherit',
      shell: isWindows,
      env: { ...process.env, AUDIT_BASE_URL: auditBaseUrl, AUDIT_URL: auditBaseUrl, ...options.env },
    });

    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${label} failed with exit code ${code}`));
      }
    });
  });
}

async function waitForServer(url, timeoutMs = 15000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url, { cache: 'no-store' });
      if (response.ok) return;
    } catch {
      // Keep waiting while the local audit server starts.
    }
    await new Promise((resolve) => setTimeout(resolve, 350));
  }
  throw new Error(`Audit server did not become ready at ${url}`);
}

async function isServerAvailable(url) {
  try {
    const response = await fetch(url, { cache: 'no-store' });
    return response.ok;
  } catch {
    return false;
  }
}

for (const [label, command, args] of preServerSteps) {
  await runStep(label, command, args);
}

let server = null;

if (await isServerAvailable(auditBaseUrl)) {
  throw new Error(`Audit port is already serving at ${auditBaseUrl}. Stop the old preview or set AUDIT_BASE_URL to a free port so verify:premium checks the fresh dist.`);
}

console.log(`\n[verify:premium] starting fresh static audit server at ${auditBaseUrl}`);
server = spawn(nodeCmd, ['scripts/serve-dist-audit.cjs'], {
  stdio: ['ignore', 'pipe', 'pipe'],
  shell: false,
  env: { ...process.env, HOST: auditUrl.hostname, PORT: auditUrl.port || '4183' },
});

server.stdout.on('data', (chunk) => process.stdout.write(`[audit-server] ${chunk}`));
server.stderr.on('data', (chunk) => process.stderr.write(`[audit-server] ${chunk}`));

try {
  await waitForServer(auditBaseUrl);
  for (const [label, command, args] of browserSteps) {
    await runStep(label, command, args);
  }
} finally {
  server?.kill();
}

console.log('\n[verify:premium] all gates passed');
