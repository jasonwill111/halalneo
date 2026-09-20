import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { readItems, readJson } from '#lib/utils/api-response.js';
import type { GuidePost, GuideShow } from '#lib/data/guide-playbook.js';
import type { CertifyingBodyRecord } from '#lib/schemas/certifying-bodies.js';
import type { MarketGuideDto } from '#lib/schemas/market-guides.js';
import type { SuccessStoryItem } from '#lib/types/api.js';

export const load: PageServerLoad = async ({ params, fetch }) => {
	const [guideRes, allGuidesRes, certifiersRes, postsRes, showsRes, storiesRes] = await Promise.all([
		fetch(`/api/market-guides/${params.country}`),
		fetch('/api/market-guides?limit=50'),
		fetch('/api/certifying-bodies?limit=50'),
		fetch('/api/blog?limit=10&status=published'),
		fetch('/api/trade-shows?limit=50'),
		fetch('/api/success-stories?limit=20')
	]);

	if (!guideRes.ok) {
		error(404, { message: 'Market guide not found' });
	}

	const guide: MarketGuideDto = await readJson<MarketGuideDto>(guideRes);
	const allGuides = await readItems<MarketGuideDto>(allGuidesRes);
	const allCertifiers = await readItems<CertifyingBodyRecord>(certifiersRes);
	const posts = await readItems<GuidePost>(postsRes);
	const shows = await readItems<GuideShow>(showsRes);
	const stories = await readItems<SuccessStoryItem>(storiesRes);

	// certifying_bodies.id IS a slug ("bpjph"), matching guide JSON entries'
	// {slug, name}. Slug match is primary; name match covers entries whose
	// label diverges from the canonical body name (e.g. "BPJPH" vs "BPJPH / MUI").
	const validCertifierIds = new Set(allCertifiers.map((c) => c.id));
	const certifierLinksByName: Record<string, string> = {};
	for (const c of allCertifiers) {
		const key = String(c.name ?? '').trim().toLowerCase();
		if (key && !certifierLinksByName[key]) certifierLinksByName[key] = c.id;
	}

	return {
		guide,
		allGuides,
		posts,
		shows,
		stories,
		validCertifierIds: Array.from(validCertifierIds),
		certifierLinksByName,
		seo: {
			// DB per-row meta wins when admins filled it; else derive.
			title: guide.metaTitle || `Halal Market Guide: ${guide.country} — Certifiers, Requirements & Costs`,
			description:
				guide.metaDescription ||
				(guide.summary || `Halal market guide for ${guide.country} — certification requirements, market size, and compliance insights.`).slice(0, 155),
			ogImage: 'https://halalneo.com/brand/og-default.png',
			ogType: 'article'
		}
	};
};
