// Product Zod schema — the single validation source for BOTH sides of the
// products data flow (development-rules.md §6.4: 前后端校验逻辑保持一致).
//
//  * `src/routes/admin/products/+page.svelte` validates the form payload with
//    `ProductCreateSchema` before it hits the network (instant FieldError + focus).
//  * `src/routes/api/products/+server.ts` re-validates with the SAME schema and
//    answers 400 `{ error, details }` (see #lib/utils/forms.ts `mergeServerDetails`).
//  * `ProductUpdateSchema` is `ProductCreateSchema.partial()` — every key that is
//    absent in the body is left untouched by the PATCH/PUT handler.
//
// Every key here maps 1:1 onto a column of `products` in
// `src/lib/server/db/schema.ts`; unknown keys are stripped by Zod, so no
// free-text/extra column can ever be written through this API.

import { z } from 'zod';

/** `products.cert_status` enum — must match schema.ts exactly. */
export const PRODUCT_CERT_STATUSES = [
	'certified',
	'pending',
	'not-certified',
	'not-applicable'
] as const;

/** `products.status` enum — must match schema.ts exactly. */
export const PRODUCT_STATUSES = ['active', 'draft', 'archived'] as const;

/** Spec/FAQ/resource row caps keep the JSON TEXT columns bounded (D1 row size). */
export const PRODUCT_LIMITS = {
	specifications: 40,
	faqs: 30,
	resources: 20,
	images: 30,
	videos: 10,
	features: 50
} as const;

const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{0,198}[a-z0-9])?$/;
const URL_RE = /^https?:\/\/\S{1,400}$/i;

/**
 * Nullable TEXT column: trims, rejects oversize, collapses '' / missing to
 * `null` so D1 never stores empty strings (seed + public pages both assume
 * "empty means null").
 */
function optionalText(max: number, label: string) {
	return z
		.string()
		.trim()
		.max(max, `${label} must be ${max} characters or fewer.`)
		.transform((v) => (v.length ? v : null))
		.nullable()
		.optional();
}

/** Nullable TEXT column holding an http(s) URL. */
function optionalUrl(label: string) {
	return z
		.string()
		.trim()
		.max(1000, `${label} must be 1000 characters or fewer.`)
		.refine((v) => !v.length || URL_RE.test(v), `${label} must be a full http(s) URL.`)
		.transform((v) => (v.length ? v : null))
		.nullable()
		.optional();
}

/** JSON array column of URLs (images/videos). Bad rows report on the list key. */
function optionalUrlList(itemMax: number, countMax: number) {
	return z
		.array(z.string().trim().max(itemMax, `Each entry must be ${itemMax} characters or fewer.`))
		.max(countMax, `At most ${countMax} entries are allowed.`)
		.superRefine((rows, ctx) => {
			rows.forEach((row, i) => {
				if (row && !URL_RE.test(row)) {
					ctx.addIssue({
						code: 'custom',
						message: `Entry #${i + 1} must be a full http(s) URL.`
					});
				}
			});
		})
		.transform((rows) => {
			const kept = rows.map((r) => r.trim()).filter((r) => r.length > 0);
			return kept.length ? kept : null;
		})
		.nullable()
		.optional();
}

/** JSON array column of plain tag-like strings. */
function optionalTagList(itemMax: number, countMax: number) {
	return z
		.array(z.string().trim().max(itemMax, `Each entry must be ${itemMax} characters or fewer.`))
		.max(countMax, `At most ${countMax} entries are allowed.`)
		.transform((rows) => {
			const kept = rows.map((r) => r.trim()).filter((r) => r.length > 0);
			return kept.length ? kept : null;
		})
		.nullable()
		.optional();
}

/** `products.price_min` / `price_max` (REAL). Empty / null clears the column. */
function optionalPrice(label: string) {
	return z
		.number({ error: `${label} must be a number.` })
		.finite(`${label} must be a finite number.`)
		.min(0, `${label} cannot be negative.`)
		.max(1_000_000_000, `${label} is too large.`)
		.nullable()
		.optional();
}

const SpecMapSchema = z
	.record(
		z.string().trim().min(1, 'Specification keys cannot be empty.').max(120),
		z.string().trim().max(1000)
	)
	.refine(
		(rec) => Object.keys(rec).length <= PRODUCT_LIMITS.specifications,
		`At most ${PRODUCT_LIMITS.specifications} specifications are allowed.`
	)
	.transform((rec) => (Object.keys(rec).length ? rec : null))
	.nullable()
	.optional();

/**
 * FAQ rows. Row-level emptiness is reported on the `faqs` key itself (not
 * `faqs.0.answer`) so the 400 `details` map lands on a field the form renders.
 */
