import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	const [rfqRes, catRes] = await Promise.all([
		fetch('/api/rfqs?limit=100'),
		fetch('/api/categories?limit=100')
	]);

	const rfqs = rfqRes.ok ? ((((await rfqRes.json()) as any)).items ?? []) : [];
	const categories = catRes.ok ? ((((await catRes.json()) as any)).items ?? []) : [];

	return {
		seo: {
			title: 'Buying Requests — Halal Sourcing RFQs',
			description:
				'Live buying requests from halal buyers worldwide. Quote directly on sourcing needs for certified food, cosmetics, pharma and ingredients.',
			ogImage: 'https://halalneo.com/api/media/og-default.png',
			keywords: ['halal RFQ', 'buying requests', 'halal sourcing', 'trade leads']
		},
		rfqs,
		categories: categories.map((c: any) => ({ slug: c.slug, name: c.name }))
	};
};
