import { describe, expect, it } from 'vitest';
import { contentBlocksSchema, parseContentBlocks } from './blocks.js';

describe('content blocks', () => {
	it('accepts the shared block contract', () => {
		const result = contentBlocksSchema.safeParse([
			{
				id: 'intro',
				type: 'richText',
				schemaVersion: 1,
				data: { paragraphs: ['A structured paragraph.'] }
			}
		]);
		expect(result.success).toBe(true);
	});

	it('keeps valid blocks and reports invalid blocks', () => {
		const result = parseContentBlocks([
			{
				id: 'stats',
				type: 'statGrid',
				schemaVersion: 1,
				data: { items: [{ label: 'Guides', value: '11' }] }
			},
			{ id: 'broken', type: 'unknown', schemaVersion: 1, data: {} }
		]);
		expect(result.blocks).toHaveLength(1);
		expect(result.issues).toHaveLength(1);
	});
});
