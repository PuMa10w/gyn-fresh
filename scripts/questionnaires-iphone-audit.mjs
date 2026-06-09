import { chromium, devices } from 'playwright';

const baseUrl = process.env.AUDIT_URL ?? process.env.AUDIT_BASE_URL ?? 'http://127.0.0.1:4173';
const device = devices['iPhone 15 Pro Max'] ?? { viewport: { width: 430, height: 932 }, isMobile: true, hasTouch: true };

async function ensureServer(url) {
  try {
    const response = await fetch(url, { cache: 'no-store' });
    if (response.ok) return;
  } catch {
    // handled below
  }
  console.error('Audit server is not available. Run npm.cmd run verify:premium or start preview first.');
  process.exit(1);
}

async function clickVisible(page, pattern, label) {
  const buttons = page.getByRole('button', { name: pattern });
  const count = await buttons.count();
  for (let index = 0; index < count; index += 1) {
    const button = buttons.nth(index);
    if (await button.isVisible().catch(() => false)) {
      await button.click({ timeout: 7000 });
      return;
    }
  }

  const clicked = await page.evaluate((source) => {
    const re = new RegExp(source, 'i');
    const target = Array.from(document.querySelectorAll('button, [role="button"], a')).find((element) => {
      const rect = element.getBoundingClientRect();
      const text = `${element.textContent || ''} ${element.getAttribute('aria-label') || ''}`;
      return rect.width > 0 && rect.height > 0 && re.test(text);
    });
    target?.click();
    return Boolean(target);
  }, pattern.source);

  if (!clicked) throw new Error(`${label}: action not found`);
}

await ensureServer(baseUrl);

const browser = await chromium.launch({ executablePath: process.env.CHROME_EXECUTABLE || undefined, headless: true });
const page = await browser.newPage(device);
const errors = [];
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(message.text());
});
page.on('pageerror', (error) => errors.push(error.message));

await page.goto(`${baseUrl}/?questionnaireAudit=${Date.now()}`, { waitUntil: 'domcontentloaded' });
await clickVisible(page, /Открыть быстрые действия|Шкалы|Опросники/i, 'open questionnaires');
if (!(await page.locator('.questionnaire-modal').isVisible().catch(() => false))) {
  await clickVisible(page, /Шкалы|Опросники/i, 'open questionnaire modal');
}
await page.locator('.questionnaire-modal .q-card').first().waitFor({ state: 'visible', timeout: 10000 });

const total = await page.locator('.questionnaire-modal .q-card').count();
const completed = [];

for (let index = 0; index < total; index += 1) {
  await page.locator('.questionnaire-modal .q-card').nth(index).click();
  await page.locator('.q-question, .q-result').first().waitFor({ state: 'visible', timeout: 8000 });

  for (let guard = 0; guard < 80; guard += 1) {
    if (await page.locator('.q-result').isVisible().catch(() => false)) break;
    const options = page.locator('.q-option');
    await options.nth(Math.min(1, Math.max(0, (await options.count()) - 1))).click();
    await clickVisible(page, /Далее|Получить результат/i, 'questionnaire next');
    await page.waitForTimeout(80);
  }

  await page.locator('.q-result').waitFor({ state: 'visible', timeout: 10000 });
  const resultText = await page.locator('.q-result').innerText();
  if (!/Профессиональное заключение| екомендация|Следующие шаги/i.test(resultText)) {
    throw new Error(`Questionnaire ${index + 1}: result summary is incomplete`);
  }

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  if (overflow > 3) throw new Error(`Questionnaire ${index + 1}: horizontal overflow ${overflow}px`);
  completed.push(index + 1);

  await clickVisible(page, /К списку тестов/i, 'back to questionnaire list');
  await page.locator('.questionnaire-modal .q-card').first().waitFor({ state: 'visible', timeout: 8000 });
}

if (completed.length < 19) throw new Error(`Only ${completed.length} questionnaires completed, expected at least 19`);
if (errors.length) throw new Error(`Console/page errors: ${errors.join(' | ')}`);

await browser.close();
console.log(JSON.stringify({ ok: true, completed: completed.length }, null, 2));