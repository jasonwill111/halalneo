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
	rating?: number | null;
	certifications?: any;
	yearEstablished?: number;
	employeeCount?: string;
	productionCapacity?: string;
	products?: unknown[];
}

export const load: PageLoad = async ({ params, fetch }) => {
	try {
		const [res, productsRes] = await Promise.all([
			fetch(`/api/suppliers/${params.slug}`),
			fetch(`/api/products?supplierSlug=${params.slug}&limit=20`)
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
			return {
				slug: params.slug,
				seo: {
					title: data.name ? `${data.name} 鈥?HalalNeo` : `${params.slug} 鈥?HalalNeo`,
					description:
						data.description ||
						`${data.name || params.slug} 鈥?halal-certified ${data.businessType || 'supplier'} from ${data.country || 'worldwide'}. View products, certifications, and contact info on HalalNeo.`,
					ogImage: 'https://halalneo.com/api/media/og-suppliers.png',
					keywords: [data.name, 'halal supplier', data.country, data.businessType, 'certified'].filter(Boolean)
				},
				item: { ...data, certifications: certificationsParsed },
				products
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
