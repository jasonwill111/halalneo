import type { EntryGenerator } from './$types';

export const entries: EntryGenerator = () => [];

export const load = async ({ params }) => {
	return {
		seo: {
			title: `${params.slug} — HalalNeo Blog`,
			description: `Read about ${params.slug} on the HalalNeo blog — insights on halal certification and medical device compliance.`
		},
		item: null as {
			title: string;
			tags: string[];
			date: string;
			author: { name: string; initials: string };
			content: string;
		} | null
	};
};
