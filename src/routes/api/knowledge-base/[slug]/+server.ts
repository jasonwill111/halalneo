import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDbFromPlatform } from '#lib/server/db/api-helpers.js';
import { knowledgeBase } from '#lib/server/db/schema.js';
import { eq, sql } from 'drizzle-orm';
import { cachedQuery, cacheLong, invalidateCache } from '#lib/server/cache.js';
import { getSession } from '#lib/server/auth.js';

const ALLOWED_KB_FIELDS = new Set([
	'section', 'title', 'summary', 'body', 'tags', 'author',
	'status', 'metaTitle', 'metaDescription', 'keywords'
]);

export const GET: RequestHandler = async ({ params, url, platform }) => {
	const db = getDbFromPlatform(platform);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	try {
		if (params.slug === 'sections') {
			const sections = await cachedQuery(
				url.toString(),
				async () => {
					const rows = await db
						.select({
							section: knowledgeBase.section,
							count: sql<number>`count(*)`
						})
						.from(knowledgeBase)
						.where(eq(knowledgeBase.status, 'published'))
						.groupBy(knowledgeBase.section);
					return { items: rows, total: rows.length };
				},
				{ ...cacheLong() }
			);
			return json(sections);
		}

		const row = await cachedQuery(
			url.toString(),
			async () => {
				const [row] = await db.select().from(knowledgeBase).where(eq(knowledgeBase.slug, params.slug)).limit(1);
				return row ?? null;
			},
			{ ...cacheLong() }
		);

		if (!row) return json({ error: 'Not found' }, { status: 404 });
		return json(row);
	} catch (e: any) {
		return json({ error: e?.message ?? 'Failed' }, { status: 500 });
	}
};

export const PUT: RequestHandler = async ({ params, request, platform }) => {
	const session = await getSession({ platform, request, locals: {} } as any);
	if (!session) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const db = getDbFromPlatform(platform);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	const body = (((await request.json()) as any).catch(() => null)) as Record<string, unknown> | null;
	if (!body) return json({ error: 'Invalid body' }, { status: 400 });

	const { slug: _slug, ...rawUpdates } = body;
	const updates: Record<string, unknown> = {};
	for (const [k, v] of Object.entries(rawUpdates)) {
		if (ALLOWED_KB_FIELDS.has(k)) updates[k] = v;
	}
	updates.updatedAt = new Date();

	try {
		const [row] = await db
			.update(knowledgeBase)
			.set(updates as any)
			.where(eq(knowledgeBase.slug, params.slug))
			.returning();
		if (!row) return json({ error: 'Not found' }, { status: 404 });
		await invalidateCache('/api/knowledge-base', `/api/knowledge-base/${params.slug}`);
		return json(row);
	} catch (e: any) {
		return json({ error: e?.message ?? 'Update failed' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ params, request, platform }) => {
	const session = await getSession({ platform, request, locals: {} } as any);
	if (!session) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const db = getDbFromPlatform(platform);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	try {
		const [row] = await db
			.delete(knowledgeBase)
			.where(eq(knowledgeBase.slug, params.slug))
			.returning();
		if (!row) return json({ error: 'Not found' }, { status: 404 });
		await invalidateCache('/api/knowledge-base', `/api/knowledge-base/${params.slug}`);
		return json({ deleted: true });
	} catch (e: any) {
		return json({ error: e?.message ?? 'Delete failed' }, { status: 500 });
	}
};
