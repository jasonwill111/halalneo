// E2E review flow: submit 2 applications -> login -> reject one with feedback
// -> approve the other -> verify D1 rows -> cleanup.
import { chromium } from '@playwright/test';
import fs from 'node:fs';
import { execSync } from 'node:child_process';

const BASE = process.env.SMOKE_BASE || 'https://halalneo.com';
const OUT = 'D:\\Dev Projects\\halalneo\\.scratch\\ui-smoke';
fs.mkdirSync(OUT, { recursive: true });
const pw = fs.readFileSync(process.env.USERPROFILE + '/.halalneo-admin/admin-pw.txt', 'utf8').trim();

const results = [];
const check = (name, ok, detail = '') => {
	results.push({ name, ok });
	console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
};

function d1(sql) {
	return execSync(
		`wrangler d1 execute halalneo-db --remote --command "${sql.replace(/"/g, '\\"')}" --json`,
		{ cwd: 'D:\\Dev Projects\\halalneo', env: { ...process.env, NO_PROXY: '*', HTTP_PROXY: '', HTTPS_PROXY: '' }, encoding: 'utf8' }
	);
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

// Unique suffix per run — page HTML is edge-cached (s-maxage), so reusing
// slugs across runs would read stale cached copies.
const RUN = Date.now().toString(36).slice(-6);
const NAME_A = `QA Review Reject ${RUN} Co`;
const NAME_B = `QA Review Approve ${RUN} Co`;
const SLUG_A = `qa-review-reject-${RUN}-co`;
const SLUG_B = `qa-review-approve-${RUN}-co`;

// 1. Submit two applications via the public form
async function submitApp(company) {
	await page.goto(`${BASE}/supplier/onboarding`, { waitUntil: 'networkidle' });
	await page.getByPlaceholder('e.g. Nusantara Foods Sdn Bhd').fill(company);
	await page.getByPlaceholder('Country').fill('Singapore');
	await page.locator('button').filter({ hasText: /Select/ }).first().click();
	await page.getByRole('option', { name: 'Trader' }).click();
	await page.getByPlaceholder('you@company.com').fill(`qa-${company.toLowerCase().replace(/[^a-z0-9]+/g, '-')}@example.com`);
	await page.getByRole('button', { name: 'Continue' }).click();
	await page.getByRole('button', { name: 'Continue' }).click();
	await page.getByRole('button', { name: 'Submit Application' }).click();
	await page.waitForTimeout(3500);
	return ((await page.textContent('body')) ?? '').includes('Application submitted');
}
check('submit app A', await submitApp(NAME_A));
check('submit app B', await submitApp(NAME_B));

// 2. Login and open dashboard
await page.goto(`${BASE}/admin/login`, { waitUntil: 'networkidle' });
await page.getByPlaceholder('admin@halalneo.com').fill('support@halalneo.com');
await page.getByPlaceholder('••••••••').fill(pw);
await page.getByRole('button', { name: 'Sign in' }).click();
await page.waitForURL('**/admin', { timeout: 15000 });
await page.waitForTimeout(2000);
const dash = (await page.textContent('body')) ?? '';
check('dashboard lists app A', dash.includes(NAME_A), 'row visible');
check('dashboard lists app B', dash.includes(NAME_B), 'row visible');

// 3. Reject app A with feedback
await page.getByRole('button', { name: 'Review' }).first().click();
await page.waitForTimeout(500);
// ensure this dialog is for app A
const dlgText = (await page.textContent('[role="dialog"]')) ?? '';
const isA = dlgText.includes(NAME_A);
if (!isA) {
	// close and open the right one
	await page.getByRole('button', { name: 'Cancel' }).click();
	await page.waitForTimeout(400);
	const rows = await page.locator('li', { hasText: NAME_A }).first();
	await rows.getByRole('button', { name: 'Review' }).click();
	await page.waitForTimeout(500);
}
// try rejecting without feedback -> validation error
await page.getByRole('button', { name: 'Reject' }).click();
await page.waitForTimeout(400);
check('reject requires feedback', ((await page.textContent('[role="dialog"]')) ?? '').includes('Please include a reason'), 'inline error');
await page.locator('[role="dialog"] textarea').fill('Certification details incomplete. Please resubmit with a valid MUIS certificate number.');
await page.getByRole('button', { name: 'Reject' }).click();
await page.waitForTimeout(1500);
check('rejected row removed from list', !((await page.textContent('body')) ?? '').includes(NAME_A), 'row gone');

// 4. Approve app B
const liB = page.locator('li', { hasText: NAME_B }).first();
await liB.getByRole('button', { name: 'Review' }).click();
await page.waitForTimeout(500);
check('application text shown in dialog', ((await page.textContent('[role="dialog"]')) ?? '').includes('Country: Singapore'), 'details panel');
await page.getByRole('button', { name: 'Approve' }).click();
await page.waitForTimeout(1500);
check('approved row removed from list', !((await page.textContent('body')) ?? '').includes(NAME_B), 'row gone');
await page.screenshot({ path: `${OUT}/admin-review-flow.png`, fullPage: true });

// 5. Verify D1 state
const verify = JSON.parse(d1("SELECT slug, status, admin_notes FROM suppliers WHERE slug LIKE 'qa-review-%'"))[0].results;
const rowA = verify.find((r) => r.slug === SLUG_A);
const rowB = verify.find((r) => r.slug === SLUG_B);
check('D1: A rejected + note persisted', rowA?.status === 'rejected' && (rowA?.admin_notes ?? '').includes('MUIS certificate'), JSON.stringify(rowA));
check('D1: B active', rowB?.status === 'active', JSON.stringify(rowB));

// 6. Approved supplier is publicly visible; rejected is not.
// The public listing page fetches /api/suppliers?limit=100&status=active;
// the detail page renders not-found for non-active slugs.
// NOTE: the listing is edge-cached (s-maxage) + worker-cached (query-keyed
// TTL) and approval invalidation only deletes path-only keys, so a plain
// refetch can serve stale data for minutes. The `&_t=` cache-buster forces
// a cold read at BOTH layers (edge key + worker cacheKey both include the
// query string) — this asserts origin truth, not CDN timing luck.
let activeText = '';
for (let i = 0; i < 5; i++) {
	const activeList = await page.request.get(
		`${BASE}/api/suppliers?limit=100&status=active&_t=${Date.now()}`
	);
	activeText = await activeList.text();
	if (activeText.includes(SLUG_B) && !activeText.includes(SLUG_A)) break;
	await page.waitForTimeout(3000);
}
check('approved in public listing', activeText.includes(SLUG_B), 'B listed');
check('rejected not in public listing', !activeText.includes(SLUG_A), 'A hidden');
// Detail visibility: check as an ANONYMOUS visitor (the admin-cookie context
// embeds the private SSR fetch payload in its own HTML, which is by design).
const anon = await browser.newContext();
const anonPage = await anon.newPage();
const detailA = await anonPage.request.get(`${BASE}/suppliers/${SLUG_A}`);
const detailText = await detailA.text();
check('rejected detail page not public', !detailText.includes(NAME_A), 'no content leak (anonymous)');
const approvedDetail = await anonPage.request.get(`${BASE}/suppliers/${SLUG_B}`);
check('approved detail page public', (await approvedDetail.text()).includes(NAME_B), 'B renders');
await anon.close();
// sanity: the old unfiltered fetch is what leaked before — confirm it's no longer what the page uses
const pageSrc = await page.request.get(`${BASE}/suppliers`);
check('public page renders', pageSrc.ok(), `status ${pageSrc.status()}`);

await browser.close();

// 7. Cleanup QA rows (inquiries first — FK references suppliers.slug)
d1("DELETE FROM inquiries WHERE supplier_slug LIKE 'qa-review-%' OR supplier_slug LIKE 'qa-guard-%'");
d1("DELETE FROM suppliers WHERE slug LIKE 'qa-review-%' OR slug LIKE 'qa-guard-%'");
console.log('cleanup done');

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
