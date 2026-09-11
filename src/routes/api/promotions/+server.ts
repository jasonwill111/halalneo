import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '#lib/server/db/index.js';
import { getBindings } from '#lib/server/bindings.js';
import { promotions, supplierMembers } from '#lib/server/db/schema.js';
import { eq, and, desc, sql } from 'drizzle-orm';
import { cachedQuery, cacheMedium, invalidateCache, queryCacheKey } from '#lib/server/cache.js';
import { getSession } from '#lib/server/auth.js';
import { checkWeeklyQuota, resolvePlan } from '#lib/server/quotas.js';
import { z } from 'zod';

const promoSchema = z.object({
	supplierSlug: z.string().min(1),
	productSlug: z.string().max(200).optional().nullable(),
	title: z.string().min(5).max(200),
	description: z.string().max(5000).optional().nullable(),
	discountPct: z.number().int().min(1).max(99).optional().nullable(),
	priceMin: z.string().max(50).optional().nullable(),
	priceMax: z.string().max(50).optional().nullable(),
	priceUnit: z.string().max(50).optional().nullable(),
	moq: z.string().max(200).optional().nullable(),
	validUntil: z.string().max(30).optional().nullable()
});

async function isMember(db: any, userId: string, supplierSlug: string): Promise<boolean> {
	const rows = await db
		.select({ userId: supplierMembers.userId })
		.from(supplierMembers)
		.where(and(eq(supplierMembers.userId, userId), eq(supplierMembers.supplierSlug, supplierSlug)))
		.limit(1);
	return rows.length > 0;
}

// ==================== GET: public promotions board ====================
export const GET: RequestHandler = async ({ url }) => {
	const db = getDb(getBindings().DB);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	try {
		const data = await cachedQuery(
			url.toString(),
			async () => {
				const limit = Math.min(Number(url.searchParams.get('limit')) || 20, 100);
				const offset = Number(url.searchParams.get('offset')) || 0;
				const supplierSlug = url.searchParams.get('supplierSlug') || undefined;
				const status = url.searchParams.get('status') || 'active';

				const conditions = [eq(promotions.status, status)];
				if (supplierSlug) conditions.push(eq(promotions.supplierSlug, supplierSlug));
				const where = conditions.length > 1 ? and(...conditions) : conditions[0];

				const [countResult] = await db
					.select({ count: sql<number>`count(*)` })
					.from(promotions)
					.where(where);
				const rows = await db
					.select({
						id: promotions.id,
						supplierSlug: promotions.supplierSlug,
						productSlug: promotions.productSlug,
						title: promotions.title,
						description: promotions.description,
						discountPct: promotions.discountPct,
						priceMin: promotions.priceMin,
						priceMax: promotions.priceMax,
						priceUnit: promotions.priceUnit,
						moq: promotions.moq,
						validUntil: promotions.validUntil,
						status: promotions.status,
						views: promotions.views,
						createdAt: promotions.createdAt
					})
					.from(promotions)
					.where(where)
					.orderBy(desc(promotions.createdAt))
					.limit(limit)
					.offset(offset);
				return { items: rows, total: countResult?.count ?? 0 };
			},
			{ ...cacheMedium(), cacheKey: queryCacheKey(url) }
		);

		return json(data);
	} catch (e: any) {
		return json({ error: e?.message ?? 'Failed' }, { status: 500 });
	}
};

// ==================== POST: publish a deal (supplier member + weekly quota) ====================
export const POST: RequestHandler = async (event) => {
	const { request } = event;
	const session = await getSession(event);
	const userId = (session?.user as any)?.id as string | undefined;
	if (!userId) return json({ error: 'Please sign in as a supplier to publish a deal.' }, { status: 401 });

	const db = getDb(getBindings().DB);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
	if (!body) return json({ error: 'Request body is required' }, { status: 400 });
	const parsed = promoSchema.safeParse(body);
	if (!parsed.success) {
		return json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, { status: 400 });
	}

	if (!(await isMember(db, userId, parsed.data.supplierSlug))) {
		return json({ error: 'Only team members of this supplier can publish deals.' }, { status: 403 });
	}

	const quota = await checkWeeklyQuota(db, promotions, promotions.supplierSlug, parsed.data.supplierSlug, 'promotion', resolvePlan(userId));
	if (!quota.allowed) {
		return json(
			{ error: `Weekly deal limit reached (${quota.limit}/week on the free plan). Upgrade for more.` },
			{ status: 429 }
		);
	}

	try {
		const now = new Date();
		const [row] = await db
			.insert(promotions)
			.values({
				supplierSlug: parsed.data.supplierSlug,
				productSlug: parsed.data.productSlug || null,
				title: parsed.data.title.trim(),
				description: parsed.data.description || null,
				discountPct: parsed.data.discountPct ?? null,
				priceMin: parsed.data.priceMin || null,
				priceMax: parsed.data.priceMax || null,
				priceUnit: parsed.data.priceUnit || null,
				moq: parsed.data.moq || null,
				validUntil: parsed.data.validUntil || null,
				status: 'active',
				views: 0,
				createdAt: now,
				updatedAt: now
			})
			.returning({ id: promotions.id });

		await invalidateCache('/api/promotions');
		return json({ id: row.id, remaining: quota.remaining - 1 }, { status: 201 });
	} catch (e: any) {
		return json({ error: e?.message ?? 'Failed to publish' }, { status: 500 });
	}
};
