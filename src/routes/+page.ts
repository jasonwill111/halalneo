import type { PageLoad } from './$types';
import { readItems, readList, readTotal } from '#lib/utils/api-response.js';
import type { ProductListItem } from '#lib/schemas/products.js';
import type { SupplierListItem } from '#lib/schemas/suppliers.js';
import type { CategoryRecord } from '#lib/schemas/categories.js';
import type { KbArticleListItem, KbSectionCountItem } from '#lib/types/api.js';

export const prerender = false;

/**
 * `/api/products` + `/api/suppliers` list rows are projected (§5.9.3) and never carry
 * the JSON TEXT columns, so the defensive parses below collapse to their fallbacks —
 * kept as-is because the cards render those arrays.
 */
type FeaturedProduct = ProductListItem & { features?: string | unknown[] | null };
type FeaturedSupplier = SupplierListItem & { certifications?: string | unknown[] | null };

export const load: PageLoad = async ({ fetch }) => {
	const [productsRes, suppliersRes, categoriesRes, kbSectionsRes, kbArticlesRes, guidesRes, certifiersRes, glossaryRes] = await Promise.all([
		fetch('/api/products?limit=4&status=active'),
		fetch('/api/suppliers?limit=4&status=active'),
		fetch('/api/categories'),
		fetch('/api/knowledge-base/sections'),
		fetch('/api/knowledge-base?limit=50'),
		fetch('/api/market-guides?limit=1'),
		fetch('/api/certifying-bodies?limit=1'),
		fetch('/api/pages?category=glossary&limit=1')
	]);

	const productsData = await readList<FeaturedProduct>(productsRes);
	const suppliersData = await readList<FeaturedSupplier>(suppliersRes);
	const categories = await readItems<CategoryRecord>(categoriesRes);
	const kbSections = await readItems<KbSectionCountItem>(kbSectionsRes);
	const kbArticles = (await readItems<KbArticleListItem>(kbArticlesRes)).map((a) => ({
		...a,
		tags: typeof a.tags === 'string' ? (JSON.parse(a.tags || '[]') as string[]) : a.tags ?? []
	}));

	const featuredProducts = (productsData.items ?? []).map((p) => ({
		...p,
		features: typeof p.features === 'string' ? (JSON.parse(p.features || '[]') as string[]) : p.features ?? [],
	}));
	const featuredSuppliers = (suppliersData.items ?? []).map((s) => ({
		...s,
		certifications: typeof s.certifications === 'string' ? (JSON.parse(s.certifications || '[]') as string[]) : s.certifications ?? [],
	}));
	const guidesTotal = await readTotal(guidesRes);
	const certifiersTotal = await readTotal(certifiersRes);
	const glossaryTotal = await readTotal(glossaryRes);

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
			glossaryTerms: glossaryTotal,
			guideCount: guidesTotal,
			certifierCount: certifiersTotal
		}
	};
};
