import { chromium, devices } from 'playwright';

const baseUrl = process.env.AUDIT_URL ?? 'http://127.0.0.1:4173';
const device = devices['iPhone 15 Pro Max'] ?? { viewport: { width: 430, height: 932 }, isMobile: true, hasTouch: true };

const bannedLegacyRgb = [
  '25, 198, 179',
  '109, 207, 147',
  '20, 184, 166',
  '16, 185, 129',
  '39, 174, 96',
  '46, 204, 113',
  '100, 210, 255',
];

const selectors = [
  '.premium-button--primary',
  '.version-actions .premium-button',
  '.mobile-bottom-item.is-active',
  '.nav-tab.active',
  '.category-chip.active',
  '.modal-tab.active',
  '.pharma-tab.active',
  '.q-progress-fill',
  '.q-result-badge',
  '.search-input-wrapper',
  '.disease-card',
  '.premium-card',
  '.version-checker',
];

const mojibakePattern = new RegExp('(?:[\\u0420\\u0421][\\u00a0\\u00a4\\u00a9\\u00ae\\u00b0\\u00b7\\u0402-\\u040f\\u0452-\\u045f\\u2018-\\u201d\\u2020-\\u2022\\u20ac\\u2122])|(?:\\u0420\\u0406[\\u0402-\\u040f\\u0452-\\u045f\\u2018-\\u201d\\u2020-\\u2022\\u20ac\\u2122])|\\u00d0|\\u00d1|\\ufffd');
const removedSharePattern = /\bQR\b|QR-код/i;

const browser = await chromium.launch({ executablePath: process.env.CHROME_EXECUTABLE || undefined, headless: true });
const page = await browser.newPage(device);
const findings = [];

const waitForApp = async () => {
  await page.waitForSelector('#root, #main-content, main', { state: 'visible', timeout: 30000 });
  await page.waitForFunction(() => document.body.innerText.trim().length > 40, null, { timeout: 30000 });
};

const clickByText = async (texts, label) => {
  const patterns = texts.map((text) => text instanceof RegExp ? text : new RegExp(text, 'i'));

  for (const pattern of patterns) {
    const locators = await page.getByRole('button', { name: pattern }).all();
    for (const locator of locators) {
      if (await locator.isVisible().catch(() => false)) {
        await locator.click({ timeout: 5000 });
        return true;
      }
    }
  }

  const clicked = await page.evaluate((patternSources) => {
    const patterns = patternSources.map((source) => new RegExp(source, 'i'));
    const candidates = Array.from(document.querySelectorAll('button, [role="button"], a, .mobile-bottom-item'));
    const visible = candidates.filter((element) => {
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
    });
    const target = visible.find((element) => patterns.some((pattern) => {
      const text = `${element.textContent ?? ''} ${element.getAttribute('aria-label') ?? ''}`;
      return pattern.test(text);
    }));
    target?.click();
    return Boolean(target);
  }, patterns.map((pattern) => pattern.source));

  if (!clicked) {
    findings.push({ flow: label, selector: 'navigation', property: 'click', value: 'missing target', text: texts.join(', ') });
  }
  return clicked;
};

const openOverflowAction = async (actionPattern, label) => {
  await clickByText([/Открыть быстрые действия/i, /⋯/], `${label}-overflow`);
  await page.waitForTimeout(120);
  return clickByText([actionPattern], label);
};

const openHome = async (suffix = 'home') => {
  await page.goto(`${baseUrl}/?pastel=${Date.now()}-${suffix}`, { waitUntil: 'domcontentloaded' });
  await waitForApp();
  if (!(await page.locator('.home-shell, .premium-command-hero').first().isVisible().catch(() => false))) {
    await clickByText(['Главная'], 'home-navigation');
  }
  await page.locator('.home-shell, .premium-command-hero, #main-content').first().waitFor({ state: 'visible', timeout: 30000 });
};

const inspect = async (label) => {
  const result = await page.evaluate(({ selectors, bannedLegacyRgb, mojibakeSource, removedShareSource }) => {
    const findings = [];
    const mojibakePattern = new RegExp(mojibakeSource);
    const removedSharePattern = new RegExp(removedShareSource, 'i');
    const bodyText = document.body.innerText;

    if (removedSharePattern.test(bodyText)) {
      findings.push({
        selector: 'body',
        property: 'text',
        value: 'removed QR block is visible',
        text: 'QR-раздел должен отсутствовать в пользовательском интерфейсе',
      });
    }

    if (mojibakePattern.test(bodyText)) {
      findings.push({
        selector: 'body',
        property: 'text',
        value: 'visible mojibake',
        text: bodyText.match(mojibakePattern)?.[0] ?? '',
      });
    }

    for (const selector of selectors) {
      const elements = Array.from(document.querySelectorAll(selector)).filter((element) => {
        const rect = element.getBoundingClientRect();
        const style = window.getComputedStyle(element);
        return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
      });

      for (const element of elements.slice(0, 8)) {
        const style = window.getComputedStyle(element);
        const values = {
          backgroundColor: style.backgroundColor,
          backgroundImage: style.backgroundImage,
          borderColor: style.borderColor,
          color: style.color,
        };

        for (const [property, value] of Object.entries(values)) {
          if (bannedLegacyRgb.some((legacy) => value.includes(legacy))) {
            findings.push({
              selector,
              property,
              value,
              text: element.textContent?.trim().slice(0, 80) ?? '',
            });
          }
        }
      }
    }
    return findings;
  }, {
    selectors,
    bannedLegacyRgb,
    mojibakeSource: mojibakePattern.source,
    removedShareSource: removedSharePattern.source,
  });

  findings.push(...result.map((finding) => ({ flow: label, ...finding })));
};

await openHome('start');
await inspect('home');

await clickByText(['Гинекология'], 'catalog-navigation');
await page.locator('.disease-card').first().waitFor({ state: 'visible', timeout: 30000 });
await inspect('catalog');

await page.locator('.disease-card-action, .disease-card').first().click();
await page.getByTestId('disease-modal').waitFor({ state: 'visible', timeout: 30000 });
await clickByText(['УЗИ'], 'disease-modal-ultrasound');
await inspect('disease-modal-ultrasound');

await page.keyboard.press('Escape').catch(() => undefined);
await openHome('questionnaire');
await openOverflowAction(/Шкалы|Опросники/i, 'questionnaire-navigation');
await page.locator('.questionnaire-modal, [data-testid="questionnaire-modal"]').waitFor({ state: 'visible', timeout: 30000 });
await inspect('questionnaire');

await page.keyboard.press('Escape').catch(() => undefined);
await openHome('pharma');
await openOverflowAction(/Фарма|Фармакология/i, 'pharmacology-navigation');
await page.locator('.pharmacology-modal, [data-testid="pharmacology-modal"]').waitFor({ state: 'visible', timeout: 30000 });
await inspect('pharmacology');

await browser.close();

if (findings.length) {
  console.error(JSON.stringify({ ok: false, findings }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ ok: true, checkedSelectors: selectors.length, flows: 5 }, null, 2));