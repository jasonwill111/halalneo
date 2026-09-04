import type { RequestHandler } from './$types';
import { getDbFromPlatform } from '#lib/server/db/api-helpers.js';
import { pages } from '#lib/server/db/schema.js';
import { and, desc, eq } from 'drizzle-orm';

const BASE_URL = 'https://halalneo.com';

function escapeXml(str: string | null | undefined): string {
	return (str ?? '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

function toRfc822(date: unknown): string {
	if (!date) return new Date().toUTCString();
	const d = date instanceof Date ? date : new Date(date as number);
	return isNaN(d.getTime()) ? new Date().toUTCString() : d.toUTCString();
}

function excerptOf(post: { excerpt?: string | null; body?: string | null }): string {
	if (post.excerpt) return post.excerpt;
	const text = (post.body ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
	return text.length > 300 ? text.slice(0, 300).trimEnd() + '…' : text;
}

export const GET: RequestHandler = async ({ platform }) => {
	let items: Array<{
		slug: string;
		title: string;
		excerpt?: string | null;
		body?: string | null;
		author?: string | null;
		publishedAt?: Date | number | null;
		updatedAt?: Date | number | null;
	}> = [];

	const db = getDbFromPlatform(platform);
	if (db) {
		try {
			const rows = await db
				.select({
					slug: pages.slug,
					title: pages.title,
					excerpt: pages.excerpt,
					body: pages.body,
					author: pages.author,
					publishedAt: pages.publishedAt,
					updatedAt: pages.updatedAt
				})
				.from(pages)
				.where(and(eq(pages.type, 'blog' as const), eq(pages.status, 'published' as const)))
				.orderBy(desc(pages.publishedAt))
				.limit(30);
			items = rows;
		} catch {
			items = [];
		}
	}

	const xmlItems = items
		.map(
			(post) => `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${BASE_URL}/blog/${escapeXml(post.slug)}</link>
      <guid isPermaLink="true">${BASE_URL}/blog/${escapeXml(post.slug)}</guid>
      <description>${escapeXml(excerptOf(post))}</description>
      ${post.author ? `<author>${escapeXml(post.author)}</author>` : ''}
      <pubDate>${toRfc822(post.publishedAt ?? post.updatedAt)}</pubDate>
    </item>`
		)
		.join('\n');

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>HalalNeo - Halal Trade Blog</title>
    <link>${BASE_URL}/blog</link>
    <description>Industry insights, market reports, and updates on halal trade, certification, and sourcing.</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${xmlItems}
  </channel>
</rss>`;

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/rss+xml; charset=utf-8',
			'Cache-Control': 'public, max-age=3600, stale-while-revalidate=3600'
		}
	});
};