const FaqsSchema = z
	.array(
		z.object({
			question: z.string().trim().max(300, 'Question must be 300 characters or fewer.'),
			answer: z.string().trim().max(5000, 'Answer must be 5000 characters or fewer.')
		})
	)
	.max(PRODUCT_LIMITS.faqs, `At most ${PRODUCT_LIMITS.faqs} FAQs are allowed.`)
	.superRefine((rows, ctx) => {
		rows.forEach((row, i) => {
			if (!row.question && !row.answer) return;
			if (!row.question || !row.answer) {
				ctx.addIssue({
					code: 'custom',
					message: `FAQ #${i + 1}: question and answer are both required.`
				});
			}
		});
	})
	.transform((rows) => {
		const kept = rows
			.map((r) => ({ question: r.question.trim(), answer: r.answer.trim() }))
			.filter((r) => r.question.length > 0);
		return kept.length ? kept : null;
	})
	.nullable()
	.optional();

/** Downloadable resource rows — same "report on the list key" convention. */
const ResourcesSchema = z
	.array(
		z.object({
			name: z.string().trim().max(200, 'Resource title must be 200 characters or fewer.'),
			url: z.string().trim().max(1000, 'Resource URL must be 1000 characters or fewer.')
		})
	)
	.max(PRODUCT_LIMITS.resources, `At most ${PRODUCT_LIMITS.resources} resources are allowed.`)
	.superRefine((rows, ctx) => {
		rows.forEach((row, i) => {
			if (!row.name && !row.url) return;
			if (!row.name || !URL_RE.test(row.url)) {
				ctx.addIssue({
					code: 'custom',
					message: `Resource #${i + 1}: title and a full http(s) URL are both required.`
				});
			}
		});
	})
	.transform((rows) => {
		const kept = rows
			.map((r) => ({ name: r.name.trim(), url: r.url.trim() }))
			.filter((r) => r.name.length > 0 || r.url.length > 0);
		return kept.length ? kept : null;
	})
	.nullable()
	.optional();

/**
 * Field map shared by create + update. Zod forbids `.partial()` on objects that
 * carry refinements, so the cross-field price check lives in `assertPriceRange`
 * and is attached to each finished schema instead.
 */
const productShape = {
	slug: z
		.string()
		.trim()
		.min(2, 'Slug is required.')
		.max(200, 'Slug must be 200 characters or fewer.')
		.regex(SLUG_RE, 'Slug may only contain lowercase letters, numbers and dashes.'),
	name: z
		.string()
		.trim()
		.min(2, 'Name is required.')
		.max(200, 'Name must be 200 characters or fewer.'),
	supplierSlug: z.string().trim().min(1, 'Supplier is required.').max(200),
	categorySlug: z.string().trim().min(1, 'Category is required.').max(200),
	shortDescription: optionalText(500, 'Short description'),
	description: optionalText(20000, 'Description'),
	image: optionalUrl('Image URL'),
	images: optionalUrlList(1000, PRODUCT_LIMITS.images),
	videos: optionalUrlList(1000, PRODUCT_LIMITS.videos),
	features: optionalTagList(200, PRODUCT_LIMITS.features),
	specifications: SpecMapSchema,
	faqs: FaqsSchema,
	resources: ResourcesSchema,
	moq: optionalText(200, 'MOQ'),
	priceMin: optionalPrice('Minimum price'),
	priceMax: optionalPrice('Maximum price'),
	priceUnit: optionalText(50, 'Price unit'),
	units: optionalText(200, 'Units'),
	originCountry: optionalText(120, 'Origin country'),
	certStatus: z.enum(PRODUCT_CERT_STATUSES, {
		error: `Certification status must be one of: ${PRODUCT_CERT_STATUSES.join(', ')}.`
	}),
	status: z.enum(PRODUCT_STATUSES, {
		error: `Status must be one of: ${PRODUCT_STATUSES.join(', ')}.`
	}),
	metaTitle: optionalText(60, 'Meta title'),
	metaDescription: optionalText(160, 'Meta description'),
	keywords: optionalText(500, 'Keywords')
};

/** Cross-field rule, reported on `priceMax` so it renders under that input. */
function priceRangeMessage(val: {
	priceMin?: number | null;
	priceMax?: number | null;
}): string | null {
	if (val.priceMin != null && val.priceMax != null && val.priceMin > val.priceMax) {
		return 'Maximum price must be greater than or equal to minimum price.';
	}
	return null;
}

export const ProductCreateSchema = z.object(productShape).superRefine((val, ctx) => {
	const message = priceRangeMessage(val);
	if (message) ctx.addIssue({ code: 'custom', path: ['priceMax'], message });
});

/** Required keys of the create shape, relaxed to optional for partial updates. */
const {
	slug: _slug,
	name,
	supplierSlug,
	categorySlug,
	certStatus,
	status,
	...optionalProductFields
} = productShape;

/** Partial update body (PATCH/PUT): absent keys are never written. */
export const ProductUpdateSchema = z
	.object({
		name: name.optional(),
		supplierSlug: supplierSlug.optional(),
		categorySlug: categorySlug.optional(),
		certStatus: certStatus.optional(),
		status: status.optional(),
		...optionalProductFields
	})
	.superRefine((val, ctx) => {
		const message = priceRangeMessage(val);
		if (message) ctx.addIssue({ code: 'custom', path: ['priceMax'], message });
	});

