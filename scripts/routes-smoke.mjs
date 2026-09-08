// Route-scheme verification: plural listings, singular details, 301 redirects.
import { chromium } from '@playwright/test';

const BASE = 'https://halalneo.com';
const results = [];
const check = (name, ok, detail = '') => {
	results.push({ name, ok });
	console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
};

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

// 1. singular detail URLs resolve
const r1 = await page.request.get(`${BASE}/product/halal-chicken-spread-500g`).catch(() => null);
// slug may not exist; instead discover one from the listing API
const list = await page.request.get(`${BASE}/api/products?limit=1`);
const prodSlug = ((await list.json()).items?.[0]?.slug) ?? 'halal-chicken-spread-500g';
const pd = await page.request.get(`${BASE}/product/${prodSlug}`);
check('singular /product/[slug] 200', pd.status() === 200, `status ${pd.status()}`);
const pdText = await pd.text();
check('product detail renders', pdText.includes('HalalNeo') && (pdText.includes('Halal Certified') || pdText.includes('product')), 'content');

const slist = await page.request.get(`${BASE}/api/suppliers?limit=1&status=active`);
const supSlug = ((await slist.json()).items?.[0]?.slug) ?? 'al-barakah-heritage';
const sd = await page.request.get(`${BASE}/supplier/${supSlug}`);
check('singular /supplier/[slug] 200', sd.status() === 200, `status ${sd.status()}`);

const clist = await page.request.get(`${BASE}/api/categories`);
const catSlug = ((await clist.json()).items?.[0]?.slug) ?? 'food-beverages';
const cd = await page.request.get(`${BASE}/category/${catSlug}`);
check('singular /category/[slug] 200', cd.status() === 200, `status ${cd.status()}`);

// 2. old plural detail URLs 301 to singular
const r1s = await page.request.get(`${BASE}/suppliers/${supSlug}`, { maxRedirects: 0 });
check('old /suppliers/x 301', r1s.status() === 301 && (r1s.headers().location ?? '').includes(`/supplier/`), r1s.headers().location ?? '');
const r2s = await page.request.get(`${BASE}/products/${prodSlug}`, { maxRedirects: 0 });
check('old /products/x 301', r2s.status() === 301 && (r2s.headers().location ?? '').includes(`/product/`), r2s.headers().location ?? '');
const r3s = await page.request.get(`${BASE}/categories/${catSlug}`, { maxRedirects: 0 });
check('old /categories/x 301', r3s.status() === 301 && (r3s.headers().location ?? '').includes(`/category/`), r3s.headers().location ?? '');

// 3. listings stay plural + portal routes intact
for (const p of ['/suppliers', '/products', '/categories', '/supplier/onboarding', '/supplier/login']) {
	const res = await page.request.get(`${BASE}${p}`);
	check(`listing/portal ${p} 200`, res.status() === 200, `status ${res.status()}`);
}

// 4. portal route wins over dynamic slug (onboarding not shadowed)
const ob = await page.request.get(`${BASE}/supplier/onboarding`);
const obText = await ob.text();
check('portal not shadowed by [slug]', obText.includes('Become a HalalNeo supplier'), 'onboarding form');

// 5. sitemap uses singular URLs
const sm = await (await page.request.get(`${BASE}/sitemap.xml`)).text();
check('sitemap singular product urls', sm.includes('/product/'), 'yes');
check('sitemap singular supplier urls', sm.includes('/supplier/'), 'yes');
check('sitemap no old plural detail', !sm.includes('/products/') && !sm.includes('/suppliers/') && !sm.includes('/categories/'), 'clean');

// 6. internal navigation click-through works
await page.goto(`${BASE}/suppliers`, { waitUntil: 'networkidle' });
await page.locator('a[href^="/supplier/"]').first().click();
await page.waitForURL('**/supplier/**', { timeout: 15000 });
check('listing links to singular detail', !page.url().includes('/suppliers/'), page.url());

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
