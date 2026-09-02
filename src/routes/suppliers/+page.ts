import type { PageLoad } from './$types';

export const prerender = false;

export const load: PageLoad = async ({ fetch }) => {
	const [suppliersRes, productsRes] = await Promise.all([
		fetch('/api/suppliers?limit=100'),
		fetch('/api/products?limit=100')
	]);

	const suppliers = (suppliersRes.ok ? (await suppliersRes.json()).items ?? [] : []).map((s: any) => ({
		...s,
		certifications: typeof s.certifications === 'string' ? JSON.parse(s.certifications || '[]') : s.certifications ?? [],
		mainMarkets: typeof s.mainMarkets === 'string' ? JSON.parse(s.mainMarkets || '[]') : s.mainMarkets ?? []
	}));
	const products = (productsRes.ok ? (await productsRes.json()).items ?? [] : []).map((p: any) => ({
		...p,
		features: typeof p.features === 'string' ? JSON.parse(p.features || '[]') : p.features ?? [],
	}));

	return {
		seo: {
			title: 'Halal-Certified Suppliers —HalalNeo',
			description:
				'Discover halal-certified suppliers and manufacturers from Southeast Asia to the Gulf. Verified B2B partners for global trade.',
			ogImage: 'https://halalneo.com/og-suppliers.png',
			keywords: ['halal suppliers', 'certified manufacturers', 'B2B suppliers', 'halal trade partners']
		},
		suppliers,
		products
	};
};
