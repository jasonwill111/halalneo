// Zod schemas for country market guides — Project Rules §6.1 / §6.4.
//
// Single source of truth shared by the admin form (`src/routes/admin/market-guides`)
// and the API (`src/routes/api/market-guides`). Field list mirrors the Drizzle
// model in `#lib/server/db/schema.js` (table `market_guides`).
//
// NOTE: `market_guides.status` is plain TEXT in D1 (unlike the enum-typed
// `status` columns of other collections), so the write path is constrained
// here: only MARKET_GUIDE_STATUSES may ever reach the database.

import { z } from 'zod';

export const MARKET_GUIDE_STATUSES = ['active', 'inactive', 'draft'] as const;
export type MarketGuideStatus = (typeof MARKET_GUIDE_STATUSES)[number];

export const MANDATE_STATUSES = ['mandatory', 'phasing-in', 'voluntary'] as const;
export type MarketGuideMandateStatus = (typeof MANDATE_STATUSES)[number];

const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

/** Text column: trims, rejects oversize payloads, treats '' as "unset". */
const text = (max: number) => z.string().trim().max(max);
const list = (max: number, itemMax = 600) =>
	z.array(z.string().trim().min(1, 'List items cannot be empty.').max(itemMax)).max(max);

export const certifyingBodyRefSchema = z.object({
	slug: z.string().trim().min(1, 'Certifying body slug is required.').max(200),
	name: z.string().trim().min(1, 'Certifying body name is required.').max(200)
});
export type CertifyingBodyRef = z.infer<typeof certifyingBodyRefSchema>;

export const marketGuideCreateSchema = z.object({
	slug: text(200)
		.optional()
		.refine((s) => !s || SLUG_PATTERN.test(s), {
			message: 'Slug may only contain lowercase letters, numbers and dashes.'
		}),
	country: text(120).min(1, 'Country is required.'),
	flag: text(16).optional(),
	region: text(60).optional(),
	muslimPopulation: text(160).optional(),
	totalPopulation: text(160).optional(),
	marketSizeUsd: text(200).optional(),
	mandateStatus: z
		.enum(MANDATE_STATUSES, {
			error: 'Choose mandatory, phasing-in or voluntary.'
		})
		.optional(),
	mandatorySince: text(200).optional().nullable(),
	certifyingBodies: z.array(certifyingBodyRefSchema).max(30).optional(),
	importRequirements: list(30).optional(),
	standardBasis: text(300).optional(),
	certificateValidity: text(200).optional(),
	estimatedCostUsd: text(200).optional(),
	processingTime: text(200).optional(),
	keyInsights: list(30).optional(),
	opportunities: list(30).optional(),
	challenges: list(30).optional(),
	summary: text(4000).optional(),
	metaTitle: text(200).optional(),
	metaDescription: text(500).optional(),
	keywords: text(500).optional(),
	status: z
		.enum(MARKET_GUIDE_STATUSES, {
			error: 'Status must be active, inactive or draft.'
		})
		.optional()
});

/** PUT payload: every field optional, enums still constrained. */
export const marketGuideUpdateSchema = marketGuideCreateSchema.partial();

export type MarketGuideInput = z.infer<typeof marketGuideCreateSchema>;
export type MarketGuidePatch = z.infer<typeof marketGuideUpdateSchema>;

/** JSON shape returned by GET /api/market-guides (dates serialise to ISO strings). */
export interface MarketGuideDto {
	slug: string;
	country: string;
	flag: string | null;
	region: string | null;
	muslimPopulation: string | null;
	totalPopulation: string | null;
	marketSizeUsd: string | null;
	mandateStatus: string | null;
	mandatorySince: string | null;
	certifyingBodies: CertifyingBodyRef[] | null;
	importRequirements: string[] | null;
	standardBasis: string | null;
	certificateValidity: string | null;
	estimatedCostUsd: string | null;
	processingTime: string | null;
	keyInsights: string[] | null;
	opportunities: string[] | null;
	challenges: string[] | null;
	summary: string | null;
	metaTitle: string | null;
	metaDescription: string | null;
	keywords: string | null;
	status: string;
	createdAt?: string | null;
	updatedAt?: string | null;
}

/** List response envelope for the public/admin list endpoints. */
export interface MarketGuideListResponse {
	items: MarketGuideDto[];
	total: number;
	limit: number;
	offset: number;
}

export function slugifyMarketGuide(value: string): string {
	return value
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

/**
 * Map a stored status onto the allowed write set. Legacy seed rows written
 * before the status cleanup carry values like `published`; the admin form
 * treats those as `draft` so a save always lands on a valid enum value.
 */
export function normaliseMarketGuideStatus(value: string | null | undefined): MarketGuideStatus {
	return MARKET_GUIDE_STATUSES.includes(value as MarketGuideStatus)
		? (value as MarketGuideStatus)
		: 'draft';
}

/** `mandate_status` is free text in legacy rows — clamp it for the form select. */
export function normaliseMandateStatus(value: string | null | undefined): MarketGuideMandateStatus {
	return MANDATE_STATUSES.includes(value as MarketGuideMandateStatus)
		? (value as MarketGuideMandateStatus)
		: 'voluntary';
}
