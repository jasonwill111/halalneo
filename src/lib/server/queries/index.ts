import { eq, and, or, sql, desc, asc, inArray, like } from 'drizzle-orm';
import type { SQL } from 'drizzle-orm';
import type { drizzle } from 'drizzle-orm/d1';
import * as schema from '#lib/server/db/schema.js';
import { cachedQuery, cacheMedium, queryCacheKey } from '../cache.js';
import { ftsQuery, ftsSlugs } from '../fts.js';
import type {
	PaginatedResult,
	ProductQueryOptions,
	SupplierQueryOptions,
	KbQueryOptions,
	BlogQueryOptions,
	PageQueryOptions,
	ServiceProviderQueryOptions,
	CertifyingBodyQueryOptions,
	InquiryQueryOptions,
	CreateInquiryData
} from './types.js';

type Db = ReturnType<typeof drizzle<typeof schema>>;

function buildConditions(conditions: SQL[]) {
	return conditions.length ? and(...conditions) : undefined;
}

/**
 * §5.9.4 — no list query may return more than 100 rows per page. Callers that
 * genuinely need everything (sitemaps, exports) page with `offset` instead of
 * raising this number; see src/routes/sitemap.xml/+server.ts.
 */
export const LIST_LIMIT_MAX = 100;
const DEFAULT_LIMIT = 20;

/** Clamp any caller-supplied page size into `1..LIST_LIMIT_MAX`. */
export function clampLimit(limit: number | undefined, fallback = DEFAULT_LIMIT): number {
	const n = typeof limit === 'number' && Number.isFinite(limit) ? Math.trunc(limit) : fallback;
	return Math.min(Math.max(n, 1), LIST_LIMIT_MAX);
}

/** §5.9.1 — even "small" dictionary tables get an explicit LIMIT. */
const CATEGORY_LIMIT = 100;
/** The category tree must be whole to nest correctly, so it gets a wider cap. */
const CATEGORY_TREE_LIMIT = 300;
const SETTINGS_LIMIT = 100;

// ==================== Products ====================

export async function getProducts(
	db: Db,
	opts: ProductQueryOptions = {},
	request?: Request
): Promise<PaginatedResult<typeof schema.products.$inferSelect>> {
	const queryFn = async () => {
		const { offset = 0, search, categorySlug, supplierSlug, certStatus, status } = opts;
		const limit = clampLimit(opts.limit);

		const conditions = [];
		// Indexed FTS lookup instead of LIKE '%…%' (full-table scan).
		if (search) {
			const match = ftsQuery(search);
			if (!match) return { items: [], total: 0, limit, offset };
			conditions.push(inArray(schema.products.slug, await ftsSlugs(db, 'products', match, 200)));
		}
		if (categorySlug) conditions.push(eq(schema.products.categorySlug, categorySlug));
		if (supplierSlug) conditions.push(eq(schema.products.supplierSlug, supplierSlug));
		if (certStatus)
			conditions.push(
				eq(
					schema.products.certStatus,
					certStatus as 'certified' | 'pending' | 'not-certified' | 'not-applicable'
				)
			);
		if (status)
			conditions.push(eq(schema.products.status, status as 'active' | 'draft' | 'archived'));

		const where = buildConditions(conditions);

		const [countRows, rows] = await Promise.all([
			db
				.select({ count: sql<number>`count(*)` })
				.from(schema.products)
				.where(where),
			db
				.select()
				.from(schema.products)
				.where(where)
				.limit(limit)
				.offset(offset)
				.orderBy(desc(schema.products.createdAt))
		]);

		return {
			items: rows,
			total: countRows[0]?.count ?? 0,
			limit,
			offset
		};
	};

	if (request) {
		const url = new URL(request.url);
		return cachedQuery(request, queryFn, {
			cacheKey: queryCacheKey(url),
			...cacheMedium()
		});
	}

	return queryFn();
}

export async function getProductBySlug(db: Db, slug: string) {
	const [row] = await db
		.select()
		.from(schema.products)
		.where(eq(schema.products.slug, slug))
		.limit(1);
	return row ?? null;
}

