import type { PageLoad } from './$types';
import { fetchSafe, firstFailure, type LoadFailure } from '#lib/utils/load-error.js';
import { readItems } from '#lib/utils/api-response.js';
import type { PromotionItem } from '#lib/types/api.js';
import type { SupplierListItem } from '#lib/schemas/suppliers.js';

export const load: PageLoad = async ({ fetch }) => {
	const failures: LoadFailure[] = [];
	const [promoRes, supRes] = await Promise.all([
		fetchSafe(fetch, '/api/promotions?limit=100', failures),
		fetchSafe(fetch, '/api/suppliers?limit=100&status=active', failures)
	]);

	const promos = await readItems<PromotionItem>(promoRes);
	const suppliers = await readItems<SupplierListItem>(supRes);
	const names: Record<string, string> = {};
	for (const s of suppliers) names[s.slug] = s.name;

	return {
		seo: {
			title: 'Quick Deals — Halal Clearance Offers',
			description:
				'Time-boxed clearance deals from halal suppliers: discounted food, cosmetics, pharma and ingredients while stock lasts.',
			ogImage: 'https://halalneo.com/brand/og-default.png',
			keywords: ['halal deals', 'clearance', 'wholesale offers', 'halal promotions']
		},
		promos,
		supplierNames: names,
		loadError: firstFailure(failures)
	};
};
