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
	try {
		const [res, relatedRes] = await Promise.all([
			fetch(`/api/pages/${params.slug}`),
			fetch(`/api/blog?type=blog&limit=4`)
		]);

		if (res.ok) {
			const data: BlogPost = await res.json();
			const tagsParsed = typeof data.tags === 'string' ? JSON.parse(data.tags || '[]') : data.tags ?? [];
			const relatedData = relatedRes.ok ? await relatedRes.json() : { items: [] };
			const relatedPosts = relatedData.items ?? [];
			const related = relatedPosts
				.filter((p: any) => p.slug !== params.slug)
				.slice(0, 3)
				.map((p: any) => ({
					slug: p.slug ?? '',
					title: p.title ?? '',
					excerpt: p.excerpt ?? p.metaDescription ?? '',
					date: p.publishedAt ?? '',
					author: { name: p.author || 'HalalNeo' },
					tags: typeof p.tags === 'string' ? JSON.parse(p.tags || '[]') : p.tags ?? []
				}));

			const wordCount = data.body ? data.body.replace(/<[^>]*>/g, '').split(/\s+/).length : 0;
			const readTime = `${Math.max(1, Math.ceil(wordCount / 200))} min read`;

			const item = {
				title: data.title,
				tags: tagsParsed,
				date: data.publishedAt,
				author: { name: data.author || 'HalalNeo', initials: 'HN' },
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
						`Read about ${data.title || params.slug} on the HalalNeo blog — insights on halal certification and medical device compliance.`,
					ogImage: data.featuredImage || 'https://halalneo.com/og-blog.png',
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
			description: `Read about ${params.slug} on the HalalNeo blog — insights on halal certification and medical device compliance.`
		},
		item: null as any,
		related: []
	};
};
