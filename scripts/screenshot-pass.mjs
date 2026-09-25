// Signed-in screenshot pass for ConfirmDialog/Toaster/Skeleton verification.
// Light + dark @1440 for admin pages; ConfirmDialog open interaction; 375/768 responsive set.
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const BASE = process.env.SMOKE_BASE || 'http://127.0.0.1:4174';
const OUT = 'D:\\Dev Projects\\halalneo\\screenshots';
fs.mkdirSync(OUT, { recursive: true });
const pw = fs
	.readFileSync(process.env.USERPROFILE + '/.halalneo-admin/admin-pw.txt', 'utf8')
	.trim();

const ADMIN_PAGES = [
	['admin/users', 'admin-users'],
	['admin/stories', 'admin-stories'],
	['admin/knowledge', 'admin-knowledge'],
	['admin/ai-tools', 'admin-ai-tools'],
	['admin/suppliers', 'admin-suppliers'],
	['admin/blog', 'admin-blog'],
	['admin/market-guides', 'admin-market-guides']
];

const browser = await chromium.launch({ headless: true });

// Local D1 may not have the staff account — ensure it exists (idempotent).
{
	const ctx = await browser.newContext();
	const page = await ctx.newPage();
	const r = await page.request.post(`${BASE}/api/auth/sign-up/email`, {
		data: { name: 'Local Admin', email: 'support@halalneo.com', password: pw }
	});
	console.log(`local signup: ${r.status()} ${r.ok() ? 'created' : '(exists or rejected — fine)'}`);
	await ctx.close();
}

async function signIn(page) {
	await page.goto(`${BASE}/admin/login`, { waitUntil: 'networkidle' });
	await page.getByPlaceholder('admin@halalneo.com').fill('support@halalneo.com');
	await page.getByPlaceholder('••••••••').fill(pw);
	await page.getByRole('button', { name: 'Sign in' }).click();
	await page.waitForURL('**/admin', { timeout: 20000 });
	await page.waitForTimeout(1200);
}

for (const theme of ['light', 'dark']) {
	const ctx = await browser.newContext({
		viewport: { width: 1440, height: 900 },
		colorScheme: theme
	});
	const page = await ctx.newPage();
	await signIn(page);

	for (const [route, name] of ADMIN_PAGES) {
		await page.goto(`${BASE}/${route}`, { waitUntil: 'networkidle' });
		await page.waitForTimeout(700);
		await page.screenshot({ path: `${OUT}/${theme}-${name}-1440.png`, fullPage: true });
	}
	console.log(`${theme} admin pages done`);

	// Interaction assertion: ConfirmDialog opens on Delete click (suppliers page has seed rows)
	await page.goto(`${BASE}/admin/suppliers`, { waitUntil: 'networkidle' });
	await page.waitForTimeout(700);
	const delBtn = page.locator('button[aria-label="Delete"]').first();
	if (await delBtn.count()) {
		await delBtn.click();
		await page.waitForTimeout(600);
		const dialogVisible = await page
			.getByRole('alertdialog')
			.isVisible()
			.catch(() => false);
		console.log(`${theme} ConfirmDialog visible: ${dialogVisible}`);
		await page.screenshot({ path: `${OUT}/${theme}-admin-suppliers-confirmdialog-1440.png` });
		// Cancel to leave state clean
		await page
			.getByRole('button', { name: 'Cancel' })
			.click()
			.catch(() => {});
	} else {
		console.log(`${theme} no Delete button found on suppliers`);
	}
	await ctx.close();
}

// Supplier dashboard (own portal session path may differ; capture what renders)
for (const theme of ['light', 'dark']) {
	const ctx = await browser.newContext({
		viewport: { width: 1440, height: 900 },
		colorScheme: theme
	});
	const page = await ctx.newPage();
	await page
		.goto(`${BASE}/supplier/dashboard`, { waitUntil: 'domcontentloaded', timeout: 60000 })
		.catch(() => {});
	await page.waitForTimeout(4000);
	await page.screenshot({ path: `${OUT}/${theme}-supplier-dashboard-1440.png`, fullPage: true });
	console.log(`${theme} supplier dashboard url: ${page.url()}`);
	await ctx.close();
}

// Responsive set (light): home + admin/users + supplier dashboard at 375 and 768
for (const [w, h, tag] of [
	[375, 667, '375'],
	[768, 1024, '768']
]) {
	const ctx = await browser.newContext({ viewport: { width: w, height: h }, colorScheme: 'light' });
	const page = await ctx.newPage();
	await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {});
	await page.waitForTimeout(3000);
	await page.screenshot({ path: `${OUT}/light-home-${tag}.png`, fullPage: true });
	await signIn(page);
	await page
		.goto(`${BASE}/admin/users`, { waitUntil: 'domcontentloaded', timeout: 60000 })
		.catch(() => {});
	await page.waitForTimeout(2000);
	await page.screenshot({ path: `${OUT}/light-admin-users-${tag}.png`, fullPage: true });
	await page
		.goto(`${BASE}/supplier/dashboard`, { waitUntil: 'domcontentloaded', timeout: 60000 })
		.catch(() => {});
	await page.waitForTimeout(3000);
	await page.screenshot({ path: `${OUT}/light-supplier-dashboard-${tag}.png`, fullPage: true });
	await ctx.close();
	console.log(`responsive ${tag} done`);
}

await browser.close();
console.log('ALL SCREENSHOTS DONE');
