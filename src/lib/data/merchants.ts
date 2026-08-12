import type { Merchant } from "./types";
import { getBody } from "./certifying-bodies";

export const merchants: Merchant[] = [
	{
		slug: "nusantara-foods",
		name: "Nusantara Foods",
		country: "Indonesia",
		businessType: "manufacturer",
		isBrand: true,
		status: "active",
		logoInitials: "NF",
		description:
			"Family-owned manufacturer of halal-certified spice pastes, sauces and ready-to-cook bases from Jakarta. Operates a dedicated halal production line under a BPJPH Halal Assurance System.",
		yearEstablished: 2009,
		certifications: [
			{
				id: "nf-1",
				body: getBody("bpjph"),
				scope: "Spice pastes, sauces, condiments",
				status: "certified",
				expiry: "2027-06-30",
				number: "BPJPH-2024-004871"
			},
			{
				id: "nf-2",
				body: getBody("jakim"),
				scope: "Ready-to-cook bases (export)",
				status: "certified",
				expiry: "2026-11-15",
				number: "MYE-HCB-22134"
			}
		]
	},
	{
		slug: "santosa-beverages",
		name: "Santosa Beverages",
		country: "Indonesia",
		businessType: "manufacturer",
		isBrand: true,
		status: "active",
		logoInitials: "SB",
		description:
			"Bottler of halal fruit drinks and juice concentrates. All production lines certified halal; uses alcohol-free flavouring systems and dedicated tank storage.",
		yearEstablished: 2012,
		certifications: [
			{
				id: "sb-1",
				body: getBody("bpjph"),
				scope: "Fruit drinks, juice concentrates",
				status: "certified",
				expiry: "2027-03-20",
				number: "BPJPH-2025-008113"
			}
		]
	},
	{
		slug: "al-barakah-heritage",
		name: "Al-Barakah Heritage Foods",
		country: "Malaysia",
		businessType: "manufacturer",
		isBrand: true,
		status: "active",
		logoInitials: "AB",
		description:
			"Malaysian producer of traditional halal sweets, biscuits and snack mixes. JAKIM-certified across two facilities with export recognition for Singapore and the Gulf.",
		yearEstablished: 2004,
		certifications: [
			{
				id: "ab-1",
				body: getBody("jakim"),
				scope: "Biscuits, snacks, traditional sweets",
				status: "certified",
				expiry: "2026-12-31",
				number: "JAKIM-2024-081132"
			},
			{
				id: "ab-2",
				body: getBody("muis"),
				scope: "Snack mixes (Singapore import)",
				status: "certified",
				expiry: "2026-08-18",
				number: "MUIS-FHCB-2025-0912"
			}
		]
	},
	{
		slug: "medina-halal-meat",
		name: "Medina Halal Meat Co.",
		country: "United Arab Emirates",
		businessType: "manufacturer",
		isBrand: false,
		status: "active",
		logoInitials: "MH",
		description:
			"UAE-based processor and exporter of halal beef and poultry. Certified under GSO 2055 with SFDA-approved halal slaughter certificates for Gulf and MENA import.",
		yearEstablished: 2011,
		certifications: [
			{
				id: "mh-1",
				body: getBody("moiat"),
				scope: "Frozen beef, poultry (GCC)",
				status: "certified",
				expiry: "2027-01-10",
				number: "MOIAT-HCB-0193"
			},
			{
				id: "mh-2",
				body: getBody("sfda"),
				scope: "Halal slaughter certificates, chilled beef",
				status: "certified",
				expiry: "2026-09-05",
				number: "SFDA-HSC-2025-4120"
			}
		]
	},
	{
		slug: "grainpath-trading",
		name: "GrainPath Trading",
		country: "Turkey",
		businessType: "trader",
		isBrand: false,
		status: "active",
		logoInitials: "GP",
		description:
			"Istanbul-based halal trading house sourcing and consolidating certified grains, pulses and bulk ingredients from GIMDES-certified mills across Türkiye and Central Asia.",
		yearEstablished: 2015,
		certifications: [
			{
				id: "gp-1",
				body: getBody("gimdes"),
				scope: "Grains, pulses, bulk ingredients",
				status: "certified",
				expiry: "2026-10-22",
				number: "GIMDES-TR-10234"
			}
		]
	},
	{
		slug: "saffron-distributors",
		name: "Saffron Distributors",
		country: "Singapore",
		businessType: "wholesaler",
		isBrand: false,
		status: "active",
		logoInitials: "SD",
		description:
			"Singapore wholesaler distributing halal-certified FMCG and food service products to HORECA and retail across Southeast Asia. Focuses on suppliers with MUIS-recognized certification.",
		yearEstablished: 2008,
		certifications: [
			{
				id: "sd-1",
				body: getBody("muis"),
				scope: "Distribution, warehousing",
				status: "certified",
				expiry: "2027-02-28",
				number: "MUIS-DIST-2025-0188"
			}
		]
	},
	{
		slug: "pureharvest-snacks",
		name: "PureHarvest Snacks",
		country: "South Africa",
		businessType: "manufacturer",
		isBrand: true,
		status: "pending",
		logoInitials: "PH",
		description:
			"Cape Town snack manufacturer producing halal chips and baked snacks. SANHA certification in progress — verification pending.",
		yearEstablished: 2018,
		certifications: [
			{
				id: "ph-1",
				body: getBody("sanha"),
				scope: "Baked snacks, chips",
				status: "pending",
				expiry: "2026-12-01",
				number: "SANHA-PEND-7712"
			}
		]
	}
];

export function getMerchant(slug: string): Merchant | undefined {
	return merchants.find((m) => m.slug === slug);
}
