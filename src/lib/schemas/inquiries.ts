// Zod schemas for buyer inquiries — Project Rules §6.1 / §6.4.
//
// Shared by `src/routes/admin/inquiries`, the public inquiry forms (contact,
// product / supplier / promotion / RFQ pages) and `src/routes/api/inquiries`.
// Field list mirrors the Drizzle model (table `inquiries`); `status` is a real
// text enum there, and INQUIRY_STATUSES is the single source of truth for both
// the public create path and the admin triage (PATCH) path.

import { z } from 'zod';

export const INQUIRY_STATUSES = ['active', 'pending', 'closed', 'flagged'] as const;
export type InquiryStatus = (typeof INQUIRY_STATUSES)[number];

const text = (max: number) => z.string().trim().max(max);

/** Public "send inquiry" payload (POST /api/inquiries). */
export const inquiryCreateSchema = z.object({
	buyerSlug: text(200).min(1, 'Your contact reference is required.'),
	supplierSlug: text(200).optional().nullable(),
	productSlug: text(200).optional().nullable(),
	subject: text(200).min(3, 'Subject must be at least 3 characters.'),
	message: text(5000).min(10, 'Message must be at least 10 characters.')
});

/** Admin triage payload (PATCH /api/inquiries/:id) — status only. */
export const inquiryStatusUpdateSchema = z.object({
	status: z.enum(INQUIRY_STATUSES, {
		error: `Status must be one of: ${INQUIRY_STATUSES.join(', ')}.`
	})
});

export type InquiryCreateInput = z.infer<typeof inquiryCreateSchema>;
export type InquiryStatusInput = z.infer<typeof inquiryStatusUpdateSchema>;

export interface InquiryDto {
	id: string;
	buyerSlug: string;
	supplierSlug: string | null;
	productSlug: string | null;
	subject: string;
	message: string;
	status: string;
	createdAt?: string | null;
	updatedAt?: string | null;
}

export interface InquiryListResponse {
	items: InquiryDto[];
	total: number;
	limit: number;
	offset: number;
}
