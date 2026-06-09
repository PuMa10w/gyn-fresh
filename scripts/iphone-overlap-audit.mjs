import { chromium, devices } from 'playwright';
import { installModernIPhoneDevices } from './auditDeviceProfiles.mjs';

const baseUrl = process.env.AUDIT_URL ?? 'http://127.0.0.1:4173';
const deviceNames = installModernIPhoneDevices(devices);
const browser = await chromium.launch({
  executablePath: process.env.CHROME_EXECUTABLE || undefined,
  headless: true,
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const assertOneActiveLayer = async (page, label) => {
  const layers = await page.evaluate(() => {
    const selectors = ['[data-testid="disease-modal"]', '.questionnaire-modal', '.pharmacology-modal'];
    return selectors
      .flatMap((selector) => Array.from(document.querySelectorAll(selector)))
      .filter((element) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return rect.width > 10 && rect.height > 10 && style.display !== 'none' && style.visibility !== 'hidden';
      })
      .map((element) => element.className || element.getAttribute('data-testid') || element.tagName);
  });

  if (layers.length > 1) {
    throw new Error(`${label}: multiple active overlays detected ${JSON.stringify(layers)}`);
  }
};

const assertNoOverlap = async (page, label) => {
  const result = await page.evaluate(() => {
    const viewportHeight = window.innerHeight;
    const activeLayer =
      document.querySelector('.modal-content, .questionnaire-modal, .pharmacology-modal') || document;
    const hasActiveLayer = activeLayer !== document;
    const controls = [
      ...activeLayer.querySelectorAll(
        'button, [role="button"], input, select, textarea, .disease-card, .content-card, .q-result, .q-question, .medication-card, .regimen-card',
      ),
    ].filter((element) => {
      const rect = element.getBoundingClientRect();
      return rect.width > 10 && rect.height > 10 && rect.bottom > 0 && rect.top < viewportHeight;
    });
    const blockers = [
      ...activeLayer.querySelectorAll('.modal-header, .modal-tabs, .modal-quick-strip, .pharma-tabs, .q-nav'),
      ...(hasActiveLayer ? [] : [...document.querySelectorAll('.mobile-bottom-bar')]),
    ].filter((element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return ['fixed', 'sticky'].includes(style.position) && rect.width > 10 && rect.height > 10;
    });
    const offenders = [];

    for (const control of controls) {
      const controlRect = control.getBoundingClientRect();
      for (const blocker of blockers) {
        if (control === blocker || blocker.contains(control) || control.contains(blocker)) continue;
        const blockerRect = blocker.getBoundingClientRect();
        const isBottomBar = blocker.classList.contains('mobile-bottom-bar');
        if (isBottomBar && control.closest('.cards-grid')) continue;
        const controlCenterY = controlRect.top + controlRect.height / 2;
        if (isBottomBar && controlCenterY >= blockerRect.top) continue;
        const overlapX = Math.max(0, Math.min(controlRect.right, blockerRect.right) - Math.max(controlRect.left, blockerRect.left));
        const overlapY = Math.max(0, Math.min(controlRect.bottom, blockerRect.bottom) - Math.max(controlRect.top, blockerRect.top));
        const overlapArea = overlapX * overlapY;
        const controlArea = controlRect.width * controlRect.height;

        if (controlArea > 0 && overlapArea / controlArea > 0.28) {
          offenders.push({
            control: `${control.tagName}.${String(control.className || '')}`.slice(0, 90),
            blocker: `${blocker.tagName}.${String(blocker.className || '')}`.slice(0, 90),
            text: (control.textContent || control.getAttribute('aria-label') || '').trim().slice(0, 90),
          });
        }
      }
    }

    return offenders.slice(0, 10);
  });

  if (result.length > 0) {
    throw new Error(`${label}: sticky/fixed overlap detected ${JSON.stringify(result)}`);
  }
};

const clickButton = async (page, name) => {
  const buttons = page.getByRole('button', { name, exact: false });
  const count = await buttons.count();
  for (let index = 0; index < count; index += 1) {
    const button = buttons.nth(index);
    if (await button.isVisible().catch(() => false)) {
      await button.click({ timeout: 8000 });
      await sleep(350);
      return;
    }
  }

  const clicked = await page.evaluate((source) => {
    const re = new RegExp(source, 'i');
    const target = Array.from(document.querySelectorAll('button, [role="button"], a')).find((element) => {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      const text = `${element.textContent || ''} ${element.getAttribute('aria-label') || ''}`;
      return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden' && re.test(text);
    });
    target?.click();
    return Boolean(target);
  }, typeof name === 'string' ? name : name.source);

  if (!clicked) throw new Error(`Button not found: ${String(name)}`);
};

const openToolTab = async (page, name, selector, label) => {
  await page.getByRole('tab', { name }).click();
  await page.locator(selector).waitFor({ state: 'visible', timeout: 10000 });
  await sleep(350);
  await assertOneActiveLayer(page, label);
  await assertNoOverlap(page, label);
  await page.locator('.modal-body').evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });
  await sleep(120);
  await assertNoOverlap(page, `${label} bottom`);
};

