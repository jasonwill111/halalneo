<script lang="ts">
 	import { localizeHref } from '#lib/paraglide/runtime.js';
 	import { Card, CardContent, CardTitle } from '#lib/components/ui/card/index.js';
 	import { Badge } from '#lib/components/ui/badge/index.js';
 	import Breadcrumb from '#lib/components/site/breadcrumb.svelte';
 	import FilterPills from '#lib/components/site/filter-pills.svelte';
 	import GuideHero from '#lib/components/site/guide-hero.svelte';
 	import Paginator from '#lib/components/site/paginator.svelte';
 	import { Empty, EmptyMedia, EmptyTitle, EmptyDescription } from '#lib/components/ui/empty/index.js';
 	import { MANDATE_STATUSES, type MandateStatus } from '#lib/utils/mandate.js';
 	import { COUNTRY_IMAGES } from '#lib/data/country-images.js';
 	import { cn } from '#lib/utils.js';
 	import GlobeIcon from '@lucide/svelte/icons/globe';
 	import UsersIcon from '@lucide/svelte/icons/users';
 	import BanknoteIcon from '@lucide/svelte/icons/banknote';
 	import ScaleIcon from '@lucide/svelte/icons/scale';
 	import SeoMeta from '#lib/components/seo-meta.svelte';

 	let { data, itemList } = $props();

 	let selectedRegion = $state('all');

 	const countryImages = COUNTRY_IMAGES;

 	// Regions derived from data — sorted unique region values with counts, 'all' first
 	const regionOptions = $derived([
 		{ value: 'all', label: 'All Regions', count: data.guides.length },
 		...Array.from(
 			new Set(data.guides.map((g: any) => g.region).filter((r): r is string => !!r))
 		)
 			.sort()
 			.map((region) => ({
 				value: region,
 				label: region,
 				count: data.guides.filter((g: any) => g.region === region).length
 			}))
 	]);

 	const filteredGuides = $derived(
 		selectedRegion === 'all'
 			? data.guides
 			: data.guides.filter((g: any) => g.region === selectedRegion)
 	);

 	const PAGE_SIZE = 9;
 	let page = $state(1);
 	const totalPages = $derived(Math.max(1, Math.ceil(filteredGuides.length / PAGE_SIZE)));
 	const paged = $derived(filteredGuides.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE));
 	$effect(() => {
 		void selectedRegion;
 		page = 1;
 	});

 	function statusBadge(s: MandateStatus) {
 		switch (s) {
 			case 'mandatory':
 				return { text: 'Mandatory', cls: 'bg-success/10 text-success border-success/20' };
 			case 'recommended':
 				return { text: 'Recommended', cls: 'bg-warn/10 text-warn border-warn/20' };
 			default:
 				return { text: 'Optional', cls: 'bg-muted text-muted-foreground border-border' };
 		}
 	}

 	function metadata(s: MandateStatus) {
 		const req = MANDATE_STATUSES.find((r) => r.value === s);
 		if (!req) return 'Unknown requirement';
 		if (req.category === 'voluntary') return 'Voluntary but recommended';
 		if (req.category === 'legal') return 'Legally required';
 		return req.description;
 	}

 	const guideStats = $derived({
 			totalGuides: data.guides.length,
 			regions: regionOptions.length - 1, // exclude all
 			countries: quantityOfCountries(),
 			categories: quantityOfCategories()
 		});

 		function quantityOfCountries(): number {
 			return new Set(data.guides.map((g: any) => g.country)).size;
 		}

 		function quantityOfCategories(): number {
 			return new Set(data.guides.map((g: any) => g.category)).size;
 		}

 		const seoFriendlyDescription = $derived(
 			`Comprehensive halal market entry guides for ${guideStats.regions} regions covering ${guideStats.regions.toLocaleLowerCase()} countries. Regulatory frameworks, import requirements, certification standards, and business insights for entering Asian, European, American, Middle Eastern, and African halal markets. Updated 2026.`
 		);

 		const StatCard = (title: string, value: number | string, description: string) => ({ title, value, description });
 		const stats = $derived([
 			StatCard('Country Guides', guideStats.countries.toLocaleLowerCase(), 'Halal market entry guides'),
 			StatCard('Regions Covered', guideStats.regions.toLocaleLowerCase(), 'Global halal markets'),
 			StatCard('Regulatory Types', guideStats.categories.toLocaleLowerCase(), 'Standards & frameworks'),
 			StatCard('Total Guides', guideStats.totalGuides.toLocaleLowerCase(), 'Comprehensive coverage')
 		]);
</script>

<!-- SEO Meta Tags -->
<SeoMeta 
 	title="Halal Market Entry Guides - Global Regulatory Frameworks & Import Requirements"
 	description="Comprehensive halal market entry guides for 20+ countries. Regulatory frameworks, import requirements, certification standards, and business insights for global halal trade."
 	ogTitle="HalalNeo - Global Halal Market Entry Intelligence"
 	ogDescription="Enter halal markets with confidence. Detailed guides for ASEAN, GCC, EU, US, and more. Regulatory requirements, certification, and business insights updated 2026."
 	keywords="halal market entry, halal import requirements, halal regulations, halal certification countries, halal market guide, halal trade barriers, halal business entry, halal market research, halal regulatory framework, halal market analysis"
 	canonical="/market-guides"
/>

<Breadcrumb items={[{ label: 'Market Guides', href: '/market-guides' }]} />

