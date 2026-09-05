import type { PageLoad } from './$types';

export const prerender = false;

export const load: PageLoad = async ({ fetch }) => {
	const [suppliersRes, productsRes, kbRes, certifiersRes] = await Promise.all([
		fetch('/api/suppliers?limit=100'),
		fetch('/api/products?limit=100'),
		fetch('/api/knowledge-base/sections'),
		fetch('/api/certifying-bodies?limit=100')
	]);

	const suppliers = suppliersRes.ok ? ((await suppliersRes.json()) as { items?: any[] }).items ?? [] : [];
	const products = productsRes.ok ? ((await productsRes.json()) as { items?: any[] }).items ?? [] : [];
	const kbSections = kbRes.ok ? ((await kbRes.json()) as { items?: any[] }).items ?? [] : [];
	const certifiers = certifiersRes.ok ? ((await certifiersRes.json()) as { items?: any[] }).items ?? [] : [];

	const supplierCount = suppliers.filter((s: any) => s.status === 'active').length;
	const marketCountries = [...new Set(suppliers.map((s: any) => s.country))].length;

	return {
		seo: {
			title: 'About HalalNeo —Global Halal Trade Intelligence',
			description:
				'Learn about HalalNeo —connecting halal-certified manufacturers with international B2B buyers. Your trusted platform for halal trade intelligence.',
			ogImage: 'https://halalneo.com/api/media/og-about.png',
			keywords: ['about HalalNeo', 'halal trade platform', 'B2B marketplace', 'halal certification']
		},
		stats: {
			supplierCount,
			productCount: products.length,
			marketCountries,
			kbSectionCount: kbSections.length,
			certifierCount: certifiers.length,
			totalListings: products.length + kbSections.length
		},
		kbSections,
		certifiers
	};
};
