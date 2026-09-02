import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDbFromPlatform } from '#lib/server/db/api-helpers.js';
import { pages } from '#lib/server/db/schema.js';
import { eq, and } from 'drizzle-orm';
import { cachedQuery, cacheLong, invalidateCache } from '#lib/server/cache.js';
import { getSession } from '#lib/server/auth.js';

const blogFilter = eq(pages.type, 'blog' as const);

const ALLOWED_BLOG_FIELDS = new Set([
	'title', 'excerpt', 'body', 'author', 'category', 'featuredImage',
	'tags', 'metaTitle', 'metaDescription', 'keywords', 'status', 'publishedAt'
]);

export const GET: RequestHandler = async ({ params, url, platform }) => {
	const db = getDbFromPlatform(platform);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	try {
		const row = await cachedQuery(
			url.toString(),
			async () => {
				const [row] = await db
					.select()
					.from(pages)
					.where(and(blogFilter, eq(pages.slug, params.slug)))
					.limit(1);
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

	const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
	if (!body) return json({ error: 'Invalid body' }, { status: 400 });

	const { slug: _slug, ...rawUpdates } = body;
	const updates: Record<string, unknown> = {};
	for (const [k, v] of Object.entries(rawUpdates)) {
		if (ALLOWED_BLOG_FIELDS.has(k)) updates[k] = v;
	}
	updates.updatedAt = new Date();

	try {
		const [row] = await db
			.update(pages)
			.set(updates as any)
			.where(and(blogFilter, eq(pages.slug, params.slug)))
			.returning();
		if (!row) return json({ error: 'Not found' }, { status: 404 });
		await invalidateCache('/api/blog', `/api/blog/${params.slug}`);
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
			.delete(pages)
			.where(and(blogFilter, eq(pages.slug, params.slug)))
			.returning();
		if (!row) return json({ error: 'Not found' }, { status: 404 });
		await invalidateCache('/api/blog', `/api/blog/${params.slug}`);
		return json({ deleted: true });
	} catch (e: any) {
		return json({ error: e?.message ?? 'Delete failed' }, { status: 500 });
	}
};
