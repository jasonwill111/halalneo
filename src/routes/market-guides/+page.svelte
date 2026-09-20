<script lang="ts">
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { Card } from '#lib/components/ui/card/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import Breadcrumb from '#lib/components/site/breadcrumb.svelte';
	import Paginator from '#lib/components/site/paginator.svelte';
	import {
		Empty,
		EmptyHeader,
		EmptyTitle,
		EmptyDescription,
		EmptyContent
	} from '#lib/components/ui/empty/index.js';
	import BrandedEmptyMedia from '#lib/components/site/branded-empty-media.svelte';
	import ErrorRetry from '#lib/components/site/error-retry.svelte';
	import { COUNTRY_IMAGES } from '#lib/data/country-images.js';
	import GlobeIcon from '@lucide/svelte/icons/globe';
	import UsersIcon from '@lucide/svelte/icons/users';
	import BanknoteIcon from '@lucide/svelte/icons/banknote';
	import ScaleIcon from '@lucide/svelte/icons/scale';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import SeoMeta from '#lib/components/seo-meta.svelte';

	let { data } = $props();

	interface MarketGuideRow {
		region?: string | null;
		country?: string | null;
		category?: string | null;
	}

	let selectedRegion = $state('all');

	// Regions derived from data — sorted unique region values with counts, 'all' first
	const regionOptions = $derived.by(() => [
		{ value: 'all', label: 'All Regions', count: data.guides.length },
		...Array.from(
			new Set(data.guides.map((g: MarketGuideRow) => g.region).filter((r): r is string => !!r))
		)
			.sort()
			.map((region) => ({
				value: region,
				label: region,
				count: data.guides.filter((g: MarketGuideRow) => g.region === region).length
			}))
	]);

	const filteredGuides = $derived(
		selectedRegion === 'all'
			? data.guides
			: data.guides.filter((g: MarketGuideRow) => g.region === selectedRegion)
	);

	const PAGE_SIZE = 9;
	let page = $state(1);
	const totalPages = $derived(Math.max(1, Math.ceil(filteredGuides.length / PAGE_SIZE)));
	const paged = $derived(filteredGuides.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE));
	$effect(() => {
		void selectedRegion;
		page = 1;
	});

	// Stats derived from data (recomputed on data change, no stale initial capture)
	const guideStats = $derived.by(() => ({
		totalGuides: data.guides.length,
		regions: regionOptions.length - 1, // exclude all
		countries: new Set(data.guides.map((g: MarketGuideRow) => g.country)).size,
		categories: new Set(data.guides.map((g: MarketGuideRow) => g.category)).size
	}));

	function seoFriendlyDescription(): string {
		return `Comprehensive halal market entry guides for ${guideStats.regions} regions covering ${guideStats.countries} countries. Regulatory frameworks, import requirements, certification standards, and business insights for entering Asian, European, American, Middle Eastern, and African halal markets. Updated 2026.`;
	}

	const StatCard = (title: string, value: number | string, description: string) => ({
		title,
		value,
		description
	});
	const stats = $derived([
		StatCard('Country Guides', String(guideStats.countries), 'Halal market entry guides'),
		StatCard('Regions Covered', String(guideStats.regions), 'Global halal markets'),
		StatCard('Regulatory Types', String(guideStats.categories), 'Standards & frameworks'),
		StatCard('Total Guides', String(guideStats.totalGuides), 'Comprehensive coverage')
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
	{@html `\u003cscript type="application/ld+json">${JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: [
			{ '@type': 'ListItem', position: 1, name: 'Home', item: 'https://halalneo.com/' },
			{
				'@type': 'ListItem',
				position: 2,
				name: 'Market Guides',
				item: 'https://halalneo.com/market-guides'
			}
		]
	})}\u003c/script>`}

	<!-- Structured Data: FAQ Schema -->
	{@html `\u003cscript type="application/ld+json">${JSON.stringify({
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
	})}\u003c/script>`}
</svelte:head>

<section class="space-y-4 py-8 sm:space-y-6">
	<div class="max-w-3xl space-y-2 text-center sm:text-left">
		<h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">Market entry intelligence</h1>
		<p class="text-xs text-muted-foreground sm:text-sm">
			{guideStats.countries} country-level guides for navigating halal regulatory frameworks, import requirements,
			and market opportunities.
		</p>
	</div>

	<!-- Stats Cards -->
	<div class="grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-4">
		{#each stats as stat (stat.title)}
			<Card class="p-2.5 sm:p-4">
				<div class="space-y-0.5 sm:space-y-1">
					<div class="text-base font-bold tabular-nums sm:text-2xl">{stat.value}</div>
					<div
						class="text-2xs font-medium tracking-wider text-muted-foreground uppercase sm:text-2xs-plus"
					>
						{stat.title}
					</div>
					<p class="hidden text-xs text-muted-foreground sm:line-clamp-2 sm:block">
						{stat.description}
					</p>
				</div>
			</Card>
		{/each}
	</div>

	<!-- Filter Pills -->
	<div class="space-y-4">
		<div class="flex flex-wrap gap-2">
			{#each regionOptions as region (region.value)}
				<Button
					variant={selectedRegion === region.value ? 'default' : 'outline'}
					size="sm"
					class="text-2xs-plus"
					onclick={() => (selectedRegion = region.value)}
				>
					{region.label}
					<Badge variant="secondary" class="ml-1 text-3xs">
						{region.count}
					</Badge>
				</Button>
			{/each}
		</div>
	</div>

	<!-- Guides Grid -->
	<div class="space-y-4">
		{#if data.loadError}
			<ErrorRetry failure={data.loadError} subject="market guides" />
		{:else if paged.length === 0}
			<Empty>
				<EmptyHeader>
					<BrandedEmptyMedia><GlobeIcon class="size-6 text-muted-foreground"></GlobeIcon></BrandedEmptyMedia>
					<EmptyTitle>No market guides available yet</EmptyTitle>
					<EmptyDescription
						>New country guides are added as market research completes.</EmptyDescription
					>
				</EmptyHeader>
				<EmptyContent>
					{#if selectedRegion !== 'all'}
						<Button variant="outline" size="sm" onclick={() => (selectedRegion = 'all')}
							>Show all regions</Button
						>
					{/if}
					<Button size="sm" href={localizeHref('/contact')}>Request a country guide</Button>
				</EmptyContent>
			</Empty>
		{:else}
			<div class="grid grid-cols-2 gap-2 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
				{#each paged as guide (guide.country)}
					<a
						href={localizeHref(`/market-guides/${guide.slug}`)}
						class="group press-scale flex h-full flex-col overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 transition-[transform,box-shadow] duration-base ease-spring hover:-translate-y-0.5 hover:shadow-md"
					>
						<div class="relative aspect-[16/10] overflow-hidden bg-muted">
							{#if COUNTRY_IMAGES[guide.country]}
								<img
									src={COUNTRY_IMAGES[guide.country]}
									alt={guide.country}
									class="h-full w-full object-cover transition-transform duration-slow group-hover:scale-105"
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
							<div
								class="absolute inset-0 bg-gradient-to-t from-scrim/80 via-scrim/40 to-transparent"
							></div>
							<div class="absolute right-2 bottom-2 left-2 sm:right-3 sm:bottom-3 sm:left-3">
								<h3 class="truncate text-sm font-semibold text-on-dark sm:text-base lg:text-lg">
									{guide.country}
								</h3>
								<p class="truncate text-2xs-plus text-on-dark/80 sm:text-xs">{guide.region}</p>
							</div>
							<div class="absolute top-2 right-2 hidden sm:top-3 sm:right-3 sm:block">
								<Badge>{guide.region}</Badge>
							</div>
						</div>
						<div class="flex flex-1 flex-col gap-1.5 p-2.5 sm:gap-2 sm:p-4">
							<div class="space-y-1 sm:space-y-1.5">
								<div
									class="flex items-center gap-1.5 truncate text-3xs text-muted-foreground sm:text-2xs-plus"
								>
									<UsersIcon class="size-3 shrink-0 sm:size-3.5" />
									<span class="truncate tabular-nums">{guide.muslimPopulation}m</span>
								</div>
								<div
									class="flex items-center gap-1.5 truncate text-3xs text-muted-foreground sm:text-2xs-plus"
								>
									<BanknoteIcon class="size-3 shrink-0 sm:size-3.5" />
									<span class="truncate">{guide.marketSizeUsd}</span>
								</div>
								<div
									class="flex items-center gap-1.5 truncate text-3xs text-muted-foreground sm:text-2xs-plus"
								>
									<ScaleIcon class="size-3 shrink-0 sm:size-3.5" />
									<span class="truncate">{guide.mandateStatus}</span>
								</div>
							</div>
							<p class="hidden text-sm text-muted-foreground sm:line-clamp-2 sm:block">
								{guide.summary ||
									'Comprehensive guide available - covers regulatory framework, import requirements, and market opportunities.'}
							</p>
							<div class="mt-auto flex items-center justify-between gap-2 pt-2">
								<Badge variant="outline" class="text-2xs"
									>{guide.certifyingBodies?.length ?? 0} cert.{(guide.certifyingBodies?.length ??
										0) === 1
										? ''
										: 's'}</Badge
								>
								<div class="flex items-center gap-1 text-2xs-plus text-primary">
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
		{@html `\u003cscript type="application/ld+json">${JSON.stringify({
			'@context': 'https://schema.org',
			'@type': 'CollectionPage',
			name: 'Halal Market Entry Guides',
			description: seoFriendlyDescription(),
			publisher: {
				'@type': 'Organization',
				name: 'HalalNeo',
				url: 'https://halalneo.com'
			},
			hasPart: data.guides.slice(0, 10).map((guide) => ({
				'@type': 'DigitalResource',
				name: guide.country,
				url: `https://halalneo.com/market-guides/${guide.slug}`
			}))
		})}\u003c/script>`}
	{/if}
</section>
