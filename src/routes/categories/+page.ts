import type { PageLoad } from './$types';
import { fetchSafe, firstFailure, type LoadFailure } from '#lib/utils/load-error.js';
import { readItems } from '#lib/utils/api-response.js';
import type { CategoryRecord } from '#lib/schemas/categories.js';
import type { ProductListItem } from '#lib/schemas/products.js';

export const prerender = false;

export const load: PageLoad = async ({ fetch }) => {
	const failures: LoadFailure[] = [];
	const [categoriesRes, productsRes] = await Promise.all([
		fetchSafe(fetch, '/api/categories', failures),
		fetchSafe(fetch, '/api/products?limit=100', failures)
	]);

	const categories = await readItems<CategoryRecord>(categoriesRes);
	// `/api/products` list rows are projected (§5.9.3) and carry no `features` column,
	// so the defensive parse below collapses to `[]` — kept because the cards render it.
	const products = (await readItems<ProductListItem & { features?: string | unknown[] | null }>(productsRes)).map((p) => ({
		...p,
		features: typeof p.features === 'string' ? (JSON.parse(p.features || '[]') as string[]) : p.features ?? [],
	}));

 	return {
 		seo: {
 			title: 'Product Categories — HalalNeo',
 			description:
 				'Browse halal-certified product categories —food, beverages, cosmetics, nutritional supplements and more.',
 			ogImage: 'https://halalneo.com/brand/og-default.png',
 			keywords: ['halal product categories', 'certified product types', 'halal food', 'halal cosmetics']
 		},
 		categories,
 		products,
 		loadError: firstFailure(failures),
 		itemList: {
 			'@context': 'https://schema.org',
 			'@type': 'ItemList',
 			'itemListElement': categories.map((cat, i) => ({
 				'@type': 'ListItem',
 				'position': i + 1,
 				'item': {
 					'@type': 'Thing',
 					'name': cat.name,
 					'description': cat.description,
 					'url': `/category/${cat.slug}`
 				}
 			}))
 		}
 	};
};
