import { error, isHttpError } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { readItems, readJson } from '#lib/utils/api-response.js';
import type { SuccessStoryItem } from '#lib/types/api.js';
import type { SupplierListItem } from '#lib/schemas/suppliers.js';

export const load: PageLoad = async ({ params, fetch }) => {
	try {
		const [res, supRes] = await Promise.all([
			fetch(`/api/success-stories/${params.slug}`),
			fetch('/api/suppliers?limit=100&status=active')
		]);

		if (!res.ok) throw error(404, 'Story not found');

		const story = await readJson<SuccessStoryItem>(res);
		const suppliers = await readItems<SupplierListItem>(supRes);
		const supplierName =
			suppliers.find((s) => s.slug === story.supplierSlug)?.name ?? story.supplierSlug;

		const listRes = await fetch('/api/success-stories?limit=10');
		const related = (await readItems<SuccessStoryItem>(listRes))
			.filter((s) => s.slug !== params.slug)
			.slice(0, 3);

		return {
			seo: {
				title: `${story.title ?? 'Success story'} — HalalNeo`,
				description: (story.excerpt || story.body || '').slice(0, 155),
				ogImage: 'https://halalneo.com/brand/og-default.png',
				ogType: 'article'
			},
			slug: params.slug,
			story,
			supplierName,
			related
		};
	} catch (e: unknown) {
		if (isHttpError(e) && e.status === 404) throw e;
		throw error(404, 'Story not found');
	}
};
