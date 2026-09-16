import type { PageLoad } from './$types';
import { kbSections } from '#lib/data/kb-sections.js';

const BASE_URL = 'https://halalneo.com';

export const prerender = false;

const sectionMeta: Record<string, { title: string; description: string; icon: string }> =
	Object.fromEntries(
		kbSections.map((s) => [s.slug, { title: s.title, description: s.description, icon: s.icon }])
	);

export const load: PageLoad = async ({ fetch }) => {
	const [articlesRes, sectionsRes, marketGuidesRes, tradeShowsRes, glossaryRes] = await Promise.all([
		fetch('/api/knowledge-base?limit=50'),
		fetch('/api/knowledge-base/sections'),
		fetch('/api/market-guides?limit=1'),
		fetch('/api/trade-shows?limit=1'),
		fetch('/api/pages?category=glossary&limit=1')
	]);

	const articles = (articlesRes.ok ? ((await articlesRes.json()) as { items?: any[] }).items ?? [] : []).map((a: any) => ({
		...a,
		tags: typeof a.tags === 'string' ? JSON.parse(a.tags || '[]') : a.tags ?? []
	}));
	const rawSections = sectionsRes.ok ? ((await sectionsRes.json()) as { items?: any[] }).items ?? [] : [];
	const sections = rawSections.map((s: any) => ({
		slug: s.section,
		...sectionMeta[s.section],
		count: s.count
	})).filter((s: any) => s.title);

	const marketGuidesCount = marketGuidesRes.ok ? ((await marketGuidesRes.json()) as { total?: number }).total ?? 0 : 0;
	const tradeShowsCount = tradeShowsRes.ok ? ((await tradeShowsRes.json()) as { total?: number }).total ?? 0 : 0;
	const glossaryCount = glossaryRes.ok ? ((await glossaryRes.json()) as { total?: number }).total ?? 0 : 0;

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
			ogImage: 'https://halalneo.com/api/media/og-kb.png',
			keywords: ['halal certification guide', 'halal compliance', 'trade sourcing', 'halal logistics']
		},
		articles,
		sections,
		marketGuidesCount,
		tradeShowsCount,
		glossaryCount,
		itemList,
		collectionPage
	};
};
