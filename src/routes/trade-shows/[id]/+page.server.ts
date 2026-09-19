import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { readItems, readJson } from '#lib/utils/api-response.js';
import type { TradeShowDto } from '#lib/schemas/trade-shows.js';

export const load: PageServerLoad = async ({ params, fetch }) => {
	const [showRes, listRes] = await Promise.all([
		fetch(`/api/trade-shows/${params.id}`),
		fetch('/api/trade-shows?limit=50')
	]);

	if (!showRes.ok) {
		error(404, { message: 'Trade show not found' });
	}

	const show: TradeShowDto = await readJson<TradeShowDto>(showRes);
	const allShows = await readItems<TradeShowDto>(listRes);
	const related = allShows
		.filter((s) => s.id !== show.id)
		.filter((s) => s.region === show.region)
		.slice(0, 3);

	return {
		show,
		related,
		seo: {
			// DB per-row meta wins when admins filled it; else derive.
			title: show.metaTitle || `${show.name} — ${show.city}, ${show.country} | HalalNeo`,
			description:
				show.metaDescription ||
				(show.description || `${show.name} in ${show.city}, ${show.country}.`).slice(0, 155),
			ogImage: 'https://halalneo.com/api/media/og-default.png',
			keywords: [show.name, show.city, show.country, 'halal trade show', show.region].filter(Boolean)
		}
	};
};
