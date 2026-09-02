import type { EntryGenerator, PageLoad } from './$types';

export const entries: EntryGenerator = () => [];

export const load: PageLoad = async ({ params, fetch }) => {
	const [bodyRes, suppliersRes, categoriesRes] = await Promise.all([
		fetch(`/api/certifying-bodies/${params.slug}`),
		fetch(`/api/certifying-bodies/${params.slug}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ action: 'suppliers' })
		}),
		fetch('/api/categories')
	]);

	const body = bodyRes.ok ? await bodyRes.json() : null;
	const supplierData = suppliersRes.ok ? await suppliersRes.json() : { suppliers: [], certificationTypes: [] };
	const categories = categoriesRes.ok ? (await categoriesRes.json()).items ?? [] : [];

	return {
		seo: {
			title: body?.name ? `${body.name} — HalalNeo` : `${params.slug} — HalalNeo`,
			description:
				body?.description ||
				`${body?.name || params.slug} — recognized halal certifying body. Details, standards, and contact information on HalalNeo.`,
			ogImage: 'https://halalneo.com/og-certifiers.png',
			keywords: [body?.name, 'halal certifier', body?.country, 'accreditation'].filter(Boolean)
		},
		item: body,
		slug: params.slug,
		certifiedSuppliers: supplierData.suppliers ?? [],
		certificationTypes: (supplierData.certificationTypes ?? []).map((catSlug: string) => ({
			slug: catSlug,
			name: categories.find((c: any) => c.slug === catSlug)?.name ?? catSlug
		}))
	};
};
