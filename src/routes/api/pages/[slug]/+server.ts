import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '#lib/server/db/index.js';
import { getBindings } from '#lib/server/bindings.js';
import { pages } from '#lib/server/db/schema.js';
import { pageColumns } from '#lib/server/db/projections.js';
import { eq } from 'drizzle-orm';
import { cachedQuery, cacheLong, invalidateCache } from '#lib/server/cache.js';
import { getSession } from '#lib/server/auth.js';
import { requireAdmin } from '#lib/server/auth-guard.js';
import { pageUpdateSchema, toJsonList } from '#lib/schemas/pages.js';

export const GET: RequestHandler = async (event) => {
	const { params, url } = event;
	const db = getDb(getBindings().DB);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	try {
		// Visibility guard: only published pages are public. Non-published rows
		// (draft/archived) resolve for authenticated sessions only, and are
		// never edge-cached.
		const [row] = await db
			.select(pageColumns)
			.from(pages)
			.where(eq(pages.slug, params.slug))
			.limit(1);

		if (!row) return json({ error: 'Page not found' }, { status: 404 });

		if (row.status !== 'published') {
			const session = await getSession(event);
			if (!session) return json({ error: 'Page not found' }, { status: 404 });
			return json(row, { headers: { 'Cache-Control': 'private, no-store' } });
		}

		const cached = await cachedQuery(url.toString(), async () => row ?? null, { ...cacheLong() });

		if (!cached) return json({ error: 'Page not found' }, { status: 404 });
		return json(cached);
	} catch (error: unknown) {
		return json(
			{ error: error instanceof Error ? error.message : 'Failed' },
			{ status: 500 }
		);
	}
};

export const PUT: RequestHandler = async (event) => {
	const denied = await requireAdmin(event);
	if (denied) return denied;

	const db = getDb(getBindings().DB);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	const { params } = event;
	const body = (await event.request.json().catch(() => null)) as unknown;
	if (!body) return json({ error: 'Request body is required' }, { status: 400 });

	const parsed = pageUpdateSchema.safeParse(body);
	if (!parsed.success) {
		return json(
			{ error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
			{ status: 400 }
		);
	}

	const data = parsed.data;
	const now = new Date();
	const set: Partial<typeof pages.$inferInsert> = { updatedAt: now };
	if (data.title !== undefined) set.title = data.title;
	if (data.type !== undefined) set.type = data.type;
	if (data.excerpt !== undefined) set.excerpt = data.excerpt || null;
	if (data.body !== undefined) set.body = data.body || null;
	if (data.author !== undefined) set.author = data.author || null;
	if (data.category !== undefined) set.category = data.category || null;
	if (data.featuredImage !== undefined) set.featuredImage = data.featuredImage || null;
	if (data.tags !== undefined) set.tags = toJsonList(data.tags);
	if (data.metaTitle !== undefined) set.metaTitle = data.metaTitle || null;
	if (data.metaDescription !== undefined) set.metaDescription = data.metaDescription || null;
	if (data.keywords !== undefined) set.keywords = toJsonList(data.keywords);
	if (data.status !== undefined) set.status = data.status;

	try {
		// First publication stamps `publishedAt`; later edits keep the original.
		if (data.status === 'published') {
			const [existing] = await db
				.select({ publishedAt: pages.publishedAt })
				.from(pages)
				.where(eq(pages.slug, params.slug))
				.limit(1);
			if (!existing) return json({ error: 'Page not found' }, { status: 404 });
			if (!existing.publishedAt) set.publishedAt = now;
		}

		const [row] = await db
			.update(pages)
			.set(set)
			.where(eq(pages.slug, params.slug))
			.returning(pageColumns);
		if (!row) return json({ error: 'Page not found' }, { status: 404 });
		await invalidateCache('/api/pages', `/api/pages/${params.slug}`);
		return json(row);
	} catch (error: unknown) {
		return json(
			{ error: error instanceof Error ? error.message : 'Internal error' },
			{ status: 500 }
		);
	}
};

export const DELETE: RequestHandler = async (event) => {
	const denied = await requireAdmin(event);
	if (denied) return denied;

	const db = getDb(getBindings().DB);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	const { params } = event;
	try {
		const [row] = await db
			.delete(pages)
			.where(eq(pages.slug, params.slug))
			.returning({ slug: pages.slug });
		if (!row) return json({ error: 'Page not found' }, { status: 404 });
		await invalidateCache('/api/pages', `/api/pages/${params.slug}`);
		return json({ deleted: true, slug: row.slug });
	} catch (error: unknown) {
		return json(
			{ error: error instanceof Error ? error.message : 'Internal error' },
			{ status: 500 }
		);
	}
};
