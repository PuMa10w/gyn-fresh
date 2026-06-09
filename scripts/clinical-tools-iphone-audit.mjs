import { chromium, devices } from 'playwright';

const baseUrl = process.env.AUDIT_URL ?? process.env.AUDIT_BASE_URL ?? 'http://127.0.0.1:4173';
const device = devices['iPhone 15 Pro Max'] ?? { viewport: { width: 430, height: 932 }, isMobile: true, hasTouch: true };
const targetTabs = ['AI помощник', '3D атлас', 'AI-диагност', 'PubMed'];
const maxCards = Number.parseInt(process.env.CLINICAL_TOOLS_CARD_LIMIT || '30', 10);
const browser = await chromium.launch({ executablePath: process.env.CHROME_EXECUTABLE || undefined, headless: true });
const context = await browser.newContext(device);
const page = await context.newPage();
const messages = [];
const failures = [];

page.on('pageerror', (error) => messages.push({ type: 'pageerror', message: error.message }));
page.on('console', (message) => {
  if (message.type() === 'error') {
    messages.push({ type: 'console', message: message.text() });
  }
});

async function clickGynecology() {
  await page.goto(`${baseUrl}/?clinicalTools=${Date.now()}`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#root, main, #main-content', { timeout: 30000 });
  await page.getByRole('button', { name: /Гинекология/i }).first().click();
  await page.locator('.disease-card').first().waitFor({ state: 'visible', timeout: 30000 });
}

async function closeModal() {
  const close = page.locator('.modal-close').first();
  if (await close.count()) {
    await close.click();
    await page.locator('.modal-content, [role="dialog"]').first().waitFor({ state: 'hidden', timeout: 8000 }).catch(() => undefined);
  }
}

await clickGynecology();

for (let index = 0; index < maxCards; index += 1) {
  const cardCount = await page.locator('.disease-card').count();
  if (index >= cardCount) break;

  await page.locator('.disease-card').nth(index).scrollIntoViewIfNeeded();
  await page.locator('.disease-card').nth(index).click();
  await page.locator('.modal-content, [role="dialog"]').first().waitFor({ state: 'visible', timeout: 12000 });

  const title = await page.locator('.modal-content h2, [role="dialog"] h2').first().textContent().catch(() => `card-${index}`);

  for (const tabName of targetTabs) {
    const tab = page.getByRole('tab', { name: tabName }).first();
    const tabCount = await tab.count();

    if (!tabCount) {
      failures.push({ card: title?.trim(), tab: tabName, reason: 'tab missing' });
      continue;
    }

    await tab.scrollIntoViewIfNeeded();
    await tab.click();
    await page.waitForTimeout(220);

    const visiblePanel = await page.locator('.clinical-template-assistant, .anatomy-atlas-shell, .symptom-checker, .pubmed-feed').filter({ visible: true }).count();
    const errorPanel = await page.locator('.clinical-tool-error, .premium-error-container').filter({ visible: true }).count();

    if (!visiblePanel || errorPanel) {
      failures.push({ card: title?.trim(), tab: tabName, reason: `visiblePanel=${visiblePanel}, errorPanel=${errorPanel}` });
    }
  }

  await closeModal();

  const reopenCard = page.locator('.disease-card').nth(index);
  await reopenCard.scrollIntoViewIfNeeded();
  await reopenCard.click();
  await page.locator('.modal-content, [role="dialog"]').first().waitFor({ state: 'visible', timeout: 12000 });
  await closeModal();
}

await browser.close();

const report = {
  ok: failures.length === 0 && messages.length === 0,
  checkedCards: maxCards,
  checkedTabs: targetTabs,
  failures,
  messages,
};

if (!report.ok) {
  console.error(JSON.stringify(report, null, 2));
  process.exit(1);
}

console.log(JSON.stringify(report, null, 2));