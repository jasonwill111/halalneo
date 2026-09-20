import type { PageLoad } from './$types';
import { fetchSafe, firstFailure, type LoadFailure } from '#lib/utils/load-error.js';
import { readList } from '#lib/utils/api-response.js';
import type { PageDto } from '#lib/schemas/pages.js';

export const prerender = false;

const seo = {
	title: 'Halal Trade Glossary — HalalNeo',
	description:
		'80+ professional terms covering halal certification, packaging, trade, finance, logistics and regulation — explained for B2B buyers and suppliers.',
	ogImage: 'https://halalneo.com/brand/og-default.png',
	keywords: [
		'halal glossary',
		'certification terms',
		'trade definitions',
		'logistics vocabulary',
		'islamic finance terms'
	]
};

export const load: PageLoad = async ({ fetch }) => {
	// §3.1: a failed request must surface as an error state, never as an empty glossary.
	const failures: LoadFailure[] = [];
	const res = await fetchSafe(fetch, '/api/pages?category=glossary&limit=200', failures);
	const data = await readList<PageDto>(res);
	const terms = (data.items ?? []).map((p) => ({
		term: p.title,
		definition: p.body ?? p.excerpt ?? '',
		tags:
			typeof p.tags === 'string'
				? (JSON.parse(p.tags || '[]') as string[])
				: Array.isArray(p.tags)
					? p.tags
					: []
	}));

	return {
		seo,
		terms,
		loadError: firstFailure(failures)
	};
};
