import type { EntryGenerator } from './$types';

export const entries: EntryGenerator = () => [];

export const load = async ({ params }) => {
	return {
		seo: {
			title: `${params.slug} — HalalNeo`,
			description: `HalalNeo — ${params.slug}. Global halal-certified medical device and pharmaceutical solutions.`
		},
		item: null as {
			title: string;
			content: string;
		} | null
	};
};
