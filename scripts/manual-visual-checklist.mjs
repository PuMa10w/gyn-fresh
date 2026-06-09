import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const devices = [
  'iPhone 15',
  'iPhone 15 Pro Max',
  'iPhone 16',
  'iPhone 16 Pro Max',
  'iPhone 17',
  'iPhone 17 Pro Max',
  'Desktop 1280',
  'Desktop 1440',
  'Desktop 1728',
];
const orientations = ['portrait', 'landscape'];
const themes = ['light', 'dark'];
const passes = ['pass-1', 'pass-2'];
const screens = [
  'home',
  'pwa-update-panel',
  'catalog-gynecology',
  'catalog-obstetrics',
  'search-and-chips',
  'disease-card-open-close',
  'disease-modal-tabs',
  'pharmacology',
  'questionnaire-list',
  'questionnaire-result',
  'ai-helper',
  'ai-diagnostic',
  'pubmed',
  '3d-atlas-webgl',
  '3d-atlas-fallback',
  'bookmarks',
  'history',
];
const criteria = [
  'readability',
  'no-overlay-overlap',
  'no-horizontal-overflow',
  'safe-area-clearance',
  'scroll-works',
  'touch-targets-44px',
  'visual-consistency',
];

const matrix = passes.flatMap((pass) =>
  devices.flatMap((device) =>
    orientations.flatMap((orientation) =>
      themes.flatMap((theme) =>
        screens.map((screen) => ({
          pass,
          device,
          orientation,
          theme,
          screen,
          status: 'pending-manual-review',
          criteria: Object.fromEntries(criteria.map((item) => [item, 'pending'])),
        })),
      ),
    ),
  ),
);

const report = {
  ok: true,
  generatedAt: new Date().toISOString(),
  productionTarget: 'https://gyn-clinical.pages.dev',
  releaseLine: 'v1.x',
  note: 'Manual release artifact: before production deploy, mark each pending item pass/fail during the final human visual pass.',
  totals: {
    passes: passes.length,
    devices: devices.length,
    orientations: orientations.length,
    themes: themes.length,
    screens: screens.length,
    checklistItems: matrix.length,
  },
  criteria,
  matrix,
};

const outDir = path.join(root, 'artifacts');
await fs.mkdir(outDir, { recursive: true });
await fs.writeFile(path.join(outDir, 'manual-visual-checklist.json'), `${JSON.stringify(report, null, 2)}\n`);

console.log(JSON.stringify({
  ok: true,
  artifact: 'artifacts/manual-visual-checklist.json',
  checklistItems: matrix.length,
  productionTarget: report.productionTarget,
}, null, 2));
