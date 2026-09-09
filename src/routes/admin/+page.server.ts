import type { PageServerLoad } from './$types';
import { getBindings } from '#lib/server/bindings.js';

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

export const load: PageServerLoad = async () => {
	const seo = {
		title: 'Admin Dashboard — HalalNeo',
		description: 'Admin dashboard for managing HalalNeo content.'
	};

	let d1: any = null;
	try {
		d1 = getBindings().DB;
	} catch {
		d1 = null;
	}
	if (!d1) return { seo, applications: [], pendingCount: 0 };

	try {
		const { getDb } = await import('#lib/server/db/index.js');
		const { suppliers, inquiries } = await import('#lib/server/db/schema.js');
		const { eq, sql, desc } = await import('drizzle-orm');

		const db = getDb(d1);
		const where = eq(suppliers.status, 'pending');

		const [countResult] = await db
			.select({ count: sql<number>`count(*)` })
			.from(suppliers)
			.where(where);

		const rows = await db
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
			.where(where)
			.orderBy(desc(suppliers.createdAt))
			.limit(10);

		// Attach the full application text (stored as an inquiry record on submit).
		const messages = new Map<string, string>();
		for (const row of rows) {
			const [inq] = await db
				.select({ message: inquiries.message })
				.from(inquiries)
				.where(eq(inquiries.supplierSlug, row.slug))
				.orderBy(desc(inquiries.createdAt))
				.limit(1);
			if (inq?.message) messages.set(row.slug, inq.message);
		}

		return {
			seo,
			applications: rows.map((r) => ({
				...r,
				createdAt: r.createdAt instanceof Date ? r.createdAt.getTime() : r.createdAt,
				applicationText: messages.get(r.slug) ?? null
			})) as ApplicationRow[],
			pendingCount: countResult?.count ?? 0
		};
	} catch {
		return { seo, applications: [], pendingCount: 0 };
	}
};
