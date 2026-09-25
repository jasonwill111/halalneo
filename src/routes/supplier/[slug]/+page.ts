import type { EntryGenerator, PageLoad } from './$types';
import { readItems, readJson, readList } from '#lib/utils/api-response.js';
import type { ProductListItem } from '#lib/schemas/products.js';
import type { SupplierListItem } from '#lib/schemas/suppliers.js';
import type { SuccessStoryItem } from '#lib/types/api.js';

export const entries: EntryGenerator = () => [];

/** One entry of the `certifications` JSON column (both legacy and current keys). */
interface SupplierCertRow {
	body?: {
		id?: string | null;
		name?: string | null;
		country?: string | null;
		standard?: string | null;
	} | null;
	name?: string | null;
	bodyId?: string | null;
	country?: string | null;
	standard?: string | null;
	scope?: string | null;
	number?: string | null;
	id?: string | null;
	expiry?: string | null;
	status?: string | null;
}

/** `/api/suppliers/[slug]` projection (`publicProjection`); JSON TEXT stays unparsed. */
interface SupplierDetailRow {
	slug?: string | null;
	name?: string | null;
	description?: string | null;
	businessType?: string | null;
	country?: string | null;
	logoInitials?: string | null;
	coverImage?: string | null;
	mainMarkets?: string | string[] | null;
	website?: string | null;
	email?: string | null;
	phone?: string | null;
	whatsapp?: string | null;
	line?: string | null;
	status?: string | null;
	isBrand?: boolean | null;
	certifications?: string | string[] | SupplierCertRow[] | null;
	yearEstablished?: number | null;
	employeeCount?: string | null;
	productionCapacity?: string | null;
	metaTitle?: string | null;
	metaDescription?: string | null;
	keywords?: string | string[] | null;
	createdAt?: string | number | null;
	updatedAt?: string | number | null;
}

export const load: PageLoad = async ({ params, fetch }) => {
	try {
		const [res, productsRes, storiesRes] = await Promise.all([
			fetch(`/api/suppliers/${params.slug}`),
			fetch(`/api/products?supplierSlug=${params.slug}&limit=20`),
			fetch(`/api/success-stories?supplierSlug=${params.slug}&limit=4`)
		]);

		if (res.ok) {
			const data: SupplierDetailRow = await readJson<SupplierDetailRow>(res);
			// Only approved suppliers are publicly visible; pending/rejected render as not-found.
			if (data.status && data.status !== 'active') {
				return {
					slug: params.slug,
					seo: {
						title: `${params.slug} — HalalNeo`,
						description: `${params.slug} — halal-certified supplier on HalalNeo.`,
						robots: 'noindex, nofollow'
					},
					item: null
				};
			}
			const certificationsParsed =
				typeof data.certifications === 'string'
					? (JSON.parse(data.certifications || '[]') as SupplierCertRow[])
					: (data.certifications ?? []);
			const products = await readItems<ProductListItem>(productsRes);
			const supplierStories = await readItems<SuccessStoryItem>(storiesRes);
			// Related suppliers: same country, excluding self (list API supports ?country=).
			let relatedSuppliers: SupplierListItem[] = [];
			try {
				if (data.country) {
					const relRes = await fetch(
						`/api/suppliers?country=${encodeURIComponent(data.country)}&status=active&limit=5`
					);
					if (relRes.ok) {
						const rel = await readList<SupplierListItem>(relRes);
						relatedSuppliers = (rel.items ?? []).filter((s) => s.slug !== params.slug).slice(0, 4);
					}
				}
			} catch {
				// related suppliers are best-effort — the profile still renders
			}
			return {
				slug: params.slug,
				seo: {
					// DB per-row meta wins when admins filled it; else derive.
					title:
						data.metaTitle || (data.name ? `${data.name} — HalalNeo` : `${params.slug} — HalalNeo`),
					description:
						data.metaDescription ||
						data.description ||
						`${data.name || params.slug} — halal-certified ${data.businessType || 'supplier'} from ${data.country || 'worldwide'}. View products, certifications, and contact info on HalalNeo.`,
					ogImage: 'https://halalneo.com/brand/og-default.png',
					keywords: [
						data.name,
						'halal supplier',
						data.country,
						data.businessType,
						'certified'
					].filter(Boolean)
				},
				item: { ...data, certifications: certificationsParsed },
				products,
				relatedSuppliers,
				supplierStories
			};
		}
	} catch {
		// fetch/parse failed — fall back to the static payload below
	}

	return {
		slug: params.slug,
		seo: {
			title: `${params.slug} — HalalNeo`,
			description: `${params.slug} — halal-certified supplier on HalalNeo.`,
			robots: 'noindex, nofollow'
		},
		item: null
	};
};
