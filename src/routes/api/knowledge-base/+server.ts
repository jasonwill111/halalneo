import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDbFromPlatform } from '#lib/server/db/api-helpers.js';
import { knowledgeBase } from '#lib/server/db/schema.js';
import { cachedQuery, cacheMedium, invalidateCache } from '#lib/server/cache.js';
import { getKbListItems } from '#lib/server/queries/index.js';
import { getSession } from '#lib/server/auth.js';

export const GET: RequestHandler = async ({ platform, url }) => {
	const db = getDbFromPlatform(platform);
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
					status: url.searchParams.get('status') || undefined
				});
			},
			{ ...cacheMedium() }
		);

		return json(data);
	} catch (e: any) {
		return json({ error: e?.message ?? 'Failed' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request, platform }) => {
	const session = await getSession({ platform, request, locals: {} } as any);
	if (!session) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const db = getDbFromPlatform(platform);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	const body = (((await request.json()) as any).catch(() => null)) as Record<string, unknown> | null;
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
