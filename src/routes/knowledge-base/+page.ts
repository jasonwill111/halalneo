import type { PageLoad } from './$types';
import { kbSections } from '#lib/data/kb-sections.js';

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

	const articles = (articlesRes.ok ? (await articlesRes.json()).items ?? [] : []).map((a: any) => ({
		...a,
		tags: typeof a.tags === 'string' ? JSON.parse(a.tags || '[]') : a.tags ?? []
	}));
	const rawSections = sectionsRes.ok ? (await sectionsRes.json()).items ?? [] : [];
	const sections = rawSections.map((s: any) => ({
		slug: s.section,
		...sectionMeta[s.section],
		count: s.count
	})).filter((s: any) => s.title);

	const marketGuidesCount = marketGuidesRes.ok ? (await marketGuidesRes.json()).total ?? 0 : 0;
	const tradeShowsCount = tradeShowsRes.ok ? (await tradeShowsRes.json()).total ?? 0 : 0;
	const glossaryCount = glossaryRes.ok ? (await glossaryRes.json()).total ?? 0 : 0;

	return {
		seo: {
			title: 'Halal Certification Knowledge Base — HalalNeo',
			description:
				'Comprehensive guides on halal certification, compliance, trade sourcing, logistics, and market access.',
			ogImage: 'https://halalneo.com/api/media/og-kb.svg',
			keywords: ['halal certification guide', 'halal compliance', 'trade sourcing', 'halal logistics']
		},
		articles,
		sections,
		marketGuidesCount,
		tradeShowsCount,
		glossaryCount
	};
};
