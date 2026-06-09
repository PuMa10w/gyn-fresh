import { chromium, devices } from 'playwright';
import { installModernIPhoneDevices } from './auditDeviceProfiles.mjs';

const baseUrl = process.env.AUDIT_URL ?? 'http://127.0.0.1:4173';
const deviceNames = installModernIPhoneDevices(devices);
const browser = await chromium.launch({
  executablePath: process.env.CHROME_EXECUTABLE || undefined,
  headless: true,
});

const allMessages = [];
const screenshots = [];

const slug = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const capture = async (page, deviceName, label, options = { fullPage: false }) => {
  const path = `artifacts/iphone-${slug(deviceName)}-${label}.png`;
  await page.screenshot({ path, ...options });
  screenshots.push(path);
};

const assertNoHorizontalOverflow = async (page, label) => {
  const overflow = await page.evaluate(() => {
    const doc = document.documentElement;
    const width = doc.clientWidth;
    const allowedHorizontalScroller = (el) =>
      Boolean(el.closest('.category-filter, .category-chips, .catalog-sort-options, .search-suggestions, .modal-tabs, .pharma-tabs, .modal-quick-meta, .q-severity-bar'));
    const offenders = [...document.querySelectorAll('body *')]
      .filter((el) => !allowedHorizontalScroller(el))
      .map((el) => {
        const rect = el.getBoundingClientRect();
        return {
          tag: el.tagName,
          className: String(el.className || ''),
          text: (el.textContent || '').trim().slice(0, 80),
          right: Math.round(rect.right),
          left: Math.round(rect.left),
          width: Math.round(rect.width),
        };
      })
      .filter((entry) => entry.width > 0 && (entry.right > width + 3 || entry.left < -3))
      .filter((entry) => !entry.className.includes('premium-button-shimmer'))
      .slice(0, 10);

    return {
      scrollWidth: doc.scrollWidth,
      clientWidth: doc.clientWidth,
      bodyScrollWidth: document.body.scrollWidth,
      offenders,
    };
  });

  if (overflow.scrollWidth > overflow.clientWidth + 3 || overflow.bodyScrollWidth > overflow.clientWidth + 3) {
    throw new Error(`${label}: horizontal overflow ${JSON.stringify(overflow)}`);
  }

  if (overflow.offenders.length > 0) {
    throw new Error(`${label}: overflowing elements ${JSON.stringify(overflow.offenders)}`);
  }
};

const assertNoMojibake = async (page, label) => {
  const suspicious = await page.evaluate(() => {
    const text = document.body.innerText;
    const mojibakeChars = '\u0080-\u00a0\u0402\u0403\u201A\u0453\u201E\u2026\u2020\u2021\u20AC\u2030\u0409\u2039\u040A\u040C\u040B\u040F\u0452\u2018\u2019\u201C\u201D\u2022\u2013\u2014\u2122\u0459\u203A\u045A\u045C\u045B\u045F';
    const patterns = [
      /\uFFFD/g,
      new RegExp(`[\\u0420\\u0421\\u0413\\u0432][${mojibakeChars}]`, 'g'),
      /В[©®]/g,
      new RegExp('\\u043f\\u0457\\u0405', 'g'),
      new RegExp(`Premium ${'Clinical'}|Clinical ${'command'}|TRUST ${'LAYER'}|GYN${'A'}`, 'g'),
      new RegExp(`\\b${'Q'}${'R'}\\b|${'Q'}${'R'}-код`, 'g'),
    ];
    return patterns
      .flatMap((pattern) => [...text.matchAll(pattern)].map((match) => ({
        match: match[0],
        snippet: text.slice(Math.max(0, match.index - 48), match.index + 96),
      })))
      .slice(0, 20);
  });

  if (suspicious.length > 0) {
    throw new Error(`${label}: visible mojibake detected ${JSON.stringify(suspicious)}`);
  }
};

