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

await page.goto(`${baseUrl}/?atlasAudit=${Date.now()}`, { waitUntil: 'domcontentloaded' });
await clickVisible(page, /Гинекология/i, 'open gynecology');
await page.locator('.disease-card').first().waitFor({ state: 'visible', timeout: 10000 });
await page.locator('.disease-card').first().click();
await page.locator('.modal-content').first().waitFor({ state: 'visible', timeout: 10000 });
const atlasTabClicked = await page.evaluate(() => {
  const tab = Array.from(document.querySelectorAll('.modal-tabs .tab-btn')).find((element) =>
    /3D|атлас/i.test(element.textContent || ''),
  );
  tab?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  return Boolean(tab);
});
if (!atlasTabClicked) throw new Error('open atlas tab: tab not found');
await page.locator('.anatomy-atlas-shell').waitFor({ state: 'visible', timeout: 10000 });
await page.locator('.anatomy-hotspot-card').first().waitFor({ state: 'visible', timeout: 10000 });

for (const name of ['Матка', 'Эндометрий', 'Шейка', 'Плацента', 'Роды', 'УЗИ-срез']) {
  const clickedScene = await page.evaluate((label) => {
    const chip = Array.from(document.querySelectorAll('.anatomy-scene-chip')).find((element) =>
      (element.textContent || '').trim() === label,
    );
    chip?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    return Boolean(chip);
  }, name);
  if (!clickedScene) throw new Error(`Atlas scene ${name}: chip not found`);
  await page.waitForTimeout(180);
  if (!(await page.locator('.anatomy-hotspot-card').first().isVisible().catch(() => false))) {
    throw new Error(`Atlas scene ${name}: no hotspot cards`);
  }
}

await page.locator('.anatomy-hotspot-card').first().click();
await page.locator('.anatomy-hotspot-sheet').waitFor({ state: 'visible', timeout: 8000 });

const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
if (overflow > 3) throw new Error(`Atlas horizontal overflow ${overflow}px`);
if (errors.length) throw new Error(`Console/page errors: ${errors.join(' | ')}`);

await browser.close();
console.log(JSON.stringify({ ok: true, scenesChecked: 6 }, null, 2));