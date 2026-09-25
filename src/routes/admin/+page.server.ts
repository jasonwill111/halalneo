import type { PageServerLoad } from './$types';
import { getBindings } from '#lib/server/bindings.js';
import { getDb } from '#lib/server/db/index.js';
import {
	suppliers,
	products,
	categories,
	certifyingBodies,
	knowledgeBase,
	pages,
	aiTools,
	inquiries
} from '#lib/server/db/schema.js';
import { and, desc, eq, inArray, sql } from 'drizzle-orm';
import { GLOSSARY_CATEGORY } from '#lib/schemas/glossary.js';

interface ApplicationRow {
	slug: string;
	name: string;
	country: string;
	businessType: string;
	email: string | null;
	website: string | null;
	adminNotes: string | null;
	createdAt: number | string;
	applicationText: string | null;
}

interface DashboardStats {
	suppliers: { total: number; active: number; pending: number };
	products: { total: number; certified: number; pending: number; notCertified: number };
	categories: number;
	certifyingBodies: number;
	kbSections: number;
	kbArticles: number;
	glossary: number;
	blogPosts: number;
	aiTools: { total: number; active: number };
}

type CountRow = { count: number };
type StatusCountRow = { status: string | null; count: number };
type KbCountRow = { count: number; sections: number };

function byStatus(rows: StatusCountRow[]): Record<string, number> {
	const map: Record<string, number> = {};
	for (const row of rows) map[row.status ?? 'unknown'] = row.count;
	return map;
}

function sum(rows: StatusCountRow[]): number {
	return rows.reduce((acc, row) => acc + row.count, 0);
}

export const load: PageServerLoad = async () => {
	const seo = {
		title: 'Admin Dashboard — HalalNeo',
		description: 'Admin dashboard for managing HalalNeo content.'
	};
	const emptyStats: DashboardStats = {
		suppliers: { total: 0, active: 0, pending: 0 },
		products: { total: 0, certified: 0, pending: 0, notCertified: 0 },
		categories: 0,
		certifyingBodies: 0,
		kbSections: 0,
		kbArticles: 0,
		glossary: 0,
		blogPosts: 0,
		aiTools: { total: 0, active: 0 }
	};

	let d1: ReturnType<typeof getBindings>['DB'] | null;
	try {
		d1 = getBindings().DB;
	} catch {
		d1 = null;
	}
	if (!d1) return { seo, applications: [] as ApplicationRow[], pendingCount: 0, stats: emptyStats };

	try {
		const db = getDb(d1);
		const pendingWhere = eq(suppliers.status, 'pending');

		// One D1 batch for every dashboard read (2 subrequests total incl. the
		// messages lookup below). All group-by columns (status, cert_status)
		// and the pages type/category filter are indexed.
		const [
			pendingCountRows,
			applicationRows,
			supplierStats,
			productStats,
			categoryStats,
			bodyStats,
			kbStats,
			glossaryStats,
			blogStats,
			aiToolStats
		] = (await db.batch([
			db
				.select({ count: sql<number>`count(*)` })
				.from(suppliers)
				.where(pendingWhere),
			db
				.select({
					slug: suppliers.slug,
					name: suppliers.name,
					country: suppliers.country,
					businessType: suppliers.businessType,
					email: suppliers.email,
					website: suppliers.website,
					adminNotes: suppliers.adminNotes,
					createdAt: suppliers.createdAt
				})
				.from(suppliers)
				.where(pendingWhere)
				.orderBy(desc(suppliers.createdAt))
				.limit(10),
			db
				.select({ status: suppliers.status, count: sql<number>`count(*)` })
				.from(suppliers)
				.groupBy(suppliers.status),
			db
				.select({ status: products.certStatus, count: sql<number>`count(*)` })
				.from(products)
				.groupBy(products.certStatus),
			db.select({ count: sql<number>`count(*)` }).from(categories),
			db.select({ count: sql<number>`count(*)` }).from(certifyingBodies),
			db
				.select({
					count: sql<number>`count(*)`,
					sections: sql<number>`count(distinct ${knowledgeBase.section})`
				})
				.from(knowledgeBase),
			db
				.select({ count: sql<number>`count(*)` })
				.from(pages)
				.where(and(eq(pages.type, 'landing'), eq(pages.category, GLOSSARY_CATEGORY))),
			db
				.select({ count: sql<number>`count(*)` })
				.from(pages)
				.where(eq(pages.type, 'blog')),
			db
				.select({ status: aiTools.status, count: sql<number>`count(*)` })
				.from(aiTools)
				.groupBy(aiTools.status)
		])) as [
			CountRow[],
			{
				slug: string;
				name: string;
				country: string;
				businessType: string;
				email: string | null;
				website: string | null;
				adminNotes: string | null;
				createdAt: Date | number;
			}[],
			StatusCountRow[],
			StatusCountRow[],
			CountRow[],
			CountRow[],
			KbCountRow[],
			CountRow[],
			CountRow[],
			StatusCountRow[]
		];

		const rows = applicationRows ?? [];

		// Attach the full application text (stored as an inquiry record on
		// submit) with ONE batched query — no per-row N+1 loop.
		const messages = new Map<string, string>();
		if (rows.length > 0) {
			const inqRows = await db
				.select({ supplierSlug: inquiries.supplierSlug, message: inquiries.message })
				.from(inquiries)
				.where(
					inArray(
						inquiries.supplierSlug,
						rows.map((r) => r.slug)
					)
				)
				.orderBy(desc(inquiries.createdAt));
			for (const inq of inqRows) {
				if (!inq.supplierSlug || !inq.message) continue;
				if (!messages.has(inq.supplierSlug)) messages.set(inq.supplierSlug, inq.message);
			}
		}

		const supplierByStatus = byStatus(supplierStats ?? []);
		const productByStatus = byStatus(productStats ?? []);
		const aiToolByStatus = byStatus(aiToolStats ?? []);
		const kb = kbStats?.[0] ?? { count: 0, sections: 0 };

		const stats: DashboardStats = {
			suppliers: {
				total: sum(supplierStats ?? []),
				active: supplierByStatus['active'] ?? 0,
				pending: supplierByStatus['pending'] ?? 0
			},
			products: {
				total: sum(productStats ?? []),
				certified: productByStatus['certified'] ?? 0,
				pending: productByStatus['pending'] ?? 0,
				notCertified: productByStatus['not-certified'] ?? 0
			},
			categories: categoryStats?.[0]?.count ?? 0,
			certifyingBodies: bodyStats?.[0]?.count ?? 0,
			kbSections: kb.sections,
			kbArticles: kb.count,
			glossary: glossaryStats?.[0]?.count ?? 0,
			blogPosts: blogStats?.[0]?.count ?? 0,
			aiTools: { total: sum(aiToolStats ?? []), active: aiToolByStatus['active'] ?? 0 }
		};

		return {
			seo,
			applications: rows.map((r) => ({
				...r,
				createdAt: r.createdAt instanceof Date ? r.createdAt.getTime() : r.createdAt,
				applicationText: messages.get(r.slug) ?? null
			})) satisfies ApplicationRow[],
			pendingCount: pendingCountRows?.[0]?.count ?? 0,
			stats
		};
	} catch {
		return { seo, applications: [] as ApplicationRow[], pendingCount: 0, stats: emptyStats };
	}
};
