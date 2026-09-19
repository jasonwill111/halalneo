import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '#lib/server/db/index.js';
import { getBindings } from '#lib/server/bindings.js';
import { pages } from '#lib/server/db/schema.js';
import { and, eq, sql } from 'drizzle-orm';
import { invalidateCache } from '#lib/server/cache.js';
import { requireAdmin } from '#lib/server/auth-guard.js';
import { glossaryTermUpdateSchema, GLOSSARY_CATEGORY } from '#lib/schemas/glossary.js';

/** Glossary terms are `pages` rows — writes are scoped so no other page can be touched. */
const glossaryFilter = and(eq(pages.type, 'landing'), eq(pages.category, GLOSSARY_CATEGORY));

const GLOSSARY_COLUMNS = {
	slug: pages.slug,
	term: pages.title,
	definition: pages.body,
	status: pages.status
};

export const PUT: RequestHandler = async (event) => {
	const { params, request } = event;
	const denied = await requireAdmin(event);
	if (denied) return denied;

	const db = getDb(getBindings().DB);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	const body: unknown = await request.json().catch(() => null);
	const parsed = glossaryTermUpdateSchema.safeParse(body);
	if (!parsed.success) {
		return json(
			{ error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
			{ status: 400 }
		);
	}

	const target = and(glossaryFilter, eq(pages.slug, params.slug));

	// `slug` stays the immutable identifier: renaming a term updates its title
	// (and every derived column) while the URL key keeps the original term slug,
	// exactly like the blog/KB editors.
	const updates: Partial<typeof pages.$inferInsert> = { updatedAt: new Date() };
	if (parsed.data.term !== undefined) {
		updates.title = parsed.data.term;
		updates.keywords = parsed.data.term;
		updates.metaTitle = parsed.data.term;
	}
	if (parsed.data.definition !== undefined) {
		updates.body = parsed.data.definition;
		updates.excerpt = parsed.data.definition;
		// SEO snippet cap — see the same clip in POST /api/glossary.
		updates.metaDescription = parsed.data.definition.slice(0, 160);
	}

	try {
		// Terms are addressed by name in the UI, so a case-insensitive duplicate
		// is a user-facing validation error, not a 500. One indexed lookup, done.
		if (parsed.data.term !== undefined) {
			const clash = await db
				.select({ slug: pages.slug })
				.from(pages)
				.where(
					and(
						glossaryFilter,
						sql`lower(${pages.title}) = lower(${parsed.data.term})`,
						sql`${pages.slug} != ${params.slug}`
					)
				)
				.limit(1);
			if (clash.length > 0) {
				return json(
					{ error: 'Validation failed', details: { term: ['That term already exists'] } },
					{ status: 400 }
				);
			}
		}

		const [row] = await db.update(pages).set(updates).where(target).returning(GLOSSARY_COLUMNS);
		if (!row) return json({ error: 'Not found' }, { status: 404 });
		await invalidateCache('/api/glossary', '/api/pages?category=glossary&limit=200');
		return json(row);
	} catch (e: unknown) {
		const message = e instanceof Error ? e.message : '';
		return json({ error: message || 'Update failed' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async (event) => {
	const { params } = event;
	const denied = await requireAdmin(event);
	if (denied) return denied;

	const db = getDb(getBindings().DB);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	try {
		const [row] = await db
			.delete(pages)
			.where(and(glossaryFilter, eq(pages.slug, params.slug)))
			.returning({ slug: pages.slug });
		if (!row) return json({ error: 'Not found' }, { status: 404 });
		await invalidateCache('/api/glossary', '/api/pages?category=glossary&limit=200');
		return json({ deleted: true });
	} catch (e: unknown) {
		const message = e instanceof Error ? e.message : '';
		return json({ error: message || 'Delete failed' }, { status: 500 });
	}
};
