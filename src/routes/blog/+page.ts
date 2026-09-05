import type { PageLoad } from './$types';

const BASE_URL = 'https://halalneo.com';

export const prerender = false;

export const load: PageLoad = async ({ fetch }) => {
	const res = await fetch('/api/pages?type=blog&limit=20');
	const posts = res.ok ? (await res.json()).items ?? [] : [];
	const postsParsed = posts.map((p: any) => ({
		...p,
		tags: typeof p.tags === 'string' ? JSON.parse(p.tags || '[]') : p.tags ?? [],
	}));

	const itemList = {
		'@context': 'https://schema.org',
		'@type': 'ItemList',
		name: 'Halal Trade Blog',
		description: 'Industry insights, market reports, and updates on halal trade, certification, and sourcing.',
		itemListElement: postsParsed.slice(0, 20).map((p: any, i: number) => ({
			'@type': 'ListItem',
			position: i + 1,
			item: {
				'@type': 'BlogPosting',
				headline: p.title,
				url: `${BASE_URL}/blog/${p.slug}`,
				datePublished: p.publishedAt
			}
		}))
	};

	return {
		seo: {
			title: 'Halal Trade Blog — HalalNeo',
			description:
				'Industry insights, market reports, and updates on halal trade, certification, and sourcing.',
			ogImage: 'https://halalneo.com/api/media/og-blog.svg',
			keywords: ['halal blog', 'halal trade news', 'certification updates', 'market reports']
		},
		posts: postsParsed,
		itemList
	};
};
