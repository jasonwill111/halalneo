import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '#lib/server/db/index.js';
import { getBindings } from '#lib/server/bindings.js';
import { buyingRequests } from '#lib/server/db/schema.js';
import { eq, like, or, and, desc, sql } from 'drizzle-orm';
import { cachedQuery, cacheMedium, invalidateCache, queryCacheKey } from '#lib/server/cache.js';
import { getSession } from '#lib/server/auth.js';
import { checkWeeklyQuota, resolvePlan } from '#lib/server/quotas.js';
import { z } from 'zod';

const rfqSchema = z.object({
	title: z.string().min(5, 'Title must be at least 5 characters').max(200),
	description: z.string().min(10, 'Describe what you need (min 10 characters)').max(5000),
	categorySlug: z.string().max(100).optional().nullable(),
	quantity: z.string().max(200).optional().nullable(),
	targetPrice: z.string().max(200).optional().nullable(),
	destination: z.string().max(200).optional().nullable(),
	buyerCountry: z.string().max(200).optional().nullable()
});

// ==================== GET: public buying-requests board ====================
export const GET: RequestHandler = async ({ url }) => {
	const db = getDb(getBindings().DB);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	try {
		const data = await cachedQuery(
			url.toString(),
			async () => {
				const limit = Math.min(Number(url.searchParams.get('limit')) || 20, 100);
				const offset = Number(url.searchParams.get('offset')) || 0;
				const search = url.searchParams.get('search') || undefined;
				const categorySlug = url.searchParams.get('categorySlug') || undefined;
				const status = url.searchParams.get('status') || 'active';

				const conditions = [eq(buyingRequests.status, status)];
				if (search) {
					conditions.push(
						or(like(buyingRequests.title, `%${search}%`), like(buyingRequests.description, `%${search}%`)) as any
					);
				}
				if (categorySlug) conditions.push(eq(buyingRequests.categorySlug, categorySlug));

				const where = conditions.length > 1 ? and(...conditions) : conditions[0];
				const [countResult] = await db
					.select({ count: sql<number>`count(*)` })
					.from(buyingRequests)
					.where(where);
				const rows = await db
					.select({
						id: buyingRequests.id,
						title: buyingRequests.title,
						description: buyingRequests.description,
						categorySlug: buyingRequests.categorySlug,
						quantity: buyingRequests.quantity,
						targetPrice: buyingRequests.targetPrice,
						destination: buyingRequests.destination,
						buyerCountry: buyingRequests.buyerCountry,
						status: buyingRequests.status,
						views: buyingRequests.views,
						createdAt: buyingRequests.createdAt
					})
					.from(buyingRequests)
					.where(where)
					.orderBy(desc(buyingRequests.createdAt))
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

// ==================== POST: publish a buying request (login + weekly quota) ====================
export const POST: RequestHandler = async (event) => {
	const { request } = event;
	const session = await getSession(event);
	if (!session?.user) return json({ error: 'Please sign in to post a buying request.' }, { status: 401 });

	const db = getDb(getBindings().DB);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
	if (!body) return json({ error: 'Request body is required' }, { status: 400 });
	const parsed = rfqSchema.safeParse(body);
	if (!parsed.success) {
		return json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, { status: 400 });
	}

	const userId = (session.user as any).id as string | undefined;
	const quotaKey = userId ?? (session.user as any).email ?? '';
	const quota = await checkWeeklyQuota(db, buyingRequests, buyingRequests.buyerId, quotaKey, 'buyingRequest', resolvePlan(userId));
	if (!quota.allowed) {
		return json(
			{ error: `Weekly posting limit reached (${quota.limit}/week on the free plan). Your quota resets soon — upgrade for more.` },
			{ status: 429 }
		);
	}

	try {
		const now = new Date();
		const [row] = await db
			.insert(buyingRequests)
			.values({
				buyerId: userId ?? null,
				buyerEmail: ((session.user as any).email as string | undefined) ?? null,
				buyerCountry: parsed.data.buyerCountry || null,
				title: parsed.data.title.trim(),
				description: parsed.data.description.trim(),
				categorySlug: parsed.data.categorySlug || null,
				quantity: parsed.data.quantity || null,
				targetPrice: parsed.data.targetPrice || null,
				destination: parsed.data.destination || null,
				status: 'active',
				views: 0,
				createdAt: now,
				updatedAt: now
			})
			.returning({ id: buyingRequests.id });

		await invalidateCache('/api/rfqs');
		return json({ id: row.id, remaining: quota.remaining - 1 }, { status: 201 });
	} catch (e: any) {
		return json({ error: e?.message ?? 'Failed to publish' }, { status: 500 });
	}
};