const forceTheme = async (page, theme) => {
  await page.evaluate((nextTheme) => {
    document.documentElement.setAttribute('data-theme', nextTheme);
    document.body.setAttribute('data-theme', nextTheme);
    localStorage.setItem('gyn-theme', nextTheme);
  }, theme);
  await sleep(150);
};

for (const deviceName of deviceNames) {
  const page = await browser.newPage(devices[deviceName]);
  await page.goto(`${baseUrl}/?overlapAudit=${Date.now()}`, { waitUntil: 'domcontentloaded' });
  await assertNoOverlap(page, `${deviceName} home`);

  await clickButton(page, 'Гинекология');
  await page.locator('.disease-card').first().waitFor({ state: 'visible', timeout: 8000 });
  await assertNoOverlap(page, `${deviceName} catalog`);

  await page.locator('.category-filter').first().evaluate((element) => {
    element.scrollLeft = element.scrollWidth;
  });
  await page.locator('.category-filter').first().scrollIntoViewIfNeeded();
  await assertNoOverlap(page, `${deviceName} catalog chips`);

  const searchInput = page.locator('input[type="search"], input[placeholder*="МКБ"], input[placeholder*="Нозолог"]').first();
  if (await searchInput.isVisible().catch(() => false)) {
    await searchInput.fill('эндометриоз');
    await sleep(300);
    await assertNoOverlap(page, `${deviceName} catalog search keyboard`);
  }

  await page.locator('.disease-card').first().click();
  await page.getByTestId('disease-modal').waitFor({ state: 'visible', timeout: 8000 });
  await sleep(500);
  await assertOneActiveLayer(page, `${deviceName} disease modal layer`);
  await assertNoOverlap(page, `${deviceName} disease modal top`);
  await page.getByRole('tab', { name: 'УЗИ' }).click();
  await page.locator('.modal-body').evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });
  await assertNoOverlap(page, `${deviceName} disease modal bottom`);
  await openToolTab(page, 'AI помощник', '.clinical-template-assistant', `${deviceName} AI helper`);
  await openToolTab(page, '3D атлас', '.anatomy-atlas-shell', `${deviceName} 3D atlas`);
  await openToolTab(page, 'PubMed', '.pubmed-feed', `${deviceName} PubMed`);
  await page.locator('.modal-close').first().click();
  await page.locator('.modal-content').first().waitFor({ state: 'hidden', timeout: 8000 }).catch(() => undefined);

  await page.goto(`${baseUrl}/?overlapAuditQuestionnaire=${Date.now()}`, { waitUntil: 'domcontentloaded' });
  await assertNoOverlap(page, `${deviceName} home before questionnaire`);
  await clickButton(page, /Открыть быстрые действия/i);
  await clickButton(page, /Шкалы/i);
  await page.locator('.questionnaire-modal').waitFor({ state: 'visible', timeout: 8000 });
  await assertOneActiveLayer(page, `${deviceName} questionnaire layer`);
  await assertNoOverlap(page, `${deviceName} questionnaire list`);
  await page.locator('.q-card').first().click();
  await page.locator('.q-question').waitFor({ state: 'visible', timeout: 8000 });
  await assertNoOverlap(page, `${deviceName} questionnaire question`);
  await page.locator('.questionnaire-modal').evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });
  await assertNoOverlap(page, `${deviceName} questionnaire bottom`);
  await page.locator('.modal-close').first().click();
  await page.locator('.questionnaire-modal').first().waitFor({ state: 'hidden', timeout: 8000 }).catch(() => undefined);

  await page.goto(`${baseUrl}/?overlapAuditPharma=${Date.now()}`, { waitUntil: 'domcontentloaded' });
  await assertNoOverlap(page, `${deviceName} home before pharmacology`);
  await clickButton(page, /Открыть быстрые действия/i);
  await clickButton(page, /Фарма/i);
  await page.locator('.pharmacology-modal').waitFor({ state: 'visible', timeout: 8000 });
  await assertOneActiveLayer(page, `${deviceName} pharmacology layer`);
  await assertNoOverlap(page, `${deviceName} pharmacology`);

  await page.goto(`${baseUrl}/?overlapAuditDark=${Date.now()}`, { waitUntil: 'domcontentloaded' });
  await forceTheme(page, 'dark');
  await assertNoOverlap(page, `${deviceName} dark home`);
  await clickButton(page, 'Гинекология');
  await page.locator('.disease-card').first().waitFor({ state: 'visible', timeout: 8000 });
  await page.locator('.disease-card').first().click();
  await page.getByTestId('disease-modal').waitFor({ state: 'visible', timeout: 8000 });
  await assertOneActiveLayer(page, `${deviceName} dark disease modal layer`);
  await assertNoOverlap(page, `${deviceName} dark disease modal`);
  await page.close();
}

await browser.close();
console.log(JSON.stringify({ ok: true, devices: deviceNames }, null, 2));