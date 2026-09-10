import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, fetch }) => {
	const [showRes, listRes] = await Promise.all([
		fetch(`/api/trade-shows/${params.id}`),
		fetch('/api/trade-shows?limit=50')
	]);

	if (!showRes.ok) {
		error(404, { message: 'Trade show not found' });
	}

	const show: any = await showRes.json();
	const allShows: any[] = listRes.ok ? (((await listRes.json()) as any).items ?? []) : [];
	const related = allShows
		.filter((s: any) => s.id !== show.id)
		.filter((s: any) => s.region === show.region)
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
