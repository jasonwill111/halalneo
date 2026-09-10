import type { EntryGenerator, PageLoad } from './$types';

export const entries: EntryGenerator = () => [];

interface ProviderItem {
	slug?: string;
	name?: string;
	metaTitle?: string;
	metaDescription?: string;
	description?: string;
	type?: string;
	country?: string;
	website?: string;
	email?: string;
	phone?: string;
	whatsapp?: string;
	line?: string;
	rating?: number;
	status?: string;
}

export const load: PageLoad = async ({ params, fetch }) => {
	try {
		const res = await fetch(`/api/service-providers/${params.slug}`);
		if (res.ok) {
			const data: ProviderItem = (await res.json()) as any;
			const relatedRes = await fetch(`/api/service-providers?type=${data.type}&limit=5`);
			const relatedData = relatedRes.ok ? ((await relatedRes.json()) as any) : { items: [] };
			const related = (relatedData.items ?? []).filter((p: ProviderItem) => p.slug !== params.slug).slice(0, 4);
			return {
				seo: {
					// DB per-row meta wins when admins filled it; else derive.
					title: data.metaTitle || (data.name ? `${data.name} — HalalNeo` : `${params.slug} — HalalNeo`),
					description:
						data.metaDescription ||
						data.description ||
						`${data.name || params.slug} — halal service provider (${data.type || 'specialist'}) in ${data.country || 'worldwide'}. View details on HalalNeo.`,
					ogImage: 'https://halalneo.com/api/media/og-services.png',
					keywords: [data.name, 'halal service provider', data.type, data.country].filter(Boolean)
				},
				item: data,
				slug: params.slug,
				related
			};
		}
	} catch {}

	return {
		seo: {
			title: `${params.slug} — HalalNeo`,
			description: `${params.slug} — halal service provider on HalalNeo.`,
			ogImage: 'https://halalneo.com/api/media/og-default.png',
			robots: 'noindex, nofollow'
		},
		item: null,
		slug: params.slug,
		related: []
	};
};
