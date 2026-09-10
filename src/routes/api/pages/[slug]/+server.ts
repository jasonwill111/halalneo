import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '#lib/server/db/index.js';
import { getBindings } from '#lib/server/bindings.js';
import { pages } from '#lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import { cachedQuery, cacheLong } from '#lib/server/cache.js';
import { getSession } from '#lib/server/auth.js';

export const GET: RequestHandler = async (event) => {
	const { params, url } = event;
	const db = getDb(getBindings().DB);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	try {
		// Visibility guard: only published pages are public. Non-published rows
		// (draft/archived) resolve for authenticated sessions only, and are
		// never edge-cached.
		const [row] = await db.select().from(pages).where(eq(pages.slug, params.slug)).limit(1);

		if (!row) return json({ error: 'Page not found' }, { status: 404 });

		if (row.status !== 'published') {
			const session = await getSession(event);
			if (!session) return json({ error: 'Page not found' }, { status: 404 });
			return json(row, { headers: { 'Cache-Control': 'private, no-store' } });
		}

		const cached = await cachedQuery(
			url.toString(),
			async () => row ?? null,
			{ ...cacheLong() }
		);

		if (!cached) return json({ error: 'Page not found' }, { status: 404 });
		return json(cached);
	} catch (e: any) {
		return json({ error: e?.message ?? 'Failed' }, { status: 500 });
	}
};
