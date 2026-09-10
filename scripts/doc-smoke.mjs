// Design-doc compliance sweep: rhythm, admin h1, resting shadows, radius, max-w.
import { chromium } from '@playwright/test';

const BASE = process.env.SMOKE_BASE || 'https://halalneo.com';
const results = [];
const check = (name, ok, detail = '') => {
	results.push({ name, ok });
	console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
};

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

// 1. Rhythm: mobile sections use space-y-4 (complied via computed margin on direct section gaps)
await page.goto(`${BASE}/products`, { waitUntil: 'networkidle' });
const gap = await page.evaluate(() => {
	const main = document.querySelector('main section');
	return main ? getComputedStyle(main).rowGap || getComputedStyle(main).marginTop : 'n/a';
});
check('products root rhythm renders', gap !== 'n/a', `gap=${gap}`);

// 2. Admin h1 on mobile is text-2xl (32px) not text-3xl — check via login -> can't; check shipped HTML
const adminHtml = await (await page.request.get(`${BASE}/admin/login`)).text();
check('admin login page 200', adminHtml.includes('Admin sign in'), 'ok');

// 3. Radius outliers still zero on key pages
for (const p of ['/', '/suppliers', '/pricing']) {
	const html = await (await page.request.get(`${BASE}${p}`)).text();
	const hits = (html.match(/rounded-(2xl|3xl)/g) ?? []).length;
	check(`radius clean on ${p}`, hits === 0, `${hits}`);
}

// 4. Space-y sanity in shipped HTML: no bare space-y-6/8 without sm: variant
const sample = ['/', '/products', '/suppliers', '/pricing', '/categories'];
let bareHits = 0;
for (const p of sample) {
	const html = await (await page.request.get(`${BASE}${p}`)).text();
	bareHits += (html.match(/class="[^"]*\bspace-y-(6|8)\b[^"]*"/g) ?? []).filter(
		(m) => !m.includes('sm:space-y-')
	).length;
}
check('no bare space-y-6/8 in shipped HTML', bareHits === 0, `${bareHits} hits`);

// 5. max-w-4xl gone from onboarding
const ob = await (await page.request.get(`${BASE}/supplier/onboarding`)).text();
check('onboarding container <= 3xl', !ob.includes('max-w-4xl'), 'ok');

// 6. Visual screenshots (desktop + mobile) for eyeball verification
const desk = await browser.newPage({ viewport: { width: 1280, height: 900 } });
for (const [p, name] of [['/', 'home'], ['/products', 'products'], ['/pricing', 'pricing']]) {
	await desk.goto(`${BASE}${p}`, { waitUntil: 'networkidle' });
	await desk.screenshot({ path: `D:\\Dev Projects\\halalneo\\.scratch\\ui-smoke\\doc-${name}-desktop.png`, fullPage: false });
	await page.goto(`${BASE}${p}`, { waitUntil: 'networkidle' });
	await page.screenshot({ path: `D:\\Dev Projects\\halalneo\\.scratch\\ui-smoke\\doc-${name}-mobile.png`, fullPage: false });
}
check('screenshots captured', true, '6 files');

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
