import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	const catRes = await fetch('/api/categories?limit=100');
	const categories = catRes.ok ? ((((await catRes.json()) as any)).items ?? []) : [];

	return {
		seo: {
			title: 'Post a Buying Request — Halal RFQ',
			description:
				'Post your halal sourcing need — free, 1 request per week. Suppliers quote directly, no middlemen.',
			ogImage: 'https://halalneo.com/api/media/og-default.png',
			robots: 'noindex, nofollow'
		},
		categories: categories.map((c: any) => ({ slug: c.slug, name: c.name }))
	};
};
