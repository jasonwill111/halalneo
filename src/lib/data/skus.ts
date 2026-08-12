import type { Sku } from "./types";

export const skus: Sku[] = [
	{
		slug: "rendang-braising-paste",
		merchantSlug: "nusantara-foods",
		categorySlug: "food-beverages",
		name: "Rendang Braising Paste (Industrial)",
		shortDescription:
			"Ready-to-cook rendang paste in bulk, produced on a dedicated BPJPH halal line with certified ingredient traceability.",
		image: "rendang",
		moq: "200 kg",
		priceRange: "US$2.80–3.40 / kg",
		certStatus: "certified",
		units: "20 kg food-grade pails",
		originCountry: "Indonesia",
		features: [
			"Certified alcohol-free",
			"Batch-level halal certificate",
			"12-month shelf life",
			"Custom spice profiles available"
		]
	},
	{
		slug: "sambal-bawang-hot-sauce",
		merchantSlug: "nusantara-foods",
		categorySlug: "food-beverages",
		name: "Sambal Bawang Hot Sauce (Bulk)",
		shortDescription:
			"Shallot-forward sambal hot sauce in bulk containers for private label and food service distribution.",
		image: "sambal",
		moq: "500 kg",
		priceRange: "US$1.90–2.30 / kg",
		certStatus: "certified",
		units: "200 L drums / 5 L pouches",
		originCountry: "Indonesia",
		features: [
			"Zero preservatives",
			"Halal certificate per shipment",
			"Private label ready"
		]
	},
	{
		slug: "mango-juice-concentrate",
		merchantSlug: "santosa-beverages",
		categorySlug: "beverages",
		name: "Mango Juice Concentrate 65°Bx",
		shortDescription:
			"Alcohol-free mango concentrate for beverage manufacturing, kosher and halal certified.",
		image: "mango",
		moq: "1,000 kg",
		priceRange: "US$1.15–1.45 / kg",
		certStatus: "certified",
		units: "220 kg aseptic drums",
		originCountry: "Indonesia",
		features: [
			"Aseptic, ambient stable",
			"Certified no added alcohol",
			"Full traceability"
		]
	},
	{
		slug: "guava-juice-concentrate",
		merchantSlug: "santosa-beverages",
		categorySlug: "beverages",
		name: "Guava Juice Concentrate 60°Bx",
		shortDescription:
			"Premium guava concentrate with certified halal processing and dedicated tank storage.",
		image: "guava",
		moq: "1,000 kg",
		priceRange: "US$1.30–1.60 / kg",
		certStatus: "certified",
		units: "220 kg aseptic drums",
		originCountry: "Indonesia",
		features: ["High yield", "No artificial colours", "Halal certified"]
	},
	{
		slug: "kurma-biscuits",
		merchantSlug: "al-barakah-heritage",
		categorySlug: "confectionery-snacks",
		name: "Kurma-filled Biscuits (Export)",
		shortDescription:
			"Date-filled halal biscuits with JAKIM and MUIS-recognized certification for SEA and Gulf markets.",
		image: "biscuit",
		moq: "500 cartons",
		priceRange: "US$1.05–1.35 / carton",
		certStatus: "certified",
		units: "24 × 150 g cartons",
		originCountry: "Malaysia",
		features: [
			"Date filling certified free of haram additives",
			"Export pack designed for Gulf retail",
			"Long 9-month shelf life"
		]
	},
	{
		slug: "bahulu-sponge-cakes",
		merchantSlug: "al-barakah-heritage",
		categorySlug: "confectionery-snacks",
		name: "Bahulu Sponge Cakes (Bulk)",
		shortDescription:
			"Traditional Malaysian sponge cakes in bulk, halal-certified under a JAKIM Halal Assurance System.",
		image: "cake",
		moq: "300 cartons",
		priceRange: "US$0.95–1.20 / carton",
		certStatus: "certified",
		units: "12 × 250 g cartons",
		originCountry: "Malaysia",
		features: [
			"Egg-based, no alcohol",
			"Bulk food-service pack",
			"Halal certified"
		]
	},
	{
		slug: "frozen-beef-quarter-cuts",
		merchantSlug: "medina-halal-meat",
		categorySlug: "meat-poultry",
		name: "Frozen Beef Quarter Cuts (Halal)",
		shortDescription:
			"SFDA-approved halal slaughtered beef with batch halal slaughter certificate for GCC import.",
		image: "beef",
		moq: "1 × 40 ft reefer",
		priceRange: "US$4.20–4.80 / kg",
		certStatus: "certified",
		units: "20 kg export cartons",
		originCountry: "UAE",
		features: [
			"Batch halal slaughter certificate",
			"Cold-chain monitored",
			"GSO 2055 compliant"
		]
	},
	{
		slug: "frozen-chicken-whole",
		merchantSlug: "medina-halal-meat",
		categorySlug: "meat-poultry",
		name: "Frozen Whole Chicken (Halal)",
		shortDescription:
			"Whole frozen broiler chickens, hand-slaughtered and certified per shipment for MENA markets.",
		image: "chicken",
		moq: "1 × 40 ft reefer",
		priceRange: "US$2.40–2.90 / kg",
		certStatus: "certified",
		units: "10 kg cartons",
		originCountry: "UAE",
		features: [
			"Hand slaughter, no stunning",
			"Per-shipment halal certificate",
			"HACCP certified plant"
		]
	},
	{
		slug: "bulgur-wheat-grain",
		merchantSlug: "grainpath-trading",
		categorySlug: "food-beverages",
		name: "Bulgur Wheat (Pilavlik) Bulk",
		shortDescription:
			"GIMDES-certified bulgur wheat consolidated from Anatolian mills for bulk food import.",
		image: "bulgur",
		moq: "25 MT",
		priceRange: "US$580–640 / MT",
		certStatus: "certified",
		units: "25 / 50 kg bags",
		originCountry: "Turkey",
		features: [
			"GIMDES certified",
			"Steel-milled, no additives",
			"Export documentation included"
		]
	},
	{
		slug: "red-lentils",
		merchantSlug: "grainpath-trading",
		categorySlug: "food-beverages",
		name: "Red Lentils (Split)",
		shortDescription:
			"Premium split red lentils for wholesale distribution, certified halal at origin.",
		image: "lentils",
		moq: "25 MT",
		priceRange: "US$720–790 / MT",
		certStatus: "certified",
		units: "25 / 50 kg bags",
		originCountry: "Turkey",
		features: ["High split quality", "GIMDES certified", "SGS inspection optional"]
	},
	{
		slug: "halal-gelatine-capsules",
		merchantSlug: "saffron-distributors",
		categorySlug: "nutritional-supplements",
		name: "Halal Gelatine Empty Capsules (Size 00)",
		shortDescription:
			"Bovine-sourced halal gelatine capsules for supplement manufacturers, distributed regionally.",
		image: "capsule",
		moq: "1,000,000 pcs",
		priceRange: "US$4.50–6.00 / 1,000",
		certStatus: "certified",
		units: "100,000 pcs / box",
		originCountry: "Singapore (source: Brazil)",
		features: [
			"Bovine gelatine, halal certified",
			"No porcine contamination",
			"Pharma-grade"
		]
	},
	{
		slug: "plant-based-protein-blend",
		merchantSlug: "pureharvest-snacks",
		categorySlug: "nutritional-supplements",
		name: "Plant-Based Protein Blend (Pending)",
		shortDescription:
			"Pea and rice protein blend for the halal supplement market. SANHA certification pending review.",
		image: "protein",
		moq: "5 MT",
		priceRange: "US$3.80–4.40 / kg",
		certStatus: "pending",
		units: "25 kg bags",
		originCountry: "South Africa",
		features: ["Allergen-free", "Certification in progress", "Suitable for halal dry blend"]
	}
];

export function getSku(slug: string): Sku | undefined {
	return skus.find((s) => s.slug === slug);
}
