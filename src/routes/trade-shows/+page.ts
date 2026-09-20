import type { PageLoad } from './$types';
import { fetchSafe, firstFailure, type LoadFailure } from '#lib/utils/load-error.js';
import { readList } from '#lib/utils/api-response.js';
import type { TradeShowDto } from '#lib/schemas/trade-shows.js';

export const prerender = false;

export const load: PageLoad = async ({ fetch }) => {
	const failures: LoadFailure[] = [];
	const res = await fetchSafe(fetch, '/api/trade-shows?limit=50', failures);
	const data = await readList<TradeShowDto>(res);

	return {
		shows: data.items ?? [],
		loadError: firstFailure(failures),
		seo: {
			title: 'Global Halal Trade Shows & Exhibitions — Calendar & Events',
			description:
				'Calendar of halal trade shows, exhibitions, and industry events worldwide — MIHAS, Gulfood, Halal Expo Istanbul and more.',
			ogImage: 'https://halalneo.com/brand/og-default.png',
			keywords: ['halal trade show', 'halal exhibition', 'MIHAS', 'Gulfood', 'halal expo']
		}
	};
};
