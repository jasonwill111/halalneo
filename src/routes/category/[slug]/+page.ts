import { error, isHttpError } from '@sveltejs/kit';
import type { EntryGenerator, PageLoad } from './$types';
import { readItems, readJson } from '#lib/utils/api-response.js';
import type { CategoryRecord } from '#lib/schemas/categories.js';
import type { ProductListItem } from '#lib/schemas/products.js';

export const entries: EntryGenerator = () => [];

/**
 * `/api/knowledge-base` list projection (`getKbListItems`): `excerpt` carries the
 * summary and there is no `tags`/`sectionSlug` — the matcher and the card link
 * below keep reading them defensively, hence the optional keys.
 */
interface KbListRow {
	slug: string;
	title: string | null;
	section: string | null;
	status: string | null;
	excerpt: string | null;
	views: number | null;
	summary?: string | null;
	tags?: string | string[] | null;
	sectionSlug?: string | null;
}

/** `ProductListItem` plus the optional column the card template falls back to. */
interface CategoryProductItem extends ProductListItem {
	originCountry?: string | null;
}

export const load: PageLoad = async ({ params, fetch }) => {
	try {
		const [catRes, productsRes, kbRes] = await Promise.all([
			fetch(`/api/categories/${params.slug}`),
			fetch(`/api/products?categorySlug=${params.slug}&limit=100`),
			fetch('/api/knowledge-base?limit=100')
		]);

		if (!catRes.ok) throw error(404, 'Category not found');

		const category = await readJson<CategoryRecord>(catRes);
		const products = await readItems<CategoryProductItem>(productsRes);
		const allArticles = await readItems<KbListRow>(kbRes);
		const catName = (category.name ?? params.slug).toLowerCase();
		const relatedArticles = allArticles
			.filter((a) => {
				const t = (a.title ?? '').toLowerCase();
				const s = (a.summary ?? '').toLowerCase();
				const tags =
					typeof a.tags === 'string' ? (JSON.parse(a.tags || '[]') as string[]) : (a.tags ?? []);
				return (
					tags.some((tag) => tag.toLowerCase().includes(catName)) ||
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
				ogImage: 'https://halalneo.com/brand/og-default.png',
				keywords: [category.name, 'halal products', 'halal certification']
			},
			slug: params.slug,
			category,
			products,
			relatedArticles
		};
	} catch (e: unknown) {
		if (isHttpError(e) && e.status === 404) throw e;
		throw error(404, 'Category not found');
	}
};
