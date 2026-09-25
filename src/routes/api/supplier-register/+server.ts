import { json } from '@sveltejs/kit';
import { z } from 'zod';
import { getSession } from '#lib/server/auth.js';
import { getBindings } from '#lib/server/bindings.js';
import { getDb } from '#lib/server/db/index.js';
import { createPendingSupplier, getSupplierForUser } from '#lib/server/domain/accounts.js';
import { slugify } from '#lib/schemas/content.js';
import type { RequestHandler } from './$types';

const supplierRegistrationSchema = z.object({
	name: z.string().trim().min(2).max(200),
	country: z.string().trim().min(2).max(100),
	businessType: z.enum(['manufacturer', 'wholesaler', 'trader']),
	description: z.string().trim().max(4000).optional().nullable(),
	website: z.string().trim().max(500).optional().nullable()
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
	const parsed = supplierRegistrationSchema.safeParse(body);
	if (!parsed.success) {
		return json(
			{ error: 'Invalid supplier registration', details: parsed.error.flatten().fieldErrors },
			{ status: 400 }
		);
	}

	const existing = await getSupplierForUser(db, session.user.id);
	if (existing) {
		return json(
			{ error: 'This account already has a supplier registration.', details: {} },
			{ status: 409 }
		);
	}

	const baseSlug = slugify(parsed.data.name);
	if (!baseSlug) {
		return json({ error: 'A valid company name is required.', details: {} }, { status: 400 });
	}

	const supplier = await createPendingSupplier(db, {
		ownerUserId: session.user.id,
		slug: `${baseSlug}-${session.user.id.slice(0, 8)}`,
		name: parsed.data.name,
		country: parsed.data.country,
		businessType: parsed.data.businessType,
		description: parsed.data.description,
		website: parsed.data.website,
		email: session.user.email
	});

	return json(
		{ supplier: { id: supplier.slug, slug: supplier.slug, status: supplier.status } },
		{ status: 201 }
	);
};

export const GET: RequestHandler = async (event) => {
	const session = await getSession(event);
	if (!session) return json({ error: 'Unauthorized', details: {} }, { status: 401 });

	let db: ReturnType<typeof getDb> | null;
	try {
		db = getDb(getBindings().DB);
	} catch {
		return json({ error: 'Database unavailable', details: {} }, { status: 503 });
	}

	const supplier = await getSupplierForUser(db, session.user.id);
	if (!supplier)
		return json({ error: 'Supplier registration not found', details: {} }, { status: 404 });
	return json({
		supplier: {
			slug: supplier.slug,
			name: supplier.name,
			country: supplier.country,
			businessType: supplier.businessType,
			status: supplier.status
		}
	});
};
