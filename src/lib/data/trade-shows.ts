export interface TradeShow {
	id: string;
	name: string;
	city: string;
	country: string;
	region: 'Asia' | 'Europe' | 'Middle East' | 'North America' | 'Africa' | 'Oceania';
	startDate: string;
	endDate: string;
	venue: string;
	website: string;
	scale: 'mega' | 'large' | 'medium' | 'regional';
	description: string;
	focus: string[];
	exhibitors?: string;
	visitors?: string;
}

export const tradeShows: TradeShow[] = [
	{
		id: 'mihas-2026',
		name: 'MIHAS 2026 — Malaysia International Halal Showcase',
		city: 'Kuala Lumpur',
		country: 'Malaysia',
		region: 'Asia',
		startDate: '2026-09-23',
		endDate: '2026-09-26',
		venue: 'Malaysia International Trade and Exhibition Centre (MITEC)',
		website: 'https://mihas.my',
		scale: 'mega',
		description: 'World\'s largest halal trade fair. Hosted by Malaysia\'s MITI and organised by MATRADE with JAKIM and HDC. Covers 14 halal industry clusters including food, pharma, Islamic finance, modest fashion, technology, and logistics.',
		focus: ['Food & Beverage', 'Pharmaceuticals', 'Islamic Finance', 'Modest Fashion', 'Technology', 'Logistics'],
		exhibitors: '1,200+',
		visitors: '50,000+'
	},
	{
		id: 'gulfood-2027',
		name: 'Gulfood 2027 — 32nd Edition',
		city: 'Dubai',
		country: 'UAE',
		region: 'Middle East',
		startDate: '2027-02-22',
		endDate: '2027-02-26',
		venue: 'Dubai World Trade Centre',
		website: 'https://gulfood.com',
		scale: 'mega',
		description: 'World\'s largest food and beverage exhibition. Major halal sourcing hub connecting buyers from Middle East, Africa, and South Asia with global suppliers.',
		focus: ['Food & Beverage', 'Halal Products', 'Dairy', 'Meat', 'Confectionery'],
		exhibitors: '5,000+',
		visitors: '100,000+'
	},
	{
		id: 'halal-expo-istanbul-2026',
		name: '11th OIC Halal Expo 2026 & World Halal Summit',
		city: 'Istanbul',
		country: 'Türkiye',
		region: 'Europe',
		startDate: '2026-11-25',
		endDate: '2026-11-28',
		venue: 'Istanbul Expo Center (İFM)',
		website: 'https://ifm.com.tr',
		scale: 'mega',
		description: 'Most politically significant halal industry event. Co-located with World Halal Summit and World Halal Council general assembly. Türkiye holds OIC/SMIIC secretariat. Covers mutual recognition agreements between certification bodies globally.',
		focus: ['Certification', 'Standards', 'OIC Trade', 'Food', 'Cosmetics', 'Pharmaceuticals'],
		exhibitors: '500+',
		visitors: '50,000+'
	},
	{
		id: 'saudi-halal-expo-2026',
		name: 'Saudi International Halal Expo & Summit 2026',
		city: 'Riyadh',
		country: 'Saudi Arabia',
		region: 'Middle East',
		startDate: '2026-10-04',
		endDate: '2026-10-06',
		venue: 'Riyadh International Convention & Exhibition Center (RICEC)',
		website: 'https://saudihalalexp.com',
		scale: 'large',
		description: 'MENA region\'s largest dedicated halal industry exhibition. Covers food, pharmaceuticals, cosmetics, modest fashion, tourism, and Islamic finance.',
		focus: ['Food', 'Pharmaceuticals', 'Cosmetics', 'Modest Fashion', 'Islamic Finance']
	},
	{
		id: 'halal-expo-canada-2026',
		name: 'Halal Expo Canada 2026',
		city: 'Toronto',
		country: 'Canada',
		region: 'North America',
		startDate: '2026-06-15',
		endDate: '2026-06-17',
		venue: 'Metro Toronto Convention Centre',
		website: 'https://halalexpo.ca',
		scale: 'large',
		description: 'North America\'s core halal B2B platform. Attracts exhibitors from Malaysia, Turkey, UAE, Pakistan alongside North American producers targeting 1.4 million Muslim-majority households.',
		focus: ['Food & Beverage', 'B2B Matching', 'North American Market']
	},
	{
		id: 'jakarta-halal-expo-2026',
		name: 'Jakarta Halal Expo & Conference 2026',
		city: 'Tangerang',
		country: 'Indonesia',
		region: 'Asia',
		startDate: '2026-08-28',
		endDate: '2026-08-30',
		venue: 'Indonesia Convention Exhibition (ICE BSD City)',
		website: 'https://jakartahalalexp.com',
		scale: 'large',
		description: 'Indonesia\'s flagship halal trade event. World\'s largest Muslim population market. Covers fashion, halal products, tourism, lifestyle, and Islamic finance.',
		focus: ['Fashion', 'Halal Products', 'Tourism', 'Lifestyle', 'Islamic Finance']
	},
	{
		id: 'mihas-dubai-2026',
		name: 'MIHAS @ Dubai 2026',
		city: 'Dubai',
		country: 'UAE',
		region: 'Middle East',
		startDate: '2026-11-16',
		endDate: '2026-11-18',
		venue: 'Dubai World Trade Centre',
		website: 'https://mihasdubai.com',
		scale: 'large',
		description: 'International edition of MIHAS. Showcases 200+ Malaysian halal suppliers to GCC and Middle Eastern buyers.',
		focus: ['Malaysian Products', 'GCC Market', 'B2B Matching']
	},
	{
		id: 'qatar-halal-expo-2026',
		name: 'Qatar Halal Expo & Conference 2026',
		city: 'Doha',
		country: 'Qatar',
		region: 'Middle East',
		startDate: '2026-09-07',
		endDate: '2026-09-09',
		venue: 'Doha Exhibition and Convention Center (DECC)',
		website: 'https://qatarhalalexp.com',
		scale: 'medium',
		description: 'Qatar\'s dedicated halal trade platform. Growing market driven by FIFA 2022 legacy infrastructure and Vision 2030.',
		focus: ['Food', 'Hospitality', 'Islamic Finance']
	},
	{
		id: 'halal-japan-expo-2026',
		name: 'Halal Japan Expo 2026',
		city: 'Tokyo',
		country: 'Japan',
		region: 'Asia',
		startDate: '2026-04-15',
		endDate: '2026-04-17',
		venue: 'Tokyo Big Sight',
		website: 'https://halaljapan.jp',
		scale: 'medium',
		description: 'Japan\'s halal trade event connecting halal exporters with Japanese importers and retailers. Growing demand for halal products in Japan\'s tourism and retail sectors.',
		focus: ['Food', 'Tourism', 'Japanese Market']
	},
	{
		id: 'halal-expo-nigeria-2026',
		name: 'Halal Expo Nigeria 2026',
		city: 'Lagos',
		country: 'Nigeria',
		region: 'Africa',
		startDate: '2026-02-18',
		endDate: '2026-02-20',
		venue: 'Eko Hotel & Suites',
		website: 'https://halalexponigeria.com',
		scale: 'regional',
		description: 'West Africa\'s halal trade platform. Nigeria has Africa\'s largest Muslim population and growing halal demand.',
		focus: ['Food', 'Agriculture', 'West African Market']
	},
	{
		id: 'world-halal-summit-2026',
		name: 'World Halal Summit 2026',
		city: 'Istanbul',
		country: 'Türkiye',
		region: 'Europe',
		startDate: '2026-11-25',
		endDate: '2026-11-27',
		venue: 'Istanbul Expo Center',
		website: 'https://worldhalalsummit.org',
		scale: 'large',
		description: 'Global summit on halal standards, certification, and policy. World Halal Council general assembly determines mutual recognition agreements between certification bodies.',
		focus: ['Certification', 'Standards', 'Policy', 'Mutual Recognition']
	},
	{
		id: 'global-halal-summit-2026',
		name: 'Global Halal Summit (GHaS) 2026',
		city: 'Kuala Lumpur',
		country: 'Malaysia',
		region: 'Asia',
		startDate: '2026-09-21',
		endDate: '2026-09-22',
		venue: 'MITEC',
		website: 'https://ghas.my',
		scale: 'large',
		description: 'Co-located with MIHAS. Global summit on halal industry trends, standards, and market access.',
		focus: ['Industry Trends', 'Standards', 'Market Access']
	},
	{
		id: 'anuga-halal-2027',
		name: 'Anuga — Anuga Halal Market 2027',
		city: 'Cologne',
		country: 'Germany',
		region: 'Europe',
		startDate: '2027-10-09',
		endDate: '2027-10-13',
		venue: 'Koelnmesse',
		website: 'https://anuga.com',
		scale: 'mega',
		description: 'World\'s largest food and beverage trade fair with dedicated Halal Market section. 7,000+ exhibitors from 200+ countries.',
		focus: ['Food & Beverage', 'European Market', 'Global Sourcing'],
		exhibitors: '7,000+',
		visitors: '150,000+'
	},
	{
		id: 'philippines-halal-expo-2026',
		name: 'Philippines Halal Expo 2026',
		city: 'Manila',
		country: 'Philippines',
		region: 'Asia',
		startDate: '2026-11-20',
		endDate: '2026-11-22',
		venue: 'World Trade Center Manila',
		website: 'https://philippinehalalexp.com',
		scale: 'regional',
		description: 'Philippines\' halal trade platform. Growing Southeast Asian halal market with strong Muslim-majority southern regions.',
		focus: ['Food', 'Halal Certification', 'ASEAN Market']
	},
	{
		id: 'vietnam-halal-expo-2026',
		name: 'Vietnam Halal Expo 2026',
		city: 'Ho Chi Minh City',
		country: 'Vietnam',
		region: 'Asia',
		startDate: '2026-11-18',
		endDate: '2026-11-20',
		venue: 'Saigon Exhibition & Convention Center (SECC)',
		website: 'https://vietnamhalalexp.com',
		scale: 'regional',
		description: 'Vietnam\'s halal trade event. Emerging halal manufacturing hub targeting ASEAN and OIC markets.',
		focus: ['Manufacturing', 'ASEAN Market', 'Export']
	},
	{
		id: 'france-halal-expo-2026',
		name: 'France Halal Expo 2026',
		city: 'Paris',
		country: 'France',
		region: 'Europe',
		startDate: '2026-11-24',
		endDate: '2026-11-26',
		venue: 'Paris-Nord Villepinte',
		website: 'https://francehalalexp.com',
		scale: 'medium',
		description: 'Europe\'s largest halal consumer market event. France has 5+ million Muslim consumers.',
		focus: ['Consumer Products', 'European Market', 'Food & Beverage']
	},
	{
		id: 'india-halal-expo-2026',
		name: 'India International Halal Expo 2026',
		city: 'New Delhi',
		country: 'India',
		region: 'Asia',
		startDate: '2026-02-20',
		endDate: '2026-02-22',
		venue: 'Pragati Maidan',
		website: 'https://indiahalalexp.com',
		scale: 'large',
		description: 'India\'s halal trade platform. World\'s third-largest Muslim population market with growing halal industry.',
		focus: ['Food', 'Cosmetics', 'Pharmaceuticals', 'Indian Market']
	},
	{
		id: 'halfest-malaysia-2026',
		name: 'HALFEST — Halal Fiesta Malaysia 2026',
		city: 'Kuala Lumpur',
		country: 'Malaysia',
		region: 'Asia',
		startDate: '2026-08-14',
		endDate: '2026-08-16',
		venue: 'MITEC',
		website: 'https://halfest.my',
		scale: 'medium',
		description: 'Malaysia\'s consumer halal festival. B2C focused with food tasting, product launches, and consumer engagement.',
		focus: ['Consumer Products', 'Food', 'Lifestyle']
	},
	{
		id: 'adife-abu-dhabi-2026',
		name: 'Abu Dhabi International Food Exhibition (ADIFE) 2026',
		city: 'Abu Dhabi',
		country: 'UAE',
		region: 'Middle East',
		startDate: '2026-12-09',
		endDate: '2026-12-11',
		venue: 'Abu Dhabi National Exhibition Centre',
		website: 'https://adife.ae',
		scale: 'large',
		description: 'Abu Dhabi\'s international food exhibition. Major sourcing event for Middle Eastern and North African food markets.',
		focus: ['Food & Beverage', 'Middle East Market', 'Halal Sourcing']
	},
	{
		id: 'halal-expo-germany-2026',
		name: 'Halal Expo Germany 2026',
		city: 'Frankfurt',
		country: 'Germany',
		region: 'Europe',
		startDate: '2026-11-12',
		endDate: '2026-11-14',
		venue: 'Messe Frankfurt',
		website: 'https://halalexpo-deutschland.de',
		scale: 'medium',
		description: 'Central Europe\'s halal trade platform. Growing audience of Central European buyers with no prior dedicated halal event.',
		focus: ['European Market', 'Food', 'B2B Matching']
	}
];

export function getUpcomingShows(): TradeShow[] {
	const now = new Date();
	return tradeShows
		.filter((s) => new Date(s.endDate) >= now)
		.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
}

export function getShowsByRegion(region: string): TradeShow[] {
	return tradeShows.filter((s) => s.region === region);
}

export function getShowById(id: string): TradeShow | undefined {
	return tradeShows.find((s) => s.id === id);
}
