import { chromium, devices } from 'playwright';

const baseUrl = process.env.AUDIT_URL ?? process.env.AUDIT_BASE_URL ?? 'http://127.0.0.1:4173';
const device = devices['iPhone 15 Pro Max'] ?? { viewport: { width: 430, height: 932 }, isMobile: true, hasTouch: true };
const perSectionLimit = Number.parseInt(process.env.CARDS_OPEN_LIMIT || '50', 10);

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

async function clickVisibleButton(page, pattern, label) {
  const buttons = page.getByRole('button', { name: pattern });
  const count = await buttons.count();
  for (let index = 0; index < count; index += 1) {
    const button = buttons.nth(index);
    if (await button.isVisible().catch(() => false)) {
      await button.click({ timeout: 8000 });
      return;
    }
  }

  const clicked = await page.evaluate((source) => {
    const re = new RegExp(source, 'i');
    const candidates = Array.from(document.querySelectorAll('button, [role="button"], a'));
    const target = candidates.find((element) => {
      const rect = element.getBoundingClientRect();
      const text = `${element.textContent || ''} ${element.getAttribute('aria-label') || ''}`;
      return rect.width > 0 && rect.height > 0 && re.test(text);
    });
    target?.click();
    return Boolean(target);
  }, pattern.source);

  if (!clicked) throw new Error(`${label}: button not found`);
}

async function closeModal(page) {
  const close = page.locator('.modal-close').first();
  await close.waitFor({ state: 'visible', timeout: 8000 });
  await close.click({ timeout: 8000 });
  await page.locator('.modal-content, [role="dialog"]').first().waitFor({ state: 'hidden', timeout: 8000 }).catch(() => undefined);
}

async function auditSection(page, sectionPattern, sectionLabel) {
  await clickVisibleButton(page, sectionPattern, sectionLabel);
  await page.locator('.disease-card').first().waitFor({ state: 'visible', timeout: 30000 });
  await page.waitForTimeout(250);
  const total = await page.locator('.disease-card').count();
  const limit = Math.min(total, perSectionLimit);
  const failures = [];

  for (let index = 0; index < limit; index += 1) {
    try {
      let beforeScrollY = 0;
      let opened = false;
      let lastError = null;

      for (let attempt = 0; attempt < 3 && !opened; attempt += 1) {
        try {
          const card = page.locator('.disease-card').nth(index);
          await card.waitFor({ state: 'visible', timeout: 10000 });
          await card.scrollIntoViewIfNeeded({ timeout: 10000 });
          await page.waitForTimeout(80);
          beforeScrollY = await page.evaluate(() => window.scrollY);
          await page.locator('.disease-card').nth(index).click({ timeout: 10000 });
          opened = true;
        } catch (error) {
          lastError = error;
          await page.waitForTimeout(160);
        }
      }

      if (!opened) throw lastError ?? new Error('card did not open');

      const modal = page.locator('.modal-content, [role="dialog"]').first();
      await modal.waitFor({ state: 'visible', timeout: 12000 });

      const title = (await page.locator('.modal-title, [role="dialog"] h2').first().textContent({ timeout: 5000 }).catch(() => '')).trim();
      const tabCount = await page.locator('.modal-tabs [role="tab"]').count();
      const closeCount = await page.locator('.modal-close').count();
      const errorVisible = await page.locator('.premium-error-container, .clinical-tool-error').filter({ visible: true }).count();

      if (!title || tabCount < 8 || closeCount < 1 || errorVisible > 0) {
        failures.push({ section: sectionLabel, index, title, tabCount, closeCount, errorVisible });
      }

      await closeModal(page);
      await page.waitForTimeout(80);
      const afterScrollY = await page.evaluate(() => window.scrollY);
      if (Math.abs(afterScrollY - beforeScrollY) > 420) {
        failures.push({ section: sectionLabel, index, reason: 'catalog scroll position changed too much', beforeScrollY, afterScrollY });
      }
    } catch (error) {
      failures.push({ section: sectionLabel, index, reason: error.message });
      await page.keyboard.press('Escape').catch(() => undefined);
      await page.locator('.modal-overlay').first().click({ force: true, timeout: 1000 }).catch(() => undefined);
    }
  }

  return { total, checked: limit, failures };
}

await ensureServer(baseUrl);

const browser = await chromium.launch({ executablePath: process.env.CHROME_EXECUTABLE || undefined, headless: true });
const page = await browser.newPage(device);
const messages = [];
page.on('console', (message) => {
  if (message.type() === 'error') messages.push({ type: 'console', text: message.text() });
});
page.on('pageerror', (error) => messages.push({ type: 'pageerror', text: error.message }));

await page.goto(`${baseUrl}/?cardsOpenAudit=${Date.now()}`, { waitUntil: 'domcontentloaded' });
await page.waitForSelector('#root, main, #main-content', { timeout: 30000 });

const gynecology = await auditSection(page, /Гинекология/i, 'gynecology');
const obstetrics = await auditSection(page, /Акушерство/i, 'obstetrics');

await browser.close();

const failures = [...gynecology.failures, ...obstetrics.failures];
const report = {
  ok: failures.length === 0 && messages.length === 0,
  perSectionLimit,
  gynecology,
  obstetrics,
  messages,
};

if (!report.ok) {
  console.error(JSON.stringify(report, null, 2));
  process.exit(1);
}

console.log(JSON.stringify(report, null, 2));