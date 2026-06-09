import { chromium, devices } from 'playwright';

const baseUrl = process.env.AUDIT_URL || process.env.AUDIT_BASE_URL || 'http://127.0.0.1:4173';
const device = devices['iPhone 15 Pro Max'] ?? { viewport: { width: 430, height: 932 }, isMobile: true, hasTouch: true };
const mojibakePattern = new RegExp(['\\u0420\\u0459','\\u0420\\u045f','\\u0420\\u0402','\\u0420\\u2019','\\u0420\\u201d','\\u0420\\u2022','\\u0420\\u0404','\\u0420\\u045c','\\u0420\\u045a','\\u0420\\u040c','\\u0420\\u045b','\\u0420\\u040e','\\u0420\\u040f','\\u0420\\u0407','\\u0421\\u0453','\\u0421\\u201a','\\u0421\\u040a','\\u0421\\u2039','\\u0421\\u0452','\\u0421\\u201c','\\u0421\\u0458','\\u0421\\u0455','\\u0421\\u2020','\\u0421\\u2026','\\u0421\\u0402','\\u0432\\u0402','\\u0432\\u2020','\\u0432\\u045a','\\u0432\\u2122','\\u0440\\u045f','\\u00d0','\\u00d1','\\uFFFD'].join('|'), 'g');

const browser = await chromium.launch({ executablePath: process.env.CHROME_EXECUTABLE || undefined, headless: true });
const page = await browser.newPage(device);
const findings = [];

page.on('pageerror', (error) => findings.push({ flow: 'pageerror', message: error.message }));
page.on('console', (message) => {
  const text = message.text();
  const isExpectedNetworkNoise = /Failed to load resource: net::ERR_(NETWORK_ACCESS_DENIED|FAILED|BLOCKED_BY_CLIENT)/i.test(text);
  if (['error'].includes(message.type()) && !isExpectedNetworkNoise) findings.push({ flow: 'console', message: text });
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function assertNoVisibleMojibake(flow) {
  const result = await page.evaluate((source) => {
    const pattern = new RegExp(source, 'g');
    const text = document.body.innerText || '';
    return [...text.matchAll(pattern)].slice(0, 12).map((match) => ({
      match: match[0],
      snippet: text.slice(Math.max(0, (match.index ?? 0) - 60), (match.index ?? 0) + 120),
    }));
  }, mojibakePattern.source);
  if (result.length) findings.push({ flow, mojibake: result });
}

async function clickButton(pattern, flow) {
  const locator = page.getByRole('button', { name: pattern });
  const count = await locator.count();
  for (let index = 0; index < count; index += 1) {
    const candidate = locator.nth(index);
    if (await candidate.isVisible().catch(() => false)) {
      await candidate.click({ timeout: 6000 });
      await sleep(450);
      return true;
    }
  }
  const clicked = await page.evaluate((source) => {
    const re = new RegExp(source, 'i');
    const candidates = Array.from(document.querySelectorAll('button, [role="button"], a'));
    const target = candidates.find((el) => {
      const rect = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      const text = `${el.textContent || ''} ${el.getAttribute('aria-label') || ''}`;
      return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none' && Number(style.opacity || '1') > 0.2 && re.test(text);
    });
    target?.click();
    return Boolean(target);
  }, pattern.source);
  if (!clicked) findings.push({ flow, missingButton: pattern.toString() });
  await sleep(450);
  return clicked;
}

await page.goto(`${baseUrl}/?visible-mojibake=${Date.now()}`, { waitUntil: 'domcontentloaded' });
await page.waitForSelector('#root, main, #main-content', { timeout: 30000 });
await page.waitForFunction(() => document.body.innerText.length > 80, null, { timeout: 30000 });
await assertNoVisibleMojibake('home');

await clickButton(/Гинекология/i, 'gynecology-nav');
await page.locator('.disease-card').first().waitFor({ state: 'visible', timeout: 30000 });
await assertNoVisibleMojibake('gynecology');

await page.locator('.disease-card').first().click();
await page.locator('[data-testid="disease-modal"], .modal-content').first().waitFor({ state: 'visible', timeout: 30000 });
await assertNoVisibleMojibake('disease-modal');
await clickButton(/3D атлас/i, '3d-tab');
await page.locator('.anatomy-atlas-shell, .organ-3d-viewer').first().waitFor({ state: 'visible', timeout: 30000 });
await assertNoVisibleMojibake('3d-atlas');

await page.goto(`${baseUrl}/?visible-mojibake-pharma=${Date.now()}`, { waitUntil: 'domcontentloaded' });
await page.waitForSelector('#root, main, #main-content', { timeout: 30000 });
await clickButton(/Открыть быстрые действия/i, 'pharma-menu-open');
await clickButton(/Фарма/i, 'pharma-open');
await page.locator('.pharmacology-modal, [data-testid="pharmacology-modal"]').first().waitFor({ state: 'visible', timeout: 30000 });
await assertNoVisibleMojibake('pharmacology');

await page.goto(`${baseUrl}/?visible-mojibake-questionnaires=${Date.now()}`, { waitUntil: 'domcontentloaded' });
await page.waitForSelector('#root, main, #main-content', { timeout: 30000 });
await clickButton(/Открыть быстрые действия/i, 'questionnaire-menu-open');
await clickButton(/Шкалы/i, 'questionnaire-open');
await page.locator('.questionnaire-modal, [data-testid="questionnaire-modal"]').first().waitFor({ state: 'visible', timeout: 30000 });
await assertNoVisibleMojibake('questionnaires');

await browser.close();

if (findings.length) {
  console.error(JSON.stringify({ ok: false, findings }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ ok: true, flows: ['home', 'gynecology', 'disease-modal', '3d-atlas', 'pharmacology', 'questionnaires'] }, null, 2));