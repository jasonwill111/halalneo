import type { PageLoad } from './$types';
import { readJson } from '#lib/utils/api-response.js';
import { getSection } from '#lib/data/kb-sections.js';

const BASE_URL = 'https://halalneo.com';

export const prerender = false;

/**
 * `/api/knowledge-base` list projection (`getKbListItems`): slug/title/section/
 * status/excerpt/views. The JSON-LD builders below also read summary/tags/
 * publishedAt/updatedAt, which the current projection omits — hence optional.
 */
interface KbListRow {
	slug: string;
	title: string | null;
	section: string | null;
	status: string | null;
	excerpt: string | null;
	views: number | null;
	summary?: string | null;
	tags?: string | string[] | null;
	publishedAt?: string | number | null;
	updatedAt?: string | number | null;
}

interface KbSectionResponse {
	items?: KbListRow[];
	articles?: KbListRow[];
}

export const load: PageLoad = async ({ params, fetch }) => {
	// Real display name from the static section definitions (e.g. slug
	// 'country-market-guides' -> 'Country / Market Guides'); fall back to
	// title-casing the slug for unknown sections.
	const sectionTitle = getSection(params.section)?.title ?? params.section.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

	try {
		const res = await fetch(`/api/knowledge-base?section=${params.section}&limit=50`);
		if (res.ok) {
			const data: KbSectionResponse = await readJson<KbSectionResponse>(res);
			const articles = (data.items ?? data.articles ?? []).map((a) => ({
				...a,
				tags:
					typeof a.tags === 'string' ? (JSON.parse(a.tags || '[]') as string[]) : (a.tags ?? [])
			}));

			// ItemList for articles within this section
			const itemList = {
				'@context': 'https://schema.org',
				'@type': 'ItemList',
				name: `${sectionTitle} Articles`,
				description: `Collection of articles within ${sectionTitle} section on HalalNeo Knowledge Base`,
				itemListElement: articles.slice(0, 50).map((article, i) => ({
					'@type': 'ListItem',
					position: i + 1,
					item: {
						'@type': 'NewsArticle',
						name: article.title,
						description: article.summary,
						url: `${BASE_URL}/knowledge-base/${params.section}/${article.slug}`,
						datePublished: article.publishedAt,
						dateModified: article.updatedAt
					}
				}))
			};

			// CollectionPage for the section
			const collectionPage = {
				'@context': 'https://schema.org',
				'@type': 'CollectionPage',
				name: `${sectionTitle} — HalalNeo Knowledge Base`,
				description: `Explore ${sectionTitle.toLowerCase()} articles and guides on HalalNeo — halal certification and compliance resources.`,
				url: `${BASE_URL}/knowledge-base/${params.section}`,
				isPartOf: { '@type': 'WebSite', name: 'HalalNeo', url: 'https://halalneo.com' },
				hasPart: articles.map((article) => ({
					'@type': 'NewsArticle',
					name: article.title,
					url: `${BASE_URL}/knowledge-base/${params.section}/${article.slug}`
				}))
			};

			return {
				seo: {
					title: `${sectionTitle} — HalalNeo Knowledge Base`,
					description: `Explore ${sectionTitle.toLowerCase()} articles and guides on HalalNeo — halal certification and compliance resources.`,
					ogImage: 'https://halalneo.com/brand/og-default.png',
					ogType: 'article',
					keywords: [sectionTitle, 'halal knowledge base', 'certification guide', 'compliance']
				},
				item: {
					slug: params.section,
					name: sectionTitle,
					description: `Explore ${sectionTitle.toLowerCase()} articles and guides on halal certification and compliance.`,
					articleCount: articles.length,
					articles
				},
				itemList,
				collectionPage
			};
		}
	} catch {
		// fetch/parse failed — fall back to the static payload below
	}

	return {
		seo: {
			title: `${sectionTitle} — HalalNeo Knowledge Base`,
			description: `Explore ${sectionTitle.toLowerCase()} articles and guides on HalalNeo — halal certification and compliance resources.`,
			ogImage: 'https://halalneo.com/brand/og-default.png',
			ogType: 'article'
		},
		item: null,
		itemList: {},
		collectionPage: {}
	};
};
