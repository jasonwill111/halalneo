<script lang="ts">
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { Card, CardContent, CardTitle } from '#lib/components/ui/card/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import Breadcrumb from '#lib/components/site/breadcrumb.svelte';
	import FilterPills from '#lib/components/site/filter-pills.svelte';
	import GuideHero from '#lib/components/site/guide-hero.svelte';
	import Paginator from '#lib/components/site/paginator.svelte';
	import { MANDATE_STATUSES, type MandateStatus } from '#lib/utils/mandate.js';
	import { COUNTRY_IMAGES } from '#lib/data/country-images.js';
	import { cn } from '#lib/utils.js';
	import GlobeIcon from '@lucide/svelte/icons/globe';
	import UsersIcon from '@lucide/svelte/icons/users';
	import BanknoteIcon from '@lucide/svelte/icons/banknote';
	import ScaleIcon from '@lucide/svelte/icons/scale';

	let { data } = $props();

	let selectedRegion = $state('all');

	const countryImages = COUNTRY_IMAGES;

	// Regions derived from data — sorted unique region values with counts, 'all' first
	const regionOptions = $derived([
		{ value: 'all', label: 'All Regions', count: data.guides.length },
		...Array.from(
			new Set(data.guides.map((g: any) => g.region).filter((r): r is string => !!r))
		)
			.sort()
			.map((r) => ({
				value: r,
				label: r,
				count: data.guides.filter((g: any) => g.region === r).length
			}))
	]);

	const filtered = $derived(
		selectedRegion === 'all'
			? data.guides
			: data.guides.filter((g: any) => g.region === selectedRegion)
	);

	const PAGE_SIZE = 9;
	let page = $state(1);
	const totalPages = $derived(Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)));
	const paged = $derived(filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE));

	$effect(() => {
		void selectedRegion;
		page = 1;
	});
</script>

<Breadcrumb items={[{ label: 'Market Guides', href: '/market-guides' }]} />

<section class="space-y-4">
	<div class="max-w-2xl space-y-1">
		<div class="flex items-center gap-2 text-xs font-medium text-muted-foreground">
			<GlobeIcon class="size-3.5"></GlobeIcon>
			Market Guides
		</div>
		<h1 class="text-2xl font-semibold tracking-tight sm:text-3xl">Halal markets, country by country</h1>
		<p class="text-sm text-muted-foreground">
			Certifiers, import requirements, costs, and opportunities for the world's major halal
			markets — everything needed to plan market entry.
		</p>
	</div>

	<FilterPills
		options={regionOptions}
		bind:value={selectedRegion}
		ariaLabel="Filter market guides by region"
	/>

	<div class="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3">
			{#each paged as guide (guide.slug)}
			<article class="contents">
			<a href={localizeHref(`/market-guides/${guide.slug}`)} class="group h-full">
			<Card class="h-full bg-card ring-1 ring-foreground/10 transition-shadow group-hover:shadow-md overflow-hidden">
				{#if countryImages[guide.country]}
					<div class="relative -mx-4 -mt-4 aspect-[16/9] overflow-hidden sm:-mx-5 sm:-mt-4">
						<img src={countryImages[guide.country]} srcset={`${countryImages[guide.country]}?w=480 480w, ${countryImages[guide.country]} 1200w`} sizes="(max-width: 640px) 100vw, 600px" alt={guide.country} class="h-full w-full object-cover" loading="lazy" decoding="async" width="600" height="400" />
					</div>
				{:else}
					<div class="-mx-4 -mt-4 sm:-mx-5 sm:-mt-4">
						<GuideHero
							country={guide.country}
							flag={guide.flag}
							rounded="rounded-none"
							class="aspect-[16/9] w-full"
						/>
					</div>
				{/if}
				<CardContent class="flex flex-1 flex-col gap-2 p-3 sm:p-4">
					<div class="flex items-start justify-between gap-2">
						<div class="space-y-0.5">
							<CardTitle class="flex items-center gap-1.5 text-sm font-semibold transition-colors group-hover:text-primary">
								<span class="text-base">{guide.flag}</span>
								{guide.country}
							</CardTitle>
							<p class="text-[11px] text-muted-foreground">{guide.region}</p>
						</div>
						<span
							class={cn(
								'shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium',
								MANDATE_STATUSES[guide.mandateStatus as MandateStatus]?.tone
							)}
						>
							{MANDATE_STATUSES[guide.mandateStatus as MandateStatus]?.label}
						</span>
					</div>

					<p class="hidden line-clamp-2 text-[11px] leading-relaxed text-muted-foreground sm:block">
						{guide.summary}
					</p>

				<div class="grid grid-cols-2 gap-1.5 text-[11px]">
						<div class="flex items-center gap-1 truncate text-foreground/80">
							<UsersIcon class="size-3 shrink-0" />
							<span class="truncate">{guide.muslimPopulation}</span>
						</div>
						<div class="flex items-center gap-1 truncate text-foreground/80">
							<BanknoteIcon class="size-3 shrink-0" />
							<span class="truncate">{guide.marketSizeUsd}</span>
						</div>
					</div>

					<div class="hidden flex-wrap gap-1 sm:flex">
						{#each (guide.certifyingBodies ?? []).slice(0, 3) as cb, ci (ci + '-' + (cb?.name ?? ''))}
							<Badge variant="secondary" class="text-[10px]">{cb.name}</Badge>
						{/each}
					</div>
				</CardContent>
			</Card>
			</a>
			</article>
		{:else}
			<div class="col-span-full flex flex-col items-center justify-center py-12 text-center">
				<p class="text-lg font-medium text-muted-foreground">No market guides found</p>
				<p class="text-sm text-muted-foreground">Try selecting a different region.</p>
			</div>
		{/each}
	</div>
	<Paginator bind:page {totalPages} />

	<div class="rounded-xl border border-dashed border-border p-6 text-center text-muted-foreground">
		<ScaleIcon class="mx-auto mb-2 size-8 opacity-40" />
		<p class="text-xs">
			Market guides are informational. Regulations change — always confirm current requirements with
			the destination country's authority before shipping.
		</p>
	</div>
</section>
