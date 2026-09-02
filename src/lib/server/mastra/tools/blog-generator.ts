import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

const blogContentSchema = z.object({
	title: z.string().describe('Blog article title'),
	subtitle: z.string().optional().describe('Subtitle or tagline'),
	sections: z
		.array(
			z.object({
				heading: z.string().describe('Section heading'),
				content: z.string().describe('Section content in HTML format'),
				level: z.enum(['h2', 'h3', 'h4']).optional().describe('Heading level')
			})
		)
		.describe('Article sections'),
	tags: z.array(z.string()).optional().describe('Article tags'),
	category: z.string().describe('Article category')
});

export const blogGeneratorTool = createTool({
	id: 'generate-blog-content',
	description:
		'Generate structured blog article content for the HalalNeo platform. Returns HTML content suitable for the Lexical rich text editor. Focus on halal trade, certification, compliance, sourcing, and market intelligence topics.',
	inputSchema: z.object({
		topic: z.string().describe('The blog article topic or prompt'),
		style: z
			.enum(['informative', 'tutorial', 'analysis', 'news'])
			.optional()
			.describe('Content style'),
		wordCount: z.number().optional().describe('Approximate word count target'),
		includeSchema: z.boolean().optional().describe('Include structured data/schema markup guidance')
	}),
	outputSchema: z.object({
		title: z.string(),
		subtitle: z.string().optional(),
		html: z.string().describe('Full article HTML for Lexical editor'),
		summary: z.string(),
		tags: z.array(z.string()),
		category: z.string()
	}),
	execute: async ({ context }) => {
		const { topic, style = 'informative', wordCount = 1000 } = context;

		const systemPrompt = `You are a halal trade content writer for HalalNeo, a global halal marketplace platform. 
Write a ${style} article about: ${topic}

Target word count: ~${wordCount} words.

Output your response as a JSON object with this exact structure:
{
  "title": "Article title",
  "subtitle": "Optional subtitle",
  "sections": [
    {
      "heading": "Section heading",
      "content": "<p>HTML content for this section. Use <strong>, <em>, <a>, <ul>, <ol>, <li>, <blockquote>, <code>, <h3>, <h4> tags as needed.</p>",
      "level": "h2"
    }
  ],
  "tags": ["tag1", "tag2"],
  "category": "Category name"
}

Rules:
- Write in professional, authoritative tone
- Focus on practical value for halal trade buyers and suppliers
- Include specific examples, standards, or certification body names when relevant
- Use proper HTML tags for formatting (not markdown)
- Each section should be 100-300 words
- Always include 3-5 relevant tags
- Categories: Halal Certification, Trade Sourcing, Market Intelligence, Compliance, Logistics, Technology
- Ensure all HTML is valid and self-contained`;

		const response = await fetch('https://apihub.agnes-ai.com/v1/chat/completions', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${process.env.AGNES_API_KEY}`
			},
			body: JSON.stringify({
				model: 'agnes-2.5-flash',
				messages: [
					{ role: 'system', content: systemPrompt },
					{ role: 'user', content: `Write a blog article about: ${topic}` }
				],
				temperature: 0.7,
				max_tokens: 2000
			})
		});

		const data = await response.json();
		const content = data.choices?.[0]?.message?.content || '';

		let parsed;
		try {
			const jsonMatch = content.match(/\{[\s\S]*\}/);
			if (jsonMatch) {
				parsed = JSON.parse(jsonMatch[0]);
			} else {
				throw new Error('No JSON found in response');
			}
		} catch {
			parsed = {
				title: topic,
				subtitle: '',
				sections: [{ heading: topic, content: `<p>${content}</p>`, level: 'h2' }],
				tags: [],
				category: 'Halal Trade'
			};
		}

		const html = `
<h1>${parsed.title}</h1>
${parsed.subtitle ? `<p><em>${parsed.subtitle}</em></p>` : ''}
${parsed.sections.map((s: { heading: string; content: string; level?: string }) => `<${s.level || 'h2'}>${s.heading}</${s.level || 'h2'}>${s.content}`).join('\n')}
`.trim();

		return {
			title: parsed.title,
			subtitle: parsed.subtitle || undefined,
			html,
			summary: parsed.sections[0]?.content?.replace(/<[^>]*>/g, '').slice(0, 200) || '',
			tags: parsed.tags || [],
			category: parsed.category || 'Halal Trade'
		};
	}
});
