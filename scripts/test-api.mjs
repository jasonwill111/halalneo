// Full API-flow test against the local wrangler dev server (port 4174).
// Covers: read APIs (list + detail + FTS search + verify), cache headers,
// static endpoints (robots/sitemap/rss/llms/sw/offline), and auth-gated
// write APIs (expect 401 without session). Prints a PASS/FAIL table.

const BASE = 'http://127.0.0.1:4174';
const results = [];

async function check(name, fn) {
	const t0 = Date.now();
	try {
		const out = await fn();
		results.push({ name, ok: true, ms: Date.now() - t0, out });
	} catch (e) {
		results.push({ name, ok: false, ms: Date.now() - t0, out: String(e?.message ?? e) });
	}
}

async function getJSON(path, opts = {}) {
	const res = await fetch(BASE + path, opts);
	const text = await res.text();
	let body;
	try { body = JSON.parse(text); } catch { body = text; }
	if (opts.expectStatus && res.status !== opts.expectStatus) {
		throw new Error(`expected ${opts.expectStatus}, got ${res.status}: ${String(body).slice(0, 200)}`);
	}
	return { status: res.status, body, headers: res.headers };
}

const main = async () => {
	// ── Read-only list APIs ────────────────────────────────────────────
	await check('GET /api/products', async () => {
		const { status, body } = await getJSON('/api/products?limit=5');
		if (status !== 200) throw new Error(`status ${status}`);
		if (!Array.isArray(body.items) || body.total === undefined) throw new Error('missing items/total');
		return { total: body.total, shown: body.items.length };
	});

	await check('GET /api/products (FTS search)', async () => {
		const { status, body } = await getJSON('/api/products?search=halal&limit=5');
		if (status !== 200) throw new Error(`status ${status}`);
		return { matched: body.items?.length };
	});

	await check('GET /api/products/:slug', async () => {
		const list = (await getJSON('/api/products?limit=1')).body;
		const slug = list.items?.[0]?.slug;
		if (!slug) return { skipped: 'no products seeded' };
		const { status, body } = await getJSON(`/api/products/${slug}`);
		if (status !== 200) throw new Error(`status ${status}`);
		if (body.slug !== slug) throw new Error('slug mismatch');
		return { slug };
	});

	await check('GET /api/suppliers', async () => {
		const { status, body } = await getJSON('/api/suppliers?limit=5');
		if (status !== 200) throw new Error(`status ${status}`);
		return { total: body.total };
	});

	await check('GET /api/suppliers/:slug', async () => {
		const list = (await getJSON('/api/suppliers?limit=1')).body;
		const slug = list.items?.[0]?.slug;
		if (!slug) return { skipped: 'no suppliers seeded' };
		const { status } = await getJSON(`/api/suppliers/${slug}`);
		if (status !== 200) throw new Error(`status ${status}`);
		return { slug };
	});

	await check('GET /api/categories', async () => {
		const { status, body } = await getJSON('/api/categories');
		if (status !== 200) throw new Error(`status ${status}`);
		return { count: body.items?.length };
	});

	await check('GET /api/blog (FTS title search)', async () => {
		const { status, body } = await getJSON('/api/blog?limit=3');
		if (status !== 200) throw new Error(`status ${status}`);
		return { total: body.total, shown: body.items?.length };
	});

	await check('GET /api/knowledge-base', async () => {
		const { status, body } = await getJSON('/api/knowledge-base?limit=5');
		if (status !== 200) throw new Error(`status ${status}`);
		return { total: body.total };
	});

	await check('GET /api/knowledge-base/:slug', async () => {
		const list = (await getJSON('/api/knowledge-base?limit=1&status=published')).body;
		const slug = list.items?.[0]?.slug;
		if (!slug) return { skipped: 'no KB articles' };
		const { status } = await getJSON(`/api/knowledge-base/${slug}`);
		if (status !== 200) throw new Error(`status ${status}`);
		return { slug };
	});

	await check('GET /api/certifying-bodies', async () => {
		const { status, body } = await getJSON('/api/certifying-bodies');
		if (status !== 200) throw new Error(`status ${status}`);
		return { total: body.total };
	});

	await check('GET /api/service-providers', async () => {
		const { status, body } = await getJSON('/api/service-providers');
		if (status !== 200) throw new Error(`status ${status}`);
		return { total: body.total };
	});

	await check('GET /api/market-guides', async () => {
		const { status, body } = await getJSON('/api/market-guides');
		if (status !== 200) throw new Error(`status ${status}`);
		return { total: body.total };
	});

	await check('GET /api/trade-shows', async () => {
		const { status, body } = await getJSON('/api/trade-shows');
		if (status !== 200) throw new Error(`status ${status}`);
		return { total: body.total };
	});

	await check('GET /api/search?q=halal (federated)', async () => {
		const { status, body } = await getJSON('/api/search?q=halal');
		if (status !== 200) throw new Error(`status ${status}`);
		for (const k of ['products', 'suppliers', 'articles', 'terms']) {
			if (!Array.isArray(body[k])) throw new Error(`missing ${k}`);
		}
		return {
			products: body.products.length,
			suppliers: body.suppliers.length,
			articles: body.articles.length,
			terms: body.terms.length
		};
	});

	await check('GET /api/verify?q=halal', async () => {
		const { status, body } = await getJSON('/api/verify?q=halal');
		if (status !== 200) throw new Error(`status ${status}`);
		if (!Array.isArray(body.results)) throw new Error('missing results');
		return { results: body.results.length };
	});

	await check('GET /api/verify?q=x (short, no FTS tokens → empty)', async () => {
		const { status, body } = await getJSON('/api/verify?q=x');
		if (status !== 200) throw new Error(`status ${status}`);
		return { results: body.results.length };
	});

	await check('GET /api/settings', async () => {
		const { status } = await getJSON('/api/settings');
		if (status !== 200) throw new Error(`status ${status}`);
	});

	await check('GET /api/rfqs', async () => {
		const { status } = await getJSON('/api/rfqs');
		if (status !== 200) throw new Error(`status ${status}`);
	});

	await check('GET /api/promotions', async () => {
		const { status } = await getJSON('/api/promotions');
		if (status !== 200) throw new Error(`status ${status}`);
	});

	await check('GET /api/success-stories', async () => {
		const { status } = await getJSON('/api/success-stories');
		if (status !== 200) throw new Error(`status ${status}`);
	});

	// ── Cache headers on public APIs ───────────────────────────────────
	await check('Cache-Control on /api/products (s-maxage=300)', async () => {
		const { headers } = await getJSON('/api/products?limit=1');
		const cc = headers.get('cache-control') ?? '';
		if (!cc.includes('s-maxage=300')) throw new Error(`cc="${cc}"`);
		return cc;
	});

	// ── Auth-gated writes (expect 401 without session) ─────────────────
	for (const p of ['/api/products', '/api/suppliers', '/api/knowledge-base', '/api/blog']) {
		await check(`POST ${p} → 401`, async () => {
			const { status } = await getJSON(p, {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({}),
				expectStatus: 401
			});
			return status;
		});
	}

	// ── Static / SEO endpoints ─────────────────────────────────────────
	await check('GET /robots.txt', async () => {
		const res = await fetch(BASE + '/robots.txt');
		const t = await res.text();
		if (res.status !== 200 || !t.includes('Sitemap:')) throw new Error('no sitemap line');
		return t.split('\n').length + ' lines';
	});

	await check('GET /sitemap.xml', async () => {
		const res = await fetch(BASE + '/sitemap.xml');
		const t = await res.text();
		if (res.status !== 200) throw new Error(`status ${res.status}`);
		const urls = (t.match(/<url>/g) || []).length;
		if (urls < 10) throw new Error(`only ${urls} urls`);
		return urls + ' urls';
	});

	await check('GET /rss.xml', async () => {
		const res = await fetch(BASE + '/rss.xml');
		if (res.status !== 200) throw new Error(`status ${res.status}`);
		const t = await res.text();
		if (!t.includes('<rss')) throw new Error('not rss');
	});

	await check('GET /llms.txt (GEO)', async () => {
		const res = await fetch(BASE + '/llms.txt');
		if (res.status !== 200) throw new Error(`status ${res.status}`);
	});

	await check('GET /sw.js (Service Worker)', async () => {
		const res = await fetch(BASE + '/sw.js');
		if (res.status !== 200) throw new Error(`status ${res.status}`);
		const t = await res.text();
		if (!t.includes('halalneo-v2')) throw new Error('old SW?');
	});

	await check('GET /offline.html (offline fallback)', async () => {
		const res = await fetch(BASE + '/offline');
		if (res.status === 404) {
			const res2 = await fetch(BASE + '/offline.html');
			if (res2.status !== 200) throw new Error('/offline and /offline.html both 404');
		}
	});

	await check('GET /manifest.json', async () => {
		const res = await fetch(BASE + '/manifest.json');
		if (res.status !== 200) throw new Error(`status ${res.status}`);
	});

	await check('GET /api/media/:key → 404 for missing key', async () => {
		const res = await fetch(BASE + '/api/media/nonexistent-key-xyz');
		if (res.status !== 404) throw new Error(`expected 404, got ${res.status}`);
	});

	// ── Page HTML smoke (SSR renders, no 500, has h1) ─────────────────
	const PAGES = [
		'/',
		'/products',
		'/suppliers',
		'/categories',
		'/knowledge-base',
		'/blog',
		'/certifying-bodies',
		'/service-providers',
		'/market-guides',
		'/trade-shows',
		'/glossary',
		'/faq',
		'/about',
		'/contact',
		'/pricing',
		'/search',
		'/verify',
		'/tools',
		'/login',
		'/register',
		'/rfqs',
		'/promotions',
		'/success-stories'
	];
	for (const p of PAGES) {
		await check(`HTML ${p}`, async () => {
			const res = await fetch(BASE + p);
			if (res.status !== 200) throw new Error(`status ${res.status}`);
			const html = await res.text();
			if (!html.includes('<h1')) throw new Error('no h1 in HTML');
			if (html.includes('Invalid locale')) throw new Error('locale error leaked into HTML');
			return html.length + ' bytes';
		});
	}

	// ── Report ─────────────────────────────────────────────────────────
	const pass = results.filter(r => r.ok);
	const fail = results.filter(r => !r.ok);
	console.log('\n' + '='.repeat(70));
	console.log(`API + page smoke test: ${pass.length} passed, ${fail.length} failed`);
	console.log('='.repeat(70));
	for (const r of results) {
		const tag = r.ok ? '✅' : '❌';
		const extra = r.out ? ` — ${typeof r.out === 'string' ? r.out : JSON.stringify(r.out)}` : '';
		console.log(`${tag} [${String(r.ms).padStart(4)}ms] ${r.name}${extra}`);
	}
	process.exit(fail.length ? 1 : 0);
};

main().catch((e) => {
	console.error('test runner crashed:', e);
	process.exit(2);
});
