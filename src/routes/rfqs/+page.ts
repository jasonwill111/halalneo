import type { PageLoad } from './$types';
import { fetchSafe, firstFailure, type LoadFailure } from '#lib/utils/load-error.js';
import { readItems } from '#lib/utils/api-response.js';
import type { BuyingRequestItem } from '#lib/types/api.js';
import type { CategoryRecord } from '#lib/schemas/categories.js';

export const load: PageLoad = async ({ fetch }) => {
	const failures: LoadFailure[] = [];
	const [rfqRes, catRes] = await Promise.all([
		fetchSafe(fetch, '/api/rfqs?limit=100', failures),
		fetchSafe(fetch, '/api/categories?limit=100', failures)
	]);

	const rfqs = await readItems<BuyingRequestItem>(rfqRes);
	const categories = await readItems<CategoryRecord>(catRes);

	return {
		seo: {
			title: 'Buying Requests — Halal Sourcing RFQs',
			description:
				'Live buying requests from halal buyers worldwide. Quote directly on sourcing needs for certified food, cosmetics, pharma and ingredients.',
			ogImage: 'https://halalneo.com/brand/og-default.png',
			keywords: ['halal RFQ', 'buying requests', 'halal sourcing', 'trade leads']
		},
		rfqs,
		categories: categories.map((c) => ({ slug: c.slug, name: c.name })),
		loadError: firstFailure(failures)
	};
};
