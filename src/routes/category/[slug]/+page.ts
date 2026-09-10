import { error } from '@sveltejs/kit';
import type { EntryGenerator, PageLoad } from './$types';

export const entries: EntryGenerator = () => [];

export const load: PageLoad = async ({ params, fetch }) => {
	try {
		const [catRes, productsRes, kbRes] = await Promise.all([
			fetch(`/api/categories/${params.slug}`),
			fetch(`/api/products?categorySlug=${params.slug}&limit=100`),
			fetch('/api/knowledge-base?limit=100')
		]);

		if (!catRes.ok) throw error(404, 'Category not found');

		const category = (await catRes.json()) as any;
		const products = productsRes.ok ? (((await productsRes.json()) as { items?: any[] }).items ?? []) : [];
		const allArticles = kbRes.ok ? (((await kbRes.json()) as { items?: any[] }).items ?? []) : [];
		const catName = (category.name ?? params.slug).toLowerCase();
		const relatedArticles = allArticles
			.filter((a: any) => {
				const t = (a.title ?? '').toLowerCase();
				const s = (a.summary ?? '').toLowerCase();
				const tags = typeof a.tags === 'string' ? JSON.parse(a.tags || '[]') : (a.tags ?? []);
				return (
					tags.some((tag: string) => tag.toLowerCase().includes(catName)) ||
					t.includes(catName) ||
					s.includes(catName)
				);
			})
			.slice(0, 3);

		return {
			seo: {
				title: `${category.name ?? params.slug} — HalalNeo`,
				description:
					category.description ||
					`Browse halal-certified products in the ${category.name ?? params.slug} category.`,
				ogImage: 'https://halalneo.com/api/media/og-default.png',
				keywords: [category.name, 'halal products', 'halal certification']
			},
			slug: params.slug,
			category,
			products,
			relatedArticles
		};
	} catch (e: any) {
		if (e?.status === 404) throw e;
		throw error(404, 'Category not found');
	}
};
