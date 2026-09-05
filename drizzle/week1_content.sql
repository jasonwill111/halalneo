-- HalalNeo Week 1 SEO content batch (Sept 2026)
-- 1 blog post (pages) + 1 market guide (market_guides) + 2 KB articles (knowledge_base)
-- NOTE (schema): knowledge_base rows use created_at/updated_at to match drizzle/d1_seed.sql
-- and drizzle/d1_seed_new_articles.sql (the brief's "created"/"updated" columns do not exist).
-- NOTE (standards): GSO 193:2021 covers contaminants/toxins, NOT labelling. The labelling
-- standard is GSO 9:2022 (+Amd1:2025); article 1 is built around GSO 9 (slug kept as specified).

INSERT INTO "pages" ("slug","title","type","excerpt","body","author","category","featured_image","tags","meta_title","meta_description","keywords","status","views","published_at","created_at","updated_at") VALUES ('uae-moiat-halal-national-mark-application-guide','UAE MOIAT Halal National Mark: application walkthrough','blog','How exporters apply for the UAE Halal National Mark via MOIAT: steps, fees, timelines, and how the mark differs from basic certification.','For exporters targeting the Gulf, the UAE offers two halal credentials that are easy to confuse: halal certification, and the Halal National Mark. Certification is the evidence that a product and its process meet halal rules. The National Mark is a separate, optional licence — granted by the Department of Conformity at the Ministry of Industry and Advanced Technology (MOIAT) — that lets a product, service or production system carry the federal mark as an in-market trust signal. This walkthrough covers who needs what, the application steps, and realistic timelines and costs for 2026. For market context, see our [UAE market guide](/market-guides/uae) and the [MOIAT certifier profile](/certifying-bodies/moiat).

## Who actually needs the mark

The mark itself is optional: MOIAT states that qualified local and international products may obtain it to emphasise Sharia compliance. But optional is not the same as unnecessary. For regulated categories — meat, poultry, supplements and nutraceuticals — certification to UAE.S 2055-1 (general requirements) and 2055-2 (management systems) by a MOIAT-accredited body is effectively required before customs clearance. Certificates from bodies such as JAKIM, MUI and IFANCA are accepted where the body holds the relevant accreditation. Exporters in these categories should therefore plan for two layers: the underlying halal certificate first, then the National Mark licence on top.

## The application walkthrough

**Step 1 — Confirm scope and standard.** Map each SKU to UAE.S 2055-1/2055-2 and confirm the category sits inside your chosen certification body''s accreditation scope. Scope mismatches are the most common reason files stall.

**Step 2 — Get certified through an accredited body.** The body audits the facility and reviews ingredients, cleaning and segregation controls, and labelling artwork. Major conformity bodies offer a halal certificate with or without the National Mark track — choose the with-mark track if the mark is the goal, so the audit evidence feeds both decisions.

**Step 3 — Assemble the technical file.** For the mark licence, MOIAT expects the evaluation report, the onsite assessment report, an accredited-laboratory test report, and the certification body''s valid accreditation certificate showing scope. Exporters outside the UAE follow the same route but should confirm whether a declaration of accountability or a local representative is needed in their case.

**Step 4 — Apply on the MOIAT digital platform.** Register or log in via MOIAT single sign-on, submit the national-conformity-marks service request, attach the file, and complete any field assessment that MOIAT or its designated body schedules.

**Step 5 — Pay the fees and receive the digital licence.** MOIAT publishes a six-working-day service time for this step once the file is complete, and the licence itself is issued for three years.

## Timeline and costs: verified vs. ballpark

Verified from MOIAT''s published service card: the licence decision takes around six working days after a complete submission, the licence runs for three years, and the published issuance fee is around AED 670 with technical-assessment charges listed per assessor-day. Treat these as the government slice only. The larger cost sits with the accredited body — audits, testing, travel and any corrective-action visits. Consultants typically quote end-to-end certification journeys of two to four months and AED 5,000–30,000 depending on facility size and SKU count. Confirm the current schedule when filing, because fees move: a 2023 revision famously cut the Halal mark licence fee from AED 18,000 to AED 2,000.

## Three mistakes that delay files

First, artwork reviewed too late: Arabic labelling and ingredient statements should be cleared during the audit, not after printing. Second, supplier paperwork gaps on high-risk inputs such as gelatin, enzymes and meat derivatives — collect certificates of analysis and supplier halal certificates before the audit. Third, letting the underlying halal certificate lapse: many product certificates run one year even though the mark licence runs three, so diary both renewals.','HalalNeo Editorial','blog','/api/media/blog-1.webp','["uae","moiat","certification"]','UAE MOIAT Halal National Mark: Application Walkthrough for Exporters','Step-by-step MOIAT Halal National Mark application guide for exporters: requirements, fees, timeline and tips for 2026.',NULL,'published',0,1788300000,1788300000,1788300000);

INSERT INTO "market_guides" ("slug","country","flag","region","muslim_population","total_population","market_size_usd","mandate_status","mandatory_since","certifying_bodies","import_requirements","standard_basis","certificate_validity","estimated_cost_usd","processing_time","key_insights","opportunities","challenges","summary","meta_title","meta_description","keywords","status","created_at","updated_at") VALUES ('thailand','Thailand','🇹🇭','Southeast Asia','~4 million','~72 million','$6B+ (halal product exports)','voluntary',NULL,'[{"name":"CICOT","slug":"cicot"}]','["CICOT halal certificate for any product bearing a halal claim — voluntary by law but commercially expected by most buyers","Thai FDA food licensing underneath: factory licence (Or.2) plus product registration (Or.17/Or.18) for manufactured foods","Thai-language labelling per Thai FDA rules; halal logo use follows CICOT logo-use requirements","No blanket halal import mandate — but halal claims without valid certification risk rejection by buyers and authorities","Meat and poultry: source from approved establishments and confirm slaughter-certification paperwork with the importer"]','CICOT Halal Affairs Regulations B.E. 2558 (updated B.E. 2568/2025); Thai Agricultural Standard TAS 8400-2025; broadly aligned with OIC/SMIIC','2–3 years (scheme-dependent; confirm with CICOT)','Varies by scope — confirm the inspection fee schedule with CICOT before budgeting','Typically several weeks to a few months depending on documentation readiness (confirm with CICOT)','["200,000+ halal items certified by CICOT, per Thailand''s Commerce Minister (Dec 2025)","Halal food exports to OIC members reached USD 4.872B in Jan–Oct 2025 (Ministry of Commerce)","2023 halal exports totalled 222B baht (around USD 6B); Thailand ranked 11th globally with ~4% annual growth expected","Government target: top-five global halal exporter and a ''food security hub'' for OIC countries","Lab-backed credibility: the Halal Science Center at Chulalongkorn University supports CICOT verification with DNA and analytical testing"]','["Export manufacturing base: rice, canned seafood, poultry, oils and ready-to-eat lines already flow to the Middle East","THAIFEX–ANUGA Asia and HOREC Asia anchor the annual buyer calendar","Capacity-building programs in the five southern border provinces are expanding certified supply","Muslim-friendly tourism and GMHI-standard services open adjacent halal revenue streams"]','["Perception gap: buyers sometimes question halal credibility from a Buddhist-majority country — CICOT certification plus lab evidence counters this","Transport costs make price competition with regional suppliers difficult on some lines","Voluntary regime means buyer-by-buyer requirements — confirm whether CICOT alone, or an additional cert, is expected","Check mutual-recognition coverage for each target market before committing packaging and label spend"]','Thailand is a top-tier halal production base — 200,000+ CICOT-certified items and around USD 6B in annual halal exports — operating under a voluntary certification regime. Exporters deal directly with CICOT or provincial Islamic committees for certification while meeting Thai FDA licensing underneath.','Thailand Halal Market Guide: CICOT Certification, Requirements & Opportunities','Entering Thailand''s halal market? CICOT certification steps, Thai FDA licensing, export data and buyer expectations in one guide.',NULL,'published',1788300000,1788300000);

INSERT INTO "knowledge_base" ("slug","section","title","summary","body","tags","author","status","views","created_at","updated_at") VALUES (
'gso-193-labelling-claims-checklist',
'packaging-labeling',
'GSO 9 Labelling Claims Checklist: What the Gulf Standard Actually Requires',
'GSO 193 covers contaminants, not labels. This checklist walks through GSO 9:2022 claims rules — halal, health, nutrition — for GCC market entry.',
'Exporters searching for the Gulf labelling standard sometimes land on GSO 193 — but GSO 193:2021 is the Gulf Technical Regulation on contaminants and toxins in food and feed, not labelling. The labelling standard is GSO 9:2022, Labelling of Prepackaged Foodstuffs (amended 2025), and this checklist is built around it. Claims sit at the intersection of GSO 9 and its companion regulations, so use this as a pre-artwork gate before anything goes to print. For market context see our [UAE market guide](/market-guides/uae) and the [MOIAT certifier profile](/certifying-bodies/moiat).

## Start from the correct standard stack

- **GSO 9:2022 (+ Amd 1:2025)** — the labelling regulation itself: mandatory particulars, presentation, language and claims framing. The 2025 amendment tightens the misleading-description rule and allows electronic codes as a supplement to, never a substitute for, the written label.
- **GSO CAC/GL 1** — general guidelines on claims, referenced directly by GSO 9.
- **GSO 2333** — requirements for health and nutrition claims.
- **GSO 2233** — nutrition labelling; **GSO 150-1/150-2** — date marking; **GSO 2055-1** — halal food requirements, also referenced by GSO 9.
- **GSO 193** — keep it in the compliance file, but in its place: it governs contaminant limits your test reports must meet. It will not save a label.

## The core claims rule

- No label, image or wording may present the food as another food, imply a relationship to another product, or suggest special features that similar products also have (GSO 9:2022/Amd1:2025, item 4.1).
- Every claim must be substantiable on demand: nutrient analyses, test reports, certificates. If the dossier cannot prove it, the artwork should not say it.
- Adjectives such as natural, pure and premium count as claims where they imply a verifiable difference — confirm with the authority where unsure.
- Pictures are claims too: fruit imagery, farm scenes and badges all fall under the same truthfulness test.

## Halal claims and the National Mark

- Any halal wording or logo must trace to a valid certificate covering the exact SKU. Certifier logos are licensed per product, not per company.
- In the UAE, the Halal National Mark licence (MOIAT) is the strongest shelf-level signal; bare halal wording without backing is a rejection risk at inspection.
- Match the mark on pack to the certificate scope line by line: same product name, same production site, valid dates.
- Never combine a halal mark with imagery or co-claims (for example alcohol-adjacent serving suggestions) that undermine it — mixed signals draw auditor attention.

## Health and nutrition claims

- Health and nutrition claims fall under GSO 2333: only permitted claims supported by compliant nutrient levels may be used.
- The nutrition panel (GSO 2233) must support the claim figures exactly — rounding mismatches between front-of-pack claims and the panel get flagged.
- Vitamins and minerals generally need declaration where a claim is made about them.
- Comparative claims (less sugar, more fibre) need a stated reference point; otherwise they fail the substantiation test.

## Dates, language and origin: the silent claim-killers

- Production and expiry dating follows GSO 150-1/150-2; embossed or ink-jet dates must survive storage and remain legible at port checks.
- Arabic is mandatory across the GCC (Arabic-only or Arabic/English); confirm sticker acceptance market by market rather than assuming one approval covers all six states.
- Country of origin is mandatory, and importer or agent details are required where the destination market asks for them — missing importer lines are a classic hold reason.

## Pre-shipment checklist

- Confirm the GSO 9:2022 edition plus the 2025 amendment is the artwork reference, not GSO 193.
- List every textual and pictorial claim on the pack, including badges and imagery.
- Map each claim to its evidence: test report, nutrient analysis or certificate number.
- Verify health/nutrition claims against GSO 2333 and the GSO 2233 panel figures.
- Verify the halal mark against certificate scope, site and validity dates.
- Check Arabic translations against the English source — mistranslated ingredients are a top rejection cause.
- Confirm date format, legibility and durability per GSO 150-1/150-2.
- Confirm net contents, lot code, maker/packer address, origin and importer lines are all present.
- Confirm electronic codes (QR) carry only supplementary data, with all mandatory data printed on pack.
- Run a final artwork review with someone who knows the destination market''s current enforcement practice.
- Keep the label, the technical file and the shipped product perfectly consistent — mismatches trigger shipment-level rejection.
- Diary certificate and licence renewals so in-market stock never carries an expired mark.

## What happens when claims fail at port

Failed claims typically mean holds, supervised re-labelling, re-export or destruction — and in strict markets a single documentation mismatch can condemn a whole consignment. The cheap fix is always pre-print review: an hour with the standards and a market-knowledgeable reviewer costs a fraction of a stuck container.',
'["packaging","labelling","gso","gcc"]','HalalNeo Editorial','published',0,1788300000,1788300000
);

INSERT INTO "knowledge_base" ("slug","section","title","summary","body","tags","author","status","views","created_at","updated_at") VALUES (
'arabic-label-mandatory-elements-by-market',
'packaging-labeling',
'Arabic Label Mandatory Elements by Market: UAE, Saudi Arabia, Indonesia and Malaysia',
'Mandatory label elements for four halal markets: Arabic rules in the UAE and Saudi Arabia, Bahasa Indonesia rules, and Malay/English practice in Malaysia.',
'Arabic is mandatory on food labels across the Gulf under GSO 9:2022, but each market layers its own portal, language practice and enforcement style on top — and Southeast Asia''s giants do not use Arabic at all. This guide compares the UAE, Saudi Arabia, Indonesia and Malaysia element by element, so one artwork set can serve all four with planned variations. Related: [Saudi Arabia market guide](/market-guides/saudi-arabia) and [Indonesia market guide](/market-guides/indonesia).

## The baseline every market shares

All four markets build on the Codex CXS 1-1985 foundation carried into GSO 9: product name, ingredients in descending order, allergens, net contents, maker or packer name and address, country of origin, lot identification, date marking with storage conditions, and instructions for use where needed. Halal-specific layers — certificates, logos, slaughter paperwork — sit on top of this baseline, never instead of it. A product can be perfectly halal yet still be rejected for a missing ingredient declaration.

## United Arab Emirates

- The applicable text is UAE.S GSO 9 (GSO 9:2022 plus the 2025 amendment): labels must be in Arabic only or Arabic/English, and Arabic stickers are accepted — confirm the current sticker practice with the importer before relying on it.
- Keep Arabic at least as prominent as English and verify translation quality; mistranslated ingredient lines are among the most common label holds.
- Regulated categories move through MOIAT conformity routes (ECAS for listed products): the approved label must match the formula, specification and test evidence in the technical file, so artwork changes after approval mean rework.
- The Halal National Mark is available as an optional, licensed trust signal on top of base certification.
- Advance label approval through the local importer is strongly recommended, especially for new-to-market goods.

## Saudi Arabia

- Saudi Arabia applies SFDA.FD GSO 9:2022 and enforces it the hardest in the GCC — exporters who design to SFDA practice generally clear the rest of the Gulf without relabelling.
- Arabic is mandatory; bilingual Arabic/English is the norm for imports, with legible, consumer-friendly formatting throughout.
- Product registration in the SFDA e-portal happens before shipment, with a valid Certificate of Conformity for food imports; meat and poultry need a per-shipment halal certificate plus an Islamic slaughter certificate countersigned by the origin country''s government.
- A 2025 nutritional-labelling update standardises energy, protein, carbohydrate, fat, saturated fat, sugar and sodium declarations in a bilingual format with phased enforcement — confirm the current deadline with SFDA or the local representative, who is effectively mandatory for smooth clearance.
- Non-compliance consequences scale fast: holds, penalties, recalls and blacklisting for repeat violations.

## Indonesia: Bahasa Indonesia, not Arabic

- Indonesia does not require Arabic: labels must be in Bahasa Indonesia, and certified products carry the national halal logo alongside the BPJPH certification trail.
- The regime runs under Law 33/2014 (as amended) via the SIHALAL digital platform; food and beverage certification has been mandatory since October 2024 with the net widening further from October 2026 — confirm the current phase with BPJPH, as timelines have shifted before.
- Foreign halal certificates are only recognised where the issuing body sits on BPJPH''s recognised list under mutual recognition — JAKIM-issued certificates, for example, are accepted under the Indonesia–Malaysia arrangement.
- Small-consignment exporters should note the subsidised SME processing-fee tier, which changes landed-cost math for trial orders.

## Malaysia: Malay and English

- Malaysian practice is Malay/English labelling with the certifier logo: JAKIM certification, or a certificate from a JAKIM-recognised foreign body, underpins any halal claim.
- Halal certification is mandatory for meat and poultry imports regardless of origin, with import licences (AP) required on top of the halal certificate.
- JAKIM certification carries the widest mutual recognition of any mark in the region, which is why many exporters certify to JAKIM even when Malaysia is only one of several target markets.
- Audit wait times can stretch past six months, so label and certification planning must start well ahead of the shipping season.

## Stickers versus printed labels

- Compliant-from-the-start artwork is always cleaner than rescue stickering, but where a gap is found, Arabic stickers are an accepted remedy in the UAE while Saudi practice is stricter — confirm before printing thousands of units.
- Bilingual packs read right-to-left on the Arabic panel: lay out both languages from the beginning so the Arabic panel never covers mandatory English data or vice versa.
- Any sticker must be indelible in practice — peeling, curling or moisture-damaged stickers fail the same legibility test as print.

## Pre-print checklist

- Fix the destination market first: UAE, Saudi, Indonesia and Malaysia need different label variants from one base design.
- Draft Arabic (Gulf) or Bahasa Indonesia / Malay (Southeast Asia) panels with a qualified translator, not machine output.
- Verify every mandatory element: name, ingredients, allergens, net contents, maker/packer, origin, lot, dates, storage, instructions, importer.
- Match halal wording and logos to live certificate scope, site and dates.
- Align nutrition figures between front-of-pack claims and the regulated panel.
- Confirm date format and durability for the full logistics chain, including refrigeration.
- Register the product and label in the market portal (SFDA e-portal, SIHALAL, MOIAT routes) before shipment.
- Keep label, dossier and shipped goods identical down to the batch-code format.
- Book a pre-print review with someone current on the destination market''s enforcement practice.
- Diary renewals: a valid label carrying an expired certificate is still a violation.',
'["packaging","labelling","arabic-label","mena"]','HalalNeo Editorial','published',0,1788300000,1788300000
);
