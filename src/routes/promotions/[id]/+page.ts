import { error, isHttpError } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { readItems, readJson } from '#lib/utils/api-response.js';
import type { PromotionItem } from '#lib/types/api.js';
import type { SupplierListItem } from '#lib/schemas/suppliers.js';

export const load: PageLoad = async ({ params, fetch }) => {
	try {
		const [res, supRes] = await Promise.all([
			fetch(`/api/promotions/${params.id}`),
			fetch('/api/suppliers?limit=100&status=active')
		]);

		if (!res.ok) throw error(404, 'Deal not found');

		const promo = await readJson<PromotionItem>(res);
		const suppliers = await readItems<SupplierListItem>(supRes);
		const supplierName = suppliers.find((s) => s.slug === promo.supplierSlug)?.name ?? promo.supplierSlug;

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
	} catch (e: unknown) {
		if (isHttpError(e) && e.status === 404) throw e;
		throw error(404, 'Deal not found');
	}
};
