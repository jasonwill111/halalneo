<script lang="ts">
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import {
		Card,
		CardContent,
		CardTitle
	} from '#lib/components/ui/card/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import Breadcrumb from '#lib/components/site/breadcrumb.svelte';
	import FilterPills from '#lib/components/site/filter-pills.svelte';
	import { TILE_COLORS } from '#lib/utils/tile-colors.js';
	import { getRegion } from '#lib/utils/region.js';

	let { data } = $props();

	const regions = [
		{ label: 'All regions', value: '' },
		{ label: 'Southeast Asia', value: 'Southeast Asia' },
		{ label: 'Middle East', value: 'Middle East' },
		{ label: 'South Asia', value: 'South Asia' },
		{ label: 'East Asia', value: 'East Asia' },
		{ label: 'Europe', value: 'Europe' },
		{ label: 'Africa', value: 'Africa' },
		{ label: 'Americas', value: 'Americas' },
		{ label: 'Oceania', value: 'Oceania' }
	] as const;

	let query = $state('');
	let selectedRegion = $state('');

	const filtered = $derived(
		(data.certifiers ?? []).filter((b: any) => {
			const q = query.trim().toLowerCase();
			const matchesQuery =
				!q ||
				b.name.toLowerCase().includes(q) ||
				b.country.toLowerCase().includes(q) ||
				b.standard.toLowerCase().includes(q);
			const matchesRegion = !selectedRegion || getRegion(b.country) === selectedRegion;
			return matchesQuery && matchesRegion;
		})
	);

	// Initials tile palette — shared with homepage/categories/KB for cross-page consistency
	const tileColors = TILE_COLORS;
</script>

<Breadcrumb items={[{ label: 'Certifying Bodies', href: '/certifying-bodies' }]} />

<section class="space-y-6">
	<div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
		<div class="max-w-2xl space-y-2">
			<h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">Certifying bodies</h1>
			<p class="text-muted-foreground">
				{(data.certifiers ?? []).length} recognized halal certification authorities across
				{new Set((data.certifiers ?? []).map((b: any) => b.country)).size} countries.
			</p>
		</div>
		<div class="w-full sm:w-72">
			<Input bind:value={query} type="search" placeholder="Filter bodies" />
		</div>
	</div>

	<FilterPills
		options={regions.map((r) => ({ value: r.value, label: r.label }))}
		bind:value={selectedRegion}
		ariaLabel="Filter certifying bodies by region"
	/>

	<div class="grid gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3 xl:grid-cols-4">
		{#each filtered as body, i}
			<article class="contents">
			<a href={localizeHref(`/certifying-bodies/${body.id}`)} class="group h-full">
				<Card hoverable class="h-full transition-shadow group-hover:shadow-md">
					<CardContent class="flex items-center gap-3 p-3">
						<div
							class="flex size-10 shrink-0 items-center justify-center rounded-lg text-sm font-semibold {tileColors[
								i % tileColors.length
							]}"
						>
							{body.name.slice(0, 2).toUpperCase()}
						</div>
						<div class="min-w-0 flex-1">
							<div class="flex items-center justify-between gap-2">
								<CardTitle class="truncate text-sm transition-colors group-hover:text-primary">{body.name}</CardTitle>
								<Badge variant="outline" class="shrink-0 text-[10px]">{getRegion(body.country)}</Badge>
							</div>
							<p
								class="mt-0.5 truncate text-xs text-muted-foreground"
								title={`${body.country} · ${body.standard}`}
							>
								{body.country} · {body.standard}
							</p>
						</div>
					</CardContent>
				</Card>
			</a>
			</article>
		{/each}
	</div>

	{#if filtered.length === 0}
		<p class="py-10 text-center text-muted-foreground">No certifying bodies match "{query}"</p>
	{/if}
</section>
