import type { EntryGenerator } from './$types';

export const entries: EntryGenerator = () => [];

export const load = async ({ params }) => {
	return {
		seo: {
			title: `${params.section} — HalalNeo Knowledge Base`,
			description: `Explore articles and guides in the ${params.section} section of the HalalNeo knowledge base.`
		},
		item: null as {
			name: string;
			slug: string;
			description: string;
			articleCount: number;
			articles: { title: string; slug: string; summary: string }[];
		} | null
	};
};
