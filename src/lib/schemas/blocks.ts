import { z } from 'zod';

const id = z.string().trim().min(1).max(120);
const text = (max: number) => z.string().trim().min(1).max(max);
const optionalText = (max: number) => z.string().trim().max(max).optional().nullable();
const href = z.string().trim().min(1).max(500);
const schemaVersion = z.literal(1).default(1);

const actionSchema = z.object({
	label: text(120),
	href
});

const statSchema = z.object({
	label: text(120),
	value: text(160),
	hint: optionalText(240)
});

const cardSchema = z.object({
	title: text(200),
	description: optionalText(1000),
	href: href.optional(),
	badge: optionalText(80)
});

const timelineSchema = z.object({
	title: text(200),
	description: optionalText(1000),
	status: optionalText(80)
});

const faqSchema = z.object({
	question: text(300),
	answer: text(5000)
});

const tableSchema = z.object({
	columns: z.array(text(120)).min(1).max(20),
	rows: z.array(z.array(text(1000)).max(20)).max(200)
});

const base = {
	id,
	schemaVersion
};

export const contentBlockSchema = z.discriminatedUnion('type', [
	z.object({
		...base,
		type: z.literal('richText'),
		data: z.object({ paragraphs: z.array(text(5000)).min(1).max(100) })
	}),
	z.object({
		...base,
		type: z.literal('hero'),
		data: z.object({
			eyebrow: optionalText(120),
			title: text(300),
			description: optionalText(2000),
			primaryAction: actionSchema.optional(),
			secondaryAction: actionSchema.optional()
		})
	}),
	z.object({
		...base,
		type: z.literal('statGrid'),
		data: z.object({ items: z.array(statSchema).min(1).max(24) })
	}),
	z.object({
		...base,
		type: z.literal('cardGrid'),
		data: z.object({ items: z.array(cardSchema).min(1).max(24) })
	}),
	z.object({
		...base,
		type: z.literal('timeline'),
		data: z.object({ items: z.array(timelineSchema).min(1).max(30) })
	}),
	z.object({
		...base,
		type: z.literal('faq'),
		data: z.object({ items: z.array(faqSchema).min(1).max(50) })
	}),
	z.object({
		...base,
		type: z.literal('quote'),
		data: z.object({ text: text(2000), attribution: optionalText(200) })
	}),
	z.object({
		...base,
		type: z.literal('cta'),
		data: z.object({
			title: text(300),
			description: optionalText(1000),
			action: actionSchema
		})
	}),
	z.object({
		...base,
		type: z.literal('image'),
		data: z.object({ src: href, alt: text(300), caption: optionalText(500) })
	}),
	z.object({
		...base,
		type: z.literal('relatedContent'),
		data: z.object({ items: z.array(cardSchema).min(1).max(24) })
	}),
	z.object({
		...base,
		type: z.literal('table'),
		data: tableSchema
	})
]);

export type ContentBlock = z.infer<typeof contentBlockSchema>;
export const contentBlocksSchema = z.array(contentBlockSchema).max(100);

export interface ContentBlockParseResult {
	blocks: ContentBlock[];
	issues: string[];
}

export function parseContentBlocks(input: unknown): ContentBlockParseResult {
	if (!Array.isArray(input)) return { blocks: [], issues: ['Content blocks must be an array.'] };

	const blocks: ContentBlock[] = [];
	const issues: string[] = [];
	for (const [index, candidate] of input.entries()) {
		const parsed = contentBlockSchema.safeParse(candidate);
		if (parsed.success) {
			blocks.push(parsed.data);
		} else {
			issues.push(
				`blocks.${index}: ${parsed.error.issues.map((issue) => issue.message).join(' ')}`
			);
		}
	}
	return { blocks, issues };
}
