import { error, isHttpError } from '@sveltejs/kit';
import type { EntryGenerator, PageLoad } from './$types';
import { readJson } from '#lib/utils/api-response.js';
import type { PageDto } from '#lib/schemas/pages.js';

export const entries: EntryGenerator = () => [];

/** `/api/pages/[slug]` row; `content` is the legacy key the template renders. */
interface PageItem extends PageDto {
	content?: string | null;
}

export const load: PageLoad = async ({ params, fetch }) => {
	try {
		const res = await fetch(`/api/pages/${params.slug}`);
		if (res.ok) {
			const data: PageItem = await readJson<PageItem>(res);
			return {
				seo: {
					title: data.title ? `${data.title} — HalalNeo` : `${params.slug} — HalalNeo`,
				description:
					data.metaDescription ||
					`HalalNeo — ${params.slug}. Halal trade intelligence, certification guides, and market entry resources.`,
					ogImage: data.featuredImage || 'https://halalneo.com/brand/og-default.png',
					keywords: data.keywords || []
				},
				item: data
			};
		}
		throw error(404, 'Page not found');
	} catch (e: unknown) {
		if (isHttpError(e) && e.status === 404) throw e;
		throw error(404, 'Page not found');
	}
};
