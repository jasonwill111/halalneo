// Mutual-recognition footprint per certifying body.
// Statuses are indicative (recognised = home/accepting market, mutual =
// bilateral or OIC-framework arrangement, pending = commercial acceptance
// without a formal pact) — buyers should confirm with the issuing body.
export type RecognitionStatus = 'recognised' | 'mutual' | 'pending';

export interface RecognitionEntry {
	country: string;
	status: RecognitionStatus;
}

export const RECOGNITION_DATA: Record<string, RecognitionEntry[]> = {
	jakim: [
		{ country: 'Malaysia', status: 'recognised' },
		{ country: 'Indonesia', status: 'recognised' },
		{ country: 'Singapore', status: 'recognised' },
		{ country: 'Brunei', status: 'recognised' },
		{ country: 'Thailand', status: 'recognised' },
		{ country: 'Philippines', status: 'recognised' },
		{ country: 'Japan', status: 'recognised' },
		{ country: 'South Korea', status: 'recognised' },
		{ country: 'China', status: 'mutual' },
		{ country: 'Australia', status: 'recognised' },
		{ country: 'New Zealand', status: 'recognised' },
		{ country: 'India', status: 'mutual' },
		{ country: 'Pakistan', status: 'recognised' },
		{ country: 'Turkey', status: 'mutual' },
		{ country: 'UAE', status: 'recognised' },
		{ country: 'Saudi Arabia', status: 'recognised' },
		{ country: 'Qatar', status: 'recognised' },
		{ country: 'Kuwait', status: 'recognised' }
	],
	bpjph: [
		{ country: 'Indonesia', status: 'recognised' },
		{ country: 'Malaysia', status: 'mutual' },
		{ country: 'Singapore', status: 'mutual' },
		{ country: 'Brunei', status: 'mutual' },
		{ country: 'Saudi Arabia', status: 'recognised' },
		{ country: 'UAE', status: 'recognised' },
		{ country: 'Turkey', status: 'pending' },
		{ country: 'Japan', status: 'pending' }
	],
	muis: [
		{ country: 'Singapore', status: 'recognised' },
		{ country: 'Malaysia', status: 'mutual' },
		{ country: 'Indonesia', status: 'mutual' },
		{ country: 'Brunei', status: 'mutual' },
		{ country: 'Thailand', status: 'recognised' },
		{ country: 'Japan', status: 'recognised' },
		{ country: 'South Korea', status: 'recognised' },
		{ country: 'Australia', status: 'recognised' },
		{ country: 'New Zealand', status: 'recognised' },
		{ country: 'India', status: 'pending' },
		{ country: 'Pakistan', status: 'pending' },
		{ country: 'UAE', status: 'mutual' },
		{ country: 'Saudi Arabia', status: 'mutual' }
	],
	sfda: [
		{ country: 'Saudi Arabia', status: 'recognised' },
		{ country: 'UAE', status: 'mutual' },
		{ country: 'Bahrain', status: 'mutual' },
		{ country: 'Kuwait', status: 'mutual' },
		{ country: 'Oman', status: 'mutual' },
		{ country: 'Qatar', status: 'mutual' },
		{ country: 'Malaysia', status: 'mutual' },
		{ country: 'Indonesia', status: 'pending' }
	],
	moiat: [
		{ country: 'UAE', status: 'recognised' },
		{ country: 'Saudi Arabia', status: 'mutual' },
		{ country: 'Bahrain', status: 'mutual' },
		{ country: 'Kuwait', status: 'mutual' },
		{ country: 'Oman', status: 'mutual' },
		{ country: 'Qatar', status: 'mutual' },
		{ country: 'Malaysia', status: 'pending' },
		{ country: 'Indonesia', status: 'pending' }
	],
	ifanca: [
		{ country: 'United States', status: 'recognised' },
		{ country: 'Malaysia', status: 'mutual' },
		{ country: 'Indonesia', status: 'mutual' },
		{ country: 'Singapore', status: 'mutual' },
		{ country: 'UAE', status: 'mutual' },
		{ country: 'Saudi Arabia', status: 'pending' },
		{ country: 'Turkey', status: 'pending' }
	],
	gimdes: [
		{ country: 'Turkey', status: 'recognised' },
		{ country: 'Malaysia', status: 'mutual' },
		{ country: 'Indonesia', status: 'mutual' },
		{ country: 'UAE', status: 'pending' },
		{ country: 'Saudi Arabia', status: 'pending' },
		{ country: 'Pakistan', status: 'pending' }
	],
	sanha: [
		{ country: 'South Africa', status: 'recognised' },
		{ country: 'Malaysia', status: 'mutual' },
		{ country: 'Indonesia', status: 'mutual' },
		{ country: 'UAE', status: 'mutual' },
		{ country: 'Saudi Arabia', status: 'pending' },
		{ country: 'Nigeria', status: 'pending' }
	],
	saber: [
		{ country: 'Saudi Arabia', status: 'recognised' },
		{ country: 'UAE', status: 'mutual' },
		{ country: 'Bahrain', status: 'mutual' },
		{ country: 'Kuwait', status: 'mutual' },
		{ country: 'Oman', status: 'mutual' },
		{ country: 'Qatar', status: 'mutual' },
		{ country: 'Malaysia', status: 'pending' },
		{ country: 'Indonesia', status: 'pending' }
	],
	cicot: [
		{ country: 'Thailand', status: 'recognised' },
		{ country: 'Malaysia', status: 'mutual' },
		{ country: 'Indonesia', status: 'mutual' },
		{ country: 'Singapore', status: 'mutual' },
		{ country: 'Brunei', status: 'mutual' },
		{ country: 'UAE', status: 'pending' },
		{ country: 'Saudi Arabia', status: 'pending' },
		{ country: 'Japan', status: 'pending' }
	],
	pha: [
		{ country: 'Pakistan', status: 'recognised' },
		{ country: 'Saudi Arabia', status: 'pending' },
		{ country: 'UAE', status: 'pending' },
		{ country: 'Malaysia', status: 'pending' },
		{ country: 'Indonesia', status: 'pending' },
		{ country: 'Vietnam', status: 'pending' }
	],
	hfa: [
		{ country: 'United Kingdom', status: 'recognised' },
		{ country: 'Malaysia', status: 'mutual' },
		{ country: 'Indonesia', status: 'mutual' },
		{ country: 'UAE', status: 'pending' },
		{ country: 'Saudi Arabia', status: 'pending' },
		{ country: 'Singapore', status: 'pending' }
	],
	hak: [
		{ country: 'Turkey', status: 'recognised' },
		{ country: 'Malaysia', status: 'mutual' },
		{ country: 'Indonesia', status: 'mutual' },
		{ country: 'Saudi Arabia', status: 'mutual' },
		{ country: 'UAE', status: 'mutual' },
		{ country: 'Pakistan', status: 'mutual' }
	],
	nhasa: [
		{ country: 'Australia', status: 'recognised' },
		{ country: 'Malaysia', status: 'mutual' },
		{ country: 'Indonesia', status: 'mutual' },
		{ country: 'Singapore', status: 'mutual' },
		{ country: 'UAE', status: 'pending' },
		{ country: 'Saudi Arabia', status: 'pending' }
	],
	'is-eg-halal': [
		{ country: 'Egypt', status: 'recognised' },
		{ country: 'Saudi Arabia', status: 'pending' },
		{ country: 'UAE', status: 'pending' },
		{ country: 'Malaysia', status: 'pending' },
		{ country: 'Indonesia', status: 'pending' }
	]
};

export function recognitionStatusClasses(status: RecognitionStatus): string {
	switch (status) {
		case 'recognised':
			return 'border-success/30 bg-success/15 text-success';
		case 'mutual':
			return 'border-warn/30 bg-warn/15 text-warn';
		case 'pending':
			return 'border-info/30 bg-info/15 text-info';
	}
}

export function recognitionStatusLabel(status: RecognitionStatus): string {
	switch (status) {
		case 'recognised':
			return 'Recognised';
		case 'mutual':
			return 'Mutual Recognition';
		case 'pending':
			return 'Pending';
	}
}
