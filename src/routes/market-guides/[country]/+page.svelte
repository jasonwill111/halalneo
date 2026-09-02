<script lang="ts">
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { Card, CardContent, CardTitle } from '#lib/components/ui/card/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import Breadcrumb from '#lib/components/site/breadcrumb.svelte';
	import UsersIcon from '@lucide/svelte/icons/users';
	import BanknoteIcon from '@lucide/svelte/icons/banknote';
	import ClockIcon from '@lucide/svelte/icons/clock';
	import CalendarCheckIcon from '@lucide/svelte/icons/calendar-check';
	import FileCheckIcon from '@lucide/svelte/icons/file-check';
	import TrendingUpIcon from '@lucide/svelte/icons/trending-up';
	import ShieldAlertIcon from '@lucide/svelte/icons/shield-alert';
	import LightbulbIcon from '@lucide/svelte/icons/lightbulb';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';

	let { data } = $props();
	const guide = $derived(data.guide);

	const countryImages: Record<string, string> = {
		'Malaysia': '/images/market-malaysia.webp',
		'Indonesia': '/images/market-indonesia.webp',
		'UAE': '/images/market-uae.webp',
		'Saudi Arabia': '/images/market-saudi.webp',
		'Japan': '/images/market-japan.webp',
		'Turkey': '/images/market-turkey.webp',
		'India': '/images/market-india.webp',
	};

	const mandateStatuses: Record<string, { label: string; class: string }> = {
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

	const status = $derived(mandateStatuses[guide.mandateStatus]);

	const relatedGuides = $derived(
		(data.allGuides ?? [])
			.filter((g: any) => g.slug !== guide.slug)
			.filter((g: any) => g.region === guide.region || guide.mandateStatus === g.mandateStatus)
			.slice(0, 3)
	);

	const jsonLd = $derived(JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'Article',
		headline: `Halal Market Guide: ${guide.country}`,
		description: guide.summary,
		about: {
			'@type': 'Country',
			name: guide.country
		},
		publisher: {
			'@type': 'Organization',
			name: 'HalalNeo',
			url: 'https://halalneo.com'
		}
	}));
</script>

<svelte:head>
	<title>{guide.country} Halal Market Guide — HalalNeo</title>
	<meta name="description" content={guide.summary?.slice(0, 160) ?? `Halal market guide for ${guide.country} — certification requirements, market size, and compliance insights.`} />
	{@html `<script type="application/ld+json">${jsonLd}</script>`}
</svelte:head>

<Breadcrumb
	items={[
		{ label: 'Market Guides', href: '/market-guides' },
		{ label: guide.country, href: `/market-guides/${guide.slug}` }
	]}
/>