<svelte:head>
	<!-- Structured Data: Breadcrumb -->
	{@html `<script type="application/ld+json">${JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: [
			{ '@type': 'ListItem', position: 1, name: 'Home', item: 'https://halalneo.com/' },
			{ '@type': 'ListItem', position: 2, name: 'Market Guides', item: 'https://halalneo.com/market-guides' }
		]
	})}</script>`}
	
	<!-- Structured Data: FAQ Schema -->
	{@html `<script type="application/ld+json">${JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: [
			{
				'@type': 'Question',
				name: 'What halal market entry guides are available?',
				acceptedAnswer: {
					'@type': 'Answer',
					text: 'We provide comprehensive guides for 20+ countries covering regulatory requirements, import procedures, certification standards, and business practices for halal market entry.'
				}
			},
			{
				'@type': 'Question',
				name: 'How often are the market guides updated?',
				acceptedAnswer: {
					'@type': 'Answer',
					text: 'All guides are reviewed quarterly and updated with the latest regulatory changes, market trends, and business insights. Current version: 2026.'
				}
			}
		]
	})}</script>`}
</svelte:head>

<section class="space-y-4 sm:space-y-6 py-8">
	<div class="max-w-3xl space-y-2 text-center sm:text-left">
		<h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">Market entry intelligence</h1>
		<p class="text-muted-foreground">
			{guideStats.countries} country-level guides for navigating halal regulatory frameworks, import requirements, and market opportunities.
		</p>
	</div>

	<!-- Stats Cards -->
	<div class="grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-4">
		{#each stats as stat, i}
			<Card class="p-3 sm:p-4">
				<div class="space-y-1">
					<div class="text-2xl font-bold">{stat.value}</div>
					<div class="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
						{stat.title}
					</div>
					<p class="line-clamp-2 text-xs text-muted-foreground">
						{stat.description}
					</p>
				</div>
			</Card>
		{/each}
	</div>

	<!-- Filter Pills -->
	<div class="space-y-4">
		<div class="flex flex-wrap gap-2">
			{#each regionOptions as region}
				<Button
					variant={selectedRegion === region.value ? 'default' : 'outline'}
					size="sm"
					class="text-[11px]"
					onclick={() => (selectedRegion = region.value)}
				>
					{region.label}
					<Badge variant="secondary" class="ml-1 text-[9px]">
						{region.count}
					</Badge>
				</Button>
			{/each}
		</div>
	</div>

	<!-- Guides Grid -->
	<div class="space-y-4">
		{#if paged.length === 0}
			<Empty>
				<EmptyMedia><GlobeIcon class="size-6 text-muted-foreground"></GlobeIcon></EmptyMedia>
				<EmptyTitle>No market guides available yet</EmptyTitle>
				<EmptyDescription>New country guides are added as market research completes.</EmptyDescription>
			</Empty>
		{:else}
			<div class="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
				{#each paged as guide, i}
					<a 
						href={localizeHref(`/market-guide/${guide.country}`)}
						class="group flex h-full flex-col overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 transition-all hover:-translate-y-0.5 hover:shadow-md"
					>
						<div class="relative aspect-[16/10] overflow-hidden bg-muted">
							{#if COUNTRY_IMAGES[guide.country]}
								<img
									src={COUNTRY_IMAGES[guide.country]}
									alt={guide.country}
									class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
									loading="lazy"
									decoding="async"
									width="400"
									height="250"
								/>
							{:else}
								<div class="flex h-full w-full items-center justify-center bg-muted/80">
									<GlobeIcon class="size-10 opacity-40" />
								</div>
							{/if}
							<div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
							<div class="absolute bottom-3 left-3 right-3">
								<h3 class="text-base font-semibold text-white sm:text-lg">{guide.country}</h3>
								<p class="text-xs text-on-dark/80">{guide.region}</p>
							</div>
							<div class="absolute top-3 right-3">
								<Badge class="backdrop-blur-sm">{guide.category}</Badge>
							</div>
						</div>
						<div class="flex flex-1 flex-col gap-2 p-3 sm:p-4">
							<div class="space-y-1.5">
								<div class="flex items-center gap-1.5 text-[11px] text-muted-foreground">
									<UsersIcon class="size-3.5" />
									{guide.population.toLocaleLowerCase()}m
								</div>
								<div class="flex items-center gap-1.5 text-[11px] text-muted-foreground">
									<BanknoteIcon class="size-3.5" />
									{guide.gdpPerCapita}
								</div>
								<div class="flex items-center gap-1.5 text-[11px] text-muted-foreground">
									<ScaleIcon class="size-3.5" />
									{guide.regulatoryLevel}
								</div>
							</div>
							<p class="line-clamp-2 text-sm text-muted-foreground">
								{guide.description || 'Comprehensive guide available - covers regulatory framework, import requirements, and market opportunities.'}
							</p>
							<div class="mt-auto flex items-center justify-between gap-2 pt-2">
								<Badge variant="outline" class="text-[10px]">{guide.certifications.length} cert.{guide.certifications.length === 1 ? '' : 's'}</Badge>
								<div class="flex items-center gap-1 text-[11px] text-primary">
									Read guide
									<ArrowRight class="size-3.5" />
								</div>
							</div>
						</div>
					</a>
				{/each}
			</div>
			<Paginator bind:page {totalPages} />
		{/if}
	</div>

	<!-- Structured Data Keywords -->
	{#if data.guides.length > 0}
	<!-- Schema: Collection -->
		{@html `<script type="application/ld+json">${JSON.stringify({
			'@context': 'https://schema.org',
			'@type': 'CollectionPage',
			name: 'Halal Market Entry Guides',
			description: seoFriendlyDescription(),
			publisher: {
				'@type': 'Organization',
				name: 'HalalNeo',
				url: 'https://halalneo.com'
			},
			hasPart: data.guides.slice(0, 10).map(guide => ({
				'@type': 'DigitalResource',
				name: guide.country,
				url: `https://halalneo.com/market-guide/${guide.country}`
			}))
		})}</script>`}
	{/if}
</section>
