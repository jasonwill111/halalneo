import { error } from '@sveltejs/kit';
import type { EntryGenerator, PageLoad } from './$types';

export const entries: EntryGenerator = () => [];

interface PageItem {
	title?: string;
	content?: string;
	metaDescription?: string;
	featuredImage?: string;
	keywords?: string[];
}

export const load: PageLoad = async ({ params, fetch }) => {
	try {
		const res = await fetch(`/api/pages/${params.slug}`);
		if (res.ok) {
			const data: PageItem = (await res.json()) as any;
			return {
				seo: {
					title: data.title ? `${data.title} — HalalNeo` : `${params.slug} — HalalNeo`,
				description:
					data.metaDescription ||
					`HalalNeo — ${params.slug}. Halal trade intelligence, certification guides, and market entry resources.`,
					ogImage: data.featuredImage || 'https://halalneo.com/api/media/og-default.png',
					keywords: data.keywords || []
				},
				item: data
			};
		}
		throw error(404, 'Page not found');
	} catch (e: any) {
		if (e?.status === 404) throw e;
		throw error(404, 'Page not found');
	}
};