export async function getProductsBySupplier(
	db: Db,
	supplierSlug: string,
	opts: Pick<ProductQueryOptions, 'limit' | 'offset' | 'status'> = {},
	request?: Request
): Promise<PaginatedResult<typeof schema.products.$inferSelect>> {
	const queryFn = async () => {
		const { offset = 0, status } = opts;
		const limit = clampLimit(opts.limit);

		const conditions = [eq(schema.products.supplierSlug, supplierSlug)];
		if (status)
			conditions.push(eq(schema.products.status, status as 'active' | 'draft' | 'archived'));

		const where = buildConditions(conditions);

		const [countRows, rows] = await Promise.all([
			db
				.select({ count: sql<number>`count(*)` })
				.from(schema.products)
				.where(where),
			db
				.select()
				.from(schema.products)
				.where(where)
				.limit(limit)
				.offset(offset)
				.orderBy(desc(schema.products.createdAt))
		]);

		return {
			items: rows,
			total: countRows[0]?.count ?? 0,
			limit,
			offset
		};
	};

	if (request) {
		const url = new URL(request.url);
		url.searchParams.sort();
		return cachedQuery(request, queryFn, {
			cacheKey: `products-by-supplier:${supplierSlug}:${url.searchParams.toString()}`,
			...cacheMedium()
		});
	}

	return queryFn();
}

export async function getProductsByCategory(
	db: Db,
	categorySlug: string,
	opts: Pick<ProductQueryOptions, 'limit' | 'offset' | 'status'> = {},
	request?: Request
): Promise<PaginatedResult<typeof schema.products.$inferSelect>> {
	const queryFn = async () => {
		const { offset = 0, status } = opts;
		const limit = clampLimit(opts.limit);

		const conditions = [eq(schema.products.categorySlug, categorySlug)];
		if (status)
			conditions.push(eq(schema.products.status, status as 'active' | 'draft' | 'archived'));

		const where = buildConditions(conditions);

		const [countRows, rows] = await Promise.all([
			db
				.select({ count: sql<number>`count(*)` })
				.from(schema.products)
				.where(where),
			db
				.select()
				.from(schema.products)
				.where(where)
				.limit(limit)
				.offset(offset)
				.orderBy(desc(schema.products.createdAt))
		]);

		return {
			items: rows,
			total: countRows[0]?.count ?? 0,
			limit,
			offset
		};
	};

	if (request) {
		const url = new URL(request.url);
		url.searchParams.sort();
		return cachedQuery(request, queryFn, {
			cacheKey: `products-by-category:${categorySlug}:${url.searchParams.toString()}`,
			...cacheMedium()
		});
	}

	return queryFn();
}

// ==================== Suppliers ====================

export async function getSuppliers(
	db: Db,
	opts: SupplierQueryOptions = {},
	request?: Request
): Promise<PaginatedResult<typeof schema.suppliers.$inferSelect>> {
	const queryFn = async () => {
		const { offset = 0, search, status, country } = opts;
		const limit = clampLimit(opts.limit);

		const conditions = [];
		// Indexed FTS lookup instead of LIKE '%…%' (full-table scan).
		if (search) {
			const match = ftsQuery(search);
			if (!match) return { items: [], total: 0, limit, offset };
			conditions.push(inArray(schema.suppliers.slug, await ftsSlugs(db, 'suppliers', match, 200)));
		}
		if (status)
			conditions.push(
				eq(schema.suppliers.status, status as 'active' | 'pending' | 'suspended' | 'rejected')
			);
		if (country) conditions.push(eq(schema.suppliers.country, country));

		const where = buildConditions(conditions);

		const [countRows, rows] = await Promise.all([
			db
				.select({ count: sql<number>`count(*)` })
				.from(schema.suppliers)
				.where(where),
			db
				.select()
				.from(schema.suppliers)
				.where(where)
				.limit(limit)
				.offset(offset)
				.orderBy(asc(schema.suppliers.name))
		]);

		return {
			items: rows,
			total: countRows[0]?.count ?? 0,
			limit,
			offset
		};
	};

	if (request) {
		const url = new URL(request.url);
		return cachedQuery(request, queryFn, {
			cacheKey: queryCacheKey(url),
			...cacheMedium()
		});
	}

	return queryFn();
}

