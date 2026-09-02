import type { PageLoad } from './$types';

export const prerender = false;

const sectionMeta: Record<string, { title: string; description: string; icon: string }> = {
	'halal-certification': { title: 'Halal Certification', description: 'Understanding halal standards, bodies, and the certification process worldwide.', icon: 'shield-check' },
	'trade-sourcing': { title: 'Trade Sourcing', description: 'How to find, evaluate and verify halal-certified suppliers across global markets.', icon: 'search' },
	'logistics': { title: 'Logistics & Supply Chain', description: 'Halal logistics requirements, cold chain, and documentation for international shipments.', icon: 'package' },
	'packaging-labeling': { title: 'Packaging & Labeling', description: 'Halal packaging requirements, label claims, and regulatory compliance across markets.', icon: 'file-text' },
	'country-market-guides': { title: 'Country & Market Guides', description: 'Market entry guides for key halal trade destinations — ASEAN, Gulf, Europe and beyond.', icon: 'globe' },
	'due-diligence': { title: 'Due Diligence', description: 'Risk assessment frameworks, supplier audits, and compliance verification for halal trade.', icon: 'clipboard-check' }
};

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
			title: 'Halal Certification Knowledge Base —HalalNeo',
			description:
				'Comprehensive guides on halal certification, compliance, trade sourcing, logistics, and market access.',
			ogImage: 'https://halalneo.com/og-kb.png',
			keywords: ['halal certification guide', 'halal compliance', 'trade sourcing', 'halal logistics']
		},
		articles,
		sections,
		marketGuidesCount,
		tradeShowsCount,
		glossaryCount
	};
};
