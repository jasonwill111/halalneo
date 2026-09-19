import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { parseQuery } from '#lib/server/db/api-helpers.js';
import { getDb } from '#lib/server/db/index.js';
import { getBindings } from '#lib/server/bindings.js';
import { knowledgeBase } from '#lib/server/db/schema.js';
import { desc, like, or, sql } from 'drizzle-orm';
import { cachedQuery, cacheMedium, invalidateCache, queryCacheKey } from '#lib/server/cache.js';
import { getKbListItems } from '#lib/server/queries/index.js';
import { requireAdmin } from '#lib/server/auth-guard.js';
import {
	kbSectionSchema,
	kbStatusSchema,
	knowledgeArticleCreateSchema
} from '#lib/schemas/knowledge.js';

type Db = ReturnType<typeof getDb>;

/**
 * Admin (`status=all`) column projection — adds tags/author/updatedAt for the
 * /admin/knowledge CRUD table. Public listings keep the narrower 6-column
 * projection in `getKbListItems` (§5.9: no SELECT *).
 */
const KB_ADMIN_COLUMNS = {
	slug: knowledgeBase.slug,
	section: knowledgeBase.section,
	title: knowledgeBase.title,
	summary: knowledgeBase.summary,
	tags: knowledgeBase.tags,
	author: knowledgeBase.author,
	status: knowledgeBase.status,
	views: knowledgeBase.views,
	updatedAt: knowledgeBase.updatedAt
};

/** Rows-read estimate for the admin branch: knowledge_base is ~150 seeded rows,
 * `status` and `section` are indexed (idx_kb_status / idx_kb_section), and every
 * query below is bounded by LIMIT (<=100). */
async function queryKbAdminList(db: Db, limit: number, offset: number, search: string | undefined) {
	const where = search
		? (or(like(knowledgeBase.title, `%${search}%`), like(knowledgeBase.summary, `%${search}%`)) ?? undefined)
		: undefined;

	const [[countResult], rows] = await Promise.all([
		db.select({ count: sql<number>`count(*)` }).from(knowledgeBase).where(where),
		db
			.select(KB_ADMIN_COLUMNS)
			.from(knowledgeBase)
			.where(where)
			// updated_at has no index; the set is already bounded to this small
			// table, so the sort stays cheap. Ordered listing is what the admin
			// table needs (most recently edited first).
			.orderBy(desc(knowledgeBase.updatedAt))
			.limit(limit)
			.offset(offset)
	]);

	return { items: rows, total: countResult?.count ?? 0, limit, offset };
}

export const GET: RequestHandler = async (event) => {
	const { url } = event;
	const db = getDb(getBindings().DB);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	// parseQuery clamps limit to <=100 and defaults offset to 0 (§5.9).
	const { limit, offset, search } = parseQuery(url);

	// status=all → admin overview (allowlisted session required, NEVER cached —
	// the edge cache is anonymous-shared; see the no-store rule in hooks.server.ts).
	if (url.searchParams.get('status') === 'all') {
		const denied = await requireAdmin(event);
		if (denied) return denied;
		try {
			const data = await queryKbAdminList(db, limit, offset, search);
			return json(data, { headers: { 'Cache-Control': 'private, no-store' } });
		} catch (e: unknown) {
			const message = e instanceof Error ? e.message : '';
			return json({ error: message || 'Failed' }, { status: 500 });
		}
	}

	// Early return on a bad filter, before touching D1 or the cache (§5.10).
	const rawStatus = url.searchParams.get('status');
	const statusResult = rawStatus ? kbStatusSchema.safeParse(rawStatus) : null;
	if (rawStatus && !statusResult?.success) {
		return json({ error: "status must be 'published', 'draft' or 'archived'" }, { status: 400 });
	}
	const rawSection = url.searchParams.get('section');
	const sectionResult = rawSection ? kbSectionSchema.safeParse(rawSection) : null;
	if (rawSection && !sectionResult?.success) {
		return json({ error: 'Unknown knowledge base section' }, { status: 400 });
	}

	try {
		// List view: project only 6 cols (slug/title/section/status/excerpt/views).
		// Drops body (Markdown) and tags (JSON) from D1 rows-read + cache payload.
		const data = await cachedQuery(
			url.toString(),
			() =>
				getKbListItems(db, {
					limit,
					offset,
					search,
					section: sectionResult?.data,
					status: statusResult?.success ? statusResult.data : 'published'
				}),
			{ ...cacheMedium(), cacheKey: queryCacheKey(url) }
		);

		return json(data);
	} catch (e: unknown) {
		const message = e instanceof Error ? e.message : '';
		return json({ error: message || 'Failed' }, { status: 500 });
	}
};

export const POST: RequestHandler = async (event) => {
	const denied = await requireAdmin(event);
	if (denied) return denied;

	const db = getDb(getBindings().DB);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	const body: unknown = await event.request.json().catch(() => null);
	const parsed = knowledgeArticleCreateSchema.safeParse(body);
	if (!parsed.success) {
		return json(
			{ error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
			{ status: 400 }
		);
	}

	const now = new Date();
	try {
		const [row] = await db
			.insert(knowledgeBase)
			.values({
				slug: parsed.data.slug,
				section: parsed.data.section,
				title: parsed.data.title,
				summary: parsed.data.summary ?? null,
				body: parsed.data.body,
				tags: JSON.stringify(parsed.data.tags ?? []),
				author: parsed.data.author ?? null,
				status: parsed.data.status ?? 'draft',
				metaTitle: parsed.data.metaTitle ?? null,
				metaDescription: parsed.data.metaDescription ?? null,
				keywords: parsed.data.keywords ?? null,
				createdAt: now,
				updatedAt: now
			})
			.returning(KB_ADMIN_COLUMNS);

		await invalidateCache('/api/knowledge-base');
		return json(row, { status: 201 });
	} catch (e: unknown) {
		const message = e instanceof Error ? e.message : '';
		if (message.includes('UNIQUE constraint')) {
			return json(
				{ error: 'Validation failed', details: { slug: ['An article with this slug already exists'] } },
				{ status: 400 }
			);
		}
		return json({ error: message || 'Internal error' }, { status: 500 });
	}
};
