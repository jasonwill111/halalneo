import type { PageLoad } from './$types';

export const prerender = false;

export const load: PageLoad = async ({ fetch }) => {
	const res = await fetch('/api/pages?type=blog&limit=20');
	const posts = res.ok ? (await res.json()).items ?? [] : [];
	const postsParsed = posts.map((p: any) => ({
		...p,
		tags: typeof p.tags === 'string' ? JSON.parse(p.tags || '[]') : p.tags ?? [],
	}));

	return {
		seo: {
			title: 'Halal Trade Blog —HalalNeo',
			description:
				'Industry insights, market reports, and updates on halal trade, certification, and medical device compliance.',
			ogImage: 'https://halalneo.com/og-blog.png',
			keywords: ['halal blog', 'halal trade news', 'certification updates', 'market reports']
		},
		posts: postsParsed
	};
};
