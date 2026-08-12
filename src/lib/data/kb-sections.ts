import type { KbSection } from "./types";

export const kbSections: KbSection[] = [
	{
		slug: "halal-certification",
		title: "Halal Certification",
		description:
			"How certification actually works: certifying bodies, standards, costs, timelines, and what buyers check.",
		icon: "ShieldCheck"
	},
	{
		slug: "trade-sourcing",
		title: "Trade & Sourcing",
		description:
			"The ten-stage B2B sourcing journey, Incoterms 2020, and payment methods in cross-border halal trade.",
		icon: "Handshake"
	},
	{
		slug: "logistics",
		title: "Logistics & Supply Chain",
		description:
			"Halal logistics standards, segregation, traceability and cold-chain obligations from farm to fork.",
		icon: "Truck"
	},
	{
		slug: "packaging-labeling",
		title: "Packaging & Labeling",
		description:
			"Codex label requirements, halal claims vs regulated logos, and common import-audit pitfalls.",
		icon: "Package"
	},
	{
		slug: "country-market-guides",
		title: "Country / Market Guides",
		description:
			"Priority halal markets profiled: Indonesia, Malaysia, Saudi Arabia, UAE, Türkiye, Singapore and more.",
		icon: "Globe"
	},
	{
		slug: "due-diligence",
		title: "Buyer Due Diligence",
		description:
			"Verifying a supplier's certification claims: scope, recognition lists, expiry and audit history.",
		icon: "SearchCheck"
	}
];

export function getSection(slug: string): KbSection | undefined {
	return kbSections.find((s) => s.slug === slug);
}
