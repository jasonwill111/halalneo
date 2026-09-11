// Radius consistency: assert no rounded-2xl/3xl classes render on key pages
// (checked against the shipped CSS bundle + live page HTML).
import { chromium } from '@playwright/test';

const BASE = process.env.SMOKE_BASE || 'https://halalneo.com';
const results = [];
const check = (name, ok, detail = '') => {
	results.push({ name, ok });
	console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
};

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

const pages = ['/', '/products', '/suppliers', '/categories', '/pricing', '/search', '/supplier/onboarding'];
let totalHits = 0;
for (const p of pages) {
	const html = await (await page.request.get(`${BASE}${p}`)).text();
	const hits = (html.match(/rounded-(2xl|3xl)/g) ?? []).length;
	totalHits += hits;
	check(`no rounded-2xl/3xl on ${p}`, hits === 0, `${hits} occurrences`);
}

// Mobile tab bar + popover (md:hidden, so check the CSS chunk is served without 2xl for it)
const home = await (await page.request.get(`${BASE}/`)).text();
check('mobile tab bar uses rounded-xl', !/glass-strong[^"]*rounded-2xl/.test(home), 'popover + dock');

// Desktop header: Trade dropdown sits left of Resources (navGroups order)
const tradeIdx = home.search(/>\s*Trade\s*</);
const resIdx = home.search(/>\s*Resources\s*</);
check('desktop Trade left of Resources', tradeIdx !== -1 && resIdx !== -1 && tradeIdx < resIdx, 'header dropdown order');

// Screenshot for visual confirmation
await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
await page.screenshot({ path: 'D:\\Dev Projects\\halalneo\\.scratch\\ui-smoke\\radius-home.png', fullPage: true });
const mob = await browser.newPage({ viewport: { width: 390, height: 844 } });
await mob.goto(`${BASE}/`, { waitUntil: 'networkidle' });
await mob.screenshot({ path: 'D:\\Dev Projects\\halalneo\\.scratch\\ui-smoke\\radius-home-mobile.png', fullPage: true });

// Mobile Explore popover: Trade group with all three new entries, first
await mob.getByText('Explore', { exact: true }).click();
await mob.getByRole('link', { name: 'Buying Requests' }).waitFor({ timeout: 8000 });
const popText = await mob.locator('[data-popover-panel]').innerText();
check('mobile Explore has Buying Requests', popText.includes('Buying Requests'), 'trade group');
check('mobile Explore has Quick Deals', popText.includes('Quick Deals'), 'trade group');
check('mobile Explore has Success Stories', popText.includes('Success Stories'), 'trade group');
check('mobile Explore Trade first', popText.indexOf('TRADE') !== -1 && popText.indexOf('TRADE') < popText.indexOf('RESOURCES'), 'group order');

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} passed (total outlier classes: ${totalHits})`);
process.exit(failed.length ? 1 : 0);
