import fs from 'node:fs/promises';

const baseUrl = (process.env.PRODUCTION_URL || 'https://gyn-clinical.pages.dev').replace(/\/$/, '');
const expectedCommit = process.env.EXPECTED_COMMIT || process.env.CF_PAGES_COMMIT_SHA?.slice(0, 7) || '';
const findings = [];

function addFinding(rule, detail) {
  findings.push({ rule, detail });
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Number(process.env.PRODUCTION_AUDIT_TIMEOUT_MS || 20000));
  try {
    return await fetch(url, {
      cache: 'no-store',
      redirect: 'follow',
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function getText(path) {
  const response = await fetchWithTimeout(`${baseUrl}${path}`);
  if (!response.ok) {
    addFinding('http status', `${path} returned ${response.status}`);
    return { response, text: '' };
  }
  return { response, text: await response.text() };
}

function cacheHeader(response) {
  return response.headers.get('cache-control') || '';
}

function shouldNoStore(path, response) {
  const header = cacheHeader(response).toLowerCase();
  if (!/(no-cache|no-store|must-revalidate)/.test(header)) {
    addFinding('cache-control app shell', `${path} has Cache-Control: ${header || '<missing>'}`);
  }
}

const { response: htmlResponse, text: html } = await getText('/');
shouldNoStore('/', htmlResponse);

const assets = [...html.matchAll(/(?:src|href)="([^"]*\/assets\/[^"?#]+)[^"']*"/g)].map((match) => match[1]);
if (!assets.length) {
  addFinding('html assets', 'production HTML does not reference hashed Vite assets');
}

const mainJs = assets.find((asset) => /\/assets\/index-[^/]+\.js$/.test(asset));
if (!mainJs) {
  addFinding('main js', 'production HTML does not reference an index hashed JS chunk');
} else {
  const { response, text } = await getText(mainJs);
  const header = cacheHeader(response).toLowerCase();
  if (!/immutable/.test(header) || !/max-age=31536000/.test(header)) {
    addFinding('cache-control asset', `${mainJs} has Cache-Control: ${header || '<missing>'}`);
  }
  if (expectedCommit && !text.includes(expectedCommit)) {
    addFinding('commit mismatch', `main bundle does not include expected commit ${expectedCommit}`);
  }
}

for (const path of ['/sw.js', '/registerSW.js', '/manifest.webmanifest']) {
  const { response, text } = await getText(path);
  shouldNoStore(path, response);
  if (path === '/manifest.webmanifest') {
    try {
      const manifest = JSON.parse(text);
      const manifestDescription = manifest.description || '';
      const hasClinicalMetadata = /(?:\u0433\u0438\u043d\u0435\u043a\u043e\u043b\u043e\u0433|\u0430\u043a\u0443\u0448\u0435\u0440)/i.test(manifestDescription);
      if (!hasClinicalMetadata) {
        addFinding('manifest metadata', manifest.description || '<missing>');
      }
    } catch {
      addFinding('manifest json', 'manifest.webmanifest is not valid JSON');
    }
  }
}

const report = {
  ok: findings.length === 0,
  baseUrl,
  expectedCommit: expectedCommit || null,
  assetsChecked: assets.length,
  findings,
};

await fs.mkdir('artifacts', { recursive: true });
await fs.writeFile('artifacts/production-freshness-audit.json', `${JSON.stringify(report, null, 2)}\n`);

if (findings.length) {
  console.error(JSON.stringify(report, null, 2));
  process.exit(1);
}

console.log(JSON.stringify(report, null, 2));
