import type { EntryGenerator, PageLoad } from './$types';

export const entries: EntryGenerator = () => [];

interface ProductItem {
	name?: string;
	shortDescription?: string;
	description?: string;
	image?: string;
	images?: any;
	videos?: any;
	features?: any;
	faqs?: any;
	resources?: any;
	specifications?: any;
	category?: string;
	categorySlug?: string;
	supplierSlug?: string;
	slug?: string;
	priceMin?: number | string | null;
	priceMax?: number | string | null;
	priceUnit?: string | null;
	moq?: string | null;
	units?: string | null;
	originCountry?: string | null;
	certStatus?: string | null;
	status?: string | null;
	views?: number | null;
	createdAt?: string | null;
	metaTitle?: string | null;
	metaDescription?: string | null;
	keywords?: any;
}

export const load: PageLoad = async ({ params, fetch }) => {
	if (!params.slug) {
		return {
			seo: {
				title: 'Product — HalalNeo',
				description: 'Product details on HalalNeo.',
				robots: 'noindex, nofollow'
			},
			item: null,
			relatedProducts: [],
			categories: [],
			supplierName: null
		};
	}
	try {
		const [res, relatedRes, categoriesRes] = await Promise.all([
			fetch(`/api/products/${params.slug}`),
			fetch('/api/products?limit=50'),
			fetch('/api/categories')
		]);
		if (res.ok) {
			const data: ProductItem = (await res.json()) as any;
			const parsed = {
				...data,
				features:
					typeof data.features === 'string'
						? JSON.parse(data.features || '[]')
						: (data.features ?? []),
				specifications:
					typeof data.specifications === 'string'
						? JSON.parse(data.specifications || '{}')
						: (data.specifications ?? {}),
				images:
					typeof data.images === 'string' ? JSON.parse(data.images || '[]') : (data.images ?? []),
				videos:
					typeof data.videos === 'string' ? JSON.parse(data.videos || '[]') : (data.videos ?? []),
				faqs: typeof data.faqs === 'string' ? JSON.parse(data.faqs || '[]') : (data.faqs ?? []),
				resources:
					typeof data.resources === 'string'
						? JSON.parse(data.resources || '[]')
						: (data.resources ?? [])
			};
			const allProducts = relatedRes.ok ? (((await relatedRes.json()) as { items?: any[] }).items ?? []) : [];
		const categories = categoriesRes.ok ? ((await categoriesRes.json()) as { items?: any[] }).items ?? [] : [];
		// Resolve the supplier name for the product page's supplier card.
		let supplierName: string | null = null;
		if (parsed.supplierSlug) {
			const supplierRes = await fetch(`/api/suppliers/${parsed.supplierSlug}`);
			if (supplierRes.ok) {
				const s = (await supplierRes.json()) as { name?: string };
				supplierName = s.name ?? null;
			}
		}
			const relatedProducts = allProducts
				.filter(
					(p: any) => p.slug !== params.slug && p.categorySlug === (parsed as any).categorySlug
				)
				.slice(0, 3);
			return {
				seo: {
					// DB per-row meta wins when admins filled it; else derive.
					title: parsed.metaTitle || (parsed.name ? `${parsed.name} — HalalNeo` : `${params.slug} — HalalNeo`),
				description:
					parsed.metaDescription ||
					parsed.shortDescription ||
					`Product details for ${parsed.name || params.slug} on HalalNeo — halal-certified products with verified certification scope.`,
					ogImage: parsed.image || 'https://halalneo.com/api/media/og-products.png',
					keywords: [parsed.name, 'halal product', parsed.category, 'certified product'].filter(
						Boolean
					)
				},
				slug: params.slug,
				item: parsed,
				relatedProducts,
				categories,
				supplierName
			};
		}
	} catch {}

	return {
		seo: {
			title: `${params.slug} — HalalNeo`,
			description: `Product details for ${params.slug} on HalalNeo — halal-certified products with verified certification scope.`,
			robots: 'noindex, nofollow'
		},
		item: null
	};
};