export async function getSupplierBySlug(db: Db, slug: string) {
	const [row] = await db
		.select()
		.from(schema.suppliers)
		.where(eq(schema.suppliers.slug, slug))
		.limit(1);
	return row ?? null;
}

export async function getSuppliersByCategory(
	db: Db,
	categorySlug: string,
	opts: Pick<SupplierQueryOptions, 'limit' | 'offset'> = {},
	request?: Request
): Promise<PaginatedResult<typeof schema.suppliers.$inferSelect>> {
	const queryFn = async () => {
		const { offset = 0 } = opts;
		const limit = clampLimit(opts.limit);

		const subquery = db
			.select({ supplierSlug: schema.products.supplierSlug })
			.from(schema.products)
			.where(eq(schema.products.categorySlug, categorySlug));

		const where = sql`${schema.suppliers.slug} IN (${subquery})`;

		const [countRows, rows] = await Promise.all([
			db
				.select({ count: sql<number>`count(*)` })
				.from(schema.suppliers)
				.where(where),
			db
				.select()
				.from(schema.suppliers)
				.where(where)
				.limit(limit)
				.offset(offset)
				.orderBy(asc(schema.suppliers.name))
		]);

		return {
			items: rows,
			total: countRows[0]?.count ?? 0,
			limit,
			offset
		};
	};

	if (request) {
		const url = new URL(request.url);
		url.searchParams.sort();
		return cachedQuery(request, queryFn, {
			cacheKey: `suppliers-by-category:${categorySlug}:${url.searchParams.toString()}`,
			...cacheMedium()
		});
	}

	return queryFn();
}

// ==================== Categories ====================

export async function getCategories(db: Db, request?: Request) {
	const queryFn = async () => {
		return db
			.select()
			.from(schema.categories)
			.orderBy(asc(schema.categories.sortOrder))
			.limit(CATEGORY_LIMIT);
	};

	if (request) {
		return cachedQuery(request, queryFn, {
			cacheKey: queryCacheKey(new URL(request.url)),
			...cacheMedium()
		});
	}

	return queryFn();
}

export async function getCategoryBySlug(db: Db, slug: string) {
	const [row] = await db
		.select()
		.from(schema.categories)
		.where(eq(schema.categories.slug, slug))
		.limit(1);
	return row ?? null;
}

type CategoryRow = typeof schema.categories.$inferSelect;
type CategoryWithChildren = CategoryRow & { children: CategoryWithChildren[] };

export async function getCategoryTree(db: Db): Promise<CategoryWithChildren[]> {
	// Wider than the 100-row list cap on purpose: the tree is built from a
	// single read, so a truncated page would silently drop whole branches.
	const all = await db
		.select()
		.from(schema.categories)
		.orderBy(asc(schema.categories.sortOrder))
		.limit(CATEGORY_TREE_LIMIT);
	const map = new Map<string, CategoryWithChildren>();

	for (const cat of all) {
		map.set(cat.slug, { ...cat, children: [] });
	}

	const roots: CategoryWithChildren[] = [];
	for (const cat of all) {
		const node = map.get(cat.slug)!;
		if (cat.parentSlug && map.has(cat.parentSlug)) {
			map.get(cat.parentSlug)!.children.push(node);
		} else {
			roots.push(node);
		}
	}

	return roots;
}

// ==================== Knowledge Base ====================

