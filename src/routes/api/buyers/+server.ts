import { json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { getSession } from '#lib/server/auth.js';
import { getBindings } from '#lib/server/bindings.js';
import { getDb } from '#lib/server/db/index.js';
import { buyers } from '#lib/server/db/schema.js';
import { ensureBuyerRecord } from '#lib/server/domain/accounts.js';
import type { RequestHandler } from './$types';

const buyerProfileSchema = z.object({
	companyName: z.string().trim().max(200).optional().nullable(),
	phone: z.string().trim().max(60).optional().nullable(),
	country: z.string().trim().max(100).optional().nullable()
});

export const POST: RequestHandler = async (event) => {
	const session = await getSession(event);
	if (!session) return json({ error: 'Unauthorized', details: {} }, { status: 401 });

	let db: ReturnType<typeof getDb> | null;
	try {
		db = getDb(getBindings().DB);
	} catch {
		return json({ error: 'Database unavailable', details: {} }, { status: 503 });
	}

	const body: unknown = await event.request.json().catch(() => ({}));
	const parsed = buyerProfileSchema.safeParse(body);
	if (!parsed.success) {
		return json(
			{ error: 'Invalid buyer profile', details: parsed.error.flatten().fieldErrors },
			{ status: 400 }
		);
	}

	await ensureBuyerRecord(db, session.user.id, parsed.data);
	const [buyer] = await db
		.select({
			userId: buyers.userId,
			companyName: buyers.companyName,
			phone: buyers.phone,
			country: buyers.country
		})
		.from(buyers)
		.where(eq(buyers.userId, session.user.id))
		.limit(1);

	return json({ buyer: buyer ?? { userId: session.user.id } }, { status: 201 });
};
