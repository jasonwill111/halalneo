// Admin auth journey: /admin redirects to /admin/login; sign in; /admin shows widget.
import { chromium } from '@playwright/test';
import fs from 'node:fs';
import { execSync } from 'node:child_process';

const BASE = 'https://halalneo.com';
const OUT = 'D:\\Dev Projects\\halalneo\\.scratch\\ui-smoke';
fs.mkdirSync(OUT, { recursive: true });
const pw = fs.readFileSync(process.env.USERPROFILE + '/.halalneo-admin/admin-pw.txt', 'utf8').trim();

const results = [];
const check = (name, ok, detail = '') => {
	results.push({ name, ok });
	console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
};

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

// 1. /admin without session -> /admin/login
await page.goto(`${BASE}/admin`, { waitUntil: 'networkidle' });
check('admin gate redirects', page.url().includes('/admin/login'), page.url());

// 2. wrong password rejected
await page.getByPlaceholder('admin@halalneo.com').fill('support@halalneo.com');
await page.getByPlaceholder('••••••••').fill('wrongpassword1');
await page.getByRole('button', { name: 'Sign in' }).click();
await page.waitForTimeout(2500);
check('wrong password rejected', (await page.textContent('body'))?.includes('Invalid') ?? page.url().includes('/admin/login'), 'stays on login');

// 3. correct password -> /admin
await page.getByPlaceholder('••••••••').fill(pw);
await page.getByRole('button', { name: 'Sign in' }).click();
await page.waitForURL('**/admin', { timeout: 15000 });
check('login lands on admin', page.url().endsWith('/admin'), page.url());
await page.waitForTimeout(2000);
const adminText = (await page.textContent('body')) ?? '';
check('pending widget renders', adminText.includes('Recent supplier applications'), 'widget card');
check('widget shows pending row', adminText.includes('PureHarvest Snacks') || adminText.includes('pending'), 'row content');
await page.screenshot({ path: `${OUT}/admin-dashboard.png`, fullPage: true });

// 4. non-allowlisted user cannot enter: sign up outsider, try /admin
const ctx2 = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const p2 = await ctx2.newPage();
const r = await p2.request.post(`${BASE}/api/auth/sign-up/email`, {
	data: { name: 'Outsider', email: 'outsider-qa@example.com', password: 'Outsider12345678' }
});
check('outsider signup ok', r.ok(), `status ${r.status()}`);
await p2.goto(`${BASE}/admin`, { waitUntil: 'networkidle' });
check('outsider blocked from admin', p2.url().includes('/admin/login'), p2.url());
await browser.close();

// cleanup outsider user from D1
execSync(
	`wrangler d1 execute halalneo-db --remote --command "DELETE FROM session WHERE user_id IN (SELECT id FROM user WHERE email='outsider-qa@example.com'); DELETE FROM account WHERE user_id IN (SELECT id FROM user WHERE email='outsider-qa@example.com'); DELETE FROM user WHERE email='outsider-qa@example.com'"`,
	{ cwd: 'D:\\Dev Projects\\halalneo', env: { ...process.env, NO_PROXY: '*', HTTP_PROXY: '', HTTPS_PROXY: '' } }
);
console.log('outsider cleaned up');

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
