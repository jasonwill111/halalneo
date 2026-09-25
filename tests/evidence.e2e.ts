import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test } from '@playwright/test';

const viewports = [
	{ name: 'mobile', width: 390, height: 844 },
	{ name: 'tablet', width: 768, height: 1024 },
	{ name: 'desktop', width: 1024, height: 768 },
	{ name: 'wide', width: 1440, height: 900 }
] as const;

const publicRoutes = [
	{ name: 'home', path: '/' },
	{ name: 'products', path: '/products' },
	{ name: 'suppliers', path: '/suppliers' },
	{ name: 'market-guides', path: '/market-guides' },
	{ name: 'knowledge-base', path: '/knowledge-base' },
	{ name: 'tools', path: '/tools' },
	{ name: 'contact', path: '/contact' },
	{ name: 'login', path: '/login' },
	{ name: 'buyer-register', path: '/register' },
	{ name: 'supplier-register', path: '/supplier/register' },
	{ name: 'supplier-login', path: '/supplier/login' },
	{ name: 'admin-login', path: '/admin/login' }
] as const;

async function assertPageEvidence(
	page: import('@playwright/test').Page,
	route: string
): Promise<void> {
	const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
	expect(response?.status() ?? 0, `${route} should return a non-5xx response`).toBeLessThan(500);
	expect(await page.locator('body').count(), `${route} should render a body`).toBe(1);
	expect(
		await page.locator('main').count(),
		`${route} should expose a main landmark`
	).toBeGreaterThan(0);
	const hasHorizontalOverflow = await page.evaluate(
		() => document.documentElement.scrollWidth > window.innerWidth + 1
	);
	expect(hasHorizontalOverflow, `${route} should not overflow horizontally`).toBe(false);
}

test.describe('browser evidence matrix', () => {
	test.setTimeout(180_000);
	for (const viewport of viewports) {
		test(`${viewport.name} public surfaces`, async ({ page }, testInfo) => {
			await page.setViewportSize({ width: viewport.width, height: viewport.height });
			const evidenceDir = testInfo.outputPath('public-evidence');
			await mkdir(evidenceDir, { recursive: true });

			for (const direction of ['ltr', 'rtl'] as const) {
				for (const theme of ['light', 'dark'] as const) {
					await page.goto('/', { waitUntil: 'domcontentloaded' });
					const themeButton = page.getByRole('button', { name: 'Toggle theme' }).first();
					if (theme === 'dark' && (await themeButton.count()) > 0) {
						await themeButton.click();
					}
					if (theme === 'light' && (await themeButton.count()) > 0) {
						const isDark = await page.evaluate(() =>
							document.documentElement.classList.contains('dark')
						);
						if (isDark) await themeButton.click();
					}
					await page.evaluate((dir) => {
						document.documentElement.dir = dir;
					}, direction);

					for (const route of publicRoutes) {
						await assertPageEvidence(page, route.path);
						await page.screenshot({
							path: path.join(evidenceDir, `${direction}-${theme}-${route.name}.png`),
							fullPage: true,
							animations: 'disabled',
							timeout: 30_000
						});
					}
				}
			}

			await page.emulateMedia({ reducedMotion: 'reduce' });
			await assertPageEvidence(page, '/');
			await page.screenshot({
				path: path.join(evidenceDir, 'reduced-motion-home.png'),
				fullPage: true,
				animations: 'disabled',
				timeout: 30_000
			});
		});
	}
});
