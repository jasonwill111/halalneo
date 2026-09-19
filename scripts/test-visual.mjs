// Playwright visual verification: desktop + mobile screenshots of key pages.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE = 'http://127.0.0.1:4174';
const OUT = path.resolve(process.cwd(), 'screenshots', 'verify');
fs.mkdirSync(OUT, { recursive: true });

const shots = [
  { name: 'home-desktop', path: '/', viewport: { width: 1440, height: 900 } },
  { name: 'home-mobile', path: '/', viewport: { width: 375, height: 667 } },
  { name: 'categories-desktop', path: '/categories', viewport: { width: 1440, height: 900 } },
  { name: 'categories-mobile', path: '/categories', viewport: { width: 375, height: 667 } },
  { name: 'products-desktop', path: '/products', viewport: { width: 1440, height: 900 } },
  { name: 'suppliers-desktop', path: '/suppliers', viewport: { width: 1440, height: 900 } },
  { name: 'market-guides-desktop', path: '/market-guides', viewport: { width: 1440, height: 900 } },
  { name: 'kb-desktop', path: '/knowledge-base', viewport: { width: 1440, height: 900 } },
];

const browser = await chromium.launch();
for (const s of shots) {
  const ctx = await browser.newContext({ viewport: s.viewport, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });

  const resp = await page.goto(BASE + s.path, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(400);

  const outPath = path.join(OUT, s.name + '.png');
  await page.screenshot({ path: outPath, fullPage: false });
  const status = resp?.status();
  console.log(`${s.name}: HTTP ${status} · ${errors.length} client errors · saved ${outPath}`);
  for (const e of errors.slice(0, 5)) console.log('   ' + e);
  await ctx.close();
}
await browser.close();
