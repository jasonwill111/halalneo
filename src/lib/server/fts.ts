import { sql } from 'drizzle-orm';
import type { getDb } from '#lib/server/db/index.js';

type Db = ReturnType<typeof getDb>;

/**
 * FTS5 helpers for the two unbounded tables (products, suppliers).
 * Replaces LIKE '%term%' substring scans (full-table) with indexed MATCH.
 * Small tables (<500 rows) keep LIKE per project discipline.
 */

/** Sanitize free text into an FTS5 AND query. Returns null when unusable. */
export function ftsQuery(term: string): string | null {
	const tokens = term
		.toLowerCase()
		.split(/[\s\p{P}]+/u)
		.map((t) => t.replace(/"/g, ''))
		.filter((t) => t.length >= 2);
	if (tokens.length === 0) return null;
	return tokens.map((t) => `"${t}"`).join(' ');
}

/** Indexed slug lookup via the FTS side table. Empty array on no match. */
export async function ftsSlugs(
	db: Db,
	table: 'products' | 'suppliers',
	match: string,
	limit = 50
): Promise<string[]> {
	const fts = sql.raw(table === 'products' ? 'products_fts' : 'suppliers_fts');
	const rows = await db
		.select({ slug: sql<string>`slug` })
		.from(fts)
		.where(sql`${fts} MATCH ${match}`)
		.limit(limit);
	return rows.map((r) => r.slug).filter(Boolean);
}
