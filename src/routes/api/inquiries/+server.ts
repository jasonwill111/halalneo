import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { parseQuery } from '#lib/server/db/api-helpers.js';
import { getDb } from '#lib/server/db/index.js';
import { getBindings } from '#lib/server/bindings.js';
import { inquiries } from '#lib/server/db/schema.js';
import { eq, like, sql, and } from 'drizzle-orm';
import { cachedQuery, cacheShort, queryCacheKey } from '#lib/server/cache.js';
import { getSession } from '#lib/server/auth.js';
import { z } from 'zod';

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60_000;
const RATE_LIMIT_MAX = 5;

function checkRateLimit(ip: string): boolean {
	const now = Date.now();
	const entry = rateLimitMap.get(ip);
	if (!entry || now > entry.resetAt) {
		rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
		return true;
	}
	if (entry.count >= RATE_LIMIT_MAX) return false;
	entry.count++;
	return true;
}

const inquirySchema = z.object({
	buyerSlug: z.string().optional(),
	supplierSlug: z.string().min(1, 'supplierSlug is required'),
	productSlug: z.string().optional(),
	subject: z.string().min(3, 'Subject must be at least 3 characters').max(200, 'Subject must be at most 200 characters'),
	message: z.string().min(10, 'Message must be at least 10 characters').max(5000, 'Message must be at most 5000 characters')
});

export const GET: RequestHandler = async (event) => {
	const { url } = event;
	const session = await getSession(event);
	if (!session) return json({ error: 'Unauthorized' }, { status: 401 });
	const db = getDb(getBindings().DB);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	const { limit, offset, search } = parseQuery(url);
	const status = url.searchParams.get('status') || undefined;
	const supplierSlug = url.searchParams.get('supplierSlug') || undefined;

	const conditions = [];
	if (search) conditions.push(like(inquiries.subject, `%${search}%`));
	if (status) conditions.push(eq(inquiries.status, status as 'active' | 'pending' | 'closed' | 'flagged'));
	if (supplierSlug) conditions.push(eq(inquiries.supplierSlug, supplierSlug));

	const where = conditions.length > 1 ? and(...conditions) : conditions.length === 1 ? conditions[0] : undefined;

	try {
		const data = await cachedQuery(
			url.toString(),
			async () => {
				const [countResult] = await db
					.select({ count: sql<number>`count(*)` })
					.from(inquiries)
					.where(where);

				const rows = await db
					.select()
					.from(inquiries)
					.where(where)
					.limit(limit)
					.offset(offset);

				return { items: rows, total: countResult?.count ?? 0, limit, offset };
			},
			{ ...cacheShort(), cacheKey: queryCacheKey(url) }
		);
		return json(data);
	} catch (e: any) {
		return json({ error: e?.message ?? 'Query failed' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request }) => {
	const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
	if (!checkRateLimit(ip)) {
		return json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
	}

	const db = getDb(getBindings().DB);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
	if (!body) {
		return json({ error: 'Request body is required' }, { status: 400 });
	}

	const parsed = inquirySchema.safeParse(body);
	if (!parsed.success) {
		const errors = parsed.error.flatten().fieldErrors;
		return json({ error: 'Validation failed', details: errors }, { status: 400 });
	}

	try {
		const [row] = await db.insert(inquiries).values(parsed.data as any).returning();
		return json(row, { status: 201 });
	} catch (e: any) {
		return json({ error: e?.message ?? 'Internal error' }, { status: 500 });
	}
};
