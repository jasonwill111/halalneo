import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '#lib/server/db/index.js';
import { getBindings } from '#lib/server/bindings.js';
import { knowledgeBase } from '#lib/server/db/schema.js';
import { cachedQuery, cacheMedium, invalidateCache, queryCacheKey } from '#lib/server/cache.js';
import { getKbListItems } from '#lib/server/queries/index.js';
import { getSession } from '#lib/server/auth.js';

export const GET: RequestHandler = async ({ url }) => {
	const db = getDb(getBindings().DB);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	try {
		// List view: project only 5 cols (slug/title/section/status/excerpt).
		// Drops body (HTML) and tags (JSON) from D1 rows-read + cache payload.
		const data = await cachedQuery(
			url.toString(),
			async () => {
				const limit = Math.min(Number(url.searchParams.get('limit')) || 20, 100);
				const offset = Number(url.searchParams.get('offset')) || 0;
				return getKbListItems(db, {
					limit,
					offset,
					search: url.searchParams.get('search') || undefined,
					section: (url.searchParams.get('section') as any) || undefined,
					status: url.searchParams.get('status') || 'published'
				});
			},
			{ ...cacheMedium(), cacheKey: queryCacheKey(url) }
		);

		return json(data);
	} catch (e: any) {
		return json({ error: e?.message ?? 'Failed' }, { status: 500 });
	}
};

export const POST: RequestHandler = async (event) => {
	const { request } = event;
	const session = await getSession(event);
	if (!session) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const db = getDb(getBindings().DB);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
	if (!body?.slug || !body?.title || !body?.section) {
		return json({ error: 'slug, title, section are required' }, { status: 400 });
	}

	try {
		const [row] = await db.insert(knowledgeBase).values(body as any).returning();
		await invalidateCache('/api/knowledge-base');
		return json(row, { status: 201 });
	} catch (e: any) {
		if (e?.message?.includes('UNIQUE constraint')) {
			return json({ error: 'Article with this slug already exists' }, { status: 409 });
		}
		return json({ error: e?.message ?? 'Internal error' }, { status: 500 });
	}
};
