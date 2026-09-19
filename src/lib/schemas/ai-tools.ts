// Zod schemas for the AI tool catalogue — Project Rules §6.1 / §6.4.
//
// Shared by `src/routes/admin/ai-tools` and `src/routes/api/ai-tools`.
// Backed by the `ai_tools` table (see `#lib/server/db/schema.js`); `features`
// is a JSON TEXT column, so the API encodes/decodes arrays.

import { z } from 'zod';

export const AI_TOOL_CATEGORIES = ['assistant', 'compliance', 'sourcing', 'documentation'] as const;
export type AiToolCategory = (typeof AI_TOOL_CATEGORIES)[number];

export const AI_TOOL_STATUSES = ['active', 'disabled'] as const;
export type AiToolStatus = (typeof AI_TOOL_STATUSES)[number];

export const CATEGORY_LABELS: Record<AiToolCategory, string> = {
	assistant: 'Assistant',
	compliance: 'Compliance',
	sourcing: 'Sourcing',
	documentation: 'Documentation'
};

const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
const text = (max: number) => z.string().trim().max(max);

const slugField = (label: string) =>
	text(160)
		.optional()
		.refine((s) => !s || SLUG_PATTERN.test(s), {
			message: `${label} may only contain lowercase letters, numbers and dashes.`
		});

export const aiToolCreateSchema = z.object({
	id: slugField('ID'),
	slug: slugField('Slug'),
	name: text(160).min(1, 'Tool name is required.'),
	description: text(500).optional(),
	longDescription: text(5000).optional(),
	features: z
		.array(z.string().trim().min(1, 'Feature items cannot be empty.').max(300))
		.max(20)
		.optional(),
	category: z.enum(AI_TOOL_CATEGORIES, {
		error: 'Category must be assistant, compliance, sourcing or documentation.'
	}),
	status: z.enum(AI_TOOL_STATUSES, { error: 'Status must be active or disabled.' })
});

/** PUT payload: every field optional, enums still constrained. */
export const aiToolUpdateSchema = aiToolCreateSchema.partial();

export type AiToolInput = z.infer<typeof aiToolCreateSchema>;
export type AiToolPatch = z.infer<typeof aiToolUpdateSchema>;

export interface AiToolDto {
	id: string;
	slug: string;
	name: string;
	description: string | null;
	longDescription: string | null;
	features: string[] | null;
	category: string;
	status: string;
	createdAt?: string | null;
	updatedAt?: string | null;
}

export interface AiToolListResponse {
	items: AiToolDto[];
	total: number;
	limit: number;
	offset: number;
}

export function normaliseAiToolCategory(value: string | null | undefined): AiToolCategory {
	return AI_TOOL_CATEGORIES.includes(value as AiToolCategory)
		? (value as AiToolCategory)
		: 'assistant';
}

export function normaliseAiToolStatus(value: string | null | undefined): AiToolStatus {
	return AI_TOOL_STATUSES.includes(value as AiToolStatus)
		? (value as AiToolStatus)
		: 'disabled';
}
