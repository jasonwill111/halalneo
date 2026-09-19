// Zod schemas for trade shows — Project Rules §6.1 / §6.4.
//
// Shared by `src/routes/admin/trade-shows` and `src/routes/api/trade-shows`.
// Field list mirrors the Drizzle model (table `trade_shows`). `status` is a
// plain TEXT column in D1, so the enum below is the only gate that keeps the
// write set bounded.

import { z } from 'zod';

export const TRADE_SHOW_STATUSES = ['active', 'inactive', 'draft'] as const;
export type TradeShowStatus = (typeof TRADE_SHOW_STATUSES)[number];

export const TRADE_SHOW_SCALES = ['mega', 'large', 'medium', 'regional'] as const;
export type TradeShowScale = (typeof TRADE_SHOW_SCALES)[number];

const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const text = (max: number) => z.string().trim().max(max);
const dateField = (label: string) =>
	text(30)
		.min(1, `${label} is required.`)
		.refine((v) => ISO_DATE_PATTERN.test(v), {
			message: `${label} must use the YYYY-MM-DD format.`
		});

const fields = {
	id: text(160)
		.optional()
		.refine((s) => !s || SLUG_PATTERN.test(s), {
			message: 'ID may only contain lowercase letters, numbers and dashes.'
		}),
	name: text(200).min(1, 'Name is required.'),
	city: text(120).optional(),
	country: text(120).optional(),
	region: text(60).optional(),
	venue: text(300).optional(),
	website: text(500).optional(),
	scale: z.enum(TRADE_SHOW_SCALES, {
		error: 'Choose mega, large, medium or regional.'
	}).optional(),
	description: text(4000).optional(),
	focus: z.array(z.string().trim().min(1, 'Focus items cannot be empty.').max(200)).max(30).optional(),
	exhibitors: z.coerce.number().int().min(0).max(10_000_000).optional().nullable(),
	visitors: z.coerce.number().int().min(0).max(100_000_000).optional().nullable(),
	metaTitle: text(200).optional(),
	metaDescription: text(500).optional(),
	keywords: text(500).optional(),
	status: z.enum(TRADE_SHOW_STATUSES, {
		error: 'Status must be active, inactive or draft.'
	}).optional()
};

export const tradeShowCreateSchema = z
	.object({
		...fields,
		startDate: dateField('Start date'),
		endDate: dateField('End date')
	})
	.refine((v) => !v.startDate || !v.endDate || v.endDate >= v.startDate, {
		message: 'End date cannot be earlier than the start date.',
		path: ['endDate']
	});

/** PUT payload: every field optional, enums and date formats still enforced. */
export const tradeShowUpdateSchema = z
	.object({
		...fields,
		startDate: dateField('Start date').optional(),
		endDate: dateField('End date').optional()
	})
	.refine((v) => !v.startDate || !v.endDate || v.endDate >= v.startDate, {
		message: 'End date cannot be earlier than the start date.',
		path: ['endDate']
	});

export type TradeShowInput = z.infer<typeof tradeShowCreateSchema>;
export type TradeShowPatch = z.infer<typeof tradeShowUpdateSchema>;

export interface TradeShowDto {
	id: string;
	name: string;
	city: string | null;
	country: string | null;
	region: string | null;
	startDate: string | null;
	endDate: string | null;
	venue: string | null;
	website: string | null;
	scale: string | null;
	description: string | null;
	focus: string[] | null;
	exhibitors: number | null;
	visitors: number | null;
	metaTitle: string | null;
	metaDescription: string | null;
	keywords: string | null;
	status: string;
	createdAt?: string | null;
	updatedAt?: string | null;
}

export interface TradeShowListResponse {
	items: TradeShowDto[];
	total: number;
	limit: number;
	offset: number;
}

export function normaliseTradeShowStatus(value: string | null | undefined): TradeShowStatus {
	return TRADE_SHOW_STATUSES.includes(value as TradeShowStatus)
		? (value as TradeShowStatus)
		: 'draft';
}

/** Rows written before the scale cleanup can hold free text — clamp for the select. */
export function normaliseTradeShowScale(value: string | null | undefined): TradeShowScale {
	return TRADE_SHOW_SCALES.includes(value as TradeShowScale)
		? (value as TradeShowScale)
		: 'medium';
}