export async function getKbArticles(
	db: Db,
	opts: KbQueryOptions = {},
	request?: Request
): Promise<PaginatedResult<typeof schema.knowledgeBase.$inferSelect>> {
	const queryFn = async () => {
		const { offset = 0, search, section } = opts;
		const limit = clampLimit(opts.limit);

		const conditions: SQL[] = [eq(schema.knowledgeBase.status, 'published')];
		// LIKE only — knowledge_base_fts does not exist in production D1,
		// and the table is small (<500 rows).
		if (search) {
			const term = `%${search}%`;
			const searchCond = or(
				like(schema.knowledgeBase.title, term),
				like(schema.knowledgeBase.summary, term)
			);
			if (searchCond) conditions.push(searchCond);
		}
		if (section) conditions.push(eq(schema.knowledgeBase.section, section));

		const where = buildConditions(conditions);

		const [countRows, rows] = await Promise.all([
			db
				.select({ count: sql<number>`count(*)` })
				.from(schema.knowledgeBase)
				.where(where),
			db
				.select()
				.from(schema.knowledgeBase)
				.where(where)
				.limit(limit)
				.offset(offset)
				.orderBy(desc(schema.knowledgeBase.createdAt))
		]);

		return {
			items: rows,
			total: countRows[0]?.count ?? 0,
			limit,
			offset
		};
	};

	if (request) {
		const url = new URL(request.url);
		return cachedQuery(request, queryFn, {
			cacheKey: queryCacheKey(url),
			...cacheMedium()
		});
	}

	return queryFn();
}

export async function getKbArticleBySlug(db: Db, slug: string) {
	const [row] = await db
		.select()
		.from(schema.knowledgeBase)
		.where(eq(schema.knowledgeBase.slug, slug))
		.limit(1);
	return row ?? null;
}

export async function getKbSections(db: Db) {
	return db
		.select({
			section: schema.knowledgeBase.section,
			count: sql<number>`count(*)`
		})
		.from(schema.knowledgeBase)
		.where(eq(schema.knowledgeBase.status, 'published'))
		.groupBy(schema.knowledgeBase.section);
}

// ==================== Blog ====================

export async function getBlogPosts(
	db: Db,
	opts: BlogQueryOptions = {},
	request?: Request
): Promise<PaginatedResult<typeof schema.pages.$inferSelect>> {
	const queryFn = async () => {
		const { offset = 0, search, category } = opts;
		const limit = clampLimit(opts.limit);

		const conditions = [eq(schema.pages.type, 'blog'), eq(schema.pages.status, 'published')];
		// LIKE only — pages_fts does not exist in production D1,
		// and the table is small (<500 rows).
		if (search) conditions.push(like(schema.pages.title, `%${search}%`));
		if (category) conditions.push(eq(schema.pages.category, category));

		const where = buildConditions(conditions);

		const [countRows, rows] = await Promise.all([
			db
				.select({ count: sql<number>`count(*)` })
				.from(schema.pages)
				.where(where),
			db
				.select()
				.from(schema.pages)
				.where(where)
				.limit(limit)
				.offset(offset)
				.orderBy(desc(schema.pages.publishedAt))
		]);

		return {
			items: rows,
			total: countRows[0]?.count ?? 0,
			limit,
			offset
		};
	};

	if (request) {
		const url = new URL(request.url);
		return cachedQuery(request, queryFn, {
			cacheKey: queryCacheKey(url),
			...cacheMedium()
		});
	}

	return queryFn();
}

export async function getBlogPostBySlug(db: Db, slug: string) {
	const [row] = await db
		.select()
		.from(schema.pages)
		.where(and(eq(schema.pages.slug, slug), eq(schema.pages.type, 'blog')))
		.limit(1);
	return row ?? null;
}

// ==================== Pages ====================

export async function getPageBySlug(db: Db, slug: string, type?: 'landing' | 'blog') {
	const conditions = [eq(schema.pages.slug, slug)];
	if (type) conditions.push(eq(schema.pages.type, type));

	const [row] = await db.select().from(schema.pages).where(buildConditions(conditions)).limit(1);
	return row ?? null;
}

export async function getPages(
	db: Db,
	opts: PageQueryOptions = {}
): Promise<PaginatedResult<typeof schema.pages.$inferSelect>> {
	const { offset = 0, type, status } = opts;
	const limit = clampLimit(opts.limit);

	const conditions = [];
	if (type) conditions.push(eq(schema.pages.type, type));
	if (status)
		conditions.push(eq(schema.pages.status, status as 'published' | 'draft' | 'archived'));

	const where = buildConditions(conditions);

	const [countRows, rows] = await Promise.all([
		db
			.select({ count: sql<number>`count(*)` })
			.from(schema.pages)
			.where(where),
		db
			.select()
			.from(schema.pages)
			.where(where)
			.limit(limit)
			.offset(offset)
			.orderBy(desc(schema.pages.createdAt))
	]);

	return {
		items: rows,
		total: countRows[0]?.count ?? 0,
		limit,
		offset
	};
}

