import type { KbArticle } from "./types";

export const kbArticles: KbArticle[] = [
	// ── Halal Certification ────────────────────────────────────────────────
	{
		section: "halal-certification",
		slug: "halal-certification-landscape",
		title: "The Global Halal Certification Landscape",
		summary:
			"Halal certification is a country-by-country patchwork, not a single global scheme. Around 300 halal certification bodies exist worldwide; ~120 are officially registered and active.",
		tags: ["certification", "JAKIM", "BPJPH", "MUIS", "overview"],
		body: `
Halal certification is a **country-by-country patchwork**, not a single global scheme. Around **300 halal certification bodies (HCBs) exist worldwide**, of which roughly **120 are officially registered** as active with formal accreditation or mutual-recognition agreements with governments.

## Who dominates

Three bodies are the most-recognised certifiers and the reference points most import authorities align with:

- **JAKIM (Malaysia)** — the Department of Islamic Development Malaysia, widely treated as the "gold standard". Publishes the list of Recognised Foreign Halal Certification Bodies (FHCB), updated effective 29 August 2025 to **92 recognised foreign bodies**.
- **MUI / LPPOM MUI / BPJPH (Indonesia)** — BPJPH is the government authority issuing certificates; MUI issues the fatwa validating halal status; LPPOM MUI conducts technical inspections. Certification is **mandatory**: all food since October 2024, cosmetics and pharmaceuticals by **October 2026**.
- **MUIS (Singapore)** — the sole halal certification authority under AMLA. Because MUIS does not certify products made overseas, imports rely on recognised Foreign Halal Certification Bodies vetted under an enhanced recognition framework.

## Why this matters for trade

A certificate valid in one market **does not guarantee acceptance in another**. Market acceptance is governed by **recognition lists**: each importing authority (JAKIM, BPJPH, MUIS, SFDA/GAC, MOIAT) maintains a list of foreign HCBs whose certificates it accepts, often scoped by product category.

For a B2B trade platform, the practical implications are:

1. Certificate acceptance must be evaluated **per target market**.
2. Certificate **scope, expiry and audit history** are the fields buyers actually need.
3. **Mutual-recognition registration routes** (e.g. Indonesia's SHLN) matter more than raw certification for cross-border trade.

## Other notable bodies

- **GIMDES** (Türkiye) — lead Turkish certifier; World Halal Council member.
- **CICOT** (Thailand) — central national authority under the Thai government.
- **SANHA** (South Africa) — Africa's most recognised halal certifier.
- **IFANCA, AHF, ISA** (USA); **HMC / HCE** (UK / pan-Europe); **KazHalal** (Kazakhstan); **PSQCA/PHA** (Pakistan).
- Mutual-recognition networks: **World Halal Food Council (WHFC)** and **IHAF** aim to harmonise via reciprocal recognition between member HCBs.
		`
	},
	{
		section: "halal-certification",
		slug: "certification-process-costs-timelines",
		title: "Certification Process, Costs & Timelines",
		summary:
			"Typical halal certification runs 4–7 weeks end-to-end and costs roughly US$250–7,000 per year depending on facilities, product lines and target markets.",
		tags: ["certification", "process", "costs", "timeline"],
		body: `
## The process

The standard lifecycle, as documented by certifiers and country reviews:

1. **Application** — submit company/product details, target markets, ingredient list; initial eligibility review.
2. **Agreement & fees** — sign certification agreement, pay deposit (often 50% non-refundable).
3. **Document evaluation** — review of ingredients, process flow, supplier halal status, Halal Assurance System manual (e.g. HAS 23000), facility documents.
4. **On-site audit** — physical inspection of facilities, production lines, segregation/sanitation, staff interviews; **lab testing** for porcine DNA/ethanol where animal-derived ingredients exist.
5. **Audit report & technical review** — non-conformities documented; corrective actions required (minor: 15–30 days; major: re-audit within 30–60 days).
6. **Shariah review / fatwa** — religious committee validates compliance.
7. **Certificate issuance** — official certificate + logo licence; registration in the certifier's public database.
8. **Renewal / surveillance** — certificates typically valid **1–3 years** with annual surveillance audits.

## Typical timelines

- **Simple facility, clean documentation: ~2 weeks**; typical end-to-end: **4–7 weeks**.
- Export pathway: **direct official certification 2–3 months**; mutual-recognition/accredited-body route **1–2 months**.
- Indonesia: full BPJPH certification ~**28–43 working days**; foreign-certificate registration via **SHLN up to 30 working days**.

## Typical costs (USD)

- **Application/registration**: $500–2,500 upfront (some bodies charge none).
- **On-site audit**: $1,000–5,000 (plus travel).
- **Annual renewal**: $500–3,000.
- **Lab testing**: $300–1,500 when required.
- **Logo licensing**: separate flat fee per product or % of sales.
- **Total annual**: roughly **$250–7,000**, scaling with facilities, product lines and ingredient complexity.

Key cost drivers: number of facilities (each audited separately), ingredient complexity (emulsifiers, gelatin, enzymes = more tracing), and target-market recognition requirements.
		`
	},
	{
		section: "halal-certification",
		slug: "standards-and-regimes",
		title: "Main Halal Standards & How They Differ",
		summary:
			"OIC/SMIIC, GSO 2055, MS 1500, HAS 23000 and MUIS standards differ on stunning, mechanical slaughter, seafood and impurity rules — recognition, not the standard, drives market access.",
		tags: ["standards", "SMIIC", "GSO", "MS1500", "HAS23000"],
		body: `
## The main standards

| Standard | Region | Role |
| --- | --- | --- |
| **OIC/SMIIC 1:2019** | OIC member states | Umbrella regime intended to harmonise halal certification across the OIC. |
| **GSO 2055-1:2015** | GCC / Gulf | General requirements for halal food at any stage of the food chain. |
| **GSO 2055-2:2021** | GCC | Requirements for halal **certification bodies** (basis for GAC accreditation). |
| **MS 1500:2019** | Malaysia | General guidelines; enforced by JAKIM. |
| **HAS 23000** | Indonesia | LPPOM MUI Halal Assurance System, now operated under BPJPH regulations. |
| **MUIS-HC-S001 / S002** | Singapore | General guidelines + Halal Quality Management (HalMQ). |
| **PBD 24:2007** | Brunei | Strictest ASEAN standard — no stunning. |

## How the regimes differ

Material differences that matter for cross-border trade:

- **Stunning**: permitted (with restrictions) in most regimes — Indonesia, SMIIC, Singapore, Malaysia, Thailand, Iran. **Pakistan and Brunei prohibit stunning entirely**.
- **Mechanical slaughter**: permitted by GSO, ASEAN, Singapore, Malaysia, Thailand, SMIIC and Iran; **prohibited in Pakistan and Brunei**.
- **Slaughterer**: must be a practicing Muslim in all regimes; some allow slaughterers from the Semitic religions (Ahl al-Kitab) — a key divergence.
- **Seafood**: most regimes treat all aquatic animals as halal except poisonous/harmful ones; **Pakistan restricts to scaled fish and shrimp**.
- **Insects**: generally only locusts permitted (Pakistan, Brunei, GSO, SMIIC).

Because there is no single halal standard, HCBs adopt **single or multiple standards** and seek accreditation from several bodies — which is why **recognition, not the standard itself, drives market access**.
		`
	},
	{
		section: "halal-certification",
		slug: "buyers-checklist",
		title: "What B2B Buyers Check on a Supplier's Certificate",
		summary:
			"Seven things buyers verify: scope, body recognition in the target market, expiry, audit history, accreditation, verifiable certificate details, and jurisdiction alignment.",
		tags: ["buyers", "due diligence", "checklist", "certification"],
		body: `
Synthesis from recognition frameworks and platform guidance:

1. **Certificate scope** — which products, categories and facility sites the certificate covers. Recognition is often **category-by-category** (e.g. BPJPH recognises a foreign body only for specific categories).
2. **Certifying body recognition in the target market** — not "is it halal-certified" but "is the issuing body on the importing authority's recognition list" (JAKIM FHCB, BPJPH LHLN/SHLN, MUIS FHCB, SFDA approved bodies, MOIAT registered bodies). Verify **per market and per category**.
3. **Expiry date & validity** — certificates expire (typically 1–3 years); Indonesia's GR 42/2024 allows permanent validity only if ingredients/processes are unchanged.
4. **Audit reports / surveillance status** — annual surveillance audits and corrective-action history indicate ongoing compliance.
5. **Accreditation of the certifier** — ISO/IEC 17065 accreditation, or GAC / EIAC / SAAC accreditation, adds confidence.
6. **Verifiable certificate details** — certificate number, issuing body, scope, expiry; verifiable on the body's public database (JAKIM Verify Halal, BPJPH SiHalal, MUIS FHCB list) rather than the supplier's own PDF.
7. **Jurisdiction/regime alignment** — e.g. stunning or mechanical-slaughter policy differences may disqualify a certificate in a stricter market even if the body is otherwise recognised.
		`
	},

	// ── Trade & Sourcing ───────────────────────────────────────────────────
	{
		section: "trade-sourcing",
		slug: "ten-stage-sourcing-journey",
		title: "The Ten-Stage B2B Sourcing Journey",
		summary:
			"From inquiry to customs clearance, halal compliance runs as a parallel documentation layer alongside the commercial and logistics layers at every step.",
		tags: ["sourcing", "process", "RFQ", "inquiry"],
		body: `
A B2B halal trade transaction follows a broadly standard international trade lifecycle — inquiry → quotation → negotiation → sample/approval → contract → payment → production → inspection → shipment → customs clearance — but with a **halal integrity layer running alongside** the commercial and logistics layers at every step.

## The ten stages

1. **Inquiry / request for quotation (RFQ).** The buyer sends a request describing product, specification, quantity, target price, and destination. For halal goods the RFQ should state the target market's certification requirement.
2. **Quotation.** The seller responds with a formal quotation or a **pro forma invoice** — a "quote in an invoice format" including seller/buyer details, itemized prices, weights, Incoterm, terms of payment, and validity date. Buyers typically need the pro forma to apply for import licenses or open a letter of credit.
3. **Negotiation.** Price, Incoterm, payment terms, delivery dates, and halal documentation obligations are negotiated.
4. **Sample / pre-production approval.** The buyer approves samples. For halal goods, sample approval should confirm the ingredient list, the halal mark, and the intended certification body and standard.
5. **Contract / purchase order.** Fixes product description, quantities, prices, Incoterms, payment method, and — critically for halal — **certification responsibility and liability for non-compliance**.
6. **Payment.** Per the agreed method: typically a deposit/T/T before production, an L/C or documents-against-payment for the balance, or open account for established relationships.
7. **Production.** The supplier manufactures, segregates halal from non-halal production lines, and maintains auditable records under a Halal Assurance System (HAS).
8. **Inspection / quality control.** The buyer's QC or a third-party pre-shipment inspection (PSI) firm verifies quality, quantity, and compliance. For halal, inspectors verify lot-level halal status, packaging/labeling, and container cleanliness.
9. **Shipment & documentation.** The full export pack is assembled — commercial invoice, packing list, bill of lading, certificate of origin, health/veterinary certificates, and the **halal certificate(s)**.
10. **Customs clearance & delivery.** The importer clears the goods, often against pre-registration on digital platforms (Saudi Saber/Zad, Indonesia's BPJPH Sihalal), then takes delivery.

## Key takeaway

Halal compliance is enforced primarily through **documentation**: a shipment-specific Halal Certificate issued by a body recognized by the importing country, plus declarations covering ingredient traceability, slaughter method, logistics segregation, and container cleanliness.
		`
	},
	{
		section: "trade-sourcing",
		slug: "incoterms-2020",
		title: "Incoterms 2020 Basics for Halal Trade",
		summary:
			"The 11 ICC rules define who pays for, manages, and bears risk of carriage, insurance, customs clearance and delivery — but not payment terms or title transfer.",
		tags: ["incoterms", "trade", "logistics", "contract"],
		body: `
**Incoterms 2020** are 11 ICC rules that define the tasks, costs and risks of delivery between seller and buyer. They are incorporated into the contract of sale and do **not** cover contract price, payment, title transfer, or which documents the buyer needs for customs.

## Any mode of transport (7 rules)

| Rule | Meaning | Risk/cost profile |
| --- | --- | --- |
| **EXW** (Ex Works) | Seller makes goods available at their premises | **Minimum seller obligation** — buyer collects and handles all formalities |
| **FCA** (Free Carrier) | Seller delivers to a named place for the carrier; revised 2020 to allow an **on-board B/L** when sold FCA for sea carriage | Risk transfers at delivery to carrier |
| **CPT** (Carriage Paid To) | Seller pays carriage to destination | Seller pays main carriage, buyer bears transit risk |
| **CIP** (Carriage & Insurance Paid To) | Seller pays carriage + **higher-level insurance (Institute Cargo Clauses A)** | Same as CPT plus mandatory enhanced cover |
| **DAP** (Delivered at Place) | Seller delivers at destination place; **does not unload** | Risk transfers at destination; import duties not included |
| **DPU** (Delivered at Place Unloaded) | Like DAP but **seller unloads**; renamed from DAT in 2020 | Same as DAP plus unloading obligation |
| **DDP** (Delivered Duty Paid) | Seller delivers duty paid, handling import formalities | **Maximum seller obligation** — all costs/risk including import duty |

## Sea & inland waterway only (4 rules)

| Rule | Meaning |
| --- | --- |
| **FAS** | Seller delivers alongside the vessel at the loading port |
| **FOB** | Seller delivers on board the vessel at the named loading port — widely used |
| **CFR** | Seller pays cost and freight; risk transfers on loading |
| **CIF** | Like CFR plus **minimum insurance (Clauses C)**; default in commodity trade |

## Key 2020 changes

- FCA on-board B/L option; cost articles consolidated at A9/B9.
- **CIF keeps Institute Cargo Clauses (C)** while **CIP now requires Clauses (A)**.
- DAT renamed **DPU**; clearer security-related obligations.

For halal trade, the Incoterm choice interacts with logistics obligations: under **DDP** the seller bears the full burden including import formalities — where halal inspection and registration (Saudi Saber, Indonesia Sihalal) may be required before customs release.
		`
	},
	{
		section: "trade-sourcing",
		slug: "payment-methods",
		title: "Payment Methods in Cross-Border Halal Trade",
		summary:
			"From T/T advances to letters of credit, documentary collections, escrow and open account — each sits on a risk spectrum for halal importers and exporters.",
		tags: ["payment", "L/C", "T/T", "risk", "finance"],
		body: `
The U.S. ITA defines five primary payment methods, ordered by risk from the exporter's perspective.

## 1. T/T / Telegraphic Transfer (cash in advance)

The importer wires funds (often a deposit of 20–50%, with the balance on shipment) before goods ship. **Zero non-payment risk for the exporter**; for the importer it is the least attractive option. For halal buyers, T/T offers no documentary protection: no bank checks that the halal certificate matches the shipment.

## 2. Letter of Credit (L/C)

A bank commits, on the buyer's behalf, to pay the exporter **provided the terms stated in the L/C are met through presentation of required documents**. One of the most secure instruments — protects exporter (bank pays on compliant documents) and buyer (no payment obligation until goods ship as promised). For halal trade, the **L/C is where halal certification terms are codified**.

## 3. Documents Against Payment (D/P) / documentary collection (CAD)

The exporter's bank sends the documents to the importer's bank, with instructions to release them **for payment at sight** (D/P, effectively CAD) or on a specified date (D/A). **Bank-facilitated but not bank-guaranteed** — banks act as intermediaries with no verification process. Cheaper than L/Cs; a common middle-ground for repeat halal shipments.

## 4. Escrow

A trusted third party holds payment and releases it when agreed conditions are met. Reduces the buyer's fear of non-shipment; release conditions (including halal document verification) must be defined precisely. Typically limited to smaller deals.

## 5. Open account / consignment

Goods ship before payment is due (30/60/90 days). Best cash flow for the importer, **highest risk for the exporter**; often mitigated by export credit insurance.

## Risk comparison (from exporter's perspective)

| Method | Exporter risk | Importer risk | Halal-trade notes |
| --- | --- | --- | --- |
| T/T advance | Very low | High | No documentary linkage to halal cert |
| **L/C** | Low (bank-guaranteed on docs) | Low | **Codifies halal document requirements**; strict compliance needed |
| D/P / CAD | Medium | Medium | Docs (incl. halal cert) held until payment |
| Escrow | Low–Medium | Low–Medium | Release conditions must include halal doc checks |
| Open account | High | Very low | For established, trusted relationships |
		`
	},

	// ── Logistics ──────────────────────────────────────────────────────────
	{
		section: "logistics",
		slug: "what-is-halal-logistics",
		title: "What Halal Logistics Means in Practice",
		summary:
			"Halal logistics is the discipline of keeping a product's halal status intact through every movement, storage and handling step — 'from farm to fork'.",
		tags: ["logistics", "segregation", "supply chain", "overview"],
		body: `
Halal logistics is the process of managing procurement, movement, storage and handling of goods in compliance with Shariah law. Its objective is to secure the **halal integrity** of products for the end consumer: "the command and control of goods flows in a value system in such a way that the halal integrity is secured throughout the supply chain."

## Three fundamentals

1. **Avoid direct contact with haram (cross-contamination).** Halal and non-halal goods are not mixed on handling equipment, pallets, load carriers, containers or in bulk shipments.
2. **Address contamination risk based on product characteristics** (bulk vs unitised, dry vs wet, ambient vs chilled/frozen).
3. **Address consumer perception** — the Muslim consumer's requirements shaped by school of law, local fatwas and customs.

## Core operational principles

- **Segregation** — physical and demonstrable separation of halal from non-halal / najis goods during storage, transport and terminal handling (dedicated facilities/zones, containers, pallets, colour-coding).
- **Contamination avoidance** — cleaning regimes including ritual cleansing (**sertu/samak**), seals, drip prevention, stacking rules (halal above non-halal), and personnel hygiene.
- **Traceability and chain of custody** — documentation at every handover so auditors and consumers can verify halal status from origin to destination.
- **Temperature control** — for perishables, a monitored cold chain (chilled 0–5 °C, frozen −18 °C or below).

Halal logistics goes beyond food safety: it adds religious-integrity controls on top of HACCP/ISO 22000 hygiene. Non-Muslim-country providers can comply by segregation, cleaning between loads, and dedicated equipment and personnel.

**Key takeaway:** halal trade is increasingly a **supply-chain obligation**, not just a product label. Buyers in Malaysia, Indonesia, the GCC and beyond expect proof that the logistics leg is itself halal-certified or follows a documented segregation/custody protocol.
		`
	},
	{
		section: "logistics",
		slug: "logistics-standards",
		title: "Halal Logistics Standards & Certification",
		summary:
			"MS 2400 (Malaysia), HAS 23000-5 (Indonesia) and OIC/SMIIC 17 are converging on auditable management-system standards rather than mere product labelling.",
		tags: ["logistics", "standards", "MS2400", "SMIIC17", "certification"],
		body: `
The regulatory landscape for halal logistics is converging on **auditable management-system standards** rather than mere product labelling.

## Malaysia — MS 2400:2019

The **Halal supply chain management system**, a three-part standard enforced through JAKIM logistics certification and the Malaysian Halal Management System (MHMS 2020):

- **MS 2400-1:2019 — Transportation.** Covers assurance of halal integrity through all modes of transport.
- **MS 2400-2:2019 — Warehousing.** Covers the warehouse, from receiving to delivery.
- **MS 2400-3:2019 — Retailing.** Covers the retail stage.

A **Logistics Scheme (Skim Logistik)** under MHMS 2020 requires a halal policy, a Halal Management Committee, risk-control procedures (cross-docking, break-bulk, consolidation), traceability procedures, internal halal audits (min. once a year), and management review.

## Indonesia — HAS 23000-5

**HAS 23000-5** _Halal Certification Requirements for the Logistic Industry_ (LPPOM MUI scheme), plus a BPJPH regulatory regime (PP 39/2021) that makes **halal certification of third-party logistics services mandatory** for food, beverage, pharma and cosmetics, phased in from Oct 2024 through **Oct 2026**.

## International — OIC/SMIIC 17:2020

The international counterpart of MS 2400 (Transportation, Warehousing, Retailing, plus a Port module). **GSO OIC/SMIIC 17-1/17-2:2024** are the Gulf adoptions. **ISO 31512:2024** covers B2B cold-chain storage and transport.

## Operational expectations

- **Segregation** — dedicated facilities/zones, containers, pallets and handling equipment.
- **Cleaning** — ritual cleansing (sertu/samak) and validated disinfection between loads.
- **Traceability** — documentation at every handover.
- **Temperature control** — monitored cold chain for perishables.

Certified in practice by JAKIM-audited logistics providers in Malaysia and BPJPH-recognised operators in Indonesia.
		`
	},

	// ── Packaging & Labeling ───────────────────────────────────────────────
	{
		section: "packaging-labeling",
		slug: "label-requirements",
		title: "Mandatory Label Elements for Food Products",
		summary:
			"The global baseline is Codex CXS 1-1985. Ingredients, allergens and lot codes are the three most commonly flagged elements in import audits.",
		tags: ["labeling", "codex", "ingredients", "allergens"],
		body: `
The global baseline is **Codex CXS 1-1985, _General Standard for the Labelling of Prepackaged Foods_**, which most national food laws implement.

## Mandatory label elements (Codex Section 4)

- **Name of the food** — specific, true name; brand/trade names are additional, not a substitute.
- **List of ingredients** — all ingredients in **descending order of ingoing weight**; compound ingredients declared with their sub-ingredients; food additives named. *The single most common label-compliance failure in import audits.*
- **Allergens** — foods/ingredients known to cause hypersensitivity (gluten, milk, eggs, fish, crustacea, tree nuts, peanuts, soy, sesame, sulfites) "shall always be declared".
- **Net contents & drained weight** — metric units; liquids by volume, solids by weight.
- **Manufacturer/packer name & address**, **country of origin**, **lot identification**, **date marking + storage conditions**, and **instructions for use**.

## Presentation rules

Labels must be clear, prominent, indelible, legible, and not separated from the container; name + net contents must appear in the same field of vision. A supplementary label may carry mandatory information in the consumer's language. Small units (<10 cm² surface area) are exempt from ingredient and date/instructions requirements.

## National layers

- **US** — emphasizes allergen + nutrition-facts labeling.
- **EU** — strict ingredient transparency and multilingual labels.
- **Asia-Pacific** — varies in language, format, and importer-responsibility rules.

For halal trade specifically, the **importing country's rules** (GCC/SFDA, Malaysia/JAKIM, Indonesia/BPJPH, UAE) govern the final label, and these are frequently stricter than the exporter's domestic rules. Ingredients, allergens, and lot codes are the three most commonly flagged in import audits.
		`
	},
	{
		section: "packaging-labeling",
		slug: "halal-claims-and-logos",
		title: "Halal Claims vs. Regulated Logos",
		summary:
			"The term 'halal' is a claim that must be substantiated; an official halal logo is a regulated mark owned by a certifying body and licensed per-product.",
		tags: ["labeling", "logos", "claims", "certification"],
		body: `
## Halal claims vs. halal logos

- **The term "halal" alone is a claim** that must be truthful and substantiated.
- **An official halal logo is a regulated mark** owned by a specific certifying body (e.g. JAKIM, IFANCA, ISNA/CHART), whose use is licensed **per-product** under a certification agreement — it is **not free for use**.

Several jurisdictions legally require the certifier's full name next to any halal claim (e.g. Canada CFIA B.01.050; USDA FSIS for meat/poultry; US state laws in NY, IL, NJ, CA, TX).

## Packaging material requirements

Packaging must be free of haram/najis components:

- No pig-derived materials, no non-halal animal derivatives (**gelatin, tallow, lard**) in inks, coatings, adhesives, or substrates.
- Residual alcohol must evaporate.
- Halal vs non-halal production must be segregated to prevent cross-contamination (SMIIC 1, GSO 2652:2021, AHF).

## Two overlapping layers

Halal product compliance is governed by **general food labeling law** (Codex CXS 1-1985) **and** halal-specific rules (CAC/GL 24-1997 plus national/importing-market regulations). Any halal-labeled product must satisfy both layers simultaneously:

- A product can be perfectly halal yet still be rejected for a missing ingredient declaration.
- A product with perfect general labeling can fail for an unauthorized halal mark.

## Common audit pitfalls

Missing/inconsistent ingredient declarations, translation errors (esp. Arabic for Gulf markets), unsupported claims, date-format issues, barcode/document mismatches, and misuse or misplacement of halal logos. **Label problems alone can trigger customs holds or rejection** even when the product itself is compliant.
		`
	},

	// ── Country / Market Guides ────────────────────────────────────────────
	{
		section: "country-market-guides",
		slug: "indonesia",
		title: "Indonesia — The Prize, Hardest to Enter",
		summary:
			"World's largest halal market (~US$626B) and largest OIC halal food importer. Mandatory certification expands to most imported food & beverage from 17 Oct 2026.",
		tags: ["indonesia", "BPJPH", "MRA", "import"],
		body: `
## Market size / outlook

Indonesia is the **world's largest halal market** with ~277M Muslim consumers (~91% of population) — a **~US$626 billion** market. Indonesia was the **largest halal food importer in the OIC at US$25.82B in 2024**, ahead of Malaysia. It imported 240,000+ tonnes of halal meat in 2023.

**Mandatory halal certification expands to most food & beverage products from 17 October 2026** — a major structural change for importers (F&B was mandatory from 17 Oct 2024).

## Recognised certifying bodies / accreditation

**BPJPH** (under the Ministry of Religious Affairs) is the sole halal authority under Law UU 33/2014. It certifies through LPHs (halal inspection bodies, e.g. LPPOM MUI) and issues certificates backed by halal *fatwa* (from MUI). BPJPH maintains the **LHLN list of overseas halal certification bodies** and has signed **MRAs with 114+ foreign halal bodies**.

## Import requirements

Under UU 33/2014 halal certification is mandatory for food & beverages (phased: F&B from Oct 2024; broader rollout 2026–2034). Imported products need:

- **BPOM food registration**,
- a **halal certificate registered with BPJPH** (via an MRA-covered LHLN or in-country certification),
- compliant labelling, and
- importer registration (API-U/API-P).

Halal certificates are valid **4 years** domestically; BPJPH has proposed limiting **foreign certificates to 1 year**.

## Mutual recognition

Foreign halal certificates are **accepted only if the issuing body has an MRA with BPJPH and the certificate is registered** in the BPJPH system. Bodies without an MRA (or products outside MRA scope) must be re-certified in-country. **Practical reality: check the LHLN list before engaging a foreign certifier.**

## B2B buying characteristics

Importers/distributors will not buy without a valid, BPJPH-recognized halal certificate — it is a **listing precondition**. Main demand: **food-processing ingredients**, meat, dairy, and packaged processed foods. Distribution is through registered national importers feeding modern retail, food service, and food manufacturing.
		`
	},
	{
		section: "country-market-guides",
		slug: "gcc-saudi-uae",
		title: "GCC (Saudi Arabia & UAE) — High-Value, Regulated",
		summary:
			"Halal certification is legally mandatory for specific imported categories and enforced at the border via SFDA halal shipment certificates and MOIAT-registered bodies.",
		tags: ["saudi-arabia", "uae", "gcc", "SFDA", "MOIAT"],
		body: `
## The GCC opportunity

**Saudi Arabia and the UAE** are high-value, regulated halal markets expanding fast, driven by Vision 2030 giga-projects and Dubai's re-export model. Halal certification is **legally mandatory for specific imported categories** and enforced at the border.

## Saudi Arabia — SFDA

- The **Saudi Food & Drug Authority (SFDA)** enforces halal compliance at import, requiring a **halal certificate and halal shipment certificate from an SFDA-approved body** (GSO 2055-1 / SFDA.FD/GSO 2055-1, GSO 993 for animal-derived products).
- Conformity is processed through the **SABER** electronic platform.
- Saudi Arabia is the **largest halal market by value**.
- The **Saudi Accreditation Center (SAAC)** registers halal certification bodies against GSO 2055-2; the **GCC Accreditation Center (GAC)** accredits HCBs under GSO 2055-2:2021 — the gateway to Gulf markets.

## UAE — MOIAT

- The national scheme runs under the **Ministry of Industry and Advanced Technology (MOIAT)**, which issues the **UAE National Halal Mark** and maintains the registered halal certification bodies list.
- Halal certification bodies must be accredited by the **Emirates International Accreditation Centre (EIAC)** against UAE.S 2055-1 / GSO 2055-2; foreign bodies must be recognised by MOIAT.
- **Mandatory for all food sold in the UAE**; the UAE is the gateway to the wider GCC.

## B2B buying characteristics

In every Muslim-majority market, a valid halal certificate from a recognized body is a **precondition to even be listed** by importers, distributors and retail chains — not a differentiator. Ingredients, meat/poultry, and processed food are the main import segments; HORECA and retail chains are the anchor buyers.
		`
	},

	// ── Buyer Due Diligence ────────────────────────────────────────────────
	{
		section: "due-diligence",
		slug: "verifying-supplier-certification",
		title: "How to Verify a Supplier's Certification Claims",
		summary:
			"A practical checklist for confirming halal certification against public databases, recognition lists and shipment documents — not the supplier's own PDF.",
		tags: ["due diligence", "verification", "checklist", "supplier"],
		body: `
A halal certificate is only as good as its verifiability. Here is how to check a supplier's claims against primary sources.

## 1. Verify the certificate number in the body's public database

Every major certifier maintains a public registry:

- **JAKIM Verify Halal** (Malaysia)
- **BPJPH SiHalal** portal (Indonesia)
- **MUIS FHCB list** (Singapore)
- **SFDA approved bodies** (Saudi Arabia)
- **MOIAT registered bodies** (UAE)

Check the certificate number, issuing body, scope and expiry **directly on the registry** rather than trusting the supplier's own PDF.

## 2. Confirm body recognition in the destination market

Being certified is not enough — the **issuing body** must be on the importing authority's recognition list for the **specific product category**:

- JAKIM Recognised Foreign Halal Certification Bodies (FHCB) list
- BPJPH LHLN / SHLN registration (Indonesia)
- MUIS Recognised Foreign Halal Certification Bodies
- SFDA approved bodies (Saudi)
- MOIAT registered bodies (UAE)

Recognition is often **category-by-category** — a certificate for one category does not cover another.

## 3. Check scope and expiry

- Confirm the certificate **covers the product and facility site** in question.
- Confirm it is **valid past the estimated arrival date** of the shipment.
- Check the **renewal status** — certificates typically run 1–3 years with annual surveillance audits.

## 4. For meat and poultry, require shipment-specific documents

Beyond the facility certificate, importing countries require a **shipment-specific batch or transaction certificate**:

- **Halal Slaughter Certificate** detailing slaughterhouse, slaughter date, slaughterman name, and stunning method (if used).
- Official health/veterinary export certificate (e.g. USDA-FSIS Form 9060-5 in the US).

## 5. Match documents exactly

The halal certificate, commercial invoice, packing list and bill of lading must align **word-for-word** on product name, quantity and weight — particularly under a **letter of credit**, where the bank pays only when presented documents strictly match the L/C terms. Misalignment is expensive: a container at Jeddah or Port Klang can accrue **US$150–300/day in demurrage**, and a rejected certificate can trigger return freight or destruction costs.
		`
	},
	{
		section: "due-diligence",
		slug: "red-flags",
		title: "Red Flags When Evaluating Suppliers",
		summary:
			"Signs that a supplier's halal certification or trade claim may not survive customs — and what to ask for instead.",
		tags: ["due diligence", "red flags", "risk", "supplier"],
		body: `
## Documentation red flags

- **"Halal certified" with no certificate number or issuing body** — certification is verifiable by definition; unverifiable claims are a warning sign.
- **A certificate from a body not on the destination market's recognition list** — a cert valid in one market may be worthless in another.
- **Certificate scope that doesn't match the product** — recognition is often category-by-category.
- **Expired or nearly-expired certificates** — and no evidence of renewal in progress.
- **Certificate descriptions that don't match the invoice/packing list/BOL** — under an L/C this alone can trigger bank rejection.
- **A generic "halal certificate" with no batch/shipment linkage** for meat or poultry — importing countries expect a **shipment-specific** halal certificate.

## Claims red flags

- **An official logo used without the certifier's name** — several jurisdictions legally require the certifier's full name next to any halal claim.
- **"Alcohol-free" without supporting lab evidence** where alcohol is plausible (flavourings, sauces).
- **Vague ingredient declarations** — the single most common label-compliance failure in import audits.
- **No segregation story** — for a halal producer, ask how halal and non-halal production lines, storage and transport are segregated.

## Commercial red flags

- **No pro forma invoice** or refusal to state Incoterm and payment terms in writing.
- **No cold-chain records** for frozen/chilled goods.
- **Unwillingness to name the freight forwarder** or provide a halal segregation statement for LCL shipments.

## What to ask for instead

1. Certificate **number + issuing body + expiry**, verified on the body's public database.
2. The body's **recognition status in your destination market**, for your specific category.
3. **Recent audit reports** and corrective-action history.
4. A **shipment-specific halal certificate** naming your batch numbers.
5. The **Ingredient and raw-material declarations**, including animal-derived inputs and alcohol/enzyme declarations.
		`
	},

	// ── Imported from Obsidian: Halal 认证百科 (English translation) ──────
	{
		section: "halal-certification",
		slug: "jakim-malaysia",
		title: "Malaysia (JAKIM) — The Gold Standard",
		summary:
			"JAKIM is the world's most-recognised halal certification authority. Certificate validity now varies by category (1–5 years), and Chinese exporters apply through JAKIM-recognised foreign bodies.",
		tags: ["malaysia", "JAKIM", "HDC", "recognition", "2026"],
		body: `
## Official sources

| Channel | URL | Note |
|---------|-----|------|
| JAKIM website | https://www.halal.gov.my | Main site with certification process |
| HDC | https://www.hdc.gov.my | Halal Development Corporation, export guides |
| Online application | https://ekixp.halal.gov.my | Certification application system |

> ✅ Verified accessible.

## About the authority

**JAKIM** (Jabatan Kemajuan Islam Malaysia) is Malaysia's Islamic Development Department:
- Sets halal certification standards
- Issues Malaysian halal certificates
- Regulates halal products and services nationwide
- Runs mutual-recognition with international halal bodies

**HDC** (Halal Development Corporation) supports halal industry development and exporter assistance.

## Certification process

\`\`\`
Application → document review → on-site inspection → training & assessment → certificate issuance → annual surveillance → renewal
\`\`\`

**Step 1 — Preparation:** business licence, company profile, product formulation (full ingredient list), raw-material source evidence, production flow diagram, HACCP or ISO 22000 certificate (if any), factory photos, employee halal training records.

**Step 2 — Submission:** submit via JAKIM website or designated channels; pay application fee; await document review (2–4 weeks).

**Step 3 — On-site inspection:** JAKIM inspectors visit the factory; check halal production conditions, raw-material sourcing, equipment cleanliness.

**Step 4 — Training & assessment:** attend halal training courses; pass the assessment.

**Step 5 — Certificate issuance.**

## Key data

| Item | Detail |
|------|--------|
| Certification cycle | **3–6 months** (meat & complex formulations 4–6 months) |
| Application language | Malay / English |
| Annual surveillance | Once per year |
| Chinese companies | Apply via JAKIM-recognised overseas halal bodies |
| Certificate validity | **By category:** catering/food manufacturing **2 years**; slaughterhouses/fresh meat **1 year** (higher hygiene risk); logistics/cosmetics/pharmaceuticals **3 years**; up to **5 years** for continued-good-compliance |

## Why it matters

- Recognised in **40+ countries and territories**
- Multiple mutual-recognition agreements
- Globally recognised *Halal* logo — strong brand value
- Gateway to the ASEAN Muslim market

## Official contact

| Channel | Detail |
|---------|--------|
| Website | https://www.halal.gov.my |
| HDC | https://www.hdc.gov.my |
| Address | Halal Hub Division, JAKIM, G Floor, Block 2200, Enterprise Building 3, Persiaran APEC, 63000 Cyberjaya, Selangor, Malaysia |
| Phone | +603-8315 0200 |
		`
	},
	{
		section: "halal-certification",
		slug: "saber-saudi-arabia",
		title: "Saudi Arabia (SABER / SASO) — Regulated Conformity",
		summary:
			"SABER is SASO's online product-compliance platform. PC certificates cost 500 SAR and SC (shipment) certificates 350 SAR. Chinese exporters must operate through a Saudi importer.",
		tags: ["saudi-arabia", "SABER", "SASO", "PC", "SC", "2026"],
		body: `
## Official sources

| Channel | URL | Note |
|---------|-----|------|
| SABER platform | https://saber.sa | Product registration & certificate applications |
| SASO website | https://www.saso.gov.sa | Standards organisation |
| Technical support | https://help.saber.sa | FAQ & help |
| CB list | https://saber.sa/home/CBOrganizations | Approved conformity bodies |
| Technical regulations | https://saber.sa/home/regulations | Regulations library |
| Non-regulated products | https://saber.sa/home/NonRegulatedProducts | Exempt products |
| HS code lookup | https://saber.sa/home/hscodes | HS code query |

> ✅ Verified accessible — 5,570,812+ registered products, 117,572+ registered users.

## What SABER is

**SABER** is the online product-compliance platform operated by **SASO** (Saudi Standards, Metrology and Quality Organization). Core functions: product registration, issuance of Product Conformity (PC) certificates, issuance of Shipment Conformity (SC) certificates, and connecting importers with conformity assessment bodies (CBs).

## Process

\`\`\`
Step 1: Importer registers an account in SABER
Step 2: Enter product HS code to check requirements
Step 3: If a PC is required → choose a CB → submit review → pay fee
Step 4: If an SC is required → apply → pay → certificate generated
Step 5: Clear customs with the SC certificate
\`\`\`

**Note:** Chinese exporters **cannot operate directly in SABER** — a Saudi importer must file the application.

## Official fees (verified, excluding VAT)

| Certificate | Official fee | Note |
|-------------|-------------|------|
| PC (Product Conformity) | **500 SAR** | Product conformity certificate |
| SC (Shipment Conformity) | **350 SAR** | Shipment clearance certificate |

Agent service fees: roughly RMB 1,500–5,000 (additional).

## Product classification

| Category | Required certs |
|----------|---------------|
| Regulated products | PC + SC |
| Non-regulated products | Self-declaration |
| IECEE-covered products | IECEE + PC + SC |
| GCC-covered products | GCC + PC + SC |

Query method: log in to SABER and enter the 12-digit Saudi HS code.

## 2026 official notices

- **From 1 May 2026:** unified shipping ports mandated for digital cameras, e-readers, earphones, computer mice, wireless routers etc. Must conform to **SASO IEC 62680-1-2:2023** and **SASO IEC 62680-1-3:2023**.
- **From 1 December 2026:** air-conditioner energy-efficiency standards updated.

## SABER vs SASO

| | SABER | SASO |
|--|-------|------|
| Nature | Online certification platform | Government regulator |
| Function | Product registration, certificate applications | Sets standards, regulates the market |
| Relationship | System operated by SASO | Parent authority of SABER |

## Official contact

| Channel | Detail |
|---------|--------|
| Platform | https://saber.sa |
| Phone | 920008673 |
| WhatsApp | +966920008673 |
| Support email | ecare@saber.sa |
| Complaints | info@saso.gov.sa |
		`
	},
	{
		section: "halal-certification",
		slug: "bpjph-indonesia",
		title: "Indonesia (BPJPH) — Mandatory Certification",
		summary:
			"BPJPH certification is mandatory in Indonesia: F&B since 17 Oct 2024, and cosmetics, medicines and chemicals from 17 Oct 2026. Certificates are valid 4 years.",
		tags: ["indonesia", "BPJPH", "mandatory", "2026", "deadline"],
		body: `
## Official sources

| Channel | URL | Note |
|---------|-----|------|
| BPJPH website | https://bpjph.halal.go.id | Main site |
| Online application | https://ptsp.halal.go.id | Certification application system |
| AI Halal assistant | https://aihalal.halal.go.id | AI assistant |
| Cost calculator | https://bpjph.halal.go.id/kalkulator-biaya-sh | Fee calculator |
| Approved LPH list | https://bpjph.halal.go.id/datalph | Halal inspection bodies |
| Approved overseas bodies | https://bpjph.halal.go.id/datalhln | Recognised foreign halal bodies |

> ✅ Verified accessible.

## About the authority

**BPJPH** (Badan Penyelenggara Jaminan Produk Halal) is Indonesia's only statutory halal product certification body:

| Item | Detail |
|------|--------|
| Established | October 2017 |
| Parent | Ministry of Religious Affairs |
| Legal basis | UU No. 33/2014 |
| Mandatory from | 17 October 2024 |

**Related body LPPOM MUI:** conducts on-site audits and issues religious rulings (fatwa).

## Services

1. Halal product certification
2. Registration of foreign halal certificates
3. Registration of halal auditors
4. Halal process companion institution applications
5. Halal process companion registrations
6. JPH training institution applications
7. LPH certification applications
8. Overseas halal body applications
9. SME halal certification facilitator registrations
10. LSP recommendation applications

## Process

\`\`\`
Step 1: Prepare application (company credentials, product formulation, raw-material list)
Step 2: Submit to BPJPH (via ptsp.halal.go.id)
Step 3: LPPOM MUI documents review
Step 4: MUI religious committee fatwa review
Step 5: BPJPH issues halal certificate
\`\`\`

## Key data

| Item | Detail |
|------|--------|
| Certificate validity | Usually **4 years** |
| Certification cycle | 4–8 weeks (longer for complex products) |
| Application language | Indonesian |
| Legal basis | UU No. 33/2014 |
| Enforcement | Phased (see below) |

## Mandatory timeline

| Phase | Deadline | Covered categories | Status |
|-------|----------|--------------------|--------|
| **Phase 1** | **2024-10-17** | Food & beverage, slaughter products, additives | ✅ In force |
| **Phase 2** | **2026-10-17** | **Cosmetics, traditional medicine, chemicals/biologicals**, apparel, toys and all consumer goods | ⚠️ **Must complete in 2026** |

> 🔴 **Important:** From 17 Oct 2026, exporters of cosmetics, medicine and chemicals to Indonesia must hold a BPJPH halal certificate or cannot be listed. This is a broader sweep than F&B — **all affected exporters should start certification now.**

## 2026 announcements

BPJPH announced **1.35 million free halal certification quotas** for SMEs in 2026.

## Routes for Chinese companies

1. Via a **BPJPH-recognised overseas halal body** (see: https://bpjph.halal.go.id/datalhln)
2. Via a **local Indonesian agent**
3. Via the official **OPB channel** (BPJPH–BHM strategic cooperation)

## Official contact

| Channel | Detail |
|---------|--------|
| Website | https://bpjph.halal.go.id |
| Online application | https://ptsp.halal.go.id |
| AI Halal | https://aihalal.halal.go.id |
| Phone | 176 |
| WhatsApp | 08111421142 |
| Email | layanan@halal.go.id |
| Address | Jl. Raya Pd. Gede No.13, Pinang Ranti, Jakarta Timur, DKI Jakarta 13560 |
		`
	},
	{
		section: "halal-certification",
		slug: "moiat-uae",
		title: "UAE (MoIAT) — National Halal Mark",
		summary:
			"MoIAT (ex-ESMA, merged 2020) issues the UAE National Halal Mark and runs the ECAS conformity scheme — and has an open-data API for certificate verification.",
		tags: ["uae", "MoIAT", "ESMA", "ECAS", "Halal National Mark"],
		body: `
## Official sources

| Channel | URL | Note |
|---------|-----|------|
| MoIAT website | https://www.moiat.gov.ae | Ministry of Industry & Advanced Technology (halal lead) |
| ECAS | Emirates Conformity Assessment Scheme | Product conformity assessment |
| UAE.S mark | National unified standard mark | Voluntary but widely required |
| Halal National Mark | UAE national halal mark | Managed by MoIAT |

> ⚠️ **Organisational change:** ESMA merged into **MoIAT** in 2020. The old esma.gov.ae URLs are dead. The UAE halal mark, ECAS and UAE.S standards are now under MoIAT.

## About the authority

**MoIAT** (Ministry of Industry and Advanced Technology) took over ESMA's standardisation and metrology functions in 2020 and is responsible for issuing and regulating the UAE **Halal National Mark**.

| Body | Role |
|------|------|
| MoIAT | Industrial & advanced technology ministry; halal national mark authority; standardisation; compliance |
| DED | Dubai Department of Economic Development (Dubai-area commercial registration & regulation) |
| GCC recognition | Mutual recognition of halal marks among GCC states |

## ECAS conformity scheme

Applies to: electrical/electronic goods, children's toys, auto parts, chemicals, building materials etc.

\`\`\`
Determine whether the product is within ECAS scope
  → Choose a MoIAT-recognised certification body (Notified Body)
  → Product testing + submit application documents
  → MoIAT review
  → ECAS certificate issued
  → Apply ECAS mark and NB number
\`\`\`

## Halal requirements

| Requirement | Detail |
|-------------|--------|
| Authority | **MoIAT** (formerly ESMA) |
| National halal mark | **Halal National Mark** (issued by MoIAT) |
| Raw materials | All ingredients must be halal-sourced |
| Production | No cross-contamination |
| Storage & transport | Dedicated halal conditions |
| Records | Full halal management records |
| Mutual recognition | Halal marks recognised across GCC |

## Market characteristics

- GCC hub: entry point to Gulf markets
- Trans-shipment: Dubai is the Middle East trade centre
- Strong purchasing power (high GDP per capita)
- Multicultural buyers
- Tightening regulation: MoIAT has steadily strengthened halal oversight since 2020

## Verification API

MoIAT is the **only core authority with a public open-data API** for certificate verification:

\`\`\`
GET https://data.moiat.gov.ae/api/v1/product-conformity/search
  ?certificateType=HNM&certificateNumber={number}
→ returns status, validity and covered categories
\`\`\`
		`
	},
	{
		section: "halal-certification",
		slug: "muis-singapore",
		title: "Singapore (MUIS) — International Recognition",
		summary:
			"MUIS is Singapore's sole halal authority. Foreign companies certify via WAREES Halal Limited, MUIS's only authorised overseas body; certificates are valid 1–2 years.",
		tags: ["singapore", "MUIS", "WAREES", "M3", "M4", "M5"],
		body: `
## Official sources

| Channel | URL | Note |
|---------|-----|------|
| MUIS website | https://www.muis.gov.sg | Islamic Religious Council |
| Halal zone | https://www.muis.gov.sg/halal | Halal certification area |
| WAREES Halal | https://www.wareeshalal.com.sg | Overseas halal certification |

> ✅ Verified accessible.

## About the authority

**MUIS** (Majlis Ugama Islam Singapura) is Singapore's Islamic Religious Council:

| Item | Detail |
|------|--------|
| Full name | Majlis Ugama Islam Singapura |
| Role | Singapore's sole halal certification manager |
| Certification body | ISO 9001 certified |

## Halal standards

Singapore applies the **MUIS Halal Standards**:

| Standard | Scope |
|----------|-------|
| **M3** | Halal food production, processing, storage |
| **M4** | Halal food transport and distribution |
| **M5** | Halal restaurants and food outlets |

## Process

\`\`\`
Preparation (company, products, management documents)
  → Submit to MUIS or an authorised body
  → Document review + on-site inspection
  → Halal training & assessment
  → Certificate issued
\`\`\`

## Key data

| Item | Detail |
|------|--------|
| Certificate validity | 1–2 years |
| Certification cycle | 2–4 weeks |
| Application language | English |
| International recognition | High (accepted in Indonesia, Saudi Arabia and more) |

## Overseas certification: WAREES Halal

**WAREES Halal Limited (WHL)** is Singapore's only MUIS-authorised overseas halal certification body. Website: https://www.wareeshalal.com.sg

Application route for Chinese companies:
1. Contact WAREES Halal Limited
2. Prepare company documents
3. WAREES audits and reports to MUIS
4. MUIS issues the certificate
		`
	},
	{
		section: "halal-certification",
		slug: "five-market-comparison",
		title: "Five Key Markets Compared",
		summary:
			"Malaysia, Saudi Arabia, Indonesia, UAE and Singapore side by side: authority, validity, cycle, fees and how Chinese exporters apply in each.",
		tags: ["comparison", "JAKIM", "SABER", "BPJPH", "MoIAT", "MUIS", "overview"],
		body: `
## Five-market comparison

| Market | Authority | Website | Certificate validity | Cycle | International recognition |
|--------|-----------|---------|----------------------|-------|---------------------------|
| Malaysia | JAKIM | halal.gov.my | 2 years | 2–4 months | ⭐⭐⭐⭐⭐ |
| Saudi Arabia | SABER/SASO | saber.sa | PC: long / SC: per shipment | 1–2 weeks | ⭐⭐⭐⭐⭐ |
| Indonesia | BPJPH | bpjph.halal.go.id | 4 years | 4–8 weeks | ⭐⭐⭐⭐ |
| UAE | MoIAT | moiat.gov.ae | per product | 2–4 weeks | ⭐⭐⭐⭐ |
| Singapore | MUIS | muis.gov.sg | 1–2 years | 2–4 weeks | ⭐⭐⭐⭐⭐ |

## Official fees compared

| Market | Fee | Source |
|--------|-----|--------|
| Malaysia | Official standard (see website) | halal.gov.my |
| Saudi Arabia | PC: 500 SAR / SC: 350 SAR | saber.sa (verified) |
| Indonesia | Fee calculator | bpjph.halal.go.id/kalkulator-biaya-sh |
| UAE | Official standard | moiat.gov.ae |
| Singapore | On enquiry | muis.gov.sg |

## Suitability for Chinese exporters

| Market | Suitability | How to apply |
|--------|-------------|--------------|
| Malaysia | ⭐⭐⭐⭐⭐ | Via JAKIM-recognised overseas body |
| Saudi Arabia | ⭐⭐⭐⭐⭐ | Via a Saudi importer in the SABER system |
| Indonesia | ⭐⭐⭐⭐ | Via a recognised overseas body or local agent |
| UAE | ⭐⭐⭐⭐ | Via local agent or international certifier |
| Singapore | ⭐⭐⭐⭐ | Via WAREES Halal (only authorised overseas body) |

## Mutual recognition

\`\`\`
JAKIM (Malaysia)  ←→  MUIS (Singapore), BPJPH (Indonesia, partial), many international bodies
MUIS (Singapore)  ←→  BPJPH (Indonesia), GCC states

⚠️ Halal certification is NOT fully mutual across markets —
   exporting to a specific market may require local certification.
\`\`\`

## Key cautions

| Market | Caution |
|--------|---------|
| Malaysia | JAKIM is highly recognised internationally — prioritise it |
| Saudi | SABER is technical conformity, separate from halal certification; food exports need both |
| Indonesia | Mandatory since 2024; SMEs can apply for free certification |
| UAE | MoIAT/ECAS is technical conformity; halal certification is a separate application |
| Singapore | MUIS is widely recognised; apply for overseas certification via WAREES |
		`
	},
	{
		section: "halal-certification",
		slug: "cicot-thailand",
		title: "Thailand (CICOT) — Southeast Asian Alternative",
		summary:
			"The Central Islamic Committee Office of Thailand (CICOT) is Thailand's official halal authority, recognised by AHF and IFANCA — useful for food, cosmetics and pharma exports to Thailand.",
		tags: ["thailand", "CICOT", "TISI", "asean"],
		body: `
## Official sources

| Channel | URL | Note |
|---------|-----|------|
| CICOT | Central Islamic Committee Office of Thailand | Thailand's halal authority |
| TISI | Thai Industrial Standards Institute | Thai industrial standards |

> Information grade: A — industry authority, cited by IFANCA and other international bodies.

## About the authority

**CICOT** (Central Islamic Committee Office of Thailand) is Thailand's official halal certification body:

| Item | Detail |
|------|--------|
| Full name | Central Islamic Committee Office of Thailand |
| Role | Thailand's official halal certification body |
| Scope | Food, cosmetics, pharmaceuticals |

Thailand-specific notes:
- Halal certification mainly targets food exported to Thailand
- Thailand has a large Muslim population (southern regions)
- Chinese food exporters to Thailand may need it

## Process

\`\`\`
Application → submit to CICOT → document review → on-site inspection (if needed) → certificate issued
\`\`\`

## Suitability for Chinese companies

| Scenario | Detail |
|----------|--------|
| Export to Thailand | Food exports to the Thai market |
| Local production | Setting up a food-processing plant in Thailand |
| Mutual recognition | Some Southeast Asian markets accept Thai certification |

## Recognition

CICOT certification is accepted by:
- AHF (United States)
- IFANCA
- Other international halal certification bodies
		`
	},
	{
		section: "halal-certification",
		slug: "hak-turkey",
		title: "Türkiye (HAK / GIMDES) — Eurasian Bridge",
		summary:
			"HAK (Halal Accreditation Agency) accredits Turkish certifiers like GIMDES. Certificates are valid 1–3 years, and the scheme supports exports to Türkiye and some Middle East markets.",
		tags: ["turkey", "HAK", "GIMDES", "accreditation"],
		body: `
## Official sources

| Channel | URL | Note |
|---------|-----|------|
| HAK | Halal Accreditation Agency | Turkish halal accreditation body |
| GIMDES | https://www.gimdes.org | Türkiye's main halal certification body |

> Information grade: A — industry authority; HCS and similar bodies hold HAK accreditation.

## About the authorities

**HAK** (Halal Accreditation Agency, Türkiye) is the Turkish halal certification accreditation and regulatory body:

| Item | Detail |
|------|--------|
| Full name | Halal Accreditation Agency (Türkiye) |
| Role | Halal certification accreditation and regulation |

**GIMDES** (Gıda ve İhtiyaç Maddeleri Denetleme ve Sertifikalama Kurumu) is one of Türkiye's largest halal certification bodies.

## Key data

| Item | Detail |
|------|--------|
| Certificate validity | 1–3 years (by product) |
| Certification cycle | 4–8 weeks |
| Application language | Turkish / English |

## Suitability for Chinese companies

| Scenario | Detail |
|----------|--------|
| Export to Türkiye | Food and cosmetics exports |
| European market | Türkiye is the Eurasia bridge |
| Mutual recognition | Some Middle East markets accept Turkish certification |
		`
	},
	{
		section: "halal-certification",
		slug: "ahf-united-states",
		title: "United States (AHF) — One Certificate, 180+ Markets",
		summary:
			"The American Halal Foundation (AHF) is ISO 17065-compliant, officially recognised by JAKIM, BPJPH, MUIS, MoIAT and GAC, and one certificate covers 180+ markets.",
		tags: ["united-states", "AHF", "ISO 17065", "global"],
		body: `
## Official sources

| Channel | URL | Note |
|---------|-----|------|
| AHF website | https://halalfoundation.org | American Halal Foundation |
| International recognitions | https://halalfoundation.org/international-recognitions-and-accreditations | Recognition list |

> Information grade: A — official website, complete information.

## About the authority

**AHF** (American Halal Foundation) is one of the most recognised halal certification bodies in the US:

| Item | Detail |
|------|--------|
| Full name | American Halal Foundation |
| ISO standard | ISO 17065 compliant |
| International recognition | JAKIM, BPJPH, MUIS, MoIAT, GAC and more |

Core advantages:
- **One certificate opens 180+ markets**
- Simultaneously certifies Halal, Gluten-Free, Non-GMO, Vegan and GMP
- One audit, multiple certifications

## Verified international recognition

| Body | Status |
|------|--------|
| JAKIM (Malaysia) | ✅ Officially recognised |
| BPJPH (Indonesia) | ✅ Officially recognised |
| EIAC (UAE / Middle East) | ✅ Officially recognised |
| CICOT (Thailand) | ✅ Officially recognised |
| MUIS (Singapore) | ✅ Officially recognised |
| GAC (Gulf Cooperation Council) | ✅ Officially recognised |
| World Halal Food Council | ✅ Member |

## Key data

| Item | Detail |
|------|--------|
| Certificate validity | By product type |
| Certification cycle | 4–8 weeks |
| Application language | English |
| Market coverage | 180+ countries |

## Suitability for Chinese companies

| Scenario | Detail |
|----------|--------|
| Export to North America | US and Canadian Muslim markets |
| Global markets | One cert, multiple recognitions — reduces repeated certification |
| Combined certification | Halal + other certifications in one audit |
		`
	},
	{
		section: "halal-certification",
		slug: "europe-halal-certification",
		title: "Europe (HCE & Council Networks) — Fragmented Landscape",
		summary:
			"Europe has no single halal standard. HCE (UK, est. 1992) is recognised by JAKIM, BPJPH, MUIS, GAC, MoIAT, SASO and HAK; the World Halal Council links regional certifiers.",
		tags: ["europe", "HCE", "World Halal Council", "uk"],
		body: `
## Halal Certification Europe (HCE)

| Item | Detail |
|------|--------|
| Website | https://halalce.com |
| Phone | +44 (0) 116 273 8228 |
| Email | info@Halalce.com |
| Established | 1992 |

**Recognising authorities:** JAKIM (Malaysia), BPJPH (Indonesia), MUIS (Singapore), GAC (Gulf states), MOIAT (Dubai/UAE), SASO/SFDA (Saudi Arabia), HAK (Türkiye).

## Halal Food Council USA

| Item | Detail |
|------|--------|
| Website | https://halalfoodcouncilusa.com |

## World Halal Council

| Item | Detail |
|------|--------|
| Website | https://www.worldhalalcouncil.com |
| Regional centre | Halal Greece |

## Suitability for Chinese companies

| Scenario | Detail |
|----------|--------|
| Export to Europe | European Muslim consumer market |
| Global certification | European certification recognised internationally |
| Combined certification | One certification reaches multiple markets |
		`
	},
	{
		section: "halal-certification",
		slug: "australia-nhasa",
		title: "Australia (NHASA) — Meat Export Certifier",
		summary:
			"The National Halal Certification Authority (NHASA, est. 2018) certifies food service and slaughter for Australia's meat-export trade, accepted by halal-importing regions worldwide.",
		tags: ["australia", "NHASA", "meat", "export"],
		body: `
## Official sources

| Channel | URL | Note |
|---------|-----|------|
| NHASA | https://nhasa.com.au | National Halal Certification Authority |

> Information grade: A — Australia's official halal certification body.

## About the authority

**NHASA** (National Halal Certification Authority) is Australia's main halal certification body:

| Item | Detail |
|------|--------|
| Full name | National Halal Certification Authority |
| Established | 2018 |
| Scope | Food service, slaughtering and more |

**Certificate acceptance:**
- Accepted by all halal-importing regions globally
- All Muslim-majority countries

## Suitability for Chinese companies

| Scenario | Detail |
|----------|--------|
| Export to Australia | Local Australian Muslim market |
| Import Australian meat | Australia is a major meat exporter |
| Halal meat certification | Lamb and beef exports |
		`
	},
	{
		section: "halal-certification",
		slug: "new-zealand-halal",
		title: "New Zealand — Halal for Meat & Dairy",
		summary:
			"New Zealand's halal certification is export-oriented, covering lamb, beef and dairy, delivered by local certifiers and international bodies such as AHF and HCE.",
		tags: ["new-zealand", "meat", "dairy", "export"],
		body: `
## Certification landscape

New Zealand halal certification is provided mainly by:
- Local New Zealand halal certifiers
- International bodies operating in New Zealand (AHF, HCE and others)

## New Zealand characteristics

| Characteristic | Detail |
|----------------|--------|
| Main products | Lamb, beef, dairy |
| Export orientation | Serves export markets primarily |
| Quality standards | High-standard quality control |

## Suitability for Chinese companies

| Scenario | Detail |
|----------|--------|
| Import from New Zealand | Halal food imports from NZ to China |
| Joint certification | Cooperative certification with NZ suppliers |
| Dairy certification | Infant formula and other dairy products |
		`
	},
	{
		section: "halal-certification",
		slug: "gcc-conformity",
		title: "GCC — G-Mark and Halal Across Seven States",
		summary:
			"The Gulf Cooperation Council's G-Mark lets one certificate cover seven states. In 2026 the GCC made a new home-appliance EMC standard mandatory.",
		tags: ["gcc", "GSO", "G-Mark", "2026", "gulf"],
		body: `
## GCC overview

The GCC (Gulf Cooperation Council) has 7 members:

| Country | Abbr |
|---------|------|
| Saudi Arabia | KSA |
| UAE | UAE |
| Kuwait | Kuwait |
| Qatar | Qatar |
| Bahrain | Bahrain |
| Oman | Oman |
| Yemen | Yemen |

## GSO

**GSO** (GCC Standardization Organization) is the GCC's standardisation body:

| Item | Detail |
|------|--------|
| Full name | GCC Standardization Organization |
| Role | Sets unified GCC standards |
| Certification | G-Mark (GCC conformity mark) |

## Certification types

### G-Mark

| Item | Detail |
|------|--------|
| Scope | Electrical, electronic, toys and more |
| Certificates | One certificate valid in all seven states |
| Standard source | Current GSO/IEC standards |

### Halal

GCC member states generally mutually recognise halal certification or accept a shared standard.

## Suitability for Chinese companies

| Scenario | Detail |
|----------|--------|
| G-Mark | Electrical/electronic exports to the seven Gulf states |
| Halal | Food exports must meet local halal requirements |
| One cert, many markets | Enter several markets via GCC certification |

## 2026 update

> ⚠️ **GCC home-appliance EMC standard became mandatory in March 2026.**
		`
	},
	{
		section: "halal-certification",
		slug: "international-body-comparison",
		title: "International Halal Bodies — Choosing a Certification",
		summary:
			"A comparison of JAKIM, SABER/SASO, BPJPH, MoIAT, MUIS, AHF, HCE, CICOT, HAK/GIMDES and NHASA, with a recommended certification path by exporter type.",
		tags: ["comparison", "strategy", "recommendation", "overview"],
		body: `
## Major bodies compared

| Body | Country / region | Recognition | Best fit |
|------|------------------|-------------|----------|
| **JAKIM** | Malaysia | ⭐⭐⭐⭐⭐ | Globally recognised, ASEAN first choice |
| **SABER/SASO** | Saudi Arabia | ⭐⭐⭐⭐⭐ | Essential for Gulf markets |
| **BPJPH** | Indonesia | ⭐⭐⭐⭐ | Largest Muslim market |
| **MoIAT** (ex-ESMA) | UAE | ⭐⭐⭐⭐ | Gulf entry point |
| **MUIS** | Singapore | ⭐⭐⭐⭐⭐ | Broad international recognition |
| **AHF** | United States | ⭐⭐⭐⭐⭐ | 180+ countries |
| **HCE** | UK / Europe | ⭐⭐⭐⭐ | European markets |
| **CICOT** | Thailand | ⭐⭐⭐ | Southeast Asian markets |
| **HAK/GIMDES** | Türkiye | ⭐⭐⭐ | Eurasia bridge |
| **NHASA** | Australia | ⭐⭐⭐ | Meat exports |

## Recognition network

\`\`\`
World Halal Council
 ├─ AHF (US)   ├─ JAKIM (MY)  ├─ MUIS (SG)  └─ GAC (GCC)
MoIAT (UAE)  BPJPH (ID)  SASO (SA)  HAK (TR)
\`\`\`

## Certification selection strategy

| Target market | Recommended | Alternative |
|---------------|-------------|-------------|
| Malaysia | JAKIM | AHF, MUIS |
| ASEAN markets | JAKIM | CICOT, AHF |
| Saudi Arabia | SABER + halal | AHF |
| Gulf states | MoIAT/SASO + G-Mark | AHF |
| Indonesia | BPJPH | AHF, JAKIM |
| Singapore | MUIS | WAREES (overseas) |
| Türkiye | HAK/GIMDES | AHF |
| Europe | HCE | AHF |
| United States | AHF | — |
| Australia | NHASA | AHF |

## Recommended paths for Chinese exporters

| Company type | Recommended certification combo |
|--------------|---------------------------------|
| General exporter | JAKIM + AHF |
| Food exporter | JAKIM + BPJPH + SABER |
| Meat exporter | JAKIM + NHASA + AHF |
| Cosmetics exporter | JAKIM + MoIAT + AHF |
| Startup | AHF (one certification, global coverage) |
		`
	},
	{
		section: "halal-certification",
		slug: "official-source-directory",
		title: "Official Information Sources Directory",
		summary:
			"A verified directory of official websites for JAKIM, SABER, BPJPH, MoIAT and MUIS — the primary sources to check before engaging any certifier.",
		tags: ["directory", "sources", "JAKIM", "SABER", "BPJPH", "MoIAT", "MUIS"],
		body: `
## Malaysia

| Information type | URL |
|------------------|-----|
| JAKIM website | https://www.halal.gov.my |
| HDC website | https://www.hdc.gov.my |
| Certification application | https://ekixp.halal.gov.my |

## Saudi Arabia

| Information type | URL |
|------------------|-----|
| SABER platform | https://saber.sa |
| SASO website | https://www.saso.gov.sa |
| CB body list | https://saber.sa/home/CBOrganizations |
| Technical regulations | https://saber.sa/home/regulations |
| Non-regulated products | https://saber.sa/home/NonRegulatedProducts |

## Indonesia

| Information type | URL |
|------------------|-----|
| BPJPH website | https://bpjph.halal.go.id |
| Online application | https://ptsp.halal.go.id |
| Fee calculator | https://bpjph.halal.go.id/kalkulator-biaya-sh |
| AI Halal | https://aihalal.halal.go.id |
| Approved overseas bodies | https://bpjph.halal.go.id/datalhln |

## UAE

| Information type | URL |
|------------------|-----|
| MoIAT website | https://www.moiat.gov.ae |

## Singapore

| Information type | URL |
|------------------|-----|
| MUIS website | https://www.muis.gov.sg |
| Halal zone | https://www.muis.gov.sg/halal |
| WAREES Halal | https://www.wareeshalal.com.sg |

> ⚠️ **Disclaimer:** Information comes from official authority websites and is for reference only. Fees and requirements may change — always check the official sources directly.
		`
	},

	// ── Imported from Obsidian: 欧洲清真市场分析 / 巴基斯坦清真市场深度分析 (EN) ──
	{
		section: "country-market-guides",
		slug: "europe-market-guide",
		title: "Europe — Fragmented Certification, Deep Demand",
		summary:
			"Europe's halal market is worth ~US$491B (broad measure, 2024) with ~46M Muslims. UK, France and Germany lead demand; the Netherlands is the logistics hub.",
		tags: ["europe", "uk", "france", "germany", "netherlands", "market"],
		body: `
## Market overview

Europe is one of the world's fastest-growing halal food markets. The European halal food market was valued at about **US$490.9 billion in 2024** (broad measure — all food consumed by Europe's ~46M Muslims) and is projected to reach **US$1.09 trillion by 2033** (CAGR ~9.34%, Research and Markets, Jul 2025). A narrower measure — certified halal retail food only — is closer to **~US$30 billion (2025, Mordor Intelligence)**.

Global halal food was ~**US$2.95 trillion in 2025**, heading to **US$6.32 trillion by 2034** (CAGR 8.56%); Europe is ~16–17% of the global total.

**Core growth drivers:** growing Muslim population (4.9% of Europeans in 2016 → ~6% / ~46M in 2025); non-Muslim demand on quality/ethics/cleanliness grounds; expanding halal lines in major retailers; fast-growing online halal sales; rising certification awareness.

## Country deep dives

### United Kingdom — Europe's largest halal food market

| Metric | Data |
|--------|------|
| Muslim population | ~4.1M (6.5% of population) |
| Halal food market | ~US$7.5–8.5B |
| Main communities | Pakistani, Bangladeshi, Indian origin |
| Certification | HFA and HMC dual-track |
| Concentrated in | London (1.3M+), Birmingham, Bradford |

The UK has Europe's most mature halal certification system (HFA founded 1984). Halal products are embedded in mainstream retail (Tesco, Sainsbury's, Asda); chains such as Nando's and KFC offer halal options; e-commerce is growing (Ummah Foods, Halal Click). **Platform takeaway:** the UK is the first entry point into European halal — clear certification gateways and strong B2B demand for meat, ready meals and condiments.

### France — largest Muslim population

| Metric | Data |
|--------|------|
| Muslim population | ~6–6.7M (~9% of population) |
| Halal food market | ~US$8–9B |
| Main communities | North African (Algeria, Morocco, Tunisia) |
| Certification bodies | ~50 (Paris Grand Mosque, Lyon, Évry) |
| Traditional channel | Independent halal butchers ~80% of sales |

**Certification fragmentation is the biggest challenge** — France has no unified national halal standard, and ~50 bodies coexist with varying standards. AFNOR published a non-mandatory standard in 2017. Halal meat is among France's fastest-growing food segments; ~14% of beef and ~22% of lamb slaughter is dual halal/kosher certified.

### Germany — fastest-growing market

| Metric | Data |
|--------|------|
| Muslim population | ~5–6M (~6–7%) |
| Halal market | ~US$5–6B |
| Main community | Turkish origin (~63%+ of Muslims) |
| Certification | Early stage, several private bodies |
| Retail | Traditional Turkish butchers; supermarkets expanding |

Germany is in transition from ethnic shops to mainstream retail. Diyanet-affiliated bodies are influential. Frozen halal meat and Turkish-style ready meals are the fastest-growing segments. Germany is a distribution hub for CEE and Nordic halal food.

### Netherlands — Europe's halal logistics hub

| Metric | Data |
|--------|------|
| Muslim population | ~1.1M (6%) |
| Halal market | ~US$5.8B |
| Per-capita halal spend | ~US$5,300 |
| Certification | HFFIA, HFC Europe, ECC Halal |

**The Port of Rotterdam is Europe's largest halal trans-shipment hub** and Schiphol a key air gateway. HFFIA has operated for 40+ years with global recognition; ECC Halal is headquartered in Rotterdam. Through Rotterdam the Netherlands influences **23M+ Muslim consumers** across Northern and Western Europe.

### Other notable markets

| Market | Muslims | Market size | Notes |
|--------|---------|-------------|-------|
| Belgium | 0.8–1.0M (7–8%) | US$1.5–2.0B | Brussels >25% Muslim; relies on FR/NL certifiers |
| Spain | 2.0–2.5M (4–5%) | US$2.5–3.5B | Southern gateway to Europe; Junta Islamica |
| Italy | 2.5–3.0M (4–5%) | US$2.0–3.0B | Halal Italia; meat, ready meals, pasta |
| Sweden | 0.8–1.0M (~8%) | US$1.0–1.5B | Nordic leader; highest e-commerce penetration |

## Certification landscape & challenges

The EU has **no unified halal regulation or standard** — the landscape is highly fragmented:

| Country | Main certifiers | Background | International recognition |
|---------|----------------|-----------|---------------------------|
| UK | HFA, HMC | Mature local bodies | High |
| France | Paris/Lyon/Évry mosques | Mosque-affiliated | Medium |
| Germany | Diyanet-linked, private | Religious + private | Medium-low |
| Netherlands | HFFIA, ECC Halal, HQC | Professional + private | **Very high** |
| Italy | Halal Italia | Public-private | Medium |
| Spain | Junta Islamica Spain | Religious body | Medium |

**Core challenges:** self-declaration without certification; lack of mutual recognition across countries; unregulated certifiers without ISO/IEC 17065; limited enforcement of OIC/SMIIC standards; a regulatory vacuum for imported halal food; and tensions between EU animal-welfare rules on non-stunned slaughter and some halal requirements.

## China–Europe trade opportunities

Chinese halal exports to Europe are still small (under 5% of China's food exports to Europe are halal-certified). Advantage categories: **condiments, frozen food, tea, confectionery, cereal products, herbal supplements**.

| Entry path | Model | Best starting point |
|-----------|-------|---------------------|
| 1. Rotterdam re-export | Warehouse & distribution via Rotterdam | HFFIA/ECC certification, pan-Europe reach |
| 2. UK direct | Direct to UK big retailers | HFA/HMC certification |
| 3. Germany contract manufacturing | OEM for German brands | Diyanet-recognised certification, Turkish channels |
| 4. France online retail | French e-commerce platforms | Paris Grand Mosque or AFNOR standard |
| 5. Southern Europe | Spain/Italy as gateway | Geographic proximity, Moroccan channels |

**Key barriers:** low recognition of Chinese halal certification in Europe (needs a European-recognised certifier), low brand trust, weak supply-chain traceability, EU General Food Law (EC 178/2002) complexity, and cultural differences in taste preferences across Muslim communities.
		`
	},
	{
		section: "country-market-guides",
		slug: "pakistan-market-guide",
		title: "Pakistan — The Two-Way Halal Market",
		summary:
			"Pakistan is a dual-role market: a US$147B domestic halal market and supplier of meat, textiles and surgical instruments to China, while importing ingredients, chemicals and machinery.",
		tags: ["pakistan", "PHA", "CPEC", "two-way trade", "market"],
		body: `
## Country overview

Pakistan is the world's fifth-most-populous country — **259.3M people in 2026** (1.6% annual growth), **96%+ Muslim**, the second-largest Muslim population after Indonesia. Median age is just **22.6 years** — an extremely young population that will keep halal consumer demand growing for decades. Population is projected to exceed 286M by 2030 and near 380M by 2050.

The domestic halal food & beverage market was valued at **US$147.12 billion in 2023**, covering meat, dairy, grains, beverages and snacks. Nearly all domestic food is inherently halal, but awareness of *certified* halal is rising fast, driving a premium for certified products.

## Halal certification: PHA

The **Pakistan Halal Authority (PHA)**, established under Act No. VIII of 2016 under the Ministry of Science & Technology (MoST), regulates halal status of domestic and imported/exported products. Core functions: setting halal standards; recognising and registering halal certification bodies (HCBs); coordinating international mutual recognition; supervising imported products; endorsing exports.

PHA-recognised local certifiers (19 registered as of 2025) include SANHA Halal Associates Pakistan (Karachi, HCB-005), International Halal Certification (Karachi, HCB-006), Punjab Halal Development Agency (Lahore, HCB-004) and Minhaj Halal Certification (Lahore, LHCB-010), among 12 more nationwide.

**International progress:** mutual-recognition with the US (IFANCA) and Russia; a 2025 halal MoU with Türkiye; PHA is joining IHAF and SMIIC; Pakistan standards PS OIC/SMIIC 3:2021 and PS OIC/SMIIC 9:2022 adopt the OIC/SMIIC international standards.

**Import requirements:** halal certification is mandatory for all imported animal-derived and animal-containing products. Every consignment of food & beverage needs a halal certificate from a body recognised by IHAF or SMIIC members; labels must have Urdu translation (no sticker labels); imported goods must have ≥50% shelf life remaining on arrival; pork and alcohol-containing products are banned.

## Export potential to China

| Sector | Highlight |
|--------|-----------|
| Meat | 6M tonnes halal meat produced/year; **2024 meat exports US$512M**; cooked-beef exports to China grew **+177–239% to US$14.52M in 2025** (2.38M kg, ~US$6.1/kg) into Jiangsu, Zhejiang and Tianjin |
| Textiles | ~US$488.5M exports to China in 2025 (yarn ~US$386M; apparel, home textiles, carpets, baby clothing growing) |
| Surgical instruments | Sialkot produces **150M instruments/year — 70%+ of the global reusable market**; ~US$32M exported to China in Q1 2025 |
| Aquatics | **US$465M exports in FY2024-25** (US$280M to China, +22%), including mud crab where Pakistan ranks **#3 globally** |

A 3-year halal meat export strategy (approved Dec 2025 by the Prime Minister) targets slaughterhouse upgrades, cold-chain improvement, disease control and international certification.

## CPEC & trade framework

China–Pakistan bilateral trade reached **US$25.23B in 2025 (+9.7%)**; China has been Pakistan's **largest trading partner for 12 years**. **CPEC 2.0** (2026+) shifts focus to agriculture, industry and mining: the Jan 2026 Pakistan–China Agriculture Investment Conference signed **78–79 MoUs worth US$4.5B** across 10 high-impact sub-sectors (agri-inputs, machinery, food processing, meat/poultry, dairy, fruit & vegetables, animal feed, aquaculture, cold chain, food-grade packaging). The **third phase of CPFTA** cuts tariffs on ~700 lines.

## Import demand (opportunities for Chinese exporters)

| Category | Annual import (est.) | Halal relevance | China competitiveness |
|----------|---------------------|-----------------|------------------------|
| Palm oil | US$3.0–3.5B | No (vegetable oil) | Medium (re-export/refining) |
| Chemicals | US$6.5B+ | Partial | **High** |
| Machinery | US$6.5B+ | No | **Very high** |
| Food ingredients/additives | US$0.5–1.0B | **Strict halal** | **High** (certified) |
| Pharma/APIs | US$1.0–1.5B | Rising halal pharmacopeia | **High** |
| Cosmetics/personal care | US$0.5–0.8B | Rising halal cosmetics | **High** |

Priority categories for Chinese sellers: food ingredients/additives, flavours, APIs, cosmetics raw materials, food-processing machinery, whey protein/nutrition — all with a halal-certification first strategy against the PHA-recognised HCB list.

## Pakistan as a re-export hub

Via **CPEC and Gwadar Port**, Pakistan can serve as: a hub for Chinese halal products re-exported to the Middle East and Africa; a trans-shipment point for Central Asian states; and a bridge for Middle Eastern capital into China's halal industry. Compared with Malaysia, Indonesia and the UAE, Pakistan offers the **cheapest labour, a land corridor to China, top-tier livestock resources** and a large certified-adjacent domestic market — with a less mature certification ecosystem and very low halal e-commerce coverage.
		`
	}
];

export function getArticle(section: string, slug: string): KbArticle | undefined {
	return kbArticles.find((a) => a.section === section && a.slug === slug);
}

export function getArticlesInSection(section: string): KbArticle[] {
	return kbArticles.filter((a) => a.section === section);
}
