import type { PageLoad } from './$types';

const BASE_URL = 'https://halalneo.com';

export const prerender = false;

export const load: PageLoad = async ({ fetch }) => {
	const [suppliersRes, productsRes] = await Promise.all([
		fetch('/api/suppliers?limit=100&status=active'),
		fetch('/api/products?limit=100')
	]);

	const suppliers = (suppliersRes.ok ? ((await suppliersRes.json()) as { items?: any[] }).items ?? [] : []).map((s: any) => ({
		...s,
		certifications: typeof s.certifications === 'string' ? JSON.parse(s.certifications || '[]') : s.certifications ?? [],
		mainMarkets: typeof s.mainMarkets === 'string' ? JSON.parse(s.mainMarkets || '[]') : s.mainMarkets ?? []
	}));
	const products = (productsRes.ok ? ((await productsRes.json()) as { items?: any[] }).items ?? [] : []).map((p: any) => ({
		...p,
		features: typeof p.features === 'string' ? JSON.parse(p.features || '[]') : p.features ?? [],
	}));

	const itemList = {
		'@context': 'https://schema.org',
		'@type': 'ItemList',
		name: 'Halal-Certified Suppliers',
		description:
			'Directory of halal-certified B2B suppliers and manufacturers from major halal markets.',
		itemListElement: suppliers.slice(0, 20).map((s: any, i: number) => ({
			'@type': 'ListItem',
			position: i + 1,
			item: {
				'@type': 'Organization',
				name: s.name,
				url: `${BASE_URL}/suppliers/${s.slug}`,
				address: { '@type': 'PostalAddress', addressCountry: s.country }
			}
		}))
	};

	return {
		seo: {
			title: 'Halal-Certified Suppliers — HalalNeo',
			description:
				'Discover halal-certified suppliers and manufacturers from Southeast Asia to the Gulf. Verified B2B partners for global trade.',
			ogImage: 'https://halalneo.com/api/media/og-suppliers.png',
			keywords: ['halal suppliers', 'certified manufacturers', 'B2B suppliers', 'halal trade partners']
		},
		suppliers,
		products,
		itemList
	};
};