// ==================== Service Providers ====================

type ServiceProviderType =
	'certification' | 'logistics' | 'finance' | 'payment' | 'insurance' | 'consulting';

export async function getServiceProviders(
	db: Db,
	opts: ServiceProviderQueryOptions = {},
	request?: Request
): Promise<PaginatedResult<typeof schema.serviceProviders.$inferSelect>> {
	const queryFn = async () => {
		const { offset = 0, search, type } = opts;
		const limit = clampLimit(opts.limit);

		const conditions = [eq(schema.serviceProviders.status, 'active')];
		// LIKE only — service_providers_fts does not exist in production D1,
		// and the table is small (<500 rows).
		if (search) conditions.push(like(schema.serviceProviders.name, `%${search}%`));
		if (type) conditions.push(eq(schema.serviceProviders.type, type as ServiceProviderType));

		const where = buildConditions(conditions);

		const [countRows, rows] = await Promise.all([
			db
				.select({ count: sql<number>`count(*)` })
				.from(schema.serviceProviders)
				.where(where),
			db
				.select()
				.from(schema.serviceProviders)
				.where(where)
				.limit(limit)
				.offset(offset)
				.orderBy(asc(schema.serviceProviders.name))
		]);

		return {
			items: rows,
			total: countRows[0]?.count ?? 0,
			limit,
			offset
		};
	};

	if (request) {
		const url = new URL(request.url);
		return cachedQuery(request, queryFn, {
			cacheKey: queryCacheKey(url),
			...cacheMedium()
		});
	}

	return queryFn();
}

export async function getServiceProviderBySlug(db: Db, slug: string) {
	const [row] = await db
		.select()
		.from(schema.serviceProviders)
		.where(eq(schema.serviceProviders.slug, slug))
		.limit(1);
	return row ?? null;
}

// ==================== Certifying Bodies ====================

export async function getCertifyingBodies(
	db: Db,
	opts: CertifyingBodyQueryOptions = {},
	request?: Request
): Promise<PaginatedResult<typeof schema.certifyingBodies.$inferSelect>> {
	const queryFn = async () => {
		const { offset = 0, search, country } = opts;
		const limit = clampLimit(opts.limit);

		const conditions = [];
		// LIKE only — certifying_bodies_fts does not exist in production D1,
		// and the table is small (<500 rows).
		if (search) conditions.push(like(schema.certifyingBodies.name, `%${search}%`));
		if (country) conditions.push(eq(schema.certifyingBodies.country, country));

		const where = buildConditions(conditions);

		const [countRows, rows] = await Promise.all([
			db
				.select({ count: sql<number>`count(*)` })
				.from(schema.certifyingBodies)
				.where(where),
			db
				.select()
				.from(schema.certifyingBodies)
				.where(where)
				.limit(limit)
				.offset(offset)
				.orderBy(asc(schema.certifyingBodies.name))
		]);

		return {
			items: rows,
			total: countRows[0]?.count ?? 0,
			limit,
			offset
		};
	};

	if (request) {
		const url = new URL(request.url);
		return cachedQuery(request, queryFn, {
			cacheKey: queryCacheKey(url),
			...cacheMedium()
		});
	}

	return queryFn();
}

export async function getCertifyingBodyById(db: Db, id: string) {
	const [row] = await db
		.select()
		.from(schema.certifyingBodies)
		.where(eq(schema.certifyingBodies.id, id))
		.limit(1);
	return row ?? null;
}

