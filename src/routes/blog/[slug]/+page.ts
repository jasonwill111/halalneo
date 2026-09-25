import type { EntryGenerator, PageLoad } from './$types';
import { readItems, readJson } from '#lib/utils/api-response.js';
import type { PageDto } from '#lib/schemas/pages.js';

export const entries: EntryGenerator = () => [];

/** Detail payload the article template renders. */
interface BlogDetailItem {
	title: string | null;
	tags: string[];
	date: string;
	author: { name: string; initials: string };
	content: string | null;
	image: string | null;
	readTime: string;
	/** Not emitted by this loader — the share block reads it defensively. */
	excerpt?: string | null;
}

/** Card payload for the "more from the blog" lists. */
interface BlogRelatedItem {
	slug: string;
	title: string;
	excerpt: string;
	date: string;
	author: { name: string };
	tags: string[];
}

export const load: PageLoad = async ({ params, fetch }) => {
	// D1 stores publishedAt as epoch seconds; normalize to ISO 8601.
	const toIsoDate = (v: unknown): string => {
		if (v == null || v === '') return '';
		if (typeof v === 'number') return new Date(v > 1e12 ? v : v * 1000).toISOString();
		const d = new Date(String(v));
		return isNaN(d.getTime()) ? '' : d.toISOString();
	};

	try {
		const [res, relatedRes] = await Promise.all([
			fetch(`/api/pages/${params.slug}`),
			fetch(`/api/blog?type=blog&limit=4`)
		]);

		if (res.ok) {
			const data: PageDto = await readJson<PageDto>(res);
			const tagsParsed =
				typeof data.tags === 'string'
					? (JSON.parse(data.tags || '[]') as string[])
					: (data.tags ?? []);
			const relatedPosts = await readItems<PageDto>(relatedRes);
			const related: BlogRelatedItem[] = relatedPosts
				.filter((p) => p.slug !== params.slug)
				.slice(0, 3)
				.map((p) => ({
					slug: p.slug ?? '',
					title: p.title ?? '',
					excerpt: p.excerpt ?? p.metaDescription ?? '',
					date: toIsoDate(p.publishedAt),
					author: { name: p.author || 'HalalNeo' },
					tags:
						typeof p.tags === 'string' ? (JSON.parse(p.tags || '[]') as string[]) : (p.tags ?? [])
				}));

			const wordCount = data.body ? data.body.replace(/<[^>]*>/g, '').split(/\s+/).length : 0;
			const readTime = `${Math.max(1, Math.ceil(wordCount / 200))} min read`;

			const authorInitials =
				(data.author || 'HalalNeo')
					.split(/\s+/)
					.map((w) => w[0])
					.filter(Boolean)
					.slice(0, 2)
					.join('')
					.toUpperCase() || 'HN';

			const item: BlogDetailItem = {
				title: data.title,
				tags: tagsParsed,
				date: toIsoDate(data.publishedAt),
				author: { name: data.author || 'HalalNeo', initials: authorInitials },
				content: data.body,
				image: data.featuredImage,
				readTime
			};

			return {
				slug: params.slug,
				seo: {
					title:
						data.metaTitle ||
						(data.title ? `${data.title} — HalalNeo Blog` : `${params.slug} — HalalNeo Blog`),
					description:
						data.metaDescription ||
						data.excerpt ||
						`Read about ${data.title || params.slug} on the HalalNeo blog — insights on halal certification and sourcing.`,
					ogImage: data.featuredImage || 'https://halalneo.com/brand/og-default.png',
					keywords: data.keywords || ['halal blog', 'certification insights', 'trade news'],
					ogType: 'article'
				},
				item,
				related
			};
		}
	} catch {
		// fetch/parse failed — fall back to the static payload below
	}

	return {
		slug: params.slug,
		seo: {
			title: `${params.slug} — HalalNeo Blog`,
			description: `Read about ${params.slug} on the HalalNeo blog — insights on halal certification and sourcing.`,
			robots: 'noindex, nofollow',
			ogType: 'article'
		},
		item: null as BlogDetailItem | null,
		related: []
	};
};
