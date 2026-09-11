import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, fetch }) => {
	try {
		const [res, supRes] = await Promise.all([
			fetch(`/api/promotions/${params.id}`),
			fetch('/api/suppliers?limit=100&status=active')
		]);

		if (!res.ok) throw error(404, 'Deal not found');

		const promo = (await res.json()) as any;
		const suppliers = supRes.ok ? ((((await supRes.json()) as any)).items ?? []) : [];
		const supplierName = suppliers.find((s: any) => s.slug === promo.supplierSlug)?.name ?? promo.supplierSlug;

		return {
			seo: {
				title: `${promo.title ?? 'Deal'} — Halal Quick Deal`,
				description: (promo.description ?? '').slice(0, 155) || `Limited-time halal deal: ${promo.title ?? ''}.`,
				ogImage: 'https://halalneo.com/api/media/og-default.png'
			},
			id: params.id,
			promo,
			supplierName
		};
	} catch (e: any) {
		if (e?.status === 404) throw e;
		throw error(404, 'Deal not found');
	}
};
