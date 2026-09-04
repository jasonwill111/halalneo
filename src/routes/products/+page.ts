import type { PageLoad } from './$types';

export const prerender = false;

export const load: PageLoad = async ({ fetch }) => {
	const [productsRes, suppliersRes, categoriesRes] = await Promise.all([
		fetch('/api/products?limit=100'),
		fetch('/api/suppliers?limit=100'),
		fetch('/api/categories')
	]);

	const products = (productsRes.ok ? (await productsRes.json()).items ?? [] : []).map((p: any) => ({
		...p,
		features: typeof p.features === 'string' ? JSON.parse(p.features || '[]') : p.features ?? [],
		images: typeof p.images === 'string' ? JSON.parse(p.images || '[]') : p.images ?? [],
	}));
	const suppliers = (suppliersRes.ok ? (await suppliersRes.json()).items ?? [] : []).map((s: any) => ({
		...s,
		certifications: typeof s.certifications === 'string' ? JSON.parse(s.certifications || '[]') : s.certifications ?? [],
		mainMarkets: typeof s.mainMarkets === 'string' ? JSON.parse(s.mainMarkets || '[]') : s.mainMarkets ?? []
	}));
	const categories = categoriesRes.ok ? (await categoriesRes.json()).items ?? [] : [];

	return {
		seo: {
			title: 'Halal-Certified Products — HalalNeo',
			description:
				'Browse halal-certified products from verified suppliers worldwide. Food, beverages, cosmetics and nutritional products.',
			ogImage: 'https://halalneo.com/api/media/og-products.svg',
			keywords: ['halal products', 'certified suppliers', 'B2B marketplace', 'halal food']
		},
		products,
		suppliers,
		categories
	};
};
