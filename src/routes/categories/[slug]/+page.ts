import { error } from '@sveltejs/kit';
import type { EntryGenerator, PageLoad } from './$types';

export const entries: EntryGenerator = () => [];

export const load: PageLoad = async ({ params, fetch }) => {
	try {
		const [catRes, productsRes] = await Promise.all([
			fetch(`/api/categories/${params.slug}`),
			fetch(`/api/products?categorySlug=${params.slug}&limit=50`)
		]);

		if (!catRes.ok) throw error(404, 'Category not found');

		const category = await catRes.json();
		const products = productsRes.ok ? (await productsRes.json()).items ?? [] : [];

		return {
			seo: {
				title: `${category.name ?? params.slug} — HalalNeo`,
				description: category.description || `Browse halal-certified products in the ${category.name ?? params.slug} category.`,
				ogImage: 'https://halalneo.com/og-default.svg',
				keywords: [category.name, 'halal products', 'halal certification']
			},
			category,
			products
		};
	} catch (e: any) {
		if (e?.status === 404) throw e;
		throw error(404, 'Category not found');
	}
};
