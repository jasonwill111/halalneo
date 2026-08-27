import type { EntryGenerator } from './$types';

export const entries: EntryGenerator = () => [];

export const load = async ({ params }) => {
	return {
		seo: {
			title: `${params.slug} — HalalNeo`,
			description: `Supplier profile for ${params.slug} on HalalNeo — halal-certified medical device and pharmaceutical suppliers.`
		},
		item: null as {
			name: string;
			description: string;
			location: string;
			founded: string;
			certifications: string[];
			products: { name: string; slug: string }[];
		} | null
	};
};
