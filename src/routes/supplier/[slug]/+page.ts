import type { EntryGenerator, PageLoad } from './$types';

export const entries: EntryGenerator = () => [];

interface SupplierItem {
	slug?: string;
	name?: string;
	description?: string;
	businessType?: string;
	country?: string;
	logoInitials?: string;
	coverImage?: string;
	mainMarkets?: any;
	website?: string;
	email?: string;
	phone?: string;
	whatsapp?: string;
	line?: string;
	status?: string;
	isBrand?: boolean;
	certifications?: any;
	yearEstablished?: number;
	employeeCount?: string;
	productionCapacity?: string;
	metaTitle?: string | null;
	metaDescription?: string | null;
	keywords?: any;
	createdAt?: string | null;
	products?: unknown[];
}

export const load: PageLoad = async ({ params, fetch }) => {
	try {
		const [res, productsRes, storiesRes] = await Promise.all([
			fetch(`/api/suppliers/${params.slug}`),
			fetch(`/api/products?supplierSlug=${params.slug}&limit=20`),
			fetch(`/api/success-stories?supplierSlug=${params.slug}&limit=4`)
		]);

		if (res.ok) {
			const data: SupplierItem = (await res.json()) as any;
			// Only approved suppliers are publicly visible; pending/rejected render as not-found.
			if (data.status && data.status !== 'active') {
				return {
					slug: params.slug,
					seo: {
						title: `${params.slug} 鈥?HalalNeo`,
						description: `${params.slug} 鈥?halal-certified supplier on HalalNeo.`,
						robots: 'noindex, nofollow'
					},
					item: null
				};
			}
			const certificationsParsed = typeof data.certifications === 'string' ? JSON.parse(data.certifications || '[]') : data.certifications ?? [];
			const products = productsRes.ok ? ((await productsRes.json()) as { items?: any[] }).items ?? [] : [];
			const supplierStories = storiesRes.ok ? ((((await storiesRes.json()) as any)).items ?? []) : [];
			// Related suppliers: same country, excluding self (list API supports ?country=).
			let relatedSuppliers: any[] = [];
			try {
				if (data.country) {
					const relRes = await fetch(
						`/api/suppliers?country=${encodeURIComponent(data.country)}&status=active&limit=5`
					);
					if (relRes.ok) {
						const rel = (await relRes.json()) as { items?: any[] };
						relatedSuppliers = (rel.items ?? [])
							.filter((s: any) => s.slug !== params.slug)
							.slice(0, 4);
					}
				}
			} catch {}
			return {
				slug: params.slug,
				seo: {
					// DB per-row meta wins when admins filled it; else derive.
					title: data.metaTitle || (data.name ? `${data.name} — HalalNeo` : `${params.slug} — HalalNeo`),
					description:
						data.metaDescription ||
						data.description ||
						`${data.name || params.slug} — halal-certified ${data.businessType || 'supplier'} from ${data.country || 'worldwide'}. View products, certifications, and contact info on HalalNeo.`,
					ogImage: 'https://halalneo.com/api/media/og-suppliers.png',
					keywords: [data.name, 'halal supplier', data.country, data.businessType, 'certified'].filter(Boolean)
				},
				item: { ...data, certifications: certificationsParsed },
				products,
				relatedSuppliers,
				supplierStories
			};
		}
	} catch {}

	return {
		slug: params.slug,
		seo: {
			title: `${params.slug} 鈥?HalalNeo`,
			description: `${params.slug} 鈥?halal-certified supplier on HalalNeo.`,
			robots: 'noindex, nofollow'
		},
		item: null
	};
};