<section class="space-y-8">
	{#if countryImages[guide.country]}
		<div class="relative overflow-hidden rounded-xl">
			<img src={countryImages[guide.country]} alt={guide.country} class="aspect-[3/1] w-full object-cover" loading="lazy" decoding="async" width="1200" height="400" />
			<div class="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent"></div>
		</div>
	{/if}
	<div class="max-w-3xl space-y-3">
		<div class="flex items-center gap-3">
			<span class="text-4xl">{guide.flag}</span>
			<div>
				<h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">{guide.country}</h1>
				<p class="text-sm text-muted-foreground">{guide.region}</p>
			</div>
		</div>
		<div class="flex flex-wrap items-center gap-2">
			<span class="rounded-md px-2 py-0.5 text-xs font-medium {status.class}">
				{status.label}{guide.mandatorySince ? ` — ${guide.mandatorySince}` : ''}
			</span>
		</div>
		<p class="text-base leading-relaxed text-muted-foreground">{guide.summary}</p>
	</div>

	<div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
		<Card class="bg-card shadow-sm">
			<CardContent class="p-4 text-center">
				<UsersIcon class="mx-auto mb-1 size-4 text-muted-foreground" />
				<p class="text-sm font-semibold">{guide.muslimPopulation}</p>
				<p class="text-[10px] text-muted-foreground">Muslim population</p>
			</CardContent>
		</Card>
		<Card class="bg-card shadow-sm">
			<CardContent class="p-4 text-center">
				<BanknoteIcon class="mx-auto mb-1 size-4 text-muted-foreground" />
				<p class="text-sm font-semibold">{guide.marketSizeUsd}</p>
				<p class="text-[10px] text-muted-foreground">Market size</p>
			</CardContent>
		</Card>
		<Card class="bg-card shadow-sm">
			<CardContent class="p-4 text-center">
				<ClockIcon class="mx-auto mb-1 size-4 text-muted-foreground" />
				<p class="text-sm font-semibold">{guide.processingTime}</p>
				<p class="text-[10px] text-muted-foreground">Processing time</p>
			</CardContent>
		</Card>
		<Card class="bg-card shadow-sm">
			<CardContent class="p-4 text-center">
				<CalendarCheckIcon class="mx-auto mb-1 size-4 text-muted-foreground" />
				<p class="text-sm font-semibold">{guide.certificateValidity}</p>
				<p class="text-[10px] text-muted-foreground">Certificate validity</p>
			</CardContent>
		</Card>
	</div>

	<div class="grid gap-4 lg:grid-cols-2">
		<Card class="bg-card shadow-sm">
			<CardContent class="space-y-3 p-5">
				<div class="flex items-center gap-2">
					<FileCheckIcon class="size-4 text-primary" />
					<CardTitle class="text-base">Import Requirements</CardTitle>
				</div>
				<ul class="space-y-2">
					{#each guide.importRequirements as req}
						<li class="flex items-start gap-2 text-sm text-muted-foreground">
							<span class="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary"></span>
							{req}
						</li>
					{/each}
				</ul>
			</CardContent>
		</Card>

		<Card class="bg-card shadow-sm">
			<CardContent class="space-y-3 p-5">
				<div class="flex items-center gap-2">
					<ShieldAlertIcon class="size-4 text-primary" />
					<CardTitle class="text-base">Certification Facts</CardTitle>
				</div>
				<dl class="space-y-2.5 text-sm">
					<div>
						<dt class="text-xs text-muted-foreground">Standard basis</dt>
						<dd>{guide.standardBasis}</dd>
					</div>
					<div>
						<dt class="text-xs text-muted-foreground">Estimated cost</dt>
						<dd>{guide.estimatedCostUsd}</dd>
					</div>
					<div>
						<dt class="text-xs text-muted-foreground">Certifying bodies</dt>
						<dd class="mt-1 flex flex-wrap gap-1">
							{#each guide.certifyingBodies as cb}
								<Badge variant="secondary" class="text-[10px]">{cb.name}</Badge>
							{/each}
						</dd>
					</div>
				</dl>
				<Button href={localizeHref('/certifying-bodies')} variant="outline" size="sm" class="w-full">
					Browse All Certifying Bodies
					<ArrowRightIcon class="size-3" />
				</Button>
			</CardContent>
		</Card>
	</div>

	<div class="grid gap-4 lg:grid-cols-3">
		<Card class="bg-card shadow-sm">
			<CardContent class="space-y-3 p-5">
				<div class="flex items-center gap-2">
					<LightbulbIcon class="size-4 text-primary" />
					<CardTitle class="text-sm">Key Insights</CardTitle>
				</div>
				<ul class="space-y-2">
					{#each guide.keyInsights as insight}
						<li class="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
							<span class="mt-1.5 size-1 shrink-0 rounded-full bg-primary"></span>
							{insight}
						</li>
					{/each}
				</ul>
			</CardContent>
		</Card>

		<Card class="bg-card shadow-sm">
			<CardContent class="space-y-3 p-5">
				<div class="flex items-center gap-2">
					<TrendingUpIcon class="size-4 text-green-500" />
					<CardTitle class="text-sm">Opportunities</CardTitle>
				</div>
				<ul class="space-y-2">
					{#each guide.opportunities as opp}
						<li class="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
							<span class="mt-1.5 size-1 shrink-0 rounded-full bg-green-500"></span>
							{opp}
						</li>
					{/each}
				</ul>
			</CardContent>
		</Card>

		<Card class="bg-card shadow-sm">
			<CardContent class="space-y-3 p-5">
				<div class="flex items-center gap-2">
					<ShieldAlertIcon class="size-4 text-amber-500" />
					<CardTitle class="text-sm">Challenges</CardTitle>
				</div>
				<ul class="space-y-2">
					{#each guide.challenges as ch}
						<li class="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
							<span class="mt-1.5 size-1 shrink-0 rounded-full bg-amber-500"></span>
							{ch}
						</li>
					{/each}
				</ul>
			</CardContent>
		</Card>
	</div>

	{#if relatedGuides.length > 0}
		<div class="space-y-3">
			<h2 class="text-lg font-semibold tracking-tight">Related markets</h2>
			<div class="grid gap-3 sm:grid-cols-3">
				{#each relatedGuides as rel (rel.slug)}
					<Button href={localizeHref(`/market-guides/${rel.slug}`)} variant="outline" class="h-auto justify-between p-4 text-left">
						<span class="flex items-center gap-2">
							<span class="text-lg">{rel.flag}</span>
							<span>
								<span class="block text-sm font-medium">{rel.country}</span>
								<span class="block text-[10px] text-muted-foreground">{rel.region}</span>
							</span>
						</span>
						<ArrowRightIcon class="size-4 shrink-0 text-muted-foreground" />
					</Button>
				{/each}
			</div>
		</div>
	{/if}
</section>
