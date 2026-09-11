import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, fetch }) => {
	try {
		const [res, relatedRes] = await Promise.all([
			fetch(`/api/rfqs/${params.id}`),
			fetch('/api/rfqs?limit=20')
		]);

		if (!res.ok) throw error(404, 'Buying request not found');

		const rfq = (await res.json()) as any;
		const related = relatedRes.ok ? ((((await relatedRes.json()) as any)).items ?? []) : [];

		return {
			seo: {
				title: `${rfq.title ?? 'Buying request'} — Halal RFQ`,
				description: (rfq.description ?? '').slice(0, 155) || `Halal sourcing request: ${rfq.title ?? ''}. Quote directly on HalalNeo.`,
				ogImage: 'https://halalneo.com/api/media/og-default.png',
				keywords: ['halal RFQ', rfq.title, 'sourcing request'].filter(Boolean)
			},
			id: params.id,
			rfq,
			related: related.filter((r: any) => r.id !== params.id).slice(0, 3)
		};
	} catch (e: any) {
		if (e?.status === 404) throw e;
		throw error(404, 'Buying request not found');
	}
};
