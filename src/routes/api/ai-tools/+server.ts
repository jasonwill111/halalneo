import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { parseQuery } from '#lib/server/db/api-helpers.js';
import { getDb } from '#lib/server/db/index.js';
import { getBindings } from '#lib/server/bindings.js';
import { aiTools } from '#lib/server/db/schema.js';
import { aiToolColumns } from '#lib/server/db/projections.js';
import { and, eq, like, or, sql } from 'drizzle-orm';
import { cachedQuery, cacheMedium, invalidateCache, queryCacheKey } from '#lib/server/cache.js';
import { requireAdmin } from '#lib/server/auth-guard.js';
import {
	AI_TOOL_CATEGORIES,
	AI_TOOL_STATUSES,
	aiToolCreateSchema,
	type AiToolCategory,
	type AiToolStatus
} from '#lib/schemas/ai-tools.js';

type Db = NonNullable<ReturnType<typeof getDb>>;
type StatusFilter = AiToolStatus | 'all';

function resolveStatusFilter(raw: string | null): StatusFilter {
	if (raw === 'all') return 'all';
	return AI_TOOL_STATUSES.includes(raw as AiToolStatus) ? (raw as AiToolStatus) : 'active';
}

function resolveCategory(raw: string | null): AiToolCategory | undefined {
	return AI_TOOL_CATEGORIES.includes(raw as AiToolCategory) ? (raw as AiToolCategory) : undefined;
}

function slugify(value: string): string {
	return value
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

async function queryList(
	db: Db,
	status: StatusFilter,
	category: AiToolCategory | undefined,
	search: string | undefined,
	limit: number,
	offset: number
) {
	const conditions = [];
	if (status !== 'all') conditions.push(eq(aiTools.status, status));
	if (category) conditions.push(eq(aiTools.category, category));
	if (search) {
		const q = `%${search}%`;
		conditions.push(or(like(aiTools.name, q), like(aiTools.description, q)));
	}
	const where = conditions.length ? and(...conditions) : undefined;

	const [countResult] = await db
		.select({ count: sql<number>`count(*)` })
		.from(aiTools)
		.where(where);

	const rows = await db
		.select(aiToolColumns)
		.from(aiTools)
		.where(where)
		.orderBy(sql`${aiTools.name} ASC`)
		.limit(limit)
		.offset(offset);

	return { items: rows, total: countResult?.count ?? 0, limit, offset };
}

export const GET: RequestHandler = async (event) => {
	const { url } = event;
	const db = getDb(getBindings().DB);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	const { limit, offset, search } = parseQuery(url);
	const status = resolveStatusFilter(url.searchParams.get('status'));
	const category = resolveCategory(url.searchParams.get('category'));

	try {
		// Admin view (disabled tools included): requires an allowlisted admin
		// and is never cached.
		if (status === 'all') {
			const denied = await requireAdmin(event);
			if (denied) return denied;
			const data = await queryList(db, status, category, search, limit, offset);
			return json(data, { headers: { 'Cache-Control': 'no-store' } });
		}

		const data = await cachedQuery(
			url.toString(),
			() => queryList(db, status, category, search, limit, offset),
			{
				...cacheMedium(),
				cacheKey: queryCacheKey(url)
			}
		);

		return json(data);
	} catch (error: unknown) {
		return json(
			{ error: error instanceof Error ? error.message : 'Query failed' },
			{ status: 500 }
		);
	}
};

export const POST: RequestHandler = async (event) => {
	const denied = await requireAdmin(event);
	if (denied) return denied;

	const db = getDb(getBindings().DB);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	const body = (await event.request.json().catch(() => null)) as unknown;
	if (!body) return json({ error: 'Request body is required' }, { status: 400 });

	const parsed = aiToolCreateSchema.safeParse(body);
	if (!parsed.success) {
		return json(
			{ error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
			{ status: 400 }
		);
	}

	const slug = parsed.data.slug?.trim() || slugify(parsed.data.name);
	if (!slug) {
		return json(
			{ error: 'Validation failed', details: { name: ['Tool name is required.'] } },
			{ status: 400 }
		);
	}

	const now = new Date();
	const values: typeof aiTools.$inferInsert = {
		id: parsed.data.id?.trim() || slug,
		slug,
		name: parsed.data.name,
		description: parsed.data.description ?? '',
		longDescription: parsed.data.longDescription ?? '',
		features: parsed.data.features ?? [],
		category: parsed.data.category,
		status: parsed.data.status,
		createdAt: now,
		updatedAt: now
	};

	try {
		const [row] = await db
			.insert(aiTools)
			.values(values)
			.returning({ slug: aiTools.slug, status: aiTools.status });
		await invalidateCache('/api/ai-tools');
		return json({ slug: row.slug, status: row.status }, { status: 201 });
	} catch (error: unknown) {
		if (error instanceof Error && error.message.includes('UNIQUE constraint')) {
			return json({ error: 'An AI tool with this slug already exists' }, { status: 409 });
		}
		return json(
			{ error: error instanceof Error ? error.message : 'Internal error' },
			{ status: 500 }
		);
	}
};
