import type { PageLoad } from './$types';
import { fetchSafe, firstFailure, type LoadFailure } from '#lib/utils/load-error.js';
import { readItems } from '#lib/utils/api-response.js';
import type { ProductListItem } from '#lib/schemas/products.js';
import type { SupplierListItem } from '#lib/schemas/suppliers.js';
import type { CategoryRecord } from '#lib/schemas/categories.js';

const BASE_URL = 'https://halalneo.com';

export const prerender = false;

/**
 * `/api/products` and `/api/suppliers` list rows are projected (§5.9.3) and never carry
 * the JSON TEXT columns, so the defensive parses below collapse to their fallbacks —
 * kept as-is because the cards render those arrays.
 */
type CatalogueProduct = ProductListItem & {
	features?: string | unknown[] | null;
	images?: string | unknown[] | null;
};
type CatalogueSupplier = SupplierListItem & {
	certifications?: string | unknown[] | null;
	mainMarkets?: string | unknown[] | null;
};

export const load: PageLoad = async ({ fetch }) => {
	const failures: LoadFailure[] = [];
	const [productsRes, suppliersRes, categoriesRes] = await Promise.all([
		fetchSafe(fetch, '/api/products?limit=100', failures),
		fetchSafe(fetch, '/api/suppliers?limit=100', failures),
		fetchSafe(fetch, '/api/categories', failures)
	]);

	const products = (await readItems<CatalogueProduct>(productsRes)).map((p) => ({
		...p,
		features: typeof p.features === 'string' ? (JSON.parse(p.features || '[]') as string[]) : p.features ?? [],
		images: typeof p.images === 'string' ? (JSON.parse(p.images || '[]') as string[]) : p.images ?? [],
	}));
	const suppliers = (await readItems<CatalogueSupplier>(suppliersRes)).map((s) => ({
		...s,
		certifications: typeof s.certifications === 'string' ? (JSON.parse(s.certifications || '[]') as string[]) : s.certifications ?? [],
		mainMarkets: typeof s.mainMarkets === 'string' ? (JSON.parse(s.mainMarkets || '[]') as string[]) : s.mainMarkets ?? []
	}));
	const categories = await readItems<CategoryRecord>(categoriesRes);

	const itemList = {
		'@context': 'https://schema.org',
		'@type': 'ItemList',
		name: 'Halal-Certified Products',
		description:
			'Browse halal-certified products from verified suppliers across major halal markets.',
		itemListElement: products.slice(0, 20).map((p, i) => ({
			'@type': 'ListItem',
			position: i + 1,
			item: {
				'@type': 'Product',
				name: p.name,
				url: `${BASE_URL}/product/${p.slug}`,
				category: p.categorySlug,
				offers: p.priceMin
					? { '@type': 'Offer', priceCurrency: 'USD', price: p.priceMin }
					: undefined
			}
		}))
	};

	return {
		seo: {
			title: 'Halal-Certified Products — HalalNeo',
			description:
				'Browse halal-certified products from verified suppliers worldwide. Food, beverages, cosmetics and nutritional products.',
			ogImage: 'https://halalneo.com/brand/og-default.png',
			keywords: ['halal products', 'certified suppliers', 'B2B marketplace', 'halal food']
		},
		products,
		suppliers,
		categories,
		itemList,
		loadError: firstFailure(failures)
	};
};
