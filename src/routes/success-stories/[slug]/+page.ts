import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, fetch }) => {
	try {
		const [res, supRes] = await Promise.all([
			fetch(`/api/success-stories/${params.slug}`),
			fetch('/api/suppliers?limit=100&status=active')
		]);

		if (!res.ok) throw error(404, 'Story not found');

		const story = (await res.json()) as any;
		const suppliers = supRes.ok ? ((((await supRes.json()) as any)).items ?? []) : [];
		const supplierName = suppliers.find((s: any) => s.slug === story.supplierSlug)?.name ?? story.supplierSlug;

		const listRes = await fetch('/api/success-stories?limit=10');
		const related = listRes.ok
			? ((((await listRes.json()) as any)).items ?? []).filter((s: any) => s.slug !== params.slug).slice(0, 3)
			: [];

		return {
			seo: {
				title: `${story.title ?? 'Success story'} — HalalNeo`,
				description: (story.excerpt || story.body || '').slice(0, 155),
				ogImage: 'https://halalneo.com/api/media/og-default.png'
			},
			slug: params.slug,
			story,
			supplierName,
			related
		};
	} catch (e: any) {
		if (e?.status === 404) throw e;
		throw error(404, 'Story not found');
	}
};
