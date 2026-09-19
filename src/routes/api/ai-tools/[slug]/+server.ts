import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '#lib/server/db/index.js';
import { getBindings } from '#lib/server/bindings.js';
import { aiTools } from '#lib/server/db/schema.js';
import { aiToolColumns } from '#lib/server/db/projections.js';
import { eq } from 'drizzle-orm';
import { invalidateCache } from '#lib/server/cache.js';
import { requireAdmin } from '#lib/server/auth-guard.js';
import { aiToolUpdateSchema } from '#lib/schemas/ai-tools.js';

export const GET: RequestHandler = async ({ params }) => {
	const db = getDb(getBindings().DB);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	try {
		const [row] = await db
			.select(aiToolColumns)
			.from(aiTools)
			.where(eq(aiTools.slug, params.slug))
			.limit(1);
		if (!row) return json({ error: 'Tool not found' }, { status: 404 });
		return json(row);
	} catch (error: unknown) {
		return json(
			{ error: error instanceof Error ? error.message : 'Query failed' },
			{ status: 500 }
		);
	}
};

export const PUT: RequestHandler = async (event) => {
	const denied = await requireAdmin(event);
	if (denied) return denied;

	const db = getDb(getBindings().DB);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	const { params } = event;
	const body = (await event.request.json().catch(() => null)) as unknown;
	if (!body) return json({ error: 'Request body is required' }, { status: 400 });

	const parsed = aiToolUpdateSchema.safeParse(body);
	if (!parsed.success) {
		return json(
			{ error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
			{ status: 400 }
		);
	}

	const data = parsed.data;
	// `slug` is the row identity the admin UI links on, so it stays immutable.
	const set: Partial<typeof aiTools.$inferInsert> = { updatedAt: new Date() };
	if (data.name !== undefined) set.name = data.name;
	if (data.description !== undefined) set.description = data.description;
	if (data.longDescription !== undefined) set.longDescription = data.longDescription;
	if (data.features !== undefined) set.features = data.features;
	if (data.category !== undefined) set.category = data.category;
	if (data.status !== undefined) set.status = data.status;

	try {
		const [row] = await db
			.update(aiTools)
			.set(set)
			.where(eq(aiTools.slug, params.slug))
			.returning(aiToolColumns);
		if (!row) return json({ error: 'Tool not found' }, { status: 404 });
		await invalidateCache('/api/ai-tools', `/api/ai-tools/${params.slug}`);
		return json(row);
	} catch (error: unknown) {
		return json(
			{ error: error instanceof Error ? error.message : 'Internal error' },
			{ status: 500 }
		);
	}
};

export const DELETE: RequestHandler = async (event) => {
	const denied = await requireAdmin(event);
	if (denied) return denied;

	const db = getDb(getBindings().DB);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	const { params } = event;
	try {
		const [row] = await db
			.delete(aiTools)
			.where(eq(aiTools.slug, params.slug))
			.returning({ slug: aiTools.slug });
		if (!row) return json({ error: 'Tool not found' }, { status: 404 });
		await invalidateCache('/api/ai-tools', `/api/ai-tools/${params.slug}`);
		return json({ deleted: true, slug: row.slug });
	} catch (error: unknown) {
		return json(
			{ error: error instanceof Error ? error.message : 'Internal error' },
			{ status: 500 }
		);
	}
};
