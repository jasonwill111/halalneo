import { error, isHttpError } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { readItems, readJson } from '#lib/utils/api-response.js';
import type { BuyingRequestItem } from '#lib/types/api.js';

export const load: PageLoad = async ({ params, fetch }) => {
	try {
		const [res, relatedRes] = await Promise.all([
			fetch(`/api/rfqs/${params.id}`),
			fetch('/api/rfqs?limit=20')
		]);

		if (!res.ok) throw error(404, 'Buying request not found');

		const rfq = await readJson<BuyingRequestItem>(res);
		const related = await readItems<BuyingRequestItem>(relatedRes);

		return {
			seo: {
				title: `${rfq.title ?? 'Buying request'} — Halal RFQ`,
				description:
					(rfq.description ?? '').slice(0, 155) ||
					`Halal sourcing request: ${rfq.title ?? ''}. Quote directly on HalalNeo.`,
				ogImage: 'https://halalneo.com/brand/og-default.png',
				keywords: ['halal RFQ', rfq.title, 'sourcing request'].filter(Boolean)
			},
			id: params.id,
			rfq,
			related: related.filter((r) => r.id !== params.id).slice(0, 3)
		};
	} catch (e: unknown) {
		if (isHttpError(e) && e.status === 404) throw e;
		throw error(404, 'Buying request not found');
	}
};
