// Market-guide playbook helpers — derived presentation only.
//
// Everything here is computed from the guide row itself plus shared datasets
// (RECOGNITION_DATA, blog posts, trade shows, success stories). No new facts
// are introduced: costs re-present `estimatedCostUsd`, steps re-present
// `importRequirements`, signals link out to real sources. Anything that cannot
// be derived returns null/[] so the UI can fall back gracefully.

import { RECOGNITION_DATA, type RecognitionStatus } from './recognition.js';
import { certifyingBodies } from './certifying-bodies.js';

// ---------------------------------------------------------------------------
// Country normalisation (guide rows, recognition entries, trade shows and
// blog tags spell a few markets differently).
// ---------------------------------------------------------------------------

const COUNTRY_ALIASES: Record<string, string> = {
	uae: 'united arab emirates',
	'united arab emirates': 'united arab emirates',
	turkey: 'türkiye',
	'türkiye': 'türkiye',
	usa: 'united states',
	us: 'united states',
	'united states': 'united states',
	uk: 'united kingdom',
	'united kingdom': 'united kingdom',
	vietnam: 'vietnam',
	'saudi arabia': 'saudi arabia',
	indonesia: 'indonesia',
	malaysia: 'malaysia',
	pakistan: 'pakistan',
	singapore: 'singapore',
	thailand: 'thailand',
	bangladesh: 'bangladesh',
	egypt: 'egypt'
};

export function normalizeCountry(name: string | null | undefined): string {
	const key = String(name ?? '').trim().toLowerCase();
	return COUNTRY_ALIASES[key] ?? key;
}

export function sameCountry(a: string | null | undefined, b: string | null | undefined): boolean {
	return normalizeCountry(a) === normalizeCountry(b);
}

// ---------------------------------------------------------------------------
// 1. Cost estimator — parses the guide's own `estimatedCostUsd` range and
//    positions three buyer sizes inside it. Unparseable strings fall back to
//    the raw text so we never invent numbers.
// ---------------------------------------------------------------------------

export interface CostTier {
	id: 'sme' | 'growth' | 'enterprise';
	label: string;
	range: string;
	note: string;
}

const COST_NUMBER_RE = /([$€£]?\s?[\d,]+(?:\.\d+)?)\s*(?:–|—|-|to)\s*([$€£]?\s?[\d,]+(?:\.\d+)?)/;

function formatUsd(n: number): string {
	return '$' + Math.round(n).toLocaleString('en-US');
}

export function costTiers(
	estimatedCostUsd: string | null | undefined,
	processingTime?: string | null,
	certificateValidity?: string | null
): CostTier[] | null {
	if (!estimatedCostUsd) return null;
	const match = String(estimatedCostUsd).match(COST_NUMBER_RE);
	if (!match) return null;
	const clean = (s: string) => parseFloat(s.replace(/[^0-9.]/g, ''));
	const low = clean(match[1]);
	const high = clean(match[2]);
	if (!Number.isFinite(low) || !Number.isFinite(high) || low <= 0 || high <= low) return null;
	const mid = Math.round((low + high) / 2);
	const cycle = [processingTime, certificateValidity].filter(Boolean).join(' · ');
	const cycleNote = cycle ? ` Typical cycle: ${cycle}.` : '';
	return [
		{
			id: 'sme',
			label: 'SME · first cert',
			range: `${formatUsd(low)}–${formatUsd(mid)}`,
			note: `Lower end of the guide range — single site, single category.${cycleNote} Confirm with the certifying body.`
		},
		{
			id: 'growth',
			label: 'Growth · 2–5 SKUs',
			range: `~${formatUsd(mid)}`,
			note: `Mid-range — added SKUs and label reviews push cost toward the middle.${cycleNote}`
		},
		{
			id: 'enterprise',
			label: 'Enterprise · multi-site',
			range: `${formatUsd(high)}+`,
			note: `Upper end and above — multi-site audits, renewals and local representation.${cycleNote}`
		}
	];
}

// ---------------------------------------------------------------------------
// 2. Import-requirements stepper — classifies each requirement into a phase.
// ---------------------------------------------------------------------------

export type RequirementPhase = 'Certification' | 'Registration' | 'Labelling' | 'Customs';

export const PHASE_TONES: Record<RequirementPhase | 'Requirement', string> = {
	Certification: 'bg-primary/10 text-primary',
	Registration: 'bg-info/10 text-info',
	Labelling: 'bg-warn/10 text-warn',
	Customs: 'bg-success/10 text-success',
	Requirement: 'bg-muted text-muted-foreground'
};

export function classifyRequirement(req: string): RequirementPhase | 'Requirement' {
	const s = req.toLowerCase();
	if (/(certif|recogni|fhcb|jakim|audit|standard|halal scheme|accredit)/.test(s)) return 'Certification';
	if (/(regist|sihalal|portal|saber|licen|authoriz|approval|psw|e-portal)/.test(s)) return 'Registration';
	if (/(label|logo|arabic|bahasa|urdu|english|packaging|nutrition|mark)/.test(s)) return 'Labelling';
	if (/(custom|shipment|port|clearance|coc|conformity|slaughter|countersign|import)/.test(s))
		return 'Customs';
	return 'Requirement';
}

// ---------------------------------------------------------------------------
// 3. Recognition matrix — outbound (this market's bodies accepted abroad) and
//    inbound (foreign bodies accepted by this market).
// ---------------------------------------------------------------------------

export interface RecognitionRow {
	bodySlug: string;
	bodyName: string;
	country: string;
	status: RecognitionStatus;
}

