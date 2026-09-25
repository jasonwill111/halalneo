import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '#lib/server/db/index.js';
import { getBindings } from '#lib/server/bindings.js';
import { knowledgeBase } from '#lib/server/db/schema.js';
import { eq, sql } from 'drizzle-orm';
import { cachedQuery, cacheLong, invalidateCache } from '#lib/server/cache.js';
import { getSession } from '#lib/server/auth.js';
import { requireAdmin } from '#lib/server/auth-guard.js';
import { knowledgeArticleUpdateSchema } from '#lib/schemas/knowledge.js';

export const GET: RequestHandler = async (event) => {
	const { params, url } = event;
	const db = getDb(getBindings().DB);
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

		const [row] = await db
			.select()
			.from(knowledgeBase)
			.where(eq(knowledgeBase.slug, params.slug))
			.limit(1);

		if (!row) return json({ error: 'Not found' }, { status: 404 });

		// Visibility guard: only published articles are public. Non-published
		// rows resolve for authenticated sessions only, and are never
		// edge-cached.
		if (row.status !== 'published') {
			const session = await getSession(event);
			if (!session) return json({ error: 'Not found' }, { status: 404 });
			return json(row, { headers: { 'Cache-Control': 'private, no-store' } });
		}

		const cached = await cachedQuery(url.toString(), async () => row ?? null, { ...cacheLong() });

		if (!cached) return json({ error: 'Not found' }, { status: 404 });
		return json(cached);
	} catch (e: unknown) {
		const message = e instanceof Error ? e.message : '';
		return json({ error: message || 'Failed' }, { status: 500 });
	}
};

export const PUT: RequestHandler = async (event) => {
	const { params, request } = event;
	const denied = await requireAdmin(event);
	if (denied) return denied;

	const db = getDb(getBindings().DB);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	const body: unknown = await request.json().catch(() => null);
	const parsed = knowledgeArticleUpdateSchema.safeParse(body);
	if (!parsed.success) {
		return json(
			{ error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
			{ status: 400 }
		);
	}

	// Whitelist built from the parsed payload: nothing that is not a schema key
	// can reach the UPDATE, and the object stays fully typed (§5.4).
	const updates: Partial<typeof knowledgeBase.$inferInsert> = { updatedAt: new Date() };
	if (parsed.data.section !== undefined) updates.section = parsed.data.section;
	if (parsed.data.title !== undefined) updates.title = parsed.data.title;
	if (parsed.data.summary !== undefined) updates.summary = parsed.data.summary || null;
	if (parsed.data.body !== undefined) updates.body = parsed.data.body;
	if (parsed.data.tags !== undefined) updates.tags = JSON.stringify(parsed.data.tags);
	if (parsed.data.author !== undefined) updates.author = parsed.data.author || null;
	if (parsed.data.status !== undefined) updates.status = parsed.data.status;
	if (parsed.data.metaTitle !== undefined) updates.metaTitle = parsed.data.metaTitle || null;
	if (parsed.data.metaDescription !== undefined) {
		updates.metaDescription = parsed.data.metaDescription || null;
	}
	if (parsed.data.keywords !== undefined) updates.keywords = parsed.data.keywords || null;

	try {
		const [row] = await db
			.update(knowledgeBase)
			.set(updates)
			.where(eq(knowledgeBase.slug, params.slug))
			.returning();
		if (!row) return json({ error: 'Not found' }, { status: 404 });
		await invalidateCache('/api/knowledge-base', `/api/knowledge-base/${params.slug}`);
		return json(row);
	} catch (e: unknown) {
		const message = e instanceof Error ? e.message : '';
		return json({ error: message || 'Update failed' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async (event) => {
	const { params } = event;
	const denied = await requireAdmin(event);
	if (denied) return denied;

	const db = getDb(getBindings().DB);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	try {
		const [row] = await db
			.delete(knowledgeBase)
			.where(eq(knowledgeBase.slug, params.slug))
			.returning();
		if (!row) return json({ error: 'Not found' }, { status: 404 });
		await invalidateCache('/api/knowledge-base', `/api/knowledge-base/${params.slug}`);
		return json({ deleted: true });
	} catch (e: unknown) {
		const message = e instanceof Error ? e.message : '';
		return json({ error: message || 'Delete failed' }, { status: 500 });
	}
};
