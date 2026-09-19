import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '#lib/server/db/index.js';
import { getBindings } from '#lib/server/bindings.js';
import { inquiries } from '#lib/server/db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { getSession } from '#lib/server/auth.js';

/**
 * The signed-in buyer's own inquiries (Account → Inquiries). Session-scoped:
 * never cached (hooks force `no-store` for /api/inquiries/*) and 401 for
 * anonymous visitors.
 */
export const GET: RequestHandler = async (event) => {
	const session = await getSession(event);
	const userId = session?.user.id;
	if (!userId) return json({ error: 'Unauthorized' }, { status: 401 });

	const db = getDb(getBindings().DB);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	try {
		const rows = await db
			.select({
				id: inquiries.id,
				supplierSlug: inquiries.supplierSlug,
				productSlug: inquiries.productSlug,
				subject: inquiries.subject,
				message: inquiries.message,
				status: inquiries.status,
				createdAt: inquiries.createdAt
			})
			.from(inquiries)
			.where(eq(inquiries.userId, userId))
			.orderBy(desc(inquiries.createdAt))
			.limit(100);
		return json({ items: rows }, { headers: { 'Cache-Control': 'no-store' } });
	} catch (error: unknown) {
		return json(
			{ error: error instanceof Error ? error.message : 'Query failed' },
			{ status: 500 }
		);
	}
};