export async function getSuppliersByCertifyingBody(
	db: Db,
	bodyId: string,
	request?: Request
): Promise<{
	suppliers: Array<{
		slug: string;
		name: string;
		country: string;
		businessType: 'manufacturer' | 'wholesaler' | 'trader';
		isBrand: boolean | null;
		status: 'active' | 'pending' | 'suspended' | 'rejected' | null;
		logoInitials: string | null;
		description: string | null;
		certifications: string | null;
	}>;
	certificationTypes: string[];
}> {
	const queryFn = async () => {
		// Push the bodyId predicate into D1 through the indexed suppliers_fts
		// lookup — without it this is a full-table scan followed by a JS
		// JSON.parse of every row's certifications.
		// The term MUST go through ftsQuery(): bodyId is caller-controlled and
		// interpolating it raw into a MATCH string breaks (or injects into) the
		// FTS5 query syntax.
		const empty = { suppliers: [], certificationTypes: [] };
		const match = ftsQuery(bodyId);
		if (!match) return empty;
		const matchedSlugs = await ftsSlugs(db, 'suppliers', match, 200);
		if (matchedSlugs.length === 0) return empty;

		const allSuppliers = await db
			.select({
				slug: schema.suppliers.slug,
				name: schema.suppliers.name,
				country: schema.suppliers.country,
				businessType: schema.suppliers.businessType,
				isBrand: schema.suppliers.isBrand,
				status: schema.suppliers.status,
				logoInitials: schema.suppliers.logoInitials,
				description: schema.suppliers.description,
				certifications: schema.suppliers.certifications
			})
			.from(schema.suppliers)
			.where(inArray(schema.suppliers.slug, matchedSlugs))
			.limit(50);

		type SupplierCertRow = (typeof allSuppliers)[number];

		// FTS tokenises the JSON blob, so a match can still be a false positive
		// (another field mentioning the bodyId). Re-verify the parsed JSON.
		function parseCerts(row: SupplierCertRow): Array<{ bodyId?: unknown }> {
			if (typeof row.certifications !== 'string') return [];
			try {
				const parsed: unknown = JSON.parse(row.certifications);
				return Array.isArray(parsed) ? (parsed as Array<{ bodyId?: unknown }>) : [];
			} catch {
				return [];
			}
		}

		const certifiedSuppliers = allSuppliers.filter((s) =>
			parseCerts(s).some((c) => c.bodyId === bodyId)
		);

		// Only fetch product categorySlugs for the suppliers we kept
		const supplierSlugs = certifiedSuppliers.map((s) => s.slug);
		const allProducts = supplierSlugs.length
			? await db
					.select({
						supplierSlug: schema.products.supplierSlug,
						categorySlug: schema.products.categorySlug
					})
					.from(schema.products)
					.where(inArray(schema.products.supplierSlug, supplierSlugs))
					// Aggregation-only read over ≤50 suppliers; capped so a single
					// supplier with a huge catalogue cannot turn this into a
					// wide scan (§5.9.1).
					.limit(300)
			: [];

		const certificationTypes = allProducts.reduce((acc: string[], p) => {
			if (!acc.includes(p.categorySlug)) acc.push(p.categorySlug);
			return acc;
		}, []);

		return { suppliers: certifiedSuppliers, certificationTypes };
	};

	if (request) {
		return cachedQuery(request, queryFn, {
			cacheKey: `cert-body-suppliers:${bodyId}`,
			...cacheMedium()
		});
	}

	return queryFn();
}

// ==================== Inquiries ====================

export async function getInquiries(
	db: Db,
	opts: InquiryQueryOptions = {},
	request?: Request
): Promise<PaginatedResult<typeof schema.inquiries.$inferSelect>> {
	const queryFn = async () => {
		const { offset = 0, status, buyerSlug } = opts;
		const limit = clampLimit(opts.limit);

		const conditions = [];
		if (status)
			conditions.push(
				eq(schema.inquiries.status, status as 'active' | 'pending' | 'closed' | 'flagged')
			);
		if (buyerSlug) conditions.push(eq(schema.inquiries.buyerSlug, buyerSlug));

		const where = buildConditions(conditions);

		const [countRows, rows] = await Promise.all([
			db
				.select({ count: sql<number>`count(*)` })
				.from(schema.inquiries)
				.where(where),
			db
				.select()
				.from(schema.inquiries)
				.where(where)
				.limit(limit)
				.offset(offset)
				.orderBy(desc(schema.inquiries.createdAt))
		]);

		return {
			items: rows,
			total: countRows[0]?.count ?? 0,
			limit,
			offset
		};
	};

	if (request) {
		const url = new URL(request.url);
		return cachedQuery(request, queryFn, {
			cacheKey: queryCacheKey(url),
			...cacheMedium()
		});
	}

	return queryFn();
}

