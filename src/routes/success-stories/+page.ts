import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	const res = await fetch('/api/success-stories?limit=50');
	const stories = res.ok ? ((((await res.json()) as any)).items ?? []) : [];

	return {
		seo: {
			title: 'Success Stories — Halal Trade Wins',
			description:
				'Real deals closed on HalalNeo: buyers who sourced certified suppliers, suppliers who won export orders.',
			ogImage: 'https://halalneo.com/api/media/og-default.png',
			keywords: ['halal success stories', 'trade case studies', 'export wins']
		},
		stories
	};
};
