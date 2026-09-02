import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, fetch }) => {
	const [guideRes, allGuidesRes] = await Promise.all([
		fetch(`/api/market-guides/${params.country}`),
		fetch('/api/market-guides?limit=50')
	]);

	if (!guideRes.ok) {
		error(404, { message: 'Market guide not found' });
	}

	const guide = await guideRes.json();
	const allGuides = allGuidesRes.ok ? (await allGuidesRes.json()).items ?? [] : [];

	return {
		guide,
		allGuides,
		seo: {
			title: `Halal Market Guide: ${guide.country} — Certifiers, Requirements & Costs`,
			description: (guide.summary || '').slice(0, 155),
			ogImage: 'https://halalneo.com/og-default.svg'
		}
	};
};
