import type { PageLoad } from './$types';

const BASE_URL = 'https://halalneo.com';

export const prerender = false;

export const load: PageLoad = async ({ fetch }) => {
	const [productsRes, suppliersRes, categoriesRes] = await Promise.all([
		fetch('/api/products?limit=100'),
		fetch('/api/suppliers?limit=100'),
		fetch('/api/categories')
	]);

	const products = (productsRes.ok ? ((await productsRes.json()) as { items?: any[] }).items ?? [] : []).map((p: any) => ({
		...p,
		features: typeof p.features === 'string' ? JSON.parse(p.features || '[]') : p.features ?? [],
		images: typeof p.images === 'string' ? JSON.parse(p.images || '[]') : p.images ?? [],
	}));
	const suppliers = (suppliersRes.ok ? ((await suppliersRes.json()) as { items?: any[] }).items ?? [] : []).map((s: any) => ({
		...s,
		certifications: typeof s.certifications === 'string' ? JSON.parse(s.certifications || '[]') : s.certifications ?? [],
		mainMarkets: typeof s.mainMarkets === 'string' ? JSON.parse(s.mainMarkets || '[]') : s.mainMarkets ?? []
	}));
	const categories = categoriesRes.ok ? ((await categoriesRes.json()) as { items?: any[] }).items ?? [] : [];

	const itemList = {
		'@context': 'https://schema.org',
		'@type': 'ItemList',
		name: 'Halal-Certified Products',
		description:
			'Browse halal-certified products from verified suppliers across major halal markets.',
		itemListElement: products.slice(0, 20).map((p: any, i: number) => ({
			'@type': 'ListItem',
			position: i + 1,
			item: {
				'@type': 'Product',
				name: p.name,
				url: `${BASE_URL}/product/${p.slug}`,
				category: p.categorySlug,
				offers: p.priceMin
					? { '@type': 'Offer', priceCurrency: 'USD', price: p.priceMin }
					: undefined
			}
		}))
	};

	return {
		seo: {
			title: 'Halal-Certified Products — HalalNeo',
			description:
				'Browse halal-certified products from verified suppliers worldwide. Food, beverages, cosmetics and nutritional products.',
			ogImage: 'https://halalneo.com/api/media/og-products.png',
			keywords: ['halal products', 'certified suppliers', 'B2B marketplace', 'halal food']
		},
		products,
		suppliers,
		categories,
		itemList
	};
};
