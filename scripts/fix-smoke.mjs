// Verify the two small fixes live:
// 1. /supplier/onboarding no longer shows the supplier portal sidebar.
// 2. Admin sidebar shows the real signed-in user, not "Not signed in".
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const BASE = 'https://halalneo.com';
const OUT = 'D:\\Dev Projects\\halalneo\\.scratch\\ui-smoke';
fs.mkdirSync(OUT, { recursive: true });
const pw = fs.readFileSync('C:/Users/Nick/AppData/Local/Temp/opencode/admin-pw.txt', 'utf8').trim();

const results = [];
const check = (name, ok, detail = '') => {
	results.push({ name, ok });
	console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
};

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

// 1. onboarding layout reset
await page.goto(`${BASE}/supplier/onboarding`, { waitUntil: 'networkidle' });
const ob = (await page.textContent('body')) ?? '';
check('no supplier portal header', !ob.includes('Supplier Portal'), 'title removed');
check('no demo sidebar company', !ob.includes('Nusantara Foods'), 'sidebar company removed');
check('no Premium Supplier tag', !ob.includes('Premium Supplier'), 'plan tag removed');
check('public h1 still there', ob.includes('Become a HalalNeo supplier'), 'h1');
await page.screenshot({ path: `${OUT}/onboarding-fixed.png`, fullPage: true });

// 2. admin sidebar session
await page.goto(`${BASE}/admin/login`, { waitUntil: 'networkidle' });
await page.getByPlaceholder('admin@halalneo.com').fill('support@halalneo.com');
await page.getByPlaceholder('••••••••').fill(pw);
await page.getByRole('button', { name: 'Sign in' }).click();
await page.waitForURL('**/admin', { timeout: 15000 });
await page.waitForTimeout(2000);
const admin = (await page.textContent('body')) ?? '';
check('sidebar shows real name', admin.includes('HalalNeo Admin'), 'user name');
check('sidebar shows email', admin.includes('support@halalneo.com'), 'user email');
check('no Not signed in', !admin.includes('Not signed in'), 'placeholder gone');
await page.screenshot({ path: `${OUT}/admin-sidebar-fixed.png`, fullPage: true });

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
