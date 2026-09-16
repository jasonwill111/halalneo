export interface MarketGuide {
	slug: string;
	country: string;
	flag: string;
	region: 'Southeast Asia' | 'Middle East' | 'South Asia' | 'Europe' | 'East Asia' | 'North America' | 'Africa';
	muslimPopulation: string;
	totalPopulation: string;
	marketSizeUsd: string;
	mandateStatus: 'mandatory' | 'phasing-in' | 'voluntary';
	mandatorySince: string | null;
	certifyingBodies: { name: string; slug: string }[];
	importRequirements: string[];
	standardBasis: string;
	certificateValidity: string;
	estimatedCostUsd: string;
	processingTime: string;
	keyInsights: string[];
	opportunities: string[];
	challenges: string[];
	summary: string;
}

export const marketGuides: MarketGuide[] = [
	// 1. Indonesia (existing)
	{
		slug: 'indonesia',
		country: 'Indonesia',
		flag: '🇮🇩',
		region: 'Southeast Asia',
		muslimPopulation: '~230 million',
		totalPopulation: '~275 million',
		marketSizeUsd: '$220B+ (halal products)',
		mandateStatus: 'mandatory',
		mandatorySince: 'October 2024 (F&B)',
		certifyingBodies: [
			{ name: 'BPJPH', slug: 'bpjph' },
			{ name: 'BPJPH / MUI', slug: 'bpjph' }
		],
		importRequirements: [
			'Halal certificate from BPJPH-recognized foreign halal certification body (FHCB)',
			'Certificate must be issued by a body recognized under mutual recognition (MR) with BPJPH',
			'JAKIM-issued certificates accepted under Indonesia–Malaysia MR arrangement',
			'Product registration via SIHALAL digital platform',
			'Labeling in Bahasa Indonesia with halal logo (segel halal)'
		],
		standardBasis: 'HAS 23000 (Indonesia), aligned with OIC/SMIIC standards',
		certificateValidity: '4 years (no changes in raw materials/process)',
		estimatedCostUsd: 'IDR 300,000 processing fee (SME-subsidized); regular scheme varies by product',
		processingTime: '3–6 months',
		keyInsights: [
			'World\'s largest Muslim population — the single biggest halal consumer market',
			'Law 33/2014 (amended 2023) mandates halal certification for F&B; cosmetics and pharma phasing in next',
			'SMEs receive government subsidies — IDR 300,000 flat processing fee',
			'SIHALAL platform digitized the entire application and verification process',
			'AI Halal tool (aihalal.halal.go.id) provides product pre-analysis'
		],
		opportunities: [
			'Mandatory compliance created a certification rush — huge demand for consultants and certifiers',
			'Domestic production cannot meet demand for premium halal imports (dairy, meat, ingredients)',
			'Halal tourism and modest fashion are fast-growing adjacent sectors',
			'E-commerce halal grocery segment growing 20%+ annually'
		],
		challenges: [
			'Registration through SIHALAL can be slow without local representation',
			'BPJPH recognition of foreign certifiers is required — not all bodies qualify',
			'Import licensing (through BPOM/other agencies) runs parallel to halal registration',
			'Decentralized enforcement at port level can cause inconsistent clearance'
		],
		summary: 'The world\'s largest halal market by population and the regulatory anchor of Southeast Asia. Since October 2024, halal certification is mandatory for all food and beverage products — imports included — making Indonesia both the biggest opportunity and the most complex compliance destination.'
	},
	// 2. Malaysia (existing)
	{
		slug: 'malaysia',
		country: 'Malaysia',
		flag: '🇲🇾',
		region: 'Southeast Asia',
		muslimPopulation: '~20 million',
		totalPopulation: '~34 million',
		marketSizeUsd: '$80B+ (halal industry ecosystem)',
		mandateStatus: 'mandatory',
		mandatorySince: 'Long-established (Trade Descriptions Act 2011)',
		certifyingBodies: [
			{ name: 'JAKIM', slug: 'jakim' }
		],
		importRequirements: [
			'JAKIM halal certificate or certificate from JAKIM-recognized foreign certification body (FHCB)',
			'JAKIM maintains the reference list of recognized certifiers worldwide',
			'Halal certification mandatory for meat, poultry imports regardless of origin',
			'Import license (AP) required for meat and poultry products',
			'Malay/English labeling with certifier logo'
		],
		standardBasis: 'MS 1500 (Malaysia), referencing OIC/SMIIC and Codex halal guidelines',
		certificateValidity: '2 years (food premises); 1 year (abattoirs); 3 years (logistics/cosmetics/pharma); 5 years for clean 5+ year holders',
		estimatedCostUsd: '$2,000–5,000+ depending on audit scope and facility',
		processingTime: '3–6 months',
		keyInsights: [
			'JAKIM certification is the global gold standard — accepted in Middle East, ASEAN, most OIC states',
			'Malaysia chairs OIC/SMIIC standardization — strong influence on global halal norms',
			'Double certification pathway: JAKIM for domestic, FHCB recognition for foreign suppliers',
			'Halal Industry Master Plan 2030 targets Malaysia as the global halal hub',
			'MIHAS trade show is world\'s largest halal exhibition (50,000+ visitors)'
		],
		opportunities: [
			'Most efficient gateway market — JAKIM cert opens doors across OIC',
			'Halal park ecosystem (over 20 dedicated halal industrial parks)',
			'Strong demand for certified ingredients, flavors, and food tech',
			'Islamic finance integration — financing options for halal ventures'
		],
		challenges: [
			'JAKIM audit wait times can stretch 6+ months',
			'High competition — mature market with many certified players',
			'Cost of maintaining annual audits for abattoir/food premise categories',
			'Bahasa Malaysia documentation required for certain categories'
		],
		summary: 'The gold-standard halal jurisdiction. A JAKIM certificate is the most widely accepted halal credential in international trade, and Malaysia\'s regulatory maturity makes it the reference market for halal standards worldwide.'
	},
	// 3. United Arab Emirates (existing)
	{
		slug: 'uae',
		country: 'United Arab Emirates',
		flag: '🇦🇪',
		region: 'Middle East',
		muslimPopulation: '~9 million',
		totalPopulation: '~11 million',
		marketSizeUsd: '$120B+ (halal trade hub value)',
		mandateStatus: 'mandatory',
		mandatorySince: '2014 (ESMA halal scheme)',
		certifyingBodies: [
			{ name: 'MOIAT', slug: 'moiat' }
		],
		importRequirements: [
			'UAE halal scheme accreditation (UAE.S 2055-1/2055-2) for meat, poultry, supplements, nutraceuticals',
			'Certificates from ESMA-accredited bodies (JAKIM, MUI, IFANCA accepted under accreditation)',
			'Product must be certified before customs clearance for regulated categories',
			'Arabic labeling required on all food products',
			'Halal National Mark available as an additional trust signal'
		],
		standardBasis: 'UAE.S 2055-1 (halal food requirements), UAE.S 2055-2 (management systems), GCC-wide recognition',
		certificateValidity: '1 year',
		estimatedCostUsd: '$3,000–8,000 including accreditation and audit',
		processingTime: '3–8 weeks',
		keyInsights: [
			'Dubai is the re-export hub — 60%+ of halal imports are re-exported to GCC/Africa/CIS',
			'UAE Halal National Mark goes beyond basic certification — stronger consumer trust signal',
			'ESMA (now MOIAT) accredits certification bodies rather than certifying directly at scale',
			'Gateway to the wider GCC — single accreditation unlocks Saudi, Qatar, Kuwait, Bahrain, Oman trade',
			'Gulfood (world\'s largest F&B expo) drives annual sourcing cycles'
		],
		opportunities: [
			'Re-export model means one UAE entry point serves 2B+ consumers across MENA, Africa, CIS',
			'Free zone logistics infrastructure (Jebel Ali) for halal warehousing',
			'Fast-growing halal tourism, hospitality, and airline catering sectors',
			'Dubai\'s Halal Cluster in DMCC dedicated to halal businesses'
		],
		challenges: [
			'1-year validity means annual renewal cost and audit cycle',
			'Strict import controls at port level — rejections common without correct documentation',
			'Animal-origin ingredients in cosmetics/supplements face extra scrutiny',
			'Arabic labeling and documentation requirements add cost'
		],
		summary: 'The strategic re-export hub of the global halal trade. UAE accreditation unlocks the entire GCC and serves as the distribution gateway to the Middle East, Africa, and CIS markets.'
	},
	// 4. Saudi Arabia (existing)
	{
		slug: 'saudi-arabia',
		country: 'Saudi Arabia',
		flag: '🇸🇦',
		region: 'Middle East',
		muslimPopulation: '~32 million',
		totalPopulation: '~36 million',
		marketSizeUsd: '$95B+ (domestic halal consumption)',
		mandateStatus: 'mandatory',
		mandatorySince: '2018 (SFDA halal regulation)',
		certifyingBodies: [
			{ name: 'SFDA', slug: 'sfda' },
			{ name: 'SABER / SASO', slug: 'saber' }
		],
		importRequirements: [
			'Halal certificate from SFDA-recognized certification body',
			'Product registration in SFDA e-portal before shipment',
			'Valid Certificate of Conformity (CoC) for food imports',
			'Arabic labeling mandatory',
			'Meat/poultry: Islamic slaughter certificate with government countersignature from origin country'
		],
		standardBasis: 'SFDA halal regulations; GCC Standardization Organization (GSO) halal standards',
		certificateValidity: '1 year (product registration)',
		estimatedCostUsd: '$2,800–6,000',
		processingTime: '6–12 weeks',
		keyInsights: [
			'Largest consumer market in the GCC — imports 80%+ of its food',
			'SFDA regulates directly — no self-certification or voluntary pathway for food',
			'Saudi Halal Expo (Riyadh) is MENA\'s largest dedicated halal trade show',
			'Vision 2030 invests in domestic halal production — import substitution accelerating',
			'Islamic slaughter certificates for meat require government-to-government countersignature'
		],
		opportunities: [
			'Massive import dependency creates sustained demand across all food categories',
			'Food security programs actively recruiting foreign suppliers and investors',
			'Halal cosmetics and pharma sectors growing 15%+ annually',
			'Hajj/Umrah pilgrimage food services — 10M+ visitors annually'
		],
		challenges: [
			'SFDA e-portal registration can be slow without local importer support',
			'Violations carry severe penalties including blacklisting',
			'Shipment-level rejections common if documentation mismatches product',
			'Local distributor requirement for market entry in practice'
		],
		summary: 'The largest and most import-dependent halal market in the Gulf. SFDA regulation is strict but well-documented — compliant suppliers find Saudi Arabia among the most rewarding halal destinations.'
	},
	// 5. Turkey (existing)
	{
		slug: 'turkiye',
		country: 'Türkiye',
		flag: '🇹🇷',
		region: 'Europe',
		muslimPopulation: '~75 million',
		totalPopulation: '~85 million',
		marketSizeUsd: '$60B+ (halal food consumption)',
		mandateStatus: 'voluntary',
		mandatorySince: null,
		certifyingBodies: [
			{ name: 'GIMDES', slug: 'gimdes' }
		],
		importRequirements: [
			'Halal certificate from TSE or GIMDES for halal-labeled products (voluntary but commercially expected)',
			'Standard Turkish Food Codex labeling requirements',
			'No blanket halal mandate — but halal claims must be backed by valid certification',
			'Meat imports restricted to approved countries and establishments'
		],
		standardBasis: 'TSE halal standards (OIC/SMIIC 1), aligned with OIC harmonized standards',
		certificateValidity: '1–3 years depending on certifier and category',
		estimatedCostUsd: '$2,000–4,000',
		processingTime: '8–16 weeks',
		keyInsights: [
			'Türkiye holds the OIC/SMIIC secretariat — the country writes the OIC-wide halal rulebook',
			'World Halal Council general assembly and mutual recognition decisions made at Istanbul\'s World Halal Summit',
			'Halal Expo Istanbul draws 50,000+ visitors and 500+ exhibitors each November',
			'Domestic market largely halal by default — certification is about export credibility',
			'Bridge position between European production standards and OIC market access'
		],
		opportunities: [
			'Gateway for European manufacturers targeting OIC markets',
			'Certification accepted across OIC/SMIIC member states',
			'Strong food processing and export infrastructure',
			'Halal tourism sector booming — 4M+ Muslim visitors to Istanbul alone'
		],
		challenges: [
			'Voluntary regime means market fragmentation — some buyers accept TSE, others demand GIMDES or foreign certs',
			'Economic volatility affects pricing and payment reliability',
			'Halal and secular market segments coexist — certification messaging must be targeted',
			'Currency fluctuation complicates long-term contracts'
		],
		summary: 'The standards-setter. Türkiye chairs OIC/SMIIC and hosts the World Halal Summit — its certification decisions shape mutual recognition for the entire OIC market of 1.9 billion consumers.'
	},
	// 6. Pakistan (existing)
	{
		slug: 'pakistan',
		country: 'Pakistan',
		flag: '🇵🇰',
		region: 'South Asia',
		muslimPopulation: '~220 million',
		totalPopulation: '~240 million',
		marketSizeUsd: '$70B+ (halal food market)',
		mandateStatus: 'phasing-in',
		mandatorySince: null,
		certifyingBodies: [
			{ name: 'HGSA', slug: 'hgsa' }
		],
		importRequirements: [
			'Halal certificate required for meat and derived products',
			'PSQCA conformity for food imports',
			'Import authorization via PSW (Pakistan Single Window)',
			'Urdu or English labeling'
		],
		standardBasis: 'PS 3733 (Pakistan halal standard), aligned with OIC/SMIIC',
		certificateValidity: '1 year',
		estimatedCostUsd: '$1,500–3,000',
		processingTime: '8–12 weeks',
		keyInsights: [
			'World\'s second-largest Muslim population — nearly all consumption is halal by default',
			'Emerging formal certification infrastructure — PSQCA halal standard PS 3733 adopted 2018',
			'Major meat exporter (beef to GCC, Vietnam) — export-side certification growth strong',
			'Government targeting halal export growth under Trade Policy Framework',
			'Large informal sector — formal certification penetration still low'
		],
		opportunities: [
			'Export-oriented meat certification is a high-growth service niche',
			'Domestic formalization creating first-mover certification demand',
			'Low production costs make Pakistan a competitive halal sourcing base',
			'CPEC corridor links Chinese ingredient suppliers to Gulf markets'
		],
		challenges: [
			'Regulatory enforcement capacity still developing',
			'Documentation and customs efficiency below regional peers',
			'Only a handful of recognized halal certifiers — bottleneck risk',
			'Buyers often require additional third-party audits beyond local certification'
		],
		summary: 'A high-potential halal production base and the world\'s second-largest Muslim consumer market, where formal halal certification infrastructure is now emerging to match its enormous scale.'
	},
	// 7. United States (existing)
	{
		slug: 'usa',
		country: 'United States',
		flag: '🇺🇸',
		region: 'North America',
		muslimPopulation: '~4.5 million',
		totalPopulation: '~335 million',
		marketSizeUsd: '$20B+ (domestic halal market)',
		mandateStatus: 'voluntary',
		mandatorySince: null,
		certifyingBodies: [
			{ name: 'IFANCA', slug: 'ifanca' }
		],
		importRequirements: [
			'FDA registration and Prior Notice for food imports',
			'FSMA compliance (Food Safety Modernization Act)',
			'Halal certification voluntary — but required by retailers/consumers for halal-claimed products',
			'No government halal regulation — private certifier ecosystem',
			'English labeling with FDA nutrition facts panel'
		],
		standardBasis: 'Private certifier standards (IFANCA most widely recognized); no federal halal standard',
		certificateValidity: '1 year (typical)',
		estimatedCostUsd: '$4,000–10,000 (annual)',
		processingTime: '8–16 weeks',
		keyInsights: [
			'1.4 million Muslim-majority households with above-average purchasing power',
			'Halal market growing 15%+ annually — faster than general food market',
			'No federal halal law — 8+ states have truth-in-halal-labeling statutes',
			'IFANCA is the dominant certifier — recognized by JAKIM, MUI, ESMA and most import authorities',
			'Halal mainstreaming: Costco, Walmart, Kroger now stock halal-certified lines'
		],
		opportunities: [
			'Non-Muslim consumers increasingly buy halal for perceived quality/ethics (halal-adjacent market)',
			'Amazon/retail e-commerce simplifies national distribution',
			'Ethnic food service sector (halal restaurants) expanding beyond metro cores',
			'Export-side: US halal-certified products well-accepted in OIC markets'
		],
		challenges: [
			'No unified standard — certifier choice affects which export markets open',
			'Annual audit costs are relatively high for SMEs',
			'Halal fraud incidents damaged consumer trust — buyers demand reputable certifiers',
			'Fragmented consumer market across metro areas'
		],
		summary: 'The most commercially mature voluntary halal market, where private certifiers govern a fast-growing $20B sector driven by mainstream retail adoption and a high-income Muslim consumer base.'
	},
	// 8. Egypt (new)
	{
		slug: 'egypt',
		country: 'Egypt',
		flag: '🇪🇬',
		region: 'Middle East',
		muslimPopulation: '~86 million',
		totalPopulation: '~110 million',
		marketSizeUsd: '$65B+ (halal food)',
		mandateStatus: 'mandatory',
		mandatorySince: '2016 (State of Control, Safety and Production Standards)',
		certifyingBodies: [
			{ name: 'NoB', slug: 'nob' },
			{ name: 'EQS', slug: 'eqs' }
		],
		importRequirements: [
			'Halal certificate from Egyptian authorized institution',
			'Certificate must be translated into Arabic',
			'Comply with local standards and post-arrival inspection',
			'Production facilities qualify for EQS certification'
		],
		standardBasis: 'Egyptian Code of Standard 119/2002 (Halal Production Standards), aligned with OIC/SMIIC',
		certificateValidity: '1 year',
		estimatedCostUsd: '~$600–1,500 depending on facility size',
		processingTime: '4–8 weeks',
		keyInsights: [
			'Gateway to Africa and the Arab world with huge consumer base',
			'Recent state-mandated certification has increased market formality',
			'Government supports halal exports with reduced fees',
			'Growing domestic demand and re-export hub potential'
		],
		opportunities: [
			'Large youth demographics drive consumption growth',
			'Government incentives for halal manufacturing',
			'Re-export potential to Africa and Arab world',
			'Growing tourism and hospitality sector'
		],
		challenges: [
			'Bureaucratic processes can be time-consuming',
			'Currency controls affecting international payments',
			'Local representation requirement for importers',
			'Frequent regulatory changes'
		],
		summary: 'A critical center with a vast Muslim population and mandatory market recognition. Egypt is increasingly dominant in North Africa/Arab market as a halal hub.'
	},
	// 9. Bangladesh (new)
	{
		slug: 'bangladesh',
		country: 'Bangladesh',
		flag: '🇧🇩',
		region: 'South Asia',
		muslimPopulation: '~160 million',
		totalPopulation: '~170 million',
		marketSizeUsd: '$50B+ (halal food market)',
		mandateStatus: 'phasing-in',
		mandatorySince: 'Started 2020, target complete 2025',
		certifyingBodies: [
			{ name: 'BBS', slug: 'bbs' },
			{ name: 'QAC', slug: 'qac' }
		],
		importRequirements: [
			'Halal certificate for meat products from BBS/QuAC',
			'Import license required for certain products',
			'No foods packaged mix need halal certification',
			'Quality control certificate from BBS'
		],
		standardBasis: 'Bangladesh Standard 2744-2012, aligned with OIC/SMIIC',
		certificateValidity: '1 year',
		estimatedCostUsd: '$800–1,800',
		processingTime: '6–10 weeks',
		keyInsights: [
			'Third-largest Muslim population worldwide',
			'Emerging formalization under national standards',
			'Major ready-made garment exporter – first halal certifications',
			'Government pushing "Halal Bangladesh" branding internationally'
		],
		opportunities: [
			'Domestic market barely formalized – first-mover advantage',
			'Increasing import demand for branded goods',
			'Strategic location between India and Myanmar',
			'Large, young workforce'
		],
		challenges: [
			'Infrastructure limitations delaying progress',
			'low public awareness on importance of halal certs',
			'Multiple agencies overlapping authority',
			'Worries about international standard consistency'
		],
		summary: 'An emerging market with enormous potential; Bangladesh is formalizing its halal certification system, offering first-mover opportunities for international suppliers and certifiers.'
	},
	// 10. Iran (new)
	{
		slug: 'iran',
		country: 'Iran',
		flag: '🇮🇷',
		region: 'Middle East',
		muslimPopulation: '~75 million',
		totalPopulation: '~87 million',
		marketSizeUsd: '$90B+ (halal sector)',
		mandateStatus: 'mandatory',
		mandatorySince: '2002 (State Organization for Standardization)',
		certifyingBodies: [
			{ name: 'IrISHA', slug: 'irisha' }
		],
		importRequirements: [
			'Mandatory halal certification for all animal-derived foods',
			'Certificate from IrISHA',
			'Arabic/English labeling allowed',
			'Hygiene and quality certification also required'
		],
		standardBasis: 'ISO 22716 / Iranian Halal Standard',
		certificateValidity: '2 years',
		estimatedCostUsd: '$2,800–5,000',
		processingTime: '6–14 weeks',
		keyInsights: [
			'Large domestic market with strong halal identity',
			'Regional investment hub with access to Central Asia',
			'"Halal Country" branding strategy',
			'Insulated from Western sanctions – local financing'
		],
		opportunities: [
			'Strong trade ties with OIC nations',
			'Growing tourism and pilgrimage',
			'Underutilized rich agricultural resources',
			'Handmade and cultural food export potential'
		],
		challenges: [
			'Sanctions affect international banking',
			'Complex bureaucracy',
			'Political sensitivity',
			'Documents require notarization'
		],
		summary: 'A strategically located economy with strong Islamic identity in food – a complex market, but with significant growth potential if local partnerships are prioritized.'
	},
	// 11. Nigeria (new)
	{
		slug: 'nigeria',
		country: 'Nigeria',
		flag: '🇳🇬',
		region: 'Africa',
		muslimPopulation: '~90 million',
		totalPopulation: '~218 million',
		marketSizeUsd: '$90B+ (halal sector)',
		mandateStatus: 'voluntary',
		mandatorySince: null,
		certifyingBodies: [
			{ name: 'NIASIS', slug: 'niasis' },
			{ name: 'Halal League Nigeria', slug: 'hln' }
		],
		importRequirements: [
			'NAFDAC registration for food/cosmetics',
			'Halal certification not mandatory but preferred',
			'Certificate required for Muslim-majority regions',
			'Arabic/English labeling typical'
		],
		standardBasis: 'Nigerian Halal Standard (NHAQ) aligned with OIC/SMIIC',
		certificateValidity: '1–3 years',
		estimatedCostUsd: '$3,500–7,000',
		processingTime: '8–12 weeks',
		keyInsights: [
			'Africa\'s largest economy with Muslim-majority north',
			'Growing middle class demand for halal',
			'Diverse halal consumption patterns',
			'Halal industry developing through private sector'
		],
		opportunities: [
			'Massive population offers huge market potential',
			'Domestic production is undersupplied',
			'Halal tourism and finance emerging',
			'Region-specific demand (North vs South)'
		],
		challenges: [
			'Fluctuating currency affects imports',
			'Security concerns in some areas',
			'Bureaucratic overlap',
			'Very large informal sector'
		],
		summary: 'Nigeria is Africa\'s biggest market and key to the halal sector. Halal demand is growing and requires tailored approaches for each region.'
	},
	// 12. Qatar (new)
	{
		slug: 'qatar',
		country: 'Qatar',
		flag: '🇶🇦',
		region: 'Middle East',
		muslimPopulation: '~2.4 million',
		totalPopulation: '~2.8 million',
		marketSizeUsd: '$35B+ (halal market)',
		mandateStatus: 'mandatory',
		mandatorySince: '2000 (formalized)',
		certifyingBodies: [
			{ name: 'Bureau of Domestic and Foreign Goods (BDFC)', slug: 'bdfc' }
		],
		importRequirements: [
			'Mandatory halal certification for all consumable products',
			'Certificates from relevant authorities',
			'Arabic labeling required',
			'Halal certification mandatory for all food imports'
		],
		standardBasis: 'Qatar Standardisation System – Quranic Standards',
		certificateValidity: '1 year renewal',
		estimatedCostUsd: '$2,500–6,000',
		processingTime: '4–10 weeks',
		keyInsights: [
			'Minimal regulatory bureaucracy – fast processing times',
			'Strong purchasing power from energy sector',
			'Regional logistics hub',
			'High per capita halal expenditure'
		],
		opportunities: [
			'High-value niche market',
			'Re-export hub to lesser markets',
			'Tech-driven services potential',
			'Qatar National Vision 2030 emphasis on halal economy'
		],
		challenges: [
			'Cultural/legislative sensitivities',
			'Strict compliance requirements',
			'Limited pool of local exemptions',
			'High operational costs'
		],
		summary: 'A wealthy, fast-moving market with effective halal regulations and high-quality trade opportunities – a compact but high-return addition to GCC.'
	},
	// 13. Morocco (new)
	{
		slug: 'morocco',
		country: 'Morocco',
		flag: '🇲🇦',
		region: 'Africa',
		muslimPopulation: '~36 million',
		totalPopulation: '~37 million',
		marketSizeUsd: '$40B+ (halal market)',
		mandateStatus: 'mandatory',
		mandatorySince: '2010 (Halal Food Regulations)',
		certifyingBodies: [
			{ name: 'Ministry of Agriculture', slug: 'min-agriculture' },
			{ name: 'Moroccan Halal Standard', slug: 'mhs' }
		],
		importRequirements: [
			'Mandatory Halal for meat and animal products',
			'Certificate from local or OIC bodies',
			'Arabic/English labeling',
			'Quarter a year\'s notice for inspections'
		],
		standardBasis: 'On Halal Standard – aligned with OIC',
		certificateValidity: '1 year',
		estimatedCostUsd: '$2,000–3,500',
		processingTime: '4–10 weeks',
		keyInsights: [
			'Strategic location for Europe-Africa trade',
			'Strong agricultural base',
			'Government support for halal exports',
			'Growing tourism and textile sectors'
		],
		opportunities: [
			'Agri-forward and manufacturing potential',
			'Export to Europe and Africa',
			'Growing halal cosmetics and pharma',
			'Attractive for FDI'
		],
		challenges: [
			'Water and energy infrastructure limits',
			'Bureaucratic delays',
			'Variable regulatory enforcement',
			'Local representation needed'
		],
		summary: 'A well-positioned North African market with both EU and African trade links. Morocco offers solid regulatory structure and high-quality halal potential.'
	},
	// 14. Philippines (new)
	{
		slug: 'philippines',
		country: 'Philippines',
		flag: '🇵🇭',
		region: 'Southeast Asia',
		muslimPopulation: '~11 million',
		totalPopulation: '~116 million',
		marketSizeUsd: '$30B+ (halal market)',
		mandateStatus: 'voluntary',
		mandatorySince: null,
		certifyingBodies: [
			{ name: 'HJL', slug: 'hjl' },
			{ name: 'NIASIS', slug: 'niasis-philippines' }
		],
		importRequirements: [
			'Philippine FDA registration',
			'Halal certification mandatory for Muslim-majority provinces',
			'Arabic/English labeling recommended',
			'NIASIS recommended for export-oriented'
		],
		standardBasis: 'Philippine Halal Standard, OIC-aligned',
		certificateValidity: '2 years',
		estimatedCostUsd: '$1,500–3,000',
		processingTime: '4–8 weeks',
		keyInsights: [
			'3rd largest Muslim population in Southeast Asia',
			'Region-specific requirements (Mindanao vs metro Manila)',
			'Halal integration in mainstream demand',
			'Government support for Muslim communities'
		],
		opportunities: [
			'Huge mass market with growing purchasing power',
			'Halal manufacturing sheds for exports',
			'Growing tourism sector',
			'Strategic ASEAN location'
		],
		challenges: [
			'Security concerns in Mindanao',
			'Territorial jurisdiction variations',
			'Lack of uniform national standard',
			'Need for local Filipino partners'
		],
		summary: 'A strategically important Southeast Asian market where halal is increasingly mainstream. Ideal for companies looking to serve both local and export regions.'
	},
	// 15. Ethiopia (new)
	{
		slug: 'ethiopia',
		country: 'Ethiopia',
		flag: '🇪🇹',
		region: 'Africa',
		muslimPopulation: '~13 million',
		totalPopulation: '~120 million',
		marketSizeUsd: '$40B+ (halal food)',
		mandateStatus: 'voluntary',
		mandatorySince: null,
		certifyingBodies: [
			{ name: 'Reformer of Ethiopia', slug: 'reform' }
		],
		importRequirements: [
			'Import licensing for food and animal products',
			'Halal standards widely accepted',
			'Marketing of halal products in open markets',
			'No specific halal certification requirement'
		],
		standardBasis: 'Ethiopian Halal Standards – OIC alignment',
		certificateValidity: 'N/A',
		estimatedCostUsd: 'N/A',
		processingTime: '3–6 weeks',
		keyInsights: [
			'Fast-growing African economy',
			'Large Muslim population in north and east',
			'Regional import export hub',
			'Growing halal demand in urban centers'
		],
		opportunities: [
			'Untapped market with high population growth',
			'Growing middle class',
			'Agri-processing potential',
			'Regional trade access via COMESA'
		],
		challenges: [
			'Color conflict affects business stability',
			'Limited infrastructure',
			'Financial access',
			'Political sensitivities'
		],
		summary: 'An emerging African market with rapid growth potential and significant Muslim consumer base. Ideal for early entry and partnership building.'
	},
	// 16. India (new)
	{
		slug: 'india',
		country: 'India',
		flag: '🇮🇳',
		region: 'South Asia',
		muslimPopulation: '~200 million',
		totalPopulation: '~1.4 billion',
		marketSizeUsd: '$110B+ (halal food + beauty + pharma)',
		mandateStatus: 'phasing-in',
		mandatorySince: 'India\'s halal market is largely industry-led; several states are moving to formalize.',
		certifyingBodies: [
			{ name: 'Halal India', slug: 'halal-india' },
			{ name: 'ABHI', slug: 'abhi' },
			{ name: 'Trusted Halal India', slug: 'thi' }
		],
		importRequirements: [
			'Import licensing for food, cosmetics, pharma',
			'Abis regulatory body only, not broadly recognized yet',
			'State-level certification varies',
			'Vet testing for halal meat'
		],
		standardBasis: 'No national standard yet; industry-led but moving toward standardization',
		certificateValidity: '2 years typical',
		estimatedCostUsd: '$2,000–4,500',
		processingTime: '6–10 weeks',
		keyInsights: [
			'World\'s 5th largest Muslim population',
			'Halal is culturally understood but lack standardized framework',
			'Growing diaspora and artisanal halal sector',
			'Export potential is high for international brands'
		],
		opportunities: [
			'Private halal certification gaining acceptance',
			'Major export opportunities to GCC/Africa',
			'Growing urban demand for traceable halal',
			'Tech-driven supply chain transparency'
		],
		challenges: [
			'Regulatory uncertainty',
			'Fragmented certification network',
			'Cosmetic and pharma regulations competitive',
			'State-level differences create complexity'
		],
		summary: 'India\'s halal sector is among the largest globally but operates informally; formalization is accelerating, creating exciting opportunities for international alignment.'
	}
];

export function getMarketGuide(slug: string): MarketGuide | undefined {
	return marketGuides.find((g) => g.slug === slug);
}

export function getGuidesByRegion(region: string): MarketGuide[] {
	return marketGuides.filter((g) => g.region === region);
}
