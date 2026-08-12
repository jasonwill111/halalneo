import type { GlossaryTerm } from "./types";

export const glossaryTerms: GlossaryTerm[] = [
	{
		term: "Halal",
		definition:
			"Arabic for 'permissible'. In food and trade, any product, process or business activity permitted under Islamic law."
	},
	{
		term: "Haram",
		definition:
				"Arabic for 'forbidden'. Includes pork and porcine derivatives, alcohol and intoxicants, blood, and animals not slaughtered in accordance with Islamic law."
	},
	{
		term: "Halal certification",
		definition:
				"A formal assurance issued by a recognized certifying body that a product or facility meets halal requirements, typically covering ingredients, processing and handling."
	},
	{
		term: "Certifying body (CB)",
		definition:
			"A recognized organization authorized to conduct halal audits and issue halal certificates, such as JAKIM, BPJPH, MUIS, SFDA, MOIAT, GIMDES, SANHA or IFANCA."
	},
	{
		term: "Halal Assurance System (HAS)",
		definition:
			"A documented management system within a company that ensures raw materials, production, storage and distribution remain halal at all times."
	},
	{
		term: "Tasbih",
		definition:
			"Recitation of the Bismillah (in the name of Allah) while slaughtering an animal. Its presence on meat certificates signals compliant ritual slaughter."
	},
	{
		term: "Stunning",
		definition:
			"The process of rendering an animal unconscious before slaughter. Whether reversible/non-fatal stunning is acceptable is a key difference between halal standards."
	},
	{
		term: "MOQ",
		definition:
			"Minimum order quantity — the smallest volume a supplier will accept for a single order, set by merchants on each SKU."
	},
	{
		term: "Incoterms",
		definition:
			"ICC-published international commercial terms that define risk and cost transfer between buyer and seller, e.g. FOB, CIF, EXW, DDP."
	},
	{
		term: "FOB (Free On Board)",
		definition:
			"The seller delivers goods on board the vessel at the named port. Risk transfers at the ship's rail; buyer arranges freight and insurance."
	},
	{
		term: "CIF (Cost, Insurance, Freight)",
		definition:
			"The seller pays for freight and insurance to the destination port. Risk transfers at the port of shipment, not at destination."
	},
	{
		term: "Letter of Credit (L/C)",
		definition:
			"A bank-issued guarantee that payment will be made once the seller presents compliant shipping documents. The standard secure payment for large halal shipments."
	},
	{
		term: "Bill of Lading",
		definition:
			"A transport document issued by a carrier that acts as receipt of goods, evidence of the contract of carriage, and document of title."
	},
	{
		term: "Halal logistics",
		definition:
			"The dedicated management of transportation, warehousing and handling so halal products never come into contact with haram or non-halal goods."
	},
	{
		term: "Cold chain",
		definition:
			"A temperature-controlled supply chain for perishable goods such as meat, dairy and frozen products, critical for freshness and food safety."
	},
	{
		term: "Traceability",
		definition:
			"The ability to track a product's history, application and location — from origin materials through processing, to the final shipment."
	},
	{
		term: "GMID",
		definition:
			"Global Market Identifier for halal — also used to refer to recognized halal market identifiers that let certifying bodies register export markets."
	},
	{
		term: "GSO 2055",
		definition:
			"The Gulf Standard for halal food adopted across GCC states (Saudi Arabia, UAE, and others), setting requirements for halal products in the Gulf."
	},
	{
		term: "JAKIM",
		definition:
			"Jabatan Kemajuan Islam Malaysia — Malaysia's official authority issuing internationally recognized halal certification."
	},
	{
		term: "BPJPH",
		definition:
			"Badan Penyelenggara Jaminan Produk Halal — Indonesia's statutory halal product assurance body, the mandatory certifier for products sold in Indonesia."
	},
	{
		term: "MUI",
		definition:
			"Majelis Ulama Indonesia — the Indonesian Ulama Council. Its halal fatwa underpins BPJPH's certification decisions."
	},
	{
		term: "MUIS",
		definition:
			"Majlis Ugama Islam Singapura — Singapore's Islamic Religious Council, which runs the city-state's halal certification scheme."
	},
	{
		term: "SFDA",
		definition:
			"Saudi Food and Drug Authority — regulates imported food including halal slaughter certificates entering Saudi Arabia."
	},
	{
		term: "MOIAT",
		definition:
			"Ministry of Industry and Advanced Technology (United Arab Emirates) — issues halal certificates for products exported to the UAE."
	},
	{
		term: "GIMDES",
		definition:
			"A Turkey-based halal certification body recognized across Turkish and Central Asian supply chains."
	},
	{
		term: "SANHA",
		definition:
			"South African National Halaal Authority — the major halal certification body in Southern Africa."
	},
	{
		term: "IFANCA",
		definition:
			"Islamic Food and Nutrition Council of America — a widely recognized halal certification body based in the United States."
	},
	{
		term: "Due diligence",
		definition:
			"The investigation and verification process buyers run on a supplier before committing — checking certificates, scope, expiry, recognition and audit history."
	},
	{
		term: "Private label",
		definition:
			"A product manufactured by one company but sold under a buyer's own brand. Common in halal FMCG sourcing."
	},
	{
		term: "HORECA",
		definition:
			"Hotels, restaurants and catering — a major distribution channel for halal food service products."
	}
];

export function getGlossaryTerm(term: string): GlossaryTerm | undefined {
	return glossaryTerms.find((t) => t.term.toLowerCase() === term.toLowerCase());
}