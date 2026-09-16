import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

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

	const guide: any = await guideRes.json();
	const allGuides: any[] = allGuidesRes.ok ? ((((await allGuidesRes.json()) as any)).items ?? []) : [];
	const allCertifiers: any[] = certifiersRes.ok ? ((((await certifiersRes.json()) as any)).items ?? []) : [];
	const posts: any[] = postsRes.ok ? ((((await postsRes.json()) as any)).items ?? []) : [];
	const shows: any[] = showsRes.ok ? ((((await showsRes.json()) as any)).items ?? []) : [];
	const stories: any[] = storiesRes.ok ? ((((await storiesRes.json()) as any)).items ?? []) : [];

	// certifying_bodies.id IS a slug ("bpjph"), matching guide JSON entries'
	// {slug, name}. Slug match is primary; name match covers entries whose
	// label diverges from the canonical body name (e.g. "BPJPH" vs "BPJPH / MUI").
	const validCertifierIds = new Set(allCertifiers.map((c: any) => c.id));
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
			ogImage: 'https://halalneo.com/api/media/og-default.png',
			ogType: 'article'
		}
	};
};