export type ProductCreateInput = z.infer<typeof ProductCreateSchema>;
export type ProductUpdateInput = z.infer<typeof ProductUpdateSchema>;
export type ProductCertStatus = (typeof PRODUCT_CERT_STATUSES)[number];
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

/** Row shape returned by the products list/detail endpoints (JSON TEXT columns unparsed). */
export interface ProductRow {
	slug: string;
	supplierSlug: string;
	categorySlug: string;
	name: string;
	shortDescription: string | null;
	description: string | null;
	image: string | null;
	images: string | null;
	videos: string | null;
	moq: string | null;
	priceMin: number | null;
	priceMax: number | null;
	priceUnit: string | null;
	certStatus: ProductCertStatus | null;
	units: string | null;
	originCountry: string | null;
	features: string | null;
	specifications: string | null;
	faqs: string | null;
	resources: string | null;
	status: ProductStatus | null;
	views: number | null;
	metaTitle: string | null;
	metaDescription: string | null;
	keywords: string | null;
	createdAt: string | number | null;
	updatedAt: string | number | null;
}

/** Lightweight projected row from `getProductListItems` (admin table + public cards). */
export interface ProductListItem {
	slug: string;
	name: string;
	image: string | null;
	status: ProductStatus | null;
	categorySlug: string;
	supplierSlug: string;
	moq: string | null;
	priceMin: number | null;
	priceMax: number | null;
	priceUnit: string | null;
	certStatus: ProductCertStatus | null;
}

/** `PaginatedResult<T>` envelope used by every list endpoint. */
export interface ProductListResponse {
	items: ProductListItem[];
	total: number;
	limit: number;
	offset: number;
}

/**
 * Build the client-side payload from raw form state. Deliberately mirrors the
 * server schema 1:1: empty strings become null, blank rows are dropped, and
 * numeric inputs are coerced (invalid numbers stay NaN so Zod rejects them and
 * the field shows a FieldError instead of silently saving 0).
 */
export function toProductPayload(input: {
	slug: string;
	name: string;
	supplierSlug: string;
	categorySlug: string;
	shortDescription: string;
	description: string;
	imageUrl: string;
	images: string;
	videos: string;
	features: string;
	specifications: { key: string; value: string }[];
	faqs: { question: string; answer: string }[];
	resources: { name: string; url: string }[];
	moq: string;
	priceMin: string;
	priceMax: string;
	priceUnit: string;
	units: string;
	originCountry: string;
	certStatus: ProductCertStatus;
	status: ProductStatus;
	metaTitle: string;
	metaDescription: string;
	keywords: string;
}): ProductCreateInput {
	const list = (v: string): string[] =>
		v
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean);

	const specs: Record<string, string> = {};
	for (const row of input.specifications) {
		const key = row.key.trim();
		if (key) specs[key] = row.value.trim();
	}

	const price = (v: string): number | null => {
		const trimmed = v.trim();
		if (!trimmed) return null;
		return Number(trimmed);
	};

	return {
		slug: input.slug.trim(),
		name: input.name.trim(),
		supplierSlug: input.supplierSlug,
		categorySlug: input.categorySlug,
		shortDescription: input.shortDescription,
		description: input.description,
		image: input.imageUrl,
		images: list(input.images),
		videos: list(input.videos),
		features: list(input.features),
		specifications: specs,
		faqs: input.faqs.map((f) => ({ question: f.question, answer: f.answer })),
		resources: input.resources.map((r) => ({ name: r.name, url: r.url })),
		moq: input.moq,
		priceMin: price(input.priceMin),
		priceMax: price(input.priceMax),
		priceUnit: input.priceUnit,
		units: input.units,
		originCountry: input.originCountry,
		certStatus: input.certStatus,
		status: input.status,
		metaTitle: input.metaTitle,
		metaDescription: input.metaDescription,
		keywords: input.keywords
	};
}

/** Defensive JSON TEXT parse — seed rows, empty strings and nulls all yield `fallback`. */
export function parseJsonColumn<T>(raw: unknown, fallback: T): T {
	if (raw == null) return fallback;
	if (typeof raw !== 'string') return raw as T;
	const trimmed = raw.trim();
	if (!trimmed) return fallback;
	try {
		return JSON.parse(trimmed) as T;
	} catch {
		return fallback;
	}
}

/** Display string for the price columns (`price_range` has no DB column — it is derived). */
export function formatPriceRange(
	priceMin: number | null | undefined,
	priceMax: number | null | undefined,
	priceUnit?: string | null
): string {
	const min = priceMin ?? null;
	const max = priceMax ?? null;
	const unit = priceUnit ? ` ${priceUnit}` : '';
	if (min != null && max != null) return `$${min} – $${max}${unit}`;
	if (min != null) return `from $${min}${unit}`;
	if (max != null) return `up to $${max}${unit}`;
	return '';
}
