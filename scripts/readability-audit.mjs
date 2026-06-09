import { chromium, devices } from 'playwright';

const baseUrl = process.env.AUDIT_URL || process.env.AUDIT_BASE_URL || 'http://127.0.0.1:4173';
const device = devices['iPhone 15 Pro Max'] ?? { viewport: { width: 430, height: 932 }, isMobile: true, hasTouch: true };
const selectors = [
  ['.catalog-title, .catalog-description', 4.5, 'catalog copy'],
  ['.search-input, input[type="search"]', 4.5, 'search'],
  ['.category-chip, .tab-btn, .nav-tab', 3.2, 'tabs and chips'],
  ['.card-title, .card-desc, .disease-card', 4.5, 'disease cards'],
  ['.mobile-bottom-label', 3.2, 'bottom navigation'],
  ['.content-card, .structured-item, .guideline-card', 4.5, 'clinical content cards'],
  ['.modal-quick-strip, .modal-tabs, .modal-body', 3.2, 'modal chrome'],
  ['.anatomy-atlas-shell, .anatomy-atlas-fallback, .anatomy-hotspot-card', 3.2, '3D atlas'],
  ['.clinical-template-assistant, .clinical-template-output, .clinical-template-empty', 3.2, 'AI helper'],
  ['.symptom-checker, .clinical-tool-card, .clinical-tool-error', 3.2, 'AI diagnostic'],
  ['.pubmed-feed, .pubmed-card, .pubmed-empty, .pubmed-error', 3.2, 'PubMed'],
  ['.version-checker, .version-meta-grid > div, .version-update-card', 3.2, 'PWA update panel'],
  ['.premium-error-container, .premium-error-card, .site-footer', 3.2, 'recovery and footer'],
];

const browser = await chromium.launch({ executablePath: process.env.CHROME_EXECUTABLE || undefined, headless: true });
const page = await browser.newPage(device);
const findings = [];

async function clickVisible(pattern, label) {
  const buttons = page.getByRole('button', { name: pattern });
  const count = await buttons.count();
  for (let index = 0; index < count; index += 1) {
    const button = buttons.nth(index);
    if (await button.isVisible().catch(() => false)) {
      await button.click({ timeout: 8000 });
      return true;
    }
  }
  findings.push({ label, reason: 'button not found' });
  return false;
}

async function collect(label) {
  const result = await page.evaluate((selectors) => {
    const parseRgb = (value) => {
      const match = value.match(/rgba?\(([^)]+)\)/);
      if (!match) return null;
      const parts = match[1].split(',').map((part) => Number.parseFloat(part));
      return [parts[0], parts[1], parts[2], parts.length > 3 ? parts[3] : 1];
    };
    const blend = (fg, bg) => {
      const alpha = fg[3] ?? 1;
      return [
        fg[0] * alpha + bg[0] * (1 - alpha),
        fg[1] * alpha + bg[1] * (1 - alpha),
        fg[2] * alpha + bg[2] * (1 - alpha),
        1,
      ];
    };
    const luminance = ([r, g, b]) => {
      const c = [r, g, b].map((v) => {
        const n = v / 255;
        return n <= 0.03928 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4;
      });
      return c[0] * 0.2126 + c[1] * 0.7152 + c[2] * 0.0722;
    };
    const contrast = (fg, bg) => {
      const l1 = luminance(fg);
      const l2 = luminance(bg);
      return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    };
    const backgroundFor = (el) => {
      let current = el;
      const bodyBg = parseRgb(getComputedStyle(document.body).backgroundColor);
      let bg = bodyBg && bodyBg[3] > 0.35 ? bodyBg : [255, 244, 236, 1];
      const stack = [];
      while (current && current !== document.documentElement) {
        const parsed = parseRgb(getComputedStyle(current).backgroundColor);
        if (parsed && parsed[3] > 0) stack.unshift(parsed);
        current = current.parentElement;
      }
      for (const layer of stack) bg = blend(layer, bg);
      return bg;
    };
    const visible = (el) => {
      const rect = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      return rect.width > 4 && rect.height > 4 && style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0.2;
    };

    return selectors.flatMap(([selector, minContrast, group]) =>
      Array.from(document.querySelectorAll(selector))
        .filter(visible)
        .slice(0, 14)
        .map((el) => {
          const color = parseRgb(getComputedStyle(el).color);
          const bg = backgroundFor(el);
          if (!color || !bg) return null;
          const ratio = contrast(blend(color, bg), bg);
          return ratio < minContrast ? {
            group,
            selector,
            ratio: Number(ratio.toFixed(2)),
            minContrast,
            text: (el.textContent || '').trim().slice(0, 100),
            color: getComputedStyle(el).color,
            background: getComputedStyle(el).backgroundColor,
          } : null;
        })
        .filter(Boolean)
    );
  }, selectors);
  findings.push(...result.map((entry) => ({ ...entry, page: label })));
}

await page.goto(`${baseUrl}/?readability=${Date.now()}`, { waitUntil: 'domcontentloaded' });
await page.waitForSelector('#root, main, #main-content', { timeout: 30000 });
await collect('home');

await clickVisible(/Гинекология/i, 'gynecology');
await page.locator('.disease-card').first().waitFor({ state: 'visible', timeout: 30000 }).catch(() => undefined);
await collect('catalog');

await page.locator('.disease-card').first().click();
await page.locator('.modal-content, [role="dialog"]').first().waitFor({ state: 'visible', timeout: 12000 });
await collect('modal quick');

for (const tabName of ['Диагностика', 'Источники', 'AI помощник', '3D атлас', 'AI-диагност', 'PubMed']) {
  const tab = page.getByRole('tab', { name: tabName }).first();
  await tab.scrollIntoViewIfNeeded().catch(() => undefined);
  await tab.click({ timeout: 8000 }).catch(() => undefined);
  await page.waitForTimeout(260);
  await collect(`modal ${tabName}`);
}

await browser.close();

if (findings.length) {
  console.error(JSON.stringify({ ok: false, findings }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ ok: true, checkedSelectorGroups: selectors.length }, null, 2));