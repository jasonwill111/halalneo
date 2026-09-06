import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';

// Real-user Core Web Vitals ingestion for Cloudflare Analytics Engine.
// Client sends [{ metric: 'LCP'|'CLS'|'INP', value, page }]; we validate
// ranges and write one datapoint per metric. Query in the dashboard with:
// SELECT blob2 AS metric, quantiles(0.75, 0.95)(double1) FROM halalneo_web_vitals
// WHERE blob1 = '/some-page' GROUP BY metric
const METRICS = new Set(['LCP', 'CLS', 'INP']);

export const POST: RequestHandler = async ({ request, platform }) => {
	let payload: unknown;
	try {
		payload = await request.json();
	} catch {
		return json({ error: 'Invalid JSON' }, { status: 400 });
	}
	const items = Array.isArray(payload) ? payload : [payload];
	const ae = (platform?.env as unknown as { WEBSITE_ANALYTICS?: AnalyticsEngineDataset })
		?.WEBSITE_ANALYTICS;
	if (!ae) return json({ error: 'Analytics unavailable' }, { status: 503 });

	let written = 0;
	for (const raw of items) {
		const it = raw as { metric?: unknown; value?: unknown; page?: unknown };
		const metric = typeof it?.metric === 'string' ? it.metric : '';
		const value = Number(it?.value);
		const page =
			typeof it?.page === 'string' && it.page.startsWith('/')
				? it.page.slice(0, 200)
				: '/';
		if (!METRICS.has(metric) || !Number.isFinite(value) || value < 0) continue;
		// Sanity caps: LCP/INP in ms (1h absurd), CLS unitless (100 absurd)
		if ((metric === 'CLS' && value > 100) || (metric !== 'CLS' && value > 3600000)) continue;
		try {
			ae.writeDataPoint({ blobs: [page, metric], doubles: [value], indexes: [page] });
			written++;
		} catch {
			// Analytics failure must never break the page — drop silently
		}
	}
	return json({ ok: true, written });
};
