import type { EntryGenerator } from './$types';

export const entries: EntryGenerator = () => [];

export const load = async ({ params }) => {
	return {
		seo: {
			title: `${params.slug} — HalalNeo`,
			description: `Browse halal-certified products in the ${params.slug} category on HalalNeo.`
		},
		item: null as {
			name: string;
			description: string;
			productCount: number;
			products: { name: string; slug: string; description: string }[];
		} | null
	};
};
