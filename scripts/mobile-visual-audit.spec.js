import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const baseUrl = process.env.AUDIT_URL || 'http://localhost:4173';
const artifactDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'artifacts');

test.use({
  browserName: 'chromium',
  channel: 'chrome',
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
  serviceWorkers: 'block',
});

async function expectNoOverflow(page, label) {
  const overflow = await page.evaluate(() => {
    const doc = document.documentElement;
    const offenders = [...document.querySelectorAll('body *')]
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
      .filter((entry) => entry.width > 0 && (entry.right > doc.clientWidth + 2 || entry.left < -2))
      .filter((entry) => !entry.className.includes('premium-button-shimmer'))
      .slice(0, 8);

    return {
      clientWidth: doc.clientWidth,
      scrollWidth: doc.scrollWidth,
      offenders,
    };
  });

  expect(overflow.scrollWidth, `${label}: document overflow`).toBeLessThanOrEqual(overflow.clientWidth + 2);
  if (overflow.scrollWidth > overflow.clientWidth + 2) {
    expect(overflow.offenders, `${label}: overflow offenders`).toEqual([]);
  }
}

async function expectAtTop(page, label) {
  await expect
    .poll(() => page.evaluate(() => Math.round(window.scrollY)), {
      message: `${label}: viewport should reset to the top`,
      timeout: 1200,
    })
    .toBeLessThanOrEqual(2);
}

test('mobile visual smoke: key screens and scrolls', async ({ page }) => {
  const errors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));

  await page.goto(`${baseUrl}/?mobileAudit=${Date.now()}`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(artifactDir, 'mobile-audit-home.png'), fullPage: true });
  await expectNoOverflow(page, 'home overflow');

  await page.getByRole('button', { name: '👩⚕️ Гинекология' }).click();
  await page.getByRole('heading', { name: 'Гинекология' }).waitFor({ state: 'visible' });
  await page.getByPlaceholder('Нозология, симптом, код МКБ...').waitFor({ state: 'visible' });
  await expectAtTop(page, 'gynecology navigation');
  await page.screenshot({ path: path.join(artifactDir, 'mobile-audit-gyn.png'), fullPage: false });
  await expectNoOverflow(page, 'gynecology overflow');

  await page.getByRole('button', { name: 'Эндометриоз, код N80. Открыть подробности' }).click();
  await page.getByRole('dialog').waitFor({ state: 'visible' });
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(artifactDir, 'mobile-audit-disease-modal.png'), fullPage: false });
  await expectNoOverflow(page, 'disease modal overflow');
  await page.getByRole('button', { name: /Закрыть|×|✕/ }).first().click();

  await page.getByRole('button', { name: 'Открыть опросники' }).click();
  await page.getByRole('dialog').waitFor({ state: 'visible' });
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(artifactDir, 'mobile-audit-questionnaires.png'), fullPage: false });
  await expectNoOverflow(page, 'questionnaire overflow');
  await page.getByRole('button', { name: /×|✕/ }).first().click();

  await page.getByRole('button', { name: 'Открыть фармакологию' }).click();
  await page.getByRole('dialog').waitFor({ state: 'visible' });
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(artifactDir, 'mobile-audit-pharmacology.png'), fullPage: false });
  await expectNoOverflow(page, 'pharmacology overflow');
  await page.getByRole('button', { name: /Закрыть фармакологию|×|✕/ }).first().click();

  await page.getByRole('button', { name: '🤰 Акушерство' }).click();
  await page.getByRole('heading', { name: 'Акушерство' }).waitFor({ state: 'visible' });
  await page.getByPlaceholder('Нозология, симптом, код МКБ...').waitFor({ state: 'visible' });
  await expectAtTop(page, 'obstetrics navigation');
  await page.screenshot({ path: path.join(artifactDir, 'mobile-audit-obstetrics.png'), fullPage: false });
  await expectNoOverflow(page, 'obstetrics overflow');

  expect(errors).toEqual([]);
});