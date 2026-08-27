import type { EntryGenerator } from './$types';

export const entries: EntryGenerator = () => [];

export const load = async ({ params }) => {
	return {
		seo: {
			title: `${params.slug} — HalalNeo`,
			description: `Product details for ${params.slug} on HalalNeo — halal-certified medical devices and pharmaceuticals.`
		},
		item: null as {
			name: string;
			category: string;
			certification: string;
			description: string;
			supplier: string;
		} | null
	};
};
