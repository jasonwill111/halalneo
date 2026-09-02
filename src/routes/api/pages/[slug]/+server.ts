import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDbFromPlatform } from '#lib/server/db/api-helpers.js';
import { pages } from '#lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import { cachedQuery, cacheLong } from '#lib/server/cache.js';

export const GET: RequestHandler = async ({ params, url, platform }) => {
	const db = getDbFromPlatform(platform);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	try {
		const row = await cachedQuery(
			url.toString(),
			async () => {
				const [row] = await db.select().from(pages).where(eq(pages.slug, params.slug)).limit(1);
				return row ?? null;
			},
			{ ...cacheLong() }
		);

		if (!row) return json({ error: 'Page not found' }, { status: 404 });
		return json(row);
	} catch (e: any) {
		return json({ error: e?.message ?? 'Failed' }, { status: 500 });
	}
};
