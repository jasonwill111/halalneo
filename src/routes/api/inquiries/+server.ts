import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { parseQuery } from '#lib/server/db/api-helpers.js';
import { getDb } from '#lib/server/db/index.js';
import { getBindings } from '#lib/server/bindings.js';
import { inquiries } from '#lib/server/db/schema.js';
import { inquiryColumns } from '#lib/server/db/projections.js';
import { and, eq, like, sql } from 'drizzle-orm';
import { invalidateCache } from '#lib/server/cache.js';
import { requireAdminOrSupplier } from '#lib/server/auth-guard.js';
import { getSession } from '#lib/server/auth.js';
import { INQUIRY_STATUSES, inquiryCreateSchema } from '#lib/schemas/inquiries.js';

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

/**
 * Shared triage list: admins see everything; a signed-in supplier only sees
 * inquiries addressed to a supplierSlug they are a member of. Session-scoped:
 * never cached (hooks also force `no-store` for /api/inquiries).
 */
export const GET: RequestHandler = async (event) => {
	const { url } = event;
	const supplierSlug = url.searchParams.get('supplierSlug') || undefined;
	const denied = await requireAdminOrSupplier(event, supplierSlug);
	if (denied) return denied;

	const db = getDb(getBindings().DB);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	const { limit, offset, search } = parseQuery(url);
	const rawStatus = url.searchParams.get('status');

	const conditions = [];
	if (search) conditions.push(like(inquiries.subject, `%${search}%`));
	if (rawStatus && INQUIRY_STATUSES.includes(rawStatus as (typeof INQUIRY_STATUSES)[number])) {
		conditions.push(eq(inquiries.status, rawStatus as 'active' | 'pending' | 'closed' | 'flagged'));
	}
	if (supplierSlug) conditions.push(eq(inquiries.supplierSlug, supplierSlug));

	const where = conditions.length ? and(...conditions) : undefined;

	try {
		const [countResult] = await db
			.select({ count: sql<number>`count(*)` })
			.from(inquiries)
			.where(where);

		const rows = await db
			.select(inquiryColumns)
			.from(inquiries)
			.where(where)
			.orderBy(sql`${inquiries.createdAt} DESC`)
			.limit(limit)
			.offset(offset);

		return json(
			{ items: rows, total: countResult?.count ?? 0, limit, offset },
			{ headers: { 'Cache-Control': 'no-store' } }
		);
	} catch (error: unknown) {
		return json(
			{ error: error instanceof Error ? error.message : 'Query failed' },
			{ status: 500 }
		);
	}
};

export const POST: RequestHandler = async (event) => {
	const { request } = event;
	const ip =
		request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
	if (!checkRateLimit(ip)) {
		return json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
	}

	const db = getDb(getBindings().DB);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	const body = (await request.json().catch(() => null)) as unknown;
	if (!body) {
		return json({ error: 'Request body is required' }, { status: 400 });
	}

	const parsed = inquiryCreateSchema.safeParse(body);
	if (!parsed.success) {
		return json(
			{ error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
			{ status: 400 }
		);
	}

	const now = new Date();
	// Stamp the signed-in buyer (when any) so Account → Inquiries can list
	// their own inquiries; anonymous submissions keep NULL.
	const session = await getSession(event);
	const values: typeof inquiries.$inferInsert = {
		userId: session?.user.id ?? null,
		buyerSlug: parsed.data.buyerSlug,
		supplierSlug: parsed.data.supplierSlug || null,
		productSlug: parsed.data.productSlug || null,
		subject: parsed.data.subject,
		message: parsed.data.message,
		status: 'active',
		createdAt: now,
		updatedAt: now
	};

	try {
		const [row] = await db
			.insert(inquiries)
			.values(values)
			.returning({ id: inquiries.id, status: inquiries.status });
		await invalidateCache('/api/inquiries');
		return json(row, { status: 201 });
	} catch (error: unknown) {
		return json(
			{ error: error instanceof Error ? error.message : 'Internal error' },
			{ status: 500 }
		);
	}
};
