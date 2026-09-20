import type { EntryGenerator, PageLoad } from './$types';
import { readItems, readJson } from '#lib/utils/api-response.js';
import type { ServiceProviderRecord } from '#lib/schemas/service-providers.js';

export const entries: EntryGenerator = () => [];

export const load: PageLoad = async ({ params, fetch }) => {
	try {
		const res = await fetch(`/api/service-providers/${params.slug}`);
		if (res.ok) {
			const data: ServiceProviderRecord = await readJson<ServiceProviderRecord>(res);
			const relatedRes = await fetch(`/api/service-providers?type=${data.type}&limit=5`);
			const related = (await readItems<ServiceProviderRecord>(relatedRes))
				.filter((p) => p.slug !== params.slug)
				.slice(0, 4);
			return {
				seo: {
					// DB per-row meta wins when admins filled it; else derive.
					title: data.metaTitle || (data.name ? `${data.name} — HalalNeo` : `${params.slug} — HalalNeo`),
					description:
						data.metaDescription ||
						data.description ||
						`${data.name || params.slug} — halal service provider (${data.type || 'specialist'}) in ${data.country || 'worldwide'}. View details on HalalNeo.`,
					ogImage: 'https://halalneo.com/brand/og-default.png',
					keywords: [data.name, 'halal service provider', data.type, data.country].filter(Boolean)
				},
				item: data,
				slug: params.slug,
				related
			};
		}
	} catch {
		// fetch/parse failed — fall back to the static payload below
	}

	return {
		seo: {
			title: `${params.slug} — HalalNeo`,
			description: `${params.slug} — halal service provider on HalalNeo.`,
			ogImage: 'https://halalneo.com/brand/og-default.png',
			robots: 'noindex, nofollow'
		},
		item: null,
		slug: params.slug,
		related: []
	};
};