export async function createInquiry(db: Db, data: CreateInquiryData) {
	const [row] = await db.insert(schema.inquiries).values(data).returning();
	return row;
}

// ==================== Site Settings ====================

export async function getSetting(db: Db, key: string) {
	const [row] = await db
		.select()
		.from(schema.siteSettings)
		.where(eq(schema.siteSettings.key, key))
		.limit(1);
	return row ?? null;
}

export async function getSettings(db: Db) {
	return db
		.select()
		.from(schema.siteSettings)
		.orderBy(asc(schema.siteSettings.key))
		.limit(SETTINGS_LIMIT);
}

// ==================== Media ====================

export async function getMediaByKey(db: Db, key: string) {
	const [row] = await db.select().from(schema.media).where(eq(schema.media.key, key)).limit(1);
	return row ?? null;
}

// ==================== Lightweight List Queries (no heavy JSON columns) ====================

type ProductListItem = {
	slug: string;
	name: string;
	image: string | null;
	status: string | null;
	categorySlug: string;
	supplierSlug: string;
	priceMin: number | null;
	priceMax: number | null;
	priceUnit: string | null;
	certStatus: string | null;
};

export async function getProductListItems(
	db: Db,
	opts: ProductQueryOptions = {},
	request?: Request
): Promise<PaginatedResult<ProductListItem>> {
	const queryFn = async () => {
		const { offset = 0, search, categorySlug, supplierSlug, certStatus, status } = opts;
		const limit = clampLimit(opts.limit);

		const conditions = [];
		// Indexed FTS lookup instead of LIKE '%…%' (full-table scan).
		if (search) {
			const match = ftsQuery(search);
			if (!match) return { items: [], total: 0, limit, offset };
			conditions.push(inArray(schema.products.slug, await ftsSlugs(db, 'products', match, 200)));
		}
		if (categorySlug) conditions.push(eq(schema.products.categorySlug, categorySlug));
		if (supplierSlug) conditions.push(eq(schema.products.supplierSlug, supplierSlug));
		if (certStatus)
			conditions.push(
				eq(
					schema.products.certStatus,
					certStatus as 'certified' | 'pending' | 'not-certified' | 'not-applicable'
				)
			);
		if (status)
			conditions.push(eq(schema.products.status, status as 'active' | 'draft' | 'archived'));

		const where = buildConditions(conditions);

		const [countRows, rows] = await Promise.all([
			db
				.select({ count: sql<number>`count(*)` })
				.from(schema.products)
				.where(where),
			db
				.select({
					slug: schema.products.slug,
					name: schema.products.name,
					image: schema.products.image,
					status: schema.products.status,
					categorySlug: schema.products.categorySlug,
					supplierSlug: schema.products.supplierSlug,
					moq: schema.products.moq,
					priceMin: schema.products.priceMin,
					priceMax: schema.products.priceMax,
					priceUnit: schema.products.priceUnit,
					certStatus: schema.products.certStatus
				})
				.from(schema.products)
				.where(where)
				.limit(limit)
				.offset(offset)
				.orderBy(desc(schema.products.createdAt))
		]);

		return {
			items: rows as ProductListItem[],
			total: countRows[0]?.count ?? 0,
			limit,
			offset
		};
	};

	if (request) {
		const url = new URL(request.url);
		url.searchParams.sort();
		return cachedQuery(request, queryFn, {
			cacheKey: `product-list:${url.searchParams.toString()}`,
			...cacheMedium()
		});
	}

	return queryFn();
}

type SupplierListItem = {
	slug: string;
	name: string;
	country: string;
	businessType: string | null;
	status: string | null;
	logoInitials: string | null;
	description: string | null;
};

