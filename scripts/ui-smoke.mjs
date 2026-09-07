// UI smoke: pricing banner + onboarding form journey (desktop + mobile).
// Usage: node scripts/ui-smoke.mjs   (requires playwright browsers installed)
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const BASE = 'https://halalneo.com';
const OUT = 'D:\\Dev Projects\\halalneo\\.scratch\\ui-smoke';
fs.mkdirSync(OUT, { recursive: true });

const results = [];
const check = (name, ok, detail = '') => {
	results.push({ name, ok, detail });
	console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
};

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

// 1. /pricing: banner + per-tier notes + Apply buttons
await page.goto(`${BASE}/pricing`, { waitUntil: 'networkidle' });
const bodyText = (await page.textContent('body')) ?? '';
check('pricing banner', bodyText.includes('Supplier test mode'), 'banner text');
check('pricing per-tier note', bodyText.includes('Free during test mode'), 'per-tier text');
check('pricing no fake trial', !bodyText.includes('14-day free trial'), 'old trial copy gone');
check('pricing Apply CTAs', (await page.getByRole('link', { name: 'Apply' }).count()) >= 3, 'cta count');
check('pricing FAQ rewritten', bodyText.includes('Will I be charged during supplier test mode?'), 'faq q1');
await page.screenshot({ path: `${OUT}/pricing-desktop.png`, fullPage: true });

// 2. /supplier/onboarding: badge + form journey
await page.goto(`${BASE}/supplier/onboarding`, { waitUntil: 'networkidle' });
const obText = (await page.textContent('body')) ?? '';
check('onboarding badge', obText.includes('no payment required'), 'test-mode badge');
await page.getByPlaceholder('e.g. Nusantara Foods Sdn Bhd').fill('QA UI Smoke Co');
await page.getByPlaceholder('Country').fill('Singapore');
// shadcn Select: open trigger, pick Manufacturer
await page.locator('button').filter({ hasText: /Select/ }).first().click();
await page.getByRole('option', { name: 'Manufacturer' }).click();
await page.getByPlaceholder('you@company.com').fill('qa-ui-smoke@example.com');
check('step1 gates continue', await page.getByRole('button', { name: 'Continue' }).isEnabled(), 'continue enabled');
await page.getByRole('button', { name: 'Continue' }).click();
await page.getByPlaceholder('e.g. JAKIM, MUI, MUIS, IFANCA').fill('MUIS');
await page.getByRole('button', { name: 'Continue' }).click();
check('step3 review shown', (await page.textContent('body'))?.includes('Review your application') ?? false, 'review panel');
await page.getByRole('button', { name: 'Submit Application' }).click();
await page.waitForTimeout(4000);
check('submit success', (await page.textContent('body'))?.includes('Application submitted') ?? false, 'success panel');
await page.screenshot({ path: `${OUT}/onboarding-success-desktop.png`, fullPage: true });

// 3. Mobile viewports
const mob = await browser.newPage({ viewport: { width: 390, height: 844 } });
await mob.goto(`${BASE}/pricing`, { waitUntil: 'networkidle' });
await mob.screenshot({ path: `${OUT}/pricing-mobile.png`, fullPage: true });
check('pricing mobile renders', (await mob.textContent('body'))?.includes('Supplier test mode') ?? false, 'banner on mobile');
await mob.goto(`${BASE}/supplier/onboarding`, { waitUntil: 'networkidle' });
await mob.screenshot({ path: `${OUT}/onboarding-mobile.png`, fullPage: true });
check('onboarding mobile renders', (await mob.textContent('body'))?.includes('Become a HalalNeo supplier') ?? false, 'h1 on mobile');

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