const assertReadableText = async (page, label, selectors) => {
  const failures = await page.evaluate((entries) => {
    const parseRgb = (value) => {
      const match = value.match(/rgba?\(([^)]+)\)/);
      if (!match) return null;
      const parts = match[1].split(',').map((part) => Number.parseFloat(part));
      const [r, g, b] = parts;
      const alpha = parts.length > 3 ? parts[3] : 1;
      return [r, g, b, alpha];
    };
    const luminance = ([r, g, b]) => {
      const channel = [r, g, b].map((value) => {
        const normalized = value / 255;
        return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
      });
      return channel[0] * 0.2126 + channel[1] * 0.7152 + channel[2] * 0.0722;
    };
    const contrast = (fg, bg) => {
      const l1 = luminance(fg);
      const l2 = luminance(bg);
      return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    };
    const findSolidBackground = (el) => {
      let current = el;
      while (current && current !== document.documentElement) {
        const style = getComputedStyle(current);
        const parsed = parseRgb(style.backgroundColor);
        if (parsed && (parsed[3] ?? 1) > 0.2) return { color: parsed, css: style.backgroundColor };
        current = current.parentElement;
      }
      const bodyStyle = getComputedStyle(document.body);
      const bodyBg = parseRgb(bodyStyle.backgroundColor);
      if (bodyBg && (bodyBg[3] ?? 1) > 0.2) return { color: bodyBg, css: bodyStyle.backgroundColor };
      return { color: [255, 240, 229, 1], css: 'rgb(255, 240, 229)' };
    };
    const visible = (el) => {
      const rect = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      return rect.width > 4 && rect.height > 4 && style.visibility !== 'hidden' && style.display !== 'none' && Number.parseFloat(style.opacity || '1') > 0.2;
    };

    return entries.flatMap(({ selector, minContrast }) =>
      [...document.querySelectorAll(selector)]
        .filter(visible)
        .slice(0, 8)
        .map((el) => {
          const style = getComputedStyle(el);
          const fg = parseRgb(style.color);
          const bg = findSolidBackground(el);
          if (!fg || !bg) return null;
          const ratio = contrast(fg, bg.color);
          return ratio < minContrast
            ? { selector, ratio: Number(ratio.toFixed(2)), text: (el.textContent || '').trim().slice(0, 80), color: style.color, background: bg.css }
            : null;
        })
        .filter(Boolean)
    );
  }, selectors);

  if (failures.length > 0) {
    throw new Error(`${label}: readability contrast failures ${JSON.stringify(failures)}`);
  }
};

const assertVisibleAndClickable = async (locator, label) => {
  await locator.waitFor({ state: 'visible', timeout: 8000 });
  const box = await locator.boundingBox();
  if (!box || box.width < 34 || box.height < 34) {
    throw new Error(`${label}: target is too small or invisible ${JSON.stringify(box)}`);
  }
};

const clickByText = async (page, text, label) => {
  const matches = page.getByRole('button', { name: text });
  const count = await matches.count();
  let target = null;

  for (let index = 0; index < count; index += 1) {
    const candidate = matches.nth(index);
    if (await candidate.isVisible()) {
      target = candidate;
      break;
    }
  }

  target ??= page.locator('button:visible').filter({ hasText: text }).first();

  await assertVisibleAndClickable(target, label);
  await target.click();
};

const assertModalFromTop = async (page, label) => {
  const modal = page.locator('.modal-content.mobile-sheet, [data-testid="disease-modal"]').first();
  await modal.waitFor({ state: 'visible', timeout: 8000 });
  const box = await modal.boundingBox();
  if (!box || box.y > 8) throw new Error(`${label}: modal does not start from top (${box?.y})`);

  const scrollable = await page.evaluate(() => {
    const body = document.querySelector('.modal-body') || document.querySelector('.questionnaire-modal') || document.querySelector('.pharma-content');
    if (!body) return { found: false };
    return {
      found: true,
      scrollHeight: body.scrollHeight,
      clientHeight: body.clientHeight,
      canScroll: body.scrollHeight >= body.clientHeight,
    };
  });

  if (!scrollable.found || !scrollable.canScroll) {
    throw new Error(`${label}: modal internal scroll is not available ${JSON.stringify(scrollable)}`);
  }
};

const closeTopModal = async (page, label) => {
  const close = page.locator('.modal-content .modal-close, .questionnaire-modal .modal-close, .pharmacology-modal .modal-close').first();
  await assertVisibleAndClickable(close, `${label} close`);
  await close.click();
  await page.locator('.modal-content, .questionnaire-modal, .pharmacology-modal').first().waitFor({ state: 'hidden', timeout: 8000 }).catch(() => undefined);
};

