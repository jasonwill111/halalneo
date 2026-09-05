import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, fetch }) => {
	const [guideRes, allGuidesRes, certifiersRes] = await Promise.all([
		fetch(`/api/market-guides/${params.country}`),
		fetch('/api/market-guides?limit=50'),
		fetch('/api/certifying-bodies?limit=50')
	]);

	if (!guideRes.ok) {
		error(404, { message: 'Market guide not found' });
	}

	const guide: any = await guideRes.json();
	const allGuides: any[] = allGuidesRes.ok ? ((((await allGuidesRes.json()) as any)).items ?? []) : [];
	const allCertifiers: any[] = certifiersRes.ok ? ((((await certifiersRes.json()) as any)).items ?? []) : [];
	const certifierIds = new Set(allCertifiers.map((c: any) => c.id));

	return {
		guide,
		allGuides,
		certifiersById: allCertifiers.reduce((acc: Record<string, any>, c: any) => {
			acc[c.id] = c;
			return acc;
		}, {}),
		validCertifierIds: Array.from(certifierIds),
		seo: {
			title: `Halal Market Guide: ${guide.country} — Certifiers, Requirements & Costs`,
			description: (guide.summary || '').slice(0, 155),
			ogImage: 'https://halalneo.com/api/media/og-default.png'
		}
	};
};
