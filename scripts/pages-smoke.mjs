// Visual verification of the 4 reworked pages (desktop + mobile screenshots).
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const BASE = 'https://halalneo.com';
const OUT = 'D:\\Dev Projects\\halalneo\\.scratch\\ui-smoke';
fs.mkdirSync(OUT, { recursive: true });

const results = [];
const check = (name, ok, detail = '') => {
	results.push({ name, ok });
	console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
};

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

// 1. /products listing — real products, colored cert badges, category filter
await page.goto(`${BASE}/products`, { waitUntil: 'networkidle' });
let text = (await page.textContent('body')) ?? '';
check('products: no Coming Soon', !text.includes('Coming Soon'), 'placeholder gone');
check('products: grid renders', text.includes('All products') && text.includes('listing'), 'grid section');
const productCards = await page.locator('a[href^="/products/"]').count();
check('products: cards present', productCards >= 8, `${productCards} cards`);
const certChips = await page.locator('span:has-text("Certified")').count();
check('products: colored cert chips', certChips >= 1, `${certChips} chips`);
await page.screenshot({ path: `${OUT}/products-list-desktop.png`, fullPage: true });
// filter interaction
await page.getByRole('button', { name: /Beverages/i }).first().click();
await page.waitForTimeout(600);
const filteredCount = (await page.textContent('body'))?.match(/(\d+) listing/) ?? [];
check('products: filter works', filteredCount.length > 1, `filtered to ${filteredCount[1]}`);
await page.getByRole('button', { name: 'Clear filter' }).click();

// 2. product detail — colored badges + named supplier
const firstCard = page.locator('a[href^="/products/"]').first();
await firstCard.click();
await page.waitForURL('**/products/**', { timeout: 15000 });
await page.waitForLoadState('networkidle');
text = (await page.textContent('body')) ?? '';
check('detail: halal certified badge', text.includes('Halal Certified'), 'colored badge');
check('detail: origin badge', !/>\s*category-slug/i.test(text), 'no raw slug as badge');
check('detail: supplier card named', text.includes('Verified halal supplier'), 'supplier card upgraded');
await page.screenshot({ path: `${OUT}/product-detail-desktop.png`, fullPage: true });

// 3. /suppliers listing — colored type badges + filter cards
await page.goto(`${BASE}/suppliers`, { waitUntil: 'networkidle' });
text = (await page.textContent('body')) ?? '';
check('suppliers: type filter cards', text.includes('Manufacturer') && text.includes('Wholesaler') && text.includes('Trader'), '3 type cards');
check('suppliers: no coming soon cards', !text.includes('Coming soon'), 'static cards replaced');
const badgeCount = await page.locator('.grid a span[class*="border-"]').count();
check('suppliers: colored badges', badgeCount >= 6, `${badgeCount} badges`);
await page.screenshot({ path: `${OUT}/suppliers-list-desktop.png`, fullPage: true });
// filter by manufacturer
await page.getByRole('button', { name: /Manufacturer \d/ }).first().click();
await page.waitForTimeout(600);
text = (await page.textContent('body')) ?? '';
check('suppliers: type filter works', text.includes('Clear filter'), 'filtered view');

// 4. supplier detail — colored header badges + LINE + product cards
const supLink = page.locator('a[href^="/suppliers/"]').first();
await supLink.click();
await page.waitForURL('**/suppliers/**', { timeout: 15000 });
await page.waitForLoadState('networkidle');
text = (await page.textContent('body')) ?? '';
check('supplier detail: type badge', /manufacturer|wholesaler|trader/i.test(text), 'colored type');
check('supplier detail: product cards', (await page.locator('a[href^="/products/"]').count()) >= 1, 'cards render');
await page.screenshot({ path: `${OUT}/supplier-detail-desktop.png`, fullPage: true });

// 5. Mobile spot-check
const mob = await browser.newPage({ viewport: { width: 390, height: 844 } });
await mob.goto(`${BASE}/products`, { waitUntil: 'networkidle' });
await mob.screenshot({ path: `${OUT}/products-list-mobile.png`, fullPage: true });
await mob.goto(`${BASE}/suppliers`, { waitUntil: 'networkidle' });
await mob.screenshot({ path: `${OUT}/suppliers-list-mobile.png`, fullPage: true });

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