const answerQuestionnaire = async (page) => {
  await page.locator('.q-card').first().click();
  await page.locator('.q-question').waitFor({ state: 'visible', timeout: 8000 });

  for (let index = 0; index < 20; index += 1) {
    if (await page.locator('.q-result').isVisible().catch(() => false)) return;
    const option = page.locator('.q-option').first();
    await assertVisibleAndClickable(option, `questionnaire option ${index + 1}`);
    await option.click();
    const next = page.locator('.q-nav .premium-button').last();
    await assertVisibleAndClickable(next, `questionnaire next ${index + 1}`);
    await next.click();
    await sleep(80);
  }

  throw new Error('questionnaire result did not appear');
};

for (const deviceName of deviceNames) {
  const page = await browser.newPage(devices[deviceName]);
  const messages = [];
  allMessages.push({ device: deviceName, messages });

  page.on('console', (message) => {
    const text = message.text();
    const isExpectedNetworkNoise = /Failed to load resource: net::ERR_(NETWORK_ACCESS_DENIED|FAILED|BLOCKED_BY_CLIENT)/i.test(text);
    if (['error'].includes(message.type()) && !isExpectedNetworkNoise) messages.push({ type: message.type(), text });
  });
  page.on('pageerror', (error) => messages.push({ type: 'pageerror', text: error.message }));

  await page.goto(`${baseUrl}/?iphoneAudit=${Date.now()}-${slug(deviceName)}`, { waitUntil: 'domcontentloaded' });
  await capture(page, deviceName, 'home', { fullPage: true });
  await assertNoHorizontalOverflow(page, `${deviceName} home`);
  await assertNoMojibake(page, `${deviceName} home`);
  await assertReadableText(page, `${deviceName} home`, [
    { selector: '.navbar-brand-copy strong, .navbar-actions .premium-button, .mobile-bottom-label', minContrast: 4.2 },
    { selector: '.premium-command-copy h2, .premium-command-copy p, .analytics-dashboard h4', minContrast: 4.2 },
  ]);
  await assertVisibleAndClickable(page.locator('.mobile-bottom-bar').first(), `${deviceName} bottom bar`);

  await clickByText(page, 'Гинекология', `${deviceName} bottom gynecology`);
  await page.locator('.disease-card').first().waitFor({ state: 'visible', timeout: 8000 });
  await capture(page, deviceName, 'catalog');
  await assertNoHorizontalOverflow(page, `${deviceName} catalog`);
  await assertNoMojibake(page, `${deviceName} catalog`);
  await assertReadableText(page, `${deviceName} catalog`, [
    { selector: '.catalog-title, .catalog-description, .search-input, .category-chip, .card-title, .card-desc, .card-subtitle', minContrast: 4.2 },
  ]);

  const categoryFilter = page.locator('.category-filter').first();
  await categoryFilter.evaluate((el) => { el.scrollLeft = el.scrollWidth; });
  await clickByText(page, 'Онкология', `${deviceName} category oncology`);
  await clickByText(page, 'Инфекции', `${deviceName} category infection`);
  await clickByText(page, 'Все разделы', `${deviceName} category all`);

  const search = page.locator('.search-input').first();
  await search.fill('эндометриоз');
  await page.locator('.disease-card').first().waitFor({ state: 'visible', timeout: 8000 });
  await search.fill('ъъъъъъъъъъ');
  await page.waitForTimeout(700);
  await page.waitForFunction(() => {
    const empty = document.querySelector('.catalog-status, .empty-state');
    const cards = document.querySelectorAll('.disease-card');
    return Boolean(empty) || cards.length === 0;
  }, null, { timeout: 8000 });
  await search.fill('');

  await page.locator('.disease-card').first().click();
  await page.getByTestId('disease-modal').waitFor({ state: 'visible', timeout: 8000 });
  await page.waitForTimeout(650);
  await assertModalFromTop(page, `${deviceName} disease modal`);
  const tabs = page.locator('.modal-tabs').first();
  await tabs.evaluate((el) => { el.scrollLeft = el.scrollWidth; });
  await page.getByRole('tab', { name: 'Диагностика' }).click();
  await page.getByRole('tab', { name: 'УЗИ' }).click();
  await page.locator('.modal-body').evaluate((el) => { el.scrollTop = el.scrollHeight; });
  await capture(page, deviceName, 'disease-modal');
  await assertNoHorizontalOverflow(page, `${deviceName} disease modal`);
  await assertNoMojibake(page, `${deviceName} disease modal`);
  await assertReadableText(page, `${deviceName} disease modal`, [
    { selector: '.modal-title, .modal-icd, .modal-quick-strip, .modal-tabs .tab-btn, .modal-body p, .modal-body li', minContrast: 4.2 },
  ]);
  await closeTopModal(page, `${deviceName} disease modal`);

  await clickByText(page, 'Акушерство', `${deviceName} bottom obstetrics`);
  await page.locator('.disease-card').first().waitFor({ state: 'visible', timeout: 8000 });
  await capture(page, deviceName, 'obstetrics');
  await assertNoHorizontalOverflow(page, `${deviceName} obstetrics`);

  await clickByText(page, 'Закладки', `${deviceName} bottom bookmarks`);
  await capture(page, deviceName, 'bookmarks');
  await assertNoHorizontalOverflow(page, `${deviceName} bookmarks`);

  await clickByText(page, 'Главная', `${deviceName} bottom home`);
  await page.locator('.home-shell').first().waitFor({ state: 'visible', timeout: 8000 });

  await clickByText(page, /Открыть быстрые действия/i, `${deviceName} quick menu questionnaires`);
  await clickByText(page, /Шкалы/i, `${deviceName} open questionnaires`);
  await page.locator('.questionnaire-modal').waitFor({ state: 'visible', timeout: 8000 });
  await page.waitForTimeout(650);
  await assertModalFromTop(page, `${deviceName} questionnaire list`);
  await answerQuestionnaire(page);
  await page.locator('.q-result').waitFor({ state: 'visible', timeout: 8000 });
  await page.locator('.questionnaire-modal').evaluate((el) => { el.scrollTop = el.scrollHeight; });
  await capture(page, deviceName, 'questionnaire');
  await assertNoHorizontalOverflow(page, `${deviceName} questionnaire`);
  await assertNoMojibake(page, `${deviceName} questionnaire`);
  await closeTopModal(page, `${deviceName} questionnaire`);

  await clickByText(page, /Открыть быстрые действия/i, `${deviceName} quick menu pharmacology`);
  await clickByText(page, /Фарма/i, `${deviceName} open pharmacology`);
  await page.locator('.pharmacology-modal').waitFor({ state: 'visible', timeout: 8000 });
  await page.waitForTimeout(650);
  await page.locator('.pharmacology-modal .search-input').first().fill('прогестерон');
  await page.locator('.medication-card').first().click();
  await page.locator('.med-details').first().waitFor({ state: 'visible', timeout: 8000 });
  await page.getByRole('tab', { name: 'Взаимодействия' }).click();
  await page.getByRole('tab', { name: 'Схемы' }).click();
  await capture(page, deviceName, 'pharmacology');
  await assertNoHorizontalOverflow(page, `${deviceName} pharmacology`);
  await assertNoMojibake(page, `${deviceName} pharmacology`);
  await closeTopModal(page, `${deviceName} pharmacology`);

  await page.getByRole('button', { name: 'Проверить' }).first().click();
  await page.getByRole('button', { name: /Обновить базу|Проверяем/ }).first().waitFor({ state: 'visible', timeout: 8000 }).catch(() => undefined);
  const updateButton = page.getByRole('button', { name: 'Обновить базу' }).first();
  if (await updateButton.isVisible().catch(() => false)) await updateButton.click();
  await page.locator('.version-ready-state, .version-update-card').first().waitFor({ state: 'visible', timeout: 10000 });
  await capture(page, deviceName, 'update-system');
  await assertNoHorizontalOverflow(page, `${deviceName} update system`);

  await page.close();
}

await browser.close();

const browserErrors = allMessages.flatMap(({ device, messages }) =>
  messages
    .filter((message) => message.type === 'error' || message.type === 'pageerror')
    .map((message) => ({ device, ...message })),
);

if (browserErrors.length > 0) {
  throw new Error(`Browser errors: ${JSON.stringify(browserErrors, null, 2)}`);
}

console.log(JSON.stringify({ ok: true, devices: deviceNames, messages: allMessages, screenshots }, null, 2));