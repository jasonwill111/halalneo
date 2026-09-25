import type { PageLoad } from './$types';
import { fetchSafe, firstFailure, type LoadFailure } from '#lib/utils/load-error.js';
import { readItems, readTotal } from '#lib/utils/api-response.js';
import type { ProductListItem } from '#lib/schemas/products.js';
import type { SupplierListItem } from '#lib/schemas/suppliers.js';

const BASE_URL = 'https://halalneo.com';

export const prerender = false;

/**
 * `/api/suppliers` and `/api/products` list rows are projected (§5.9.3) and never carry
 * the JSON TEXT columns, so the defensive parses below collapse to their fallbacks —
 * kept as-is because the cards render those arrays.
 */
type SupplierCard = SupplierListItem & {
	certifications?: string | unknown[] | null;
	mainMarkets?: string | unknown[] | null;
};
type SupplierProduct = ProductListItem & { features?: string | unknown[] | null };

export const load: PageLoad = async ({ fetch }) => {
	const failures: LoadFailure[] = [];
	const [suppliersRes, productsRes, certifiersRes] = await Promise.all([
		fetchSafe(fetch, '/api/suppliers?limit=100&status=active', failures),
		fetchSafe(fetch, '/api/products?limit=100', failures),
		fetchSafe(fetch, '/api/certifying-bodies?limit=1', failures)
	]);

	const suppliers = (await readItems<SupplierCard>(suppliersRes)).map((s) => ({
		...s,
		certifications:
			typeof s.certifications === 'string'
				? (JSON.parse(s.certifications || '[]') as string[])
				: (s.certifications ?? []),
		mainMarkets:
			typeof s.mainMarkets === 'string'
				? (JSON.parse(s.mainMarkets || '[]') as string[])
				: (s.mainMarkets ?? [])
	}));
	const products = (await readItems<SupplierProduct>(productsRes)).map((p) => ({
		...p,
		features:
			typeof p.features === 'string'
				? (JSON.parse(p.features || '[]') as string[])
				: (p.features ?? [])
	}));
	// Response shape (verified against /api/certifying-bodies handler): { items, total, limit, offset }
	const certifierCount = await readTotal(certifiersRes);

	const itemList = {
		'@context': 'https://schema.org',
		'@type': 'ItemList',
		name: 'Halal-Certified Suppliers',
		description:
			'Directory of halal-certified B2B suppliers and manufacturers from major halal markets.',
		itemListElement: suppliers.slice(0, 20).map((s, i) => ({
			'@type': 'ListItem',
			position: i + 1,
			item: {
				'@type': 'Organization',
				name: s.name,
				url: `${BASE_URL}/supplier/${s.slug}`,
				address: { '@type': 'PostalAddress', addressCountry: s.country }
			}
		}))
	};

	return {
		seo: {
			title: 'Halal-Certified Suppliers — HalalNeo',
			description:
				'Discover halal-certified suppliers and manufacturers from Southeast Asia to the Gulf. Verified B2B partners for global trade.',
			ogImage: 'https://halalneo.com/brand/og-default.png',
			keywords: [
				'halal suppliers',
				'certified manufacturers',
				'B2B suppliers',
				'halal trade partners'
			]
		},
		suppliers,
		businessTypes: [...new Set(suppliers.flatMap((s) => (s.businessType ? [s.businessType] : [])))],
		products,
		certifierCount,
		itemList,
		loadError: firstFailure(failures)
	};
};
