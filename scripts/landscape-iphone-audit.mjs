import { chromium, devices } from 'playwright';
import { installModernIPhoneDevices } from './auditDeviceProfiles.mjs';

const baseUrl = process.env.AUDIT_URL ?? process.env.AUDIT_BASE_URL ?? 'http://127.0.0.1:4183';
const deviceNames = installModernIPhoneDevices(devices);
const browser = await chromium.launch({
  executablePath: process.env.CHROME_EXECUTABLE || undefined,
  headless: true,
});

const failures = [];

const landscapeDevice = (deviceName) => {
  const device = devices[deviceName];
  const viewport = device.viewport ?? { width: 390, height: 844 };
  return {
    ...device,
    viewport: {
      width: Math.max(viewport.width, viewport.height),
      height: Math.min(viewport.width, viewport.height),
    },
    isMobile: true,
  };
};

const assertNoHorizontalOverflow = async (page, label) => {
  const result = await page.evaluate(() => {
    const doc = document.documentElement;
    const allowed = (el) =>
      Boolean(el.closest('.category-chips, .search-suggestions, .modal-tabs, .modal-quick-meta, .anatomy-scene-rail'));
    const offenders = [...document.querySelectorAll('body *')]
      .filter((el) => !allowed(el))
      .map((el) => {
        const rect = el.getBoundingClientRect();
        return {
          tag: el.tagName,
          className: String(el.className || ''),
          text: (el.textContent || '').trim().slice(0, 64),
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          width: Math.round(rect.width),
        };
      })
      .filter((entry) => !entry.className.includes('premium-button-shimmer'))
      .filter((entry) => entry.width > 0 && (entry.left < -4 || entry.right > doc.clientWidth + 4))
      .slice(0, 12);

    return {
      scrollWidth: doc.scrollWidth,
      clientWidth: doc.clientWidth,
      offenders,
    };
  });

  if (result.scrollWidth > result.clientWidth + 4 || result.offenders.length > 0) {
    throw new Error(`${label}: landscape overflow ${JSON.stringify(result)}`);
  }
};

const assertVisible = async (locator, label) => {
  await locator.waitFor({ state: 'visible', timeout: 9000 });
  const box = await locator.boundingBox();
  if (!box || box.width < 36 || box.height < 24) {
    throw new Error(`${label}: not visible enough ${JSON.stringify(box)}`);
  }
};

for (const deviceName of deviceNames) {
  const page = await browser.newPage(landscapeDevice(deviceName));
  const messages = [];
  page.on('console', (message) => {
    if (message.type() === 'error' && !/ERR_(NETWORK_ACCESS_DENIED|FAILED|BLOCKED_BY_CLIENT)/i.test(message.text())) {
      messages.push(message.text());
    }
  });
  page.on('pageerror', (error) => messages.push(error.message));

  try {
    await page.goto(`${baseUrl}/?landscapeAudit=${Date.now()}-${deviceName.replace(/\s+/g, '-')}`, {
      waitUntil: 'domcontentloaded',
    });
    await assertVisible(page.locator('.home-shell, .catalog-shell').first(), `${deviceName} home`);
    await assertNoHorizontalOverflow(page, `${deviceName} home`);

    await page.getByRole('button', { name: 'Гинекология' }).first().click();
    await assertVisible(page.locator('.catalog-shell').first(), `${deviceName} catalog`);
    await assertVisible(page.locator('.search-input').first(), `${deviceName} search`);
    await assertVisible(page.locator('.category-chip').first(), `${deviceName} category chip`);
    await page.locator('.disease-card').first().waitFor({ state: 'visible', timeout: 10000 });
    await assertNoHorizontalOverflow(page, `${deviceName} catalog`);

    await page.locator('.disease-card').first().click();
    await page.getByTestId('disease-modal').waitFor({ state: 'visible', timeout: 10000 });
    await assertVisible(page.locator('.modal-tabs').first(), `${deviceName} modal tabs`);
    await page.getByRole('tab', { name: 'Диагностика' }).click();
    await page.getByRole('tab', { name: 'УЗИ' }).click();
    await assertVisible(page.locator('.modal-body').first(), `${deviceName} modal body`);
    await assertNoHorizontalOverflow(page, `${deviceName} modal`);

    if (messages.length > 0) {
      throw new Error(`${deviceName}: browser errors ${JSON.stringify(messages)}`);
    }
  } catch (error) {
    failures.push({ deviceName, message: error.message });
  } finally {
    await page.close();
  }
}

await browser.close();

const report = {
  ok: failures.length === 0,
  baseUrl,
  devices: deviceNames,
  failures,
};

console.log(JSON.stringify(report, null, 2));
if (!report.ok) process.exit(1);