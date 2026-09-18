import { sql } from 'drizzle-orm';
import type { getDb } from '#lib/server/db/index.js';

type Db = ReturnType<typeof getDb>;

/**
 * FTS5 helpers — products/suppliers only.
 * Replaces LIKE '%term%' substring scans (full-table) with indexed MATCH.
 *
 * knowledge_base, pages, certifying_bodies, service_providers intentionally
 * stay on LIKE: their FTS side tables do not exist in production D1 and the
 * tables are small (<500 rows). See queries/index.ts.
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

type FtsTable =
	'products' | 'suppliers' | 'knowledge_base' | 'pages' | 'certifying_bodies' | 'service_providers';

/** Map table name → primary key column for slug/id lookups. */
const FTS_PRIMARY_KEY: Record<FtsTable, string> = {
	products: 'slug',
	suppliers: 'slug',
	knowledge_base: 'slug',
	pages: 'slug',
	certifying_bodies: 'id',
	service_providers: 'slug'
};

/** Map table name → FTS virtual table name. */
const FTS_TABLE_NAME: Record<FtsTable, string> = {
	products: 'products_fts',
	suppliers: 'suppliers_fts',
	knowledge_base: 'knowledge_base_fts',
	pages: 'pages_fts',
	certifying_bodies: 'certifying_bodies_fts',
	service_providers: 'service_providers_fts'
};

/**
 * Indexed lookup via the FTS side table.
 * Returns primary key values (slug or id) for matching rows.
 * Empty array on no match.
 */
export async function ftsSlugs(
	db: Db,
	table: FtsTable,
	match: string,
	limit = 50
): Promise<string[]> {
	const ftsName = FTS_TABLE_NAME[table];
	const pkCol = FTS_PRIMARY_KEY[table];
	const fts = sql.raw(ftsName);
	const col = sql.raw(pkCol);

	// Only products_fts / suppliers_fts exist in production D1.
	// Missing tables throw "no such table" — swallow and return []
	// so callers fall back to their LIKE paths.
	try {
		const rows = await db
			.select({ pk: sql<string>`${col}` })
			.from(fts)
			.where(sql`${fts} MATCH ${match}`)
			.limit(limit);
		return rows.map((r) => r.pk).filter(Boolean);
	} catch {
		return [];
	}
}
