export function getRegion(country: string): string {
	const map: Record<string, string> = {
		Malaysia: 'Southeast Asia',
		Indonesia: 'Southeast Asia',
		Thailand: 'Southeast Asia',
		Singapore: 'Southeast Asia',
		Philippines: 'Southeast Asia',
		Vietnam: 'Southeast Asia',
		'Saudi Arabia': 'Middle East',
		UAE: 'Middle East',
		'United Arab Emirates': 'Middle East',
		Qatar: 'Middle East',
		Kuwait: 'Middle East',
		Turkey: 'Middle East',
		Türkiye: 'Middle East',
		Pakistan: 'South Asia',
		Bangladesh: 'South Asia',
		India: 'South Asia',
		'Sri Lanka': 'South Asia',
		Japan: 'East Asia',
		China: 'East Asia',
		'South Korea': 'East Asia',
		'United Kingdom': 'Europe',
		Germany: 'Europe',
		France: 'Europe',
		Netherlands: 'Europe',
		'United States': 'Americas',
		USA: 'Americas',
		Canada: 'Americas',
		Brazil: 'Americas',
		'South Africa': 'Africa',
		Nigeria: 'Africa',
		Egypt: 'Africa',
		Kenya: 'Africa',
		Australia: 'Oceania',
		'New Zealand': 'Oceania'
	};
	return map[country] ?? 'Other';
}

export function regionBadgeClass(region: string): string {
	const map: Record<string, string> = {
		'Southeast Asia': 'bg-info/10 text-info border-info/20',
		'Middle East': 'bg-warn/10 text-warn border-warn/20',
		'South Asia': 'bg-accent-purple/10 text-accent-purple border-accent-purple/20',
		'East Asia': 'bg-accent-rose/10 text-accent-rose border-accent-rose/20',
		Europe: 'bg-primary/10 text-primary border-primary/20',
		Americas: 'bg-success/10 text-success border-success/20',
		Africa: 'bg-warn/10 text-warn border-warn/20',
		Oceania: 'bg-info/10 text-info border-info/20',
		Other: 'bg-muted text-muted-foreground border-border'
	};
	return map[region] ?? 'bg-muted text-muted-foreground border-border';
}
