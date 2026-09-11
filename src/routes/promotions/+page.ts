import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	const [promoRes, supRes] = await Promise.all([
		fetch('/api/promotions?limit=100'),
		fetch('/api/suppliers?limit=100&status=active')
	]);

	const promos = promoRes.ok ? ((((await promoRes.json()) as any)).items ?? []) : [];
	const suppliers = supRes.ok ? ((((await supRes.json()) as any)).items ?? []) : [];
	const names: Record<string, string> = {};
	for (const s of suppliers) names[s.slug] = s.name;

	return {
		seo: {
			title: 'Quick Deals — Halal Clearance Offers',
			description:
				'Time-boxed clearance deals from halal suppliers: discounted food, cosmetics, pharma and ingredients while stock lasts.',
			ogImage: 'https://halalneo.com/api/media/og-default.png',
			keywords: ['halal deals', 'clearance', 'wholesale offers', 'halal promotions']
		},
		promos,
		supplierNames: names
	};
};
