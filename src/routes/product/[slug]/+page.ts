import type { EntryGenerator, PageLoad } from './$types';
import { readItems, readJson } from '#lib/utils/api-response.js';
import type { CategoryRecord } from '#lib/schemas/categories.js';

export const entries: EntryGenerator = () => [];

/** Feature rows: modern seed stores strings, legacy rows an object with `value`. */
type FeatureEntry = string | { value?: string | null };

/** FAQ rows: `{ question, answer }`, the legacy `{ q, a }` alias, or a bare string. */
type FaqEntry =
	| string
	| { question?: string | null; answer?: string | null; q?: string | null; a?: string | null };

/** Resource rows: `{ name, url }`, the legacy `href` alias, or a bare string. */
type ResourceEntry = string | { name?: string | null; url?: string | null; href?: string | null };

/**
 * `/api/products/[slug]` returns the raw row, so every JSON TEXT column arrives
 * as a string (the seed/legacy rows occasionally carry an already-parsed value,
 * hence the unions). §5.4 — the fetch boundary lands on a real type.
 */
interface ProductRow {
	name?: string | null;
	shortDescription?: string | null;
	description?: string | null;
	image?: string | null;
	images?: string | unknown[] | null;
	videos?: string | unknown[] | null;
	features?: string | FeatureEntry[] | null;
	faqs?: string | FaqEntry[] | null;
	resources?: string | ResourceEntry[] | null;
	specifications?: string | Record<string, string> | null;
	/** Not a `products` column — older payloads carried it; only feeds SEO keywords. */
	category?: string | null;
	categorySlug?: string | null;
	supplierSlug?: string | null;
	slug?: string | null;
	priceMin?: number | string | null;
	priceMax?: number | string | null;
	priceUnit?: string | null;
	moq?: string | null;
	units?: string | null;
	originCountry?: string | null;
	certStatus?: string | null;
	status?: string | null;
	views?: number | null;
	createdAt?: string | null;
	metaTitle?: string | null;
	metaDescription?: string | null;
	keywords?: string | string[] | null;
}

/** Projected row from the `/api/products` list endpoint (`ProductListItem`). */
interface ProductRelatedItem {
	slug: string;
	name: string;
	image?: string | null;
	status?: string | null;
	categorySlug?: string | null;
	supplierSlug?: string | null;
	originCountry?: string | null;
	shortDescription?: string | null;
	moq?: string | null;
	priceMin?: number | null;
	priceMax?: number | null;
	priceUnit?: string | null;
	certStatus?: string | null;
}

export const load: PageLoad = async ({ params, fetch }) => {
	if (!params.slug) {
		return {
			seo: {
				title: 'Product — HalalNeo',
				description: 'Product details on HalalNeo.',
				robots: 'noindex, nofollow'
			},
			item: null,
			relatedProducts: [],
			categories: [],
			supplierName: null
		};
	}
	try {
		const [res, relatedRes, categoriesRes] = await Promise.all([
			fetch(`/api/products/${params.slug}`),
			fetch('/api/products?limit=50'),
			fetch('/api/categories')
		]);
		if (res.ok) {
			const data: ProductRow = await readJson<ProductRow>(res);
			const parsed = {
				...data,
				features:
					typeof data.features === 'string'
						? (JSON.parse(data.features || '[]') as FeatureEntry[])
						: (data.features ?? []),
				specifications:
					typeof data.specifications === 'string'
						? (JSON.parse(data.specifications || '{}') as Record<string, string>)
						: (data.specifications ?? {}),
				images:
					typeof data.images === 'string'
						? (JSON.parse(data.images || '[]') as unknown[])
						: (data.images ?? []),
				videos:
					typeof data.videos === 'string'
						? (JSON.parse(data.videos || '[]') as unknown[])
						: (data.videos ?? []),
				faqs:
					typeof data.faqs === 'string'
						? (JSON.parse(data.faqs || '[]') as FaqEntry[])
						: (data.faqs ?? []),
				resources:
					typeof data.resources === 'string'
						? (JSON.parse(data.resources || '[]') as ResourceEntry[])
						: (data.resources ?? [])
			};
			const allProducts = await readItems<ProductRelatedItem>(relatedRes);
			const categories = await readItems<CategoryRecord>(categoriesRes);
			// Resolve the supplier name for the product page's supplier card.
			let supplierName: string | null = null;
			if (parsed.supplierSlug) {
				const supplierRes = await fetch(`/api/suppliers/${parsed.supplierSlug}`);
				if (supplierRes.ok) {
					const s = (await supplierRes.json()) as { name?: string };
					supplierName = s.name ?? null;
				}
			}
			const relatedProducts = allProducts
				.filter((p) => p.slug !== params.slug && p.categorySlug === parsed.categorySlug)
				.slice(0, 3);
			return {
				seo: {
					// DB per-row meta wins when admins filled it; else derive.
					title:
						parsed.metaTitle ||
						(parsed.name ? `${parsed.name} — HalalNeo` : `${params.slug} — HalalNeo`),
					description:
						parsed.metaDescription ||
						parsed.shortDescription ||
						`Product details for ${parsed.name || params.slug} on HalalNeo — halal-certified products with verified certification scope.`,
					ogImage: parsed.image || 'https://halalneo.com/brand/og-default.png',
					keywords: [parsed.name, 'halal product', parsed.category, 'certified product'].filter(
						Boolean
					)
				},
				slug: params.slug,
				item: parsed,
				relatedProducts,
				categories,
				supplierName
			};
		}
	} catch {
		// fetch/parse failed — fall back to the static payload below
	}

	return {
		seo: {
			title: `${params.slug} — HalalNeo`,
			description: `Product details for ${params.slug} on HalalNeo — halal-certified products with verified certification scope.`,
			robots: 'noindex, nofollow'
		},
		item: null
	};
};