const bodyNameById: Record<string, string> = Object.fromEntries(
	certifyingBodies.map((b) => [b.id, b.name])
);

export function recognitionForGuide(
	guideCountry: string,
	bodySlugs: string[]
): { outbound: RecognitionRow[]; inbound: RecognitionRow[] } {
	const outbound: RecognitionRow[] = [];
	for (const slug of bodySlugs) {
		const entries = RECOGNITION_DATA[slug] ?? [];
		for (const e of entries) {
			outbound.push({
				bodySlug: slug,
				bodyName: bodyNameById[slug] ?? slug.toUpperCase(),
				country: e.country,
				status: e.status
			});
		}
	}
	const inbound: RecognitionRow[] = [];
	for (const [slug, entries] of Object.entries(RECOGNITION_DATA)) {
		if (bodySlugs.includes(slug)) continue;
		for (const e of entries) {
			if (sameCountry(e.country, guideCountry)) {
				inbound.push({
					bodySlug: slug,
					bodyName: bodyNameById[slug] ?? slug.toUpperCase(),
					country: e.country,
					status: e.status
				});
			}
		}
	}
	const order: Record<RecognitionStatus, number> = { recognised: 0, mutual: 1, pending: 2 };
	outbound.sort((a, b) => order[a.status] - order[b.status] || a.country.localeCompare(b.country));
	inbound.sort((a, b) => order[a.status] - order[b.status] || a.bodyName.localeCompare(b.bodyName));
	return { outbound, inbound };
}

// ---------------------------------------------------------------------------
// 4. Regulatory signals — real related posts + upcoming shows in-market.
// ---------------------------------------------------------------------------

export interface GuidePost {
	slug: string;
	title: string;
	excerpt?: string;
	date?: string;
	publishedAt?: string | number | null;
	tags?: string[] | string | null;
}

function postTags(p: GuidePost): string[] {
	const t = p.tags;
	if (Array.isArray(t)) return t.map(String);
	if (typeof t === 'string') {
		try {
			const parsed: unknown = JSON.parse(t);
			return Array.isArray(parsed) ? parsed.map(String) : [];
		} catch {
			return [];
		}
	}
	return [];
}

export interface GuideShow {
	id: string;
	name: string;
	city: string;
	country: string;
	startDate: string;
	endDate: string;
	website?: string;
}

export function relatedPosts(
	guideSlug: string,
	guideCountry: string,
	posts: GuidePost[],
	limit = 2
): GuidePost[] {
	const keys = new Set(
		[guideSlug, normalizeCountry(guideCountry), String(guideCountry).toLowerCase()]
			.map((s) => s.trim())
			.filter(Boolean)
	);
	const scored = (posts ?? []).map((p) => {
		const tags = postTags(p).map((t) => String(t).toLowerCase());
		const hay = `${p.title} ${p.excerpt ?? ''}`.toLowerCase();
		const hit = tags.some((t) => keys.has(t)) || [...keys].some((k) => k && hay.includes(k));
		return { p, hit };
	});
	return scored
		.filter((s) => s.hit)
		.map((s) => s.p)
		.slice(0, limit);
}

export function upcomingShowsInMarket(
	guideCountry: string,
	shows: GuideShow[],
	limit = 2
): GuideShow[] {
	const now = new Date();
	return (shows ?? [])
		.filter((s) => sameCountry(s.country, guideCountry))
		.filter((s) => new Date(s.endDate) >= now)
		.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
		.slice(0, limit);
}

export interface GuideStory {
	slug: string;
	title: string;
	excerpt?: string | null;
	buyerCountry?: string | null;
	dealValue?: string | null;
}

export function storiesInMarket(
	guideCountry: string,
	stories: GuideStory[],
	limit = 2
): GuideStory[] {
	return (stories ?? [])
		.filter((s) => sameCountry(s.buyerCountry, guideCountry))
		.slice(0, limit);
}

// ---------------------------------------------------------------------------
// 5. Key links — internal routes only, plus the UN Comtrade Plus portal root
//    (external trade-data source, linked — not scraped).
// ---------------------------------------------------------------------------

export interface KeyLink {
	label: string;
	description: string;
	href: string;
	external?: boolean;
}

export const COMTRADE_PORTAL_URL = 'https://comtradeplus.un.org/';

export function keyLinks(): KeyLink[] {
	return [
		{
			label: 'Verify a certificate',
			description: 'Check cert numbers against supplier records',
			href: '/verify'
		},
		{
			label: 'Certification cost estimator',
			description: 'Estimate fees by certifier and company size',
			href: '/tools/certification-cost'
		},
		{
			label: 'Landed cost calculator',
			description: 'Duty, VAT and clearance per shipment',
			href: '/tools/landed-cost'
		},
		{
			label: 'RFQ builder',
			description: 'Draft a halal-ready sourcing request',
			href: '/tools/rfq-builder'
		},
		{
			label: 'Export doc templates',
			description: 'RFQ, checklist and catalog templates',
			href: '/export-docs'
		},
		{
			label: 'UN Comtrade Plus',
			description: 'Official import/export statistics by HS code',
			href: COMTRADE_PORTAL_URL,
			external: true
		}
	];
}

// ---------------------------------------------------------------------------
// 6. Win plays — re-presents the guide's own opportunities as exporter plays.
// ---------------------------------------------------------------------------

export function winPlays(opportunities: string[] | undefined, limit = 2): string[] {
	return (opportunities ?? []).slice(0, limit);
}
