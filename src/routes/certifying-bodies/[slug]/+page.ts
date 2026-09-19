import type { EntryGenerator, PageLoad } from './$types';
import { readItems, readJson } from '#lib/utils/api-response.js';
import type { CategoryRecord } from '#lib/schemas/categories.js';
import type { CertifyingBodyRecord } from '#lib/schemas/certifying-bodies.js';
import type { MarketGuideDto } from '#lib/schemas/market-guides.js';

export const entries: EntryGenerator = () => [];

/** `POST { action: 'suppliers' }` on the certifier endpoint (read-side helper). */
interface CertifierSuppliersPayload {
	suppliers?: Array<{ slug: string; name: string; country?: string | null }>;
	certificationTypes?: string[];
}

export const load: PageLoad = async ({ params, fetch }) => {
	const [bodyRes, suppliersRes, categoriesRes, guidesRes] = await Promise.all([
		fetch(`/api/certifying-bodies/${params.slug}`),
		fetch(`/api/certifying-bodies/${params.slug}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ action: 'suppliers' })
		}),
		fetch('/api/categories'),
		fetch('/api/market-guides?limit=50')
	]);

	const body: CertifyingBodyRecord | null = bodyRes.ok
		? await readJson<CertifyingBodyRecord>(bodyRes)
		: null;
	const supplierData: CertifierSuppliersPayload = suppliersRes.ok
		? await readJson<CertifierSuppliersPayload>(suppliersRes)
		: { suppliers: [], certificationTypes: [] };
	const categories = await readItems<CategoryRecord>(categoriesRes);
	const allGuides = await readItems<MarketGuideDto>(guidesRes);
	const bodyId = body?.id ?? params.slug;
	const relatedGuides = allGuides.filter(
		(g) =>
			(g.certifyingBodies ?? []).some((cb) => cb.slug === bodyId) ||
			g.country === body?.country
	);

	return {
		seo: {
			// DB per-row meta wins when admins filled it; else derive.
			title: body?.metaTitle || (body?.name ? `${body.name} — HalalNeo` : `${params.slug} — HalalNeo`),
			description:
				body?.metaDescription ||
				body?.description ||
				`${body?.name || params.slug} — recognized halal certifying body. Details, standards, and contact information on HalalNeo.`,
			ogImage: 'https://halalneo.com/api/media/og-certifiers.png',
			keywords: [body?.name, 'halal certifier', body?.country, 'accreditation'].filter(Boolean)
		},
		item: body,
		slug: params.slug,
		certifiedSuppliers: supplierData.suppliers ?? [],
		certificationTypes: (supplierData.certificationTypes ?? []).map((catSlug) => ({
			slug: catSlug,
			name: categories.find((c) => c.slug === catSlug)?.name ?? catSlug
		})),
		relatedGuides
	};
};
