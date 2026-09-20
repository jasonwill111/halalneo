import type { PageLoad } from './$types';
import { fetchSafe, firstFailure, type LoadFailure } from '#lib/utils/load-error.js';
import { readItems } from '#lib/utils/api-response.js';
import type { PageDto } from '#lib/schemas/pages.js';

export const prerender = false;

export const load: PageLoad = async ({ fetch }) => {
	const failures: LoadFailure[] = [];
	const [glossaryRes] = await Promise.all([
		fetchSafe(fetch, '/api/pages?category=glossary&limit=50', failures)
	]);

	const glossary = (await readItems<PageDto>(glossaryRes)).map((p) => ({
		term: p.title,
		definition: p.body ?? p.excerpt ?? ''
	}));

	return {
		seo: {
			title: 'Search — HalalNeo',
			description:
				'Search halal products, suppliers, certification bodies, and knowledge base articles.',
			ogImage: 'https://halalneo.com/brand/og-default.png',
			keywords: ['halal search', 'find suppliers', 'halal products', 'certification lookup'],
			robots: 'noindex, follow'
		},
		glossary,
		loadError: firstFailure(failures)
	};
};
