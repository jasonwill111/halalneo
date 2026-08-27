import type { EntryGenerator } from './$types';

export const prerender = false;

export const entries: EntryGenerator = () => [];

export const load = async ({ params }) => {
	return {
		seo: {
			title: `${params.slug} — HalalNeo Tools`,
			description: `Use the ${params.slug} tool on HalalNeo — resources for halal certification and compliance.`
		},
		item: null as {
			name: string;
			category: string;
			description: string;
			about: string;
		} | null
	};
};
