import type { PageLoad } from './$types';
import { readItems } from '#lib/utils/api-response.js';
import type { SupplierListItem } from '#lib/schemas/suppliers.js';
import type { ProductListItem } from '#lib/schemas/products.js';
import type { CertifyingBodyRecord } from '#lib/schemas/certifying-bodies.js';
import type { MarketGuideDto } from '#lib/schemas/market-guides.js';
import type { TradeShowDto } from '#lib/schemas/trade-shows.js';
import type { KbSectionCountItem } from '#lib/types/api.js';

export const prerender = false;

export const load: PageLoad = async ({ fetch }) => {
	const [suppliersRes, productsRes, kbRes, certifiersRes, guidesRes, showsRes] = await Promise.all([
		fetch('/api/suppliers?limit=100'),
		fetch('/api/products?limit=100'),
		fetch('/api/knowledge-base/sections'),
		fetch('/api/certifying-bodies?limit=100'),
		fetch('/api/market-guides?limit=100'),
		fetch('/api/trade-shows?limit=100')
	]);

	const suppliers = await readItems<SupplierListItem>(suppliersRes);
	const products = await readItems<ProductListItem>(productsRes);
	const kbSections = await readItems<KbSectionCountItem>(kbRes);
	const certifiers = await readItems<CertifyingBodyRecord>(certifiersRes);
	const guides = await readItems<MarketGuideDto>(guidesRes);
	const shows = await readItems<TradeShowDto>(showsRes);

	const supplierCount = suppliers.filter((s) => s.status === 'active').length;
	const marketCountries = [...new Set(suppliers.map((s) => s.country))].length;

	return {
		seo: {
			title: 'About HalalNeo —Global Halal Trade Intelligence',
			description:
				'Learn about HalalNeo —connecting halal-certified manufacturers with international B2B buyers. Your trusted platform for halal trade intelligence.',
			ogImage: 'https://halalneo.com/brand/og-default.png',
			keywords: ['about HalalNeo', 'halal trade platform', 'B2B marketplace', 'halal certification']
		},
		stats: {
			supplierCount,
			productCount: products.length,
			marketCountries,
			kbSectionCount: kbSections.length,
			certifierCount: certifiers.length,
			guideCount: guides.length,
			showCount: shows.length,
			totalListings: products.length + kbSections.length
		},
		kbSections,
		certifiers
	};
};
