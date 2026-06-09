import { chromium, devices } from 'playwright';
import { installModernIPhoneDevices } from './auditDeviceProfiles.mjs';

const baseUrl = process.env.AUDIT_URL ?? process.env.AUDIT_BASE_URL ?? 'http://127.0.0.1:4183';
const deviceNames = installModernIPhoneDevices(devices);
const browser = await chromium.launch({
  executablePath: process.env.CHROME_EXECUTABLE || undefined,
  headless: true,
});

const runDevice = async (deviceName) => {
  const page = await browser.newPage(devices[deviceName]);

  await page.goto(`${baseUrl}/?touchAudit=${Date.now()}-${deviceName.replace(/\s+/g, '-')}`, { waitUntil: 'domcontentloaded' });
  await page.locator('.home-shell').first().waitFor({ state: 'visible', timeout: 9000 });
  await page.getByRole('button', { name: 'Гинекология' }).first().click();
  await page.locator('.disease-card').first().waitFor({ state: 'visible', timeout: 10000 });
  await page.locator('.disease-card').first().click();
  await page.getByTestId('disease-modal').waitFor({ state: 'visible', timeout: 10000 });

  const results = await page.evaluate((label) => {
    const interactiveSelector = [
      'button',
      'a[href]',
      'input',
      'select',
      'textarea',
      '[role="button"]',
      '[role="tab"]',
    ].join(',');

    const isVisible = (el) => {
      const style = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity || 1) > 0.1;
    };

    return [...document.querySelectorAll(interactiveSelector)]
      .filter(isVisible)
      .map((el) => {
        const rect = el.getBoundingClientRect();
        return {
          device: label,
          tag: el.tagName,
          role: el.getAttribute('role'),
          className: String(el.className || ''),
          text: (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 80),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        };
      })
      .filter((entry) => entry.width < 44 || entry.height < 44)
      .filter((entry) => !entry.className.includes('premium-button-shimmer'))
      .slice(0, 80);
  }, deviceName);

  await page.close();
  return results;
};

const results = (await Promise.all(deviceNames.map(runDevice))).flat();
await browser.close();

const critical = results;
const report = {
  ok: critical.length === 0,
  baseUrl,
  deviceCount: deviceNames.length,
  warningCount: results.length,
  criticalCount: critical.length,
  warnings: results,
  critical,
};

console.log(JSON.stringify(report, null, 2));
if (!report.ok) process.exit(1);