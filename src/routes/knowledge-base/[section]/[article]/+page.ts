import type { EntryGenerator } from './$types';

export const prerender = false;

export const entries: EntryGenerator = () => [];

export const load = async ({ params }) => {
	return {
		seo: {
			title: `${params.article} — HalalNeo Knowledge Base`,
			description: `Read about ${params.article} in the HalalNeo knowledge base — halal certification guidance and compliance resources.`
		},
		item: null as {
			title: string;
			summary: string;
			sectionName: string;
			sectionSlug: string;
			readTime: string;
			content: string;
		} | null
	};
};
