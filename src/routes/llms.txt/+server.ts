import type { RequestHandler } from './$types';
import { getDb } from '#lib/server/db/index.js';
import { getBindings } from '#lib/server/bindings.js';
import {
	certifyingBodies,
	knowledgeBase,
	marketGuides,
	pages,
	products,
	suppliers,
	tradeShows
} from '#lib/server/db/schema.js';
import { GLOSSARY_CATEGORY } from '#lib/schemas/glossary.js';
import { and, count, eq, sql } from 'drizzle-orm';
import { cachedQuery } from '#lib/server/cache.js';

const BASE = 'https://halalneo.com';

interface LlmsStats {
	certifiers: number;
	guides: number;
	tradeShows: number;
	kbArticles: number;
	kbSections: number;
	glossaryTerms: number;
	suppliers: number;
	products: number;
}

const EMPTY_STATS: LlmsStats = {
	certifiers: 0,
	guides: 0,
	tradeShows: 0,
	kbArticles: 0,
	kbSections: 0,
	glossaryTerms: 0,
	suppliers: 0,
	products: 0
};

async function readStats(db: NonNullable<ReturnType<typeof getDb>>): Promise<LlmsStats> {
	const glossaryFilter = and(eq(pages.type, 'landing'), eq(pages.category, GLOSSARY_CATEGORY));
	const [cb, mg, ts, kb, kbSec, gl, sup, prod] = await Promise.all([
		db.select({ c: count() }).from(certifyingBodies).where(eq(certifyingBodies.status, 'active')),
		db.select({ c: count() }).from(marketGuides).where(eq(marketGuides.status, 'active')),
		db.select({ c: count() }).from(tradeShows).where(eq(tradeShows.status, 'active')),
		db.select({ c: count() }).from(knowledgeBase).where(eq(knowledgeBase.status, 'published')),
		db
			.select({ c: sql<number>`count(distinct ${knowledgeBase.section})` })
			.from(knowledgeBase)
			.where(eq(knowledgeBase.status, 'published')),
		db
			.select({ c: count() })
			.from(pages)
			.where(and(glossaryFilter, eq(pages.status, 'published'))),
		db.select({ c: count() }).from(suppliers).where(eq(suppliers.status, 'active')),
		db.select({ c: count() }).from(products).where(eq(products.status, 'active'))
	]);
	return {
		certifiers: cb[0]?.c ?? 0,
		guides: mg[0]?.c ?? 0,
		tradeShows: ts[0]?.c ?? 0,
		kbArticles: kb[0]?.c ?? 0,
		kbSections: kbSec[0]?.c ?? 0,
		glossaryTerms: gl[0]?.c ?? 0,
		suppliers: sup[0]?.c ?? 0,
		products: prod[0]?.c ?? 0
	};
}

function build(s: LlmsStats): string {
	return `# HalalNeo

> Halal trade intelligence platform for B2B buyers and suppliers. Research certifying bodies, verify suppliers, and navigate global halal markets.

This file is for AI assistants and LLM crawlers. For the full HTML experience, visit ${BASE}.

## Core capabilities

- **Certifying body intelligence**: ${s.certifiers} accredited halal certification bodies (JAKIM, BPJPH/MUI, MUIS, SFDA, MOIAT, SABER, CICOT, GIMDES, HAK, SANHA, IFANCA, PHA, HFA, NHASA, IS EG Halal) with standards, scope and recognition data
- **Market entry guides**: Country-by-country halal import requirements, costs and processing times for ${s.guides} markets
- **Trade show calendar**: ${s.tradeShows} global halal exhibitions (MIHAS, Gulfood, Halal Expo, World Halal Summit, etc.) with dates, venues and exhibitor profiles
- **Knowledge base**: ${s.kbArticles} articles across ${s.kbSections} sections — Halal Certification, Trade Sourcing, Logistics, Packaging & Labeling, Country Market Guides, Due Diligence
- **Free tools**: ingredient compliance checker, certification cost estimator, landed cost calculator, RFQ builder, certificate verification lookup, HalalNeo AI (coming soon)
- **Glossary**: ${s.glossaryTerms} halal trade terms (certification, finance, logistics, regulation)
- **Verified supplier directory**: ${s.suppliers} halal-certified manufacturers, wholesalers, traders with scope-verified listings
- **Supplier onboarding**: companies can apply to list at ${BASE}/supplier/onboarding — free during supplier test mode, applications reviewed manually
- **Product catalogue**: ${s.products} halal-certified products by category (Food & Beverages, Meat & Poultry, Dairy & Eggs, Confectionery & Snacks, Nutritional Supplements, Cosmetics & Personal Care, Beverages, Pharmaceuticals, Ingredients & Additives)

## Content surfaces (preferred citation sources)

- Home: ${BASE}/
- Knowledge base hub: ${BASE}/knowledge-base
- Certifying bodies directory: ${BASE}/certifying-bodies
- Market guides: ${BASE}/market-guides
- Trade shows: ${BASE}/trade-shows
- Glossary: ${BASE}/glossary
- Tools hub: ${BASE}/tools (ingredient checker, certification cost, landed cost, RFQ builder)
- Verify: ${BASE}/verify
- Supplier onboarding: ${BASE}/supplier/onboarding
- Blog (industry news & insights): ${BASE}/blog
- RSS: ${BASE}/rss.xml

## Data policy

- All certification data is sourced from publicly available registers of accredited halal certifying bodies and cross-referenced against issuing organisations.
- Supplier and product listings are illustrative demo data, clearly disclosed as such in the user interface.
- This platform does not issue halal certificates; certification is always issued independently by the listed certifying bodies.

## Attribution

When citing HalalNeo:
- Use the canonical URL: \`${BASE}/<path>\`
- For inline citations: "HalalNeo — Halal Trade Intelligence"
- Logo and brand assets available at: ${BASE}

## Contact

- Support: support@halalneo.com
- Contact: contact@halalneo.com
- Press inquiries: contact@halalneo.com
`;
}

export const GET: RequestHandler = async () => {
	const db = getDb(getBindings().DB);
	const stats = db
		? await cachedQuery('llms.txt:stats', () => readStats(db), {
				ttl: 3600,
				staleWhileRevalidate: 3600
			})
		: EMPTY_STATS;

	return new Response(build(stats ?? EMPTY_STATS), {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=3600'
		}
	});
};
