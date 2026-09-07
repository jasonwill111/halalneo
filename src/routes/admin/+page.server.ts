import type { PageServerLoad } from './$types';

interface ApplicationRow {
	slug: string;
	name: string;
	country: string;
	businessType: string;
	email: string | null;
	createdAt: number | string;
}

export const load: PageServerLoad = async ({ platform }) => {
	const seo = {
		title: 'Admin Dashboard — HalalNeo',
		description: 'Admin dashboard for managing HalalNeo content.'
	};

	const d1 = platform?.env?.DB;
	if (!d1) return { seo, applications: [], pendingCount: 0 };

	try {
		const { getDb } = await import('#lib/server/db/index.js');
		const { suppliers } = await import('#lib/server/db/schema.js');
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
				createdAt: suppliers.createdAt
			})
			.from(suppliers)
			.where(where)
			.orderBy(desc(suppliers.createdAt))
			.limit(10);

		return {
			seo,
			applications: rows.map((r) => ({
				...r,
				createdAt: r.createdAt instanceof Date ? r.createdAt.getTime() : r.createdAt
			})) as ApplicationRow[],
			pendingCount: countResult?.count ?? 0
		};
	} catch {
		return { seo, applications: [], pendingCount: 0 };
	}
};
