import type { PageLoad } from './$types';

export const prerender = false;

export const load: PageLoad = async ({ fetch }) => {
	const [categoriesRes, productsRes] = await Promise.all([
		fetch('/api/categories'),
		fetch('/api/products?limit=100')
	]);

	const categories = categoriesRes.ok ? (await categoriesRes.json()).items ?? [] : [];
	const products = (productsRes.ok ? (await productsRes.json()).items ?? [] : []).map((p: any) => ({
		...p,
		features: typeof p.features === 'string' ? JSON.parse(p.features || '[]') : p.features ?? [],
	}));

	return {
		seo: {
			title: 'Product Categories —HalalNeo',
			description:
				'Browse halal-certified product categories —food, cosmetics, pharmaceuticals, medical devices, textiles and more.',
			ogImage: 'https://halalneo.com/og-categories.png',
			keywords: ['halal product categories', 'certified product types', 'halal food', 'halal cosmetics']
		},
		categories,
		products
	};
};
