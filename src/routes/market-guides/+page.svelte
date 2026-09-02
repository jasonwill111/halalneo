<script lang="ts">
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { Card, CardContent, CardTitle } from '#lib/components/ui/card/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import Breadcrumb from '#lib/components/site/breadcrumb.svelte';
	import GlobeIcon from '@lucide/svelte/icons/globe';
	import UsersIcon from '@lucide/svelte/icons/users';
	import BanknoteIcon from '@lucide/svelte/icons/banknote';
	import ScaleIcon from '@lucide/svelte/icons/scale';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';

	let { data } = $props();

	let selectedRegion = $state('all');

	const countryImages: Record<string, string> = {
		'Malaysia': '/images/market-malaysia.webp',
		'Indonesia': '/images/market-indonesia.webp',
		'UAE': '/images/market-uae.webp',
		'Saudi Arabia': '/images/market-saudi.webp',
		'Japan': '/images/market-japan.webp',
		'Turkey': '/images/market-turkey.webp',
		'India': '/images/market-india.webp',
	};

	const regions = ['all', 'Southeast Asia', 'Middle East', 'South Asia', 'Europe', 'North America'];

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

	const filtered = $derived(
		selectedRegion === 'all'
			? data.guides
			: data.guides.filter((g: any) => g.region === selectedRegion)
	);
</script>

<Breadcrumb items={[{ label: 'Market Guides', href: '/market-guides' }]} />

<section class="space-y-8">
	<div class="max-w-2xl space-y-2">
		<div class="flex items-center gap-2 text-sm font-medium text-muted-foreground">
			<GlobeIcon class="size-4"></GlobeIcon>
			Market Guides
		</div>
		<h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">Halal markets, country by country</h1>
		<p class="text-muted-foreground">
			Certifiers, import requirements, costs, and opportunities for the world's major halal
			markets — everything needed to plan market entry.
		</p>
	</div>

	<div class="flex flex-wrap gap-1.5">
		{#each regions as region}
			<button
				class="rounded-md px-2.5 py-1 text-xs font-medium transition-colors {selectedRegion === region
					? 'bg-primary text-primary-foreground'
					: 'bg-muted text-muted-foreground hover:bg-muted/80'}"
				onclick={() => (selectedRegion = region)}
			>
				{region === 'all' ? 'All Regions' : region}
			</button>
		{/each}
	</div>

	<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each filtered as guide (guide.slug)}
			<Card class="bg-card ring-1 ring-foreground/10 transition-shadow hover:shadow-md overflow-hidden">
				{#if countryImages[guide.country]}
					<div class="aspect-[2/1] overflow-hidden">
						<img src={countryImages[guide.country]} alt={guide.country} class="h-full w-full object-cover" loading="lazy" decoding="async" width="600" height="400" />
					</div>
				{/if}
				<CardContent class="space-y-3 p-4">
					<div class="flex items-start justify-between gap-2">
						<div class="space-y-1">
							<CardTitle class="flex items-center gap-2 text-base">
								<span class="text-xl">{guide.flag}</span>
								{guide.country}
							</CardTitle>
							<p class="text-xs text-muted-foreground">{guide.region}</p>
						</div>
						<span
							class="rounded-md px-1.5 py-0.5 text-[10px] font-medium {mandateStatuses[guide.mandateStatus]
								.class}"
						>
							{mandateStatuses[guide.mandateStatus].label}
						</span>
					</div>

					<p class="text-xs leading-relaxed text-muted-foreground line-clamp-3">
						{guide.summary}
					</p>

					<div class="grid grid-cols-2 gap-2 text-xs">
						<div class="flex items-center gap-1.5 text-muted-foreground">
							<UsersIcon class="size-3.5 shrink-0" />
							{guide.muslimPopulation}
						</div>
						<div class="flex items-center gap-1.5 text-muted-foreground">
							<BanknoteIcon class="size-3.5 shrink-0" />
							{guide.marketSizeUsd}
						</div>
					</div>

					<div class="flex flex-wrap gap-1">
						{#each guide.certifyingBodies.slice(0, 3) as cb}
							<Badge variant="secondary" class="text-[10px]">{cb.name}</Badge>
						{/each}
					</div>

					<Button href={localizeHref(`/market-guides/${guide.slug}`)} variant="outline" size="sm" class="w-full">
						View Guide
						<ArrowRightIcon class="size-3" />
					</Button>
				</CardContent>
			</Card>
		{:else}
			<div class="col-span-full flex flex-col items-center justify-center py-12 text-center">
				<p class="text-lg font-medium text-muted-foreground">No market guides found</p>
				<p class="text-sm text-muted-foreground">Try selecting a different region.</p>
			</div>
		{/each}
	</div>

	<div class="rounded-xl border border-dashed border-border p-6 text-center text-muted-foreground">
		<ScaleIcon class="mx-auto mb-2 size-8 opacity-40" />
		<p class="text-xs">
			Market guides are informational. Regulations change — always confirm current requirements with
			the destination country's authority before shipping.
		</p>
	</div>
</section>
