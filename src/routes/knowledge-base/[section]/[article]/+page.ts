import type { EntryGenerator, PageLoad } from './$types';

export const entries: EntryGenerator = () => [];

interface KbArticle {
	title?: string;
	summary?: string;
	tags?: string[];
	sectionSlug?: string;
	sectionName?: string;
	readTime?: string;
	body?: string;
	content?: string;
}

export const load: PageLoad = async ({ params, fetch }) => {
	try {
		const [res, relatedRes] = await Promise.all([
			fetch(`/api/knowledge-base/${params.article}`),
			fetch('/api/knowledge-base?limit=100')
		]);

		if (res.ok) {
			const data: KbArticle = await res.json();
			const tagsParsed =
				typeof data.tags === 'string' ? JSON.parse(data.tags || '[]') : (data.tags ?? []);

			let related: {
				slug: string;
				sectionSlug: string;
				title: string;
				summary: string;
				readTime: string;
			}[] = [];
			try {
				if (relatedRes.ok) {
					const relatedData = await relatedRes.json();
					const candidates = (relatedData.items ?? []).filter(
						(a: any) => a.slug !== params.article
					);
					const tagSet = new Set(tagsParsed.map((t: string) => t.toLowerCase()));
					const scoreOf = (a: any) => {
						const aTags = (
							typeof a.tags === 'string' ? JSON.parse(a.tags || '[]') : (a.tags ?? [])
						) as string[];
						return aTags.filter((t: string) => tagSet.has(t.toLowerCase())).length;
					};
					related = candidates
						.toSorted((a: any, b: any) => scoreOf(b) - scoreOf(a))
						.filter((a: any) => scoreOf(a) > 0)
						.slice(0, 3)
						.map((a: any) => ({
							slug: a.slug,
							sectionSlug: a.section ?? a.sectionSlug ?? '',
							title: a.title ?? '',
							summary: a.summary ?? '',
							readTime: a.readTime ?? '5 min read'
						}));
					if (related.length === 0) {
						related = candidates.slice(0, 3).map((a: any) => ({
							slug: a.slug,
							sectionSlug: a.section ?? a.sectionSlug ?? '',
							title: a.title ?? '',
							summary: a.summary ?? '',
							readTime: a.readTime ?? '5 min read'
						}));
					}
				}
			} catch {}

			return {
				slug: params.article,
				seo: {
					title: data.title ? `${data.title} — HalalNeo` : `${params.article} — HalalNeo`,
					description:
						data.summary ||
						`Read about ${data.title || params.article} on HalalNeo — halal certification and compliance guide.`,
					ogImage: 'https://halalneo.com/api/media/og-kb.svg',
					keywords: tagsParsed.length
						? tagsParsed
						: ['halal certification', 'compliance guide', 'trade knowledge']
				},
				item: { ...data, tags: tagsParsed },
				related
			};
		}
	} catch {}

	return {
		slug: params.article,
		seo: {
			title: `${params.article} — HalalNeo`,
			description: `Read about ${params.article} on HalalNeo — halal certification and compliance guide.`
		},
		item: null,
		related: []
	};
};
