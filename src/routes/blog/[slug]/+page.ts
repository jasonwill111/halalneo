import type { EntryGenerator, PageLoad } from './$types';

export const entries: EntryGenerator = () => [];

interface BlogPost {
	title?: string;
	metaDescription?: string;
	excerpt?: string;
	featuredImage?: string;
	keywords?: string[];
	tags?: string[];
	publishedAt?: string;
	author?: string;
	body?: string;
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
			const data: BlogPost = (await res.json()) as any;
			const tagsParsed = typeof data.tags === 'string' ? JSON.parse(data.tags || '[]') : data.tags ?? [];
			const relatedData = relatedRes.ok ? ((await relatedRes.json()) as any) : { items: [] };
			const relatedPosts = relatedData.items ?? [];
			const related = relatedPosts
				.filter((p: any) => p.slug !== params.slug)
				.slice(0, 3)
				.map((p: any) => ({
					slug: p.slug ?? '',
					title: p.title ?? '',
					excerpt: p.excerpt ?? p.metaDescription ?? '',
					date: toIsoDate(p.publishedAt),
					author: { name: p.author || 'HalalNeo' },
					tags: typeof p.tags === 'string' ? JSON.parse(p.tags || '[]') : p.tags ?? []
				}));

			const wordCount = data.body ? data.body.replace(/<[^>]*>/g, '').split(/\s+/).length : 0;
			const readTime = `${Math.max(1, Math.ceil(wordCount / 200))} min read`;

			const authorInitials =
				(data.author || 'HalalNeo')
					.split(/\s+/)
					.map((w: string) => w[0])
					.filter(Boolean)
					.slice(0, 2)
					.join('')
					.toUpperCase() || 'HN';

			const item = {
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
					title: data.title ? `${data.title} — HalalNeo Blog` : `${params.slug} — HalalNeo Blog`,
				description:
					data.excerpt || data.metaDescription ||
					`Read about ${data.title || params.slug} on the HalalNeo blog — insights on halal certification and sourcing.`,
					ogImage: data.featuredImage || 'https://halalneo.com/api/media/og-blog.png',
					keywords: data.keywords || ['halal blog', 'certification insights', 'trade news']
				},
				item,
				related
			};
		}
	} catch {}

	return {
		slug: params.slug,
		seo: {
			title: `${params.slug} — HalalNeo Blog`,
			description: `Read about ${params.slug} on the HalalNeo blog — insights on halal certification and sourcing.`,
			robots: 'noindex, nofollow'
		},
		item: null as any,
		related: []
	};
};
