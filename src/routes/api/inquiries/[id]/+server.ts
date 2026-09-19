import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '#lib/server/db/index.js';
import { getBindings } from '#lib/server/bindings.js';
import { inquiries } from '#lib/server/db/schema.js';
import { inquiryColumns } from '#lib/server/db/projections.js';
import { eq } from 'drizzle-orm';
import { invalidateCache } from '#lib/server/cache.js';
import { requireAdmin } from '#lib/server/auth-guard.js';
import { inquiryStatusUpdateSchema } from '#lib/schemas/inquiries.js';

/** Admin triage: move an inquiry through the status workflow. */
export const PATCH: RequestHandler = async (event) => {
	const denied = await requireAdmin(event);
	if (denied) return denied;

	const db = getDb(getBindings().DB);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	const { params } = event;
	const body = (await event.request.json().catch(() => null)) as unknown;
	if (!body) return json({ error: 'Request body is required' }, { status: 400 });

	const parsed = inquiryStatusUpdateSchema.safeParse(body);
	if (!parsed.success) {
		return json(
			{ error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
			{ status: 400 }
		);
	}

	const set: Partial<typeof inquiries.$inferInsert> = {
		status: parsed.data.status,
		updatedAt: new Date()
	};

	try {
		const [row] = await db
			.update(inquiries)
			.set(set)
			.where(eq(inquiries.id, params.id))
			.returning(inquiryColumns);
		if (!row) return json({ error: 'Inquiry not found' }, { status: 404 });
		await invalidateCache('/api/inquiries', `/api/inquiries/${params.id}`);
		return json(row);
	} catch (error: unknown) {
		return json(
			{ error: error instanceof Error ? error.message : 'Internal error' },
			{ status: 500 }
		);
	}
};
