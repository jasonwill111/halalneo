import type { PageLoad } from './$types';
import { readItems } from '#lib/utils/api-response.js';
import type { CategoryRecord } from '#lib/schemas/categories.js';

export const load: PageLoad = async ({ fetch }) => {
	const catRes = await fetch('/api/categories?limit=100');
	const categories = await readItems<CategoryRecord>(catRes);

	return {
		seo: {
			title: 'Post a Buying Request — Halal RFQ',
			description:
				'Post your halal sourcing need — free, 1 request per week. Suppliers quote directly, no middlemen.',
			ogImage: 'https://halalneo.com/brand/og-default.png',
			robots: 'noindex, nofollow'
		},
		categories: categories.map((c) => ({ slug: c.slug, name: c.name }))
	};
};
