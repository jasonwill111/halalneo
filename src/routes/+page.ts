import type { PageLoad } from './$types';

export const prerender = false;

export const load: PageLoad = async ({ fetch }) => {
	const [productsRes, suppliersRes, categoriesRes, kbSectionsRes, kbArticlesRes] = await Promise.all([
		fetch('/api/products?limit=4&status=active'),
		fetch('/api/suppliers?limit=4&status=active'),
		fetch('/api/categories'),
		fetch('/api/knowledge-base/sections'),
		fetch('/api/knowledge-base?limit=50')
	]);

	const productsData = productsRes.ok ? ((await productsRes.json()) as any) : { items: [], total: 0 };
	const suppliersData = suppliersRes.ok ? ((await suppliersRes.json()) as any) : { items: [], total: 0 };
	const categories = categoriesRes.ok ? ((await categoriesRes.json()) as { items?: any[] }).items ?? [] : [];
	const kbSections = kbSectionsRes.ok ? ((await kbSectionsRes.json()) as { items?: any[] }).items ?? [] : [];
	const kbArticles = (kbArticlesRes.ok ? ((await kbArticlesRes.json()) as { items?: any[] }).items ?? [] : []).map((a: any) => ({
		...a,
		tags: typeof a.tags === 'string' ? JSON.parse(a.tags || '[]') : a.tags ?? []
	}));

	const featuredProducts = (productsData.items ?? []).map((p: any) => ({
		...p,
		features: typeof p.features === 'string' ? JSON.parse(p.features || '[]') : p.features ?? [],
	}));
	const featuredSuppliers = (suppliersData.items ?? []).map((s: any) => ({
		...s,
		certifications: typeof s.certifications === 'string' ? JSON.parse(s.certifications || '[]') : s.certifications ?? [],
	}));

	return {
		seo: {
			title: 'Halal Trade Intelligence — Certified Suppliers, Products & Market Guides — HalalNeo',
			description: 'Connect with halal-certified suppliers worldwide. Browse verified products, compare certification bodies, and access comprehensive market guides for halal trade compliance.'
		},
		featuredSuppliers,
		featuredProducts,
		categories: categories.slice(0, 6),
		kbSections,
		kbArticles,
		stats: {
			verifiedSuppliers: suppliersData.total ?? 0,
			certifiedProducts: productsData.total ?? 0,
			kbSections: kbSections.length,
			glossaryTerms: 30
		}
	};
};