export async function getSupplierListItems(
	db: Db,
	opts: SupplierQueryOptions = {},
	request?: Request
): Promise<PaginatedResult<SupplierListItem>> {
	const queryFn = async () => {
		const { offset = 0, search, status, country, businessType } = opts;
		const limit = clampLimit(opts.limit);

		const conditions = [];
		// Indexed FTS lookup instead of LIKE '%…%' (full-table scan).
		if (search) {
			const match = ftsQuery(search);
			if (!match) return { items: [], total: 0, limit, offset };
			conditions.push(inArray(schema.suppliers.slug, await ftsSlugs(db, 'suppliers', match, 200)));
		}
		if (status)
			conditions.push(
				eq(schema.suppliers.status, status as 'active' | 'pending' | 'suspended' | 'rejected')
			);
		if (country) conditions.push(eq(schema.suppliers.country, country));
		if (businessType)
			conditions.push(
				eq(schema.suppliers.businessType, businessType as 'manufacturer' | 'wholesaler' | 'trader')
			);

		const where = buildConditions(conditions);

		const [countRows, rows] = await Promise.all([
			db
				.select({ count: sql<number>`count(*)` })
				.from(schema.suppliers)
				.where(where),
			db
				.select({
					slug: schema.suppliers.slug,
					name: schema.suppliers.name,
					country: schema.suppliers.country,
					businessType: schema.suppliers.businessType,
					status: schema.suppliers.status,
					isBrand: schema.suppliers.isBrand,
					logoInitials: schema.suppliers.logoInitials,
					description: schema.suppliers.description
				})
				.from(schema.suppliers)
				.where(where)
				.limit(limit)
				.offset(offset)
				.orderBy(asc(schema.suppliers.name))
		]);

		return {
			items: rows as SupplierListItem[],
			total: countRows[0]?.count ?? 0,
			limit,
			offset
		};
	};

	if (request) {
		const url = new URL(request.url);
		url.searchParams.sort();
		return cachedQuery(request, queryFn, {
			cacheKey: `supplier-list:${url.searchParams.toString()}`,
			...cacheMedium()
		});
	}

	return queryFn();
}

type KbListItem = {
	slug: string;
	title: string;
	section: string | null;
	status: string | null;
	excerpt: string | null;
	views: number | null;
};

export async function getKbListItems(
	db: Db,
	opts: KbQueryOptions = {},
	request?: Request
): Promise<PaginatedResult<KbListItem>> {
	const queryFn = async () => {
		const { offset = 0, search, section, status } = opts;
		const limit = clampLimit(opts.limit);

		const conditions: SQL[] = [
			eq(schema.knowledgeBase.status, (status ?? 'published') as 'published' | 'draft' | 'archived')
		];
		if (search) {
			const term = `%${search}%`;
			const searchCond = or(
				like(schema.knowledgeBase.title, term),
				like(schema.knowledgeBase.summary, term)
			);
			if (searchCond) conditions.push(searchCond);
		}
		if (section) conditions.push(eq(schema.knowledgeBase.section, section));

		const where = buildConditions(conditions);

		const [countRows, rows] = await Promise.all([
			db
				.select({ count: sql<number>`count(*)` })
				.from(schema.knowledgeBase)
				.where(where),
			db
				.select({
					slug: schema.knowledgeBase.slug,
					title: schema.knowledgeBase.title,
					section: schema.knowledgeBase.section,
					status: schema.knowledgeBase.status,
					excerpt: schema.knowledgeBase.summary,
					views: schema.knowledgeBase.views
				})
				.from(schema.knowledgeBase)
				.where(where)
				.limit(limit)
				.offset(offset)
				.orderBy(desc(schema.knowledgeBase.createdAt))
		]);

		return {
			items: rows as KbListItem[],
			total: countRows[0]?.count ?? 0,
			limit,
			offset
		};
	};

	if (request) {
		const url = new URL(request.url);
		url.searchParams.sort();
		return cachedQuery(request, queryFn, {
			cacheKey: `kb-list:${url.searchParams.toString()}`,
			...cacheMedium()
		});
	}

	return queryFn();
}
