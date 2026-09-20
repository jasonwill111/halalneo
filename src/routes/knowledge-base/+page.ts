import type { PageLoad } from './$types';
import { kbSections } from '#lib/data/kb-sections.js';
import { fetchSafe, firstFailure, type LoadFailure } from '#lib/utils/load-error.js';
import { readItems, readTotal } from '#lib/utils/api-response.js';
import type { KbArticleListItem, KbSectionCountItem } from '#lib/types/api.js';

const BASE_URL = 'https://halalneo.com';

export const prerender = false;

const sectionMeta: Record<string, { title: string; description: string; icon: string }> =
	Object.fromEntries(
		kbSections.map((s) => [s.slug, { title: s.title, description: s.description, icon: s.icon }])
	);

export const load: PageLoad = async ({ fetch }) => {
	const failures: LoadFailure[] = [];
	const [articlesRes, sectionsRes, marketGuidesRes, tradeShowsRes, glossaryRes] = await Promise.all([
		fetchSafe(fetch, '/api/knowledge-base?limit=50', failures),
		fetchSafe(fetch, '/api/knowledge-base/sections', failures),
		fetchSafe(fetch, '/api/market-guides?limit=1', failures),
		fetchSafe(fetch, '/api/trade-shows?limit=1', failures),
		fetchSafe(fetch, '/api/pages?category=glossary&limit=1', failures)
	]);

	const articles = (await readItems<KbArticleListItem>(articlesRes)).map((a) => ({
		...a,
		tags: typeof a.tags === 'string' ? (JSON.parse(a.tags || '[]') as string[]) : a.tags ?? []
	}));
	const rawSections = await readItems<KbSectionCountItem>(sectionsRes);
	const sections = rawSections.map((s) => ({
		slug: s.section,
		...sectionMeta[s.section],
		count: s.count
	})).filter((s) => s.title);

	const marketGuidesCount = await readTotal(marketGuidesRes);
	const tradeShowsCount = await readTotal(tradeShowsRes);
	const glossaryCount = await readTotal(glossaryRes);

	// ItemList for sections
	const itemList = {
		'@context': 'https://schema.org',
		'@type': 'ItemList',
		name: 'HalalTrade Knowledge Base Sections',
		description:
			'Organized sections covering halal certification, compliance, trade sourcing, logistics, and market access.',
		itemListElement: sections.map((section, i) => ({
			'@type': 'ListItem',
			position: i + 1,
			item: {
				'@type': 'WebPage',
				name: `${section.title} — HalalNeo Knowledge Base`,
				description: section.description,
				url: `${BASE_URL}/knowledge-base/${section.slug}`
			}
		}))
	};

	// CollectionPage for KB as a whole
	const collectionPage = {
		'@context': 'https://schema.org',
		'@type': 'CollectionPage',
		name: 'HalalNeo Knowledge Base',
		description: 'Comprehensive guides on halal certification, compliance, trade sourcing, logistics, and market access.',
		url: `${BASE_URL}/knowledge-base`,
		isPartOf: { '@type': 'WebSite', name: 'HalalNeo', url: 'https://halalneo.com' },
		hasPart: itemList.itemListElement.map((part) => part.item.url)
	};

	return {
		seo: {
			title: 'Halal Certification Knowledge Base — HalalNeo',
			description:
				'Comprehensive guides on halal certification, compliance, trade sourcing, logistics, and market access.',
			ogImage: 'https://halalneo.com/brand/og-default.png',
			keywords: ['halal certification guide', 'halal compliance', 'trade sourcing', 'halal logistics']
		},
		articles,
		sections,
		marketGuidesCount,
		tradeShowsCount,
		glossaryCount,
		itemList,
		collectionPage,
		loadError: firstFailure(failures)
	};
};
