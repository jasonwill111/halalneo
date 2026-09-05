import type { EntryGenerator, PageLoad } from './$types';

export const entries: EntryGenerator = () => [];

interface ProductItem {
	name?: string;
	shortDescription?: string;
	description?: string;
	image?: string;
	category?: string;
	categorySlug?: string;
	supplierSlug?: string;
	slug?: string;
	priceMin?: number | string | null;
	priceMax?: number | string | null;
	priceUnit?: string | null;
}

export const load: PageLoad = async ({ params, fetch }) => {
	try {
		const [res, relatedRes] = await Promise.all([
			fetch(`/api/products/${params.slug}`),
			fetch('/api/products?limit=50')
		]);
		if (res.ok) {
			const data: ProductItem = await res.json();
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
			const allProducts = relatedRes.ok ? ((await relatedRes.json()).items ?? []) : [];
			const relatedProducts = allProducts
				.filter(
					(p: any) => p.slug !== params.slug && p.categorySlug === (parsed as any).categorySlug
				)
				.slice(0, 3);
			return {
				seo: {
					title: parsed.name ? `${parsed.name} — HalalNeo` : `${params.slug} — HalalNeo`,
				description:
					parsed.shortDescription ||
					`Product details for ${parsed.name || params.slug} on HalalNeo — halal-certified products with verified certification scope.`,
					ogImage: parsed.image || 'https://halalneo.com/api/media/og-products.png',
					keywords: [parsed.name, 'halal product', parsed.category, 'certified product'].filter(
						Boolean
					)
				},
				item: parsed,
				relatedProducts
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
