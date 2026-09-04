export interface MarketGuide {
	slug: string;
	country: string;
	flag: string;
	region: 'Southeast Asia' | 'Middle East' | 'South Asia' | 'Europe' | 'East Asia' | 'North America';
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
			{ name: 'GIMDES', slug: 'gimdes' },
			
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
			
			{ name: 'PHA', slug: 'pha' }
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
			{ name: 'IFANCA', slug: 'ifanca' },
			
			
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
	}
];

export function getMarketGuide(slug: string): MarketGuide | undefined {
	return marketGuides.find((g) => g.slug === slug);
}

export function getGuidesByRegion(region: string): MarketGuide[] {
	return marketGuides.filter((g) => g.region === region);
}

export const mandateStatuses: Record<string, { label: string; class: string }> = {
	mandatory: {
		label: 'Mandatory',
		class: 'bg-red-500/15 text-red-600 dark:text-red-400'
	},
	'phasing-in': {
		label: 'Phasing In',
		class: 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
	},
	voluntary: {
		label: 'Voluntary',
		class: 'bg-green-500/15 text-green-600 dark:text-green-400'
	}
};
