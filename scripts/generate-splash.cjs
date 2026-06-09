const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');
const splashSizes = [
  { width: 1125, height: 2436, name: 'splash-1125x2436' },
  { width: 750, height: 1334, name: 'splash-750x1334' },
  { width: 1242, height: 2208, name: 'splash-1242x2208' },
];
const iconSizes = [
  { width: 180, height: 180, name: 'apple-touch-icon' },
  { width: 192, height: 192, name: 'logo192' },
  { width: 512, height: 512, name: 'logo512' },
];

const faviconSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">'
  + '<defs><linearGradient id="bg" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#FFF1E8"/><stop offset="0.48" stop-color="#EBCDBA"/><stop offset="1" stop-color="#B97886"/></linearGradient>'
  + '<linearGradient id="mark" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#2B2023"/><stop offset="0.62" stop-color="#5C3941"/><stop offset="1" stop-color="#B97886"/></linearGradient></defs>'
  + '<rect width="512" height="512" rx="120" fill="url(#bg)"/><rect x="56" y="64" width="400" height="384" rx="96" fill="url(#mark)" stroke="#D8B878" stroke-width="8"/>'
  + '<text x="256" y="290" text-anchor="middle" font-family="Georgia, Times New Roman, serif" font-size="142" font-weight="900" fill="#FFF8F1" letter-spacing="-10">GYN</text>'
  + '<path d="M170 344 C205 382 307 382 342 344" fill="none" stroke="#D8B878" stroke-width="14" stroke-linecap="round" opacity="0.9"/></svg>';

function html(width, height, type) {
  const panelInset = type === 'icon' ? '10%' : '18% 10%';
  const panelRadius = type === 'icon' ? '28%' : '64px';
  const border = Math.max(4, Math.round(width * 0.014));
  const shadowY = Math.round(height * 0.025);
  const shadowBlur = Math.round(width * 0.12);
  const wordSize = type === 'icon' ? Math.round(width * 0.29) : Math.round(width * 0.19);
  const lineWidth = type === 'icon' ? Math.round(width * 0.34) : Math.round(width * 0.24);
  const lineHeight = Math.max(5, Math.round(width * 0.012));
  const lineMargin = Math.round(width * 0.04);
  const subtitleMargin = Math.round(width * 0.045);
  const subtitleSize = Math.round(width * 0.035);
  return '<!doctype html><html><head><meta charset="utf-8"><style>'
    + 'html,body{margin:0;width:' + width + 'px;height:' + height + 'px;overflow:hidden}'
    + 'body{background:radial-gradient(circle at 18% 6%,rgba(255,248,241,.95),transparent 30%),linear-gradient(145deg,#fff1e8,#ead0bc 56%,#d89aa7);font-family:Georgia,Times New Roman,serif}'
    + '.screen{width:100vw;height:100vh;display:grid;place-items:center;position:relative}'
    + '.screen:before{content:"";position:absolute;inset:' + panelInset + ';border-radius:' + panelRadius + ';background:linear-gradient(145deg,#2b2023,#5c3941 58%,#b97886);border:' + border + 'px solid rgba(216,184,120,.72);box-shadow:0 ' + shadowY + 'px ' + shadowBlur + 'px rgba(43,32,35,.24),inset 0 1px 0 rgba(255,255,255,.18)}'
    + '.brand{position:relative;text-align:center;color:#fff8f1;text-shadow:0 8px 28px rgba(0,0,0,.22)}'
    + '.word{font-size:' + wordSize + 'px;font-weight:900;letter-spacing:-.075em;line-height:.9}'
    + '.line{width:' + lineWidth + 'px;height:' + lineHeight + 'px;margin:' + lineMargin + 'px auto 0;border-radius:999px;background:#d8b878;opacity:.94}'
    + '.subtitle{margin-top:' + subtitleMargin + 'px;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;font-size:' + subtitleSize + 'px;font-weight:700;letter-spacing:.04em;color:rgba(255,248,241,.82)}'
    + '</style></head><body><div class="screen"><div class="brand"><div class="word">GYN</div><div class="line"></div>'
    + (type === 'splash' ? '<div class="subtitle">клинический PWA</div>' : '')
    + '</div></div></body></html>';
}

async function screenshotPng(page, size, type) {
  await page.setViewportSize({ width: size.width, height: size.height });
  await page.setContent(html(size.width, size.height, type), { waitUntil: 'load' });
  await page.screenshot({ path: path.join(publicDir, size.name + '.png'), fullPage: false });
  console.log('created ' + size.name + '.png');
}

(async () => {
  fs.mkdirSync(publicDir, { recursive: true });
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), faviconSvg, 'utf8');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  for (const size of iconSizes) await screenshotPng(page, size, 'icon');
  for (const size of splashSizes) await screenshotPng(page, size, 'splash');
  await browser.close();
})();
