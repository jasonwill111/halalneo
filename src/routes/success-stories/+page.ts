import type { PageLoad } from './$types';
import { fetchSafe, firstFailure, type LoadFailure } from '#lib/utils/load-error.js';
import { readItems } from '#lib/utils/api-response.js';
import type { SuccessStoryItem } from '#lib/types/api.js';

const BASE_URL = 'https://halalneo.com';

export const load: PageLoad = async ({ fetch }) => {
	const failures: LoadFailure[] = [];
	const res = await fetchSafe(fetch, '/api/success-stories?limit=50', failures);
	const stories = await readItems<SuccessStoryItem>(res);

	const itemList = {
		'@context': 'https://schema.org',
		'@type': 'ItemList',
		name: 'HalalTrade Success Stories',
		description:
			'Case studies of real deals closed on HalalNeo: suppliers winning export orders and buyers sourcing certified products.',
		itemListElement: stories.slice(0, 50).map((story, i) => ({
			'@type': 'ListItem',
			position: i + 1,
			item: {
				'@type': 'NewsArticle',
				name: story.title,
				description: story.excerpt,
				url: `${BASE_URL}/success-stories/${story.slug}`,
				datePublished: story.publishedAt,
				dateModified: story.updatedAt
			}
		}))
	};

	return {
		seo: {
			title: 'Success Stories — Halal Trade Wins',
			description:
				'Real deals closed on HalalNeo: buyers who sourced certified suppliers, suppliers who won export orders.',
			ogImage: 'https://halalneo.com/api/media/og-default.png',
			keywords: ['halal success stories', 'trade case studies', 'export wins']
		},
		stories,
		itemList,
		loadError: firstFailure(failures)
	};
};
