<script lang="ts">
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Card } from '#lib/components/ui/card/index.js';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import Factory from '@lucide/svelte/icons/factory';
	import Warehouse from '@lucide/svelte/icons/warehouse';
	import ArrowLeftRight from '@lucide/svelte/icons/arrow-left-right';
	import Breadcrumb from '#lib/components/site/breadcrumb.svelte';
	import Paginator from '#lib/components/site/paginator.svelte';
	import FilterPills from '#lib/components/site/filter-pills.svelte';
	import { Input } from '#lib/components/ui/input/index.js';
	import { TILE_COLORS } from '#lib/utils/tile-colors.js';
	import { getRegion, regionBadgeClass } from '#lib/utils/region.js';

	let { data } = $props();

	type SupplierRow = {
		slug: string;
		name: string;
		country?: string | null;
		businessType?: string | null;
		isBrand?: boolean | null;
		status?: string | null;
		logoInitials?: string | null;
		description?: string | null;
	};

	const suppliers = $derived((data.suppliers ?? []) as SupplierRow[]);
	const products = $derived((data.products ?? []) as any[]);

	const PAGE_SIZE = 9;
	let page = $state(1);

	// Business type filter — 'all' shows everything
	let activeType = $state('all');
	let activeCountry = $state('all');
	let query = $state('');

	const countryOptions = $derived([
		{ value: 'all', label: 'All countries' },
		...Array.from(
			new Set(suppliers.map((s) => s.country).filter((c): c is string => !!c))
		)
			.sort()
			.map((c) => ({
				value: c,
				label: c,
				count: suppliers.filter((s) => s.country === c).length
			}))
	]);
	const filtered = $derived(
		suppliers.filter((s) => {
			if (activeType !== 'all' && s.businessType !== activeType) return false;
			if (activeCountry !== 'all' && s.country !== activeCountry) return false;
			const q = query.trim().toLowerCase();
			if (q && !(s.name ?? '').toLowerCase().includes(q)) return false;
			return true;
		})
	);
	const totalPages = $derived(Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)));
	const pagedSuppliers = $derived(filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE));
	$effect(() => {
		activeType;
		void activeCountry;
		void query;
		page = 1;
	});

	const productCount = (slug: string): number => products.filter((p: any) => p.supplierSlug === slug).length;

	const typeMeta: Record<string, { label: string; cls: string }> = {
		manufacturer: { label: 'Manufacturer', cls: 'bg-info/10 text-info border-info/20' },
		wholesaler: { label: 'Wholesaler', cls: 'bg-accent-purple/10 text-accent-purple border-accent-purple/20' },
		trader: { label: 'Trader', cls: 'bg-accent-rose/10 text-accent-rose border-accent-rose/20' }
	};

	const typeCards = [
		{ value: 'manufacturer', icon: Factory, cls: 'bg-info/10 text-info' },
		{ value: 'wholesaler', icon: Warehouse, cls: 'bg-accent-purple/10 text-accent-purple' },
		{ value: 'trader', icon: ArrowLeftRight, cls: 'bg-accent-rose/10 text-accent-rose' }
	];

	const typeCount = (value: string): number => suppliers.filter((s) => s.businessType === value).length;
</script>

<Breadcrumb items={[{ label: 'Suppliers', href: '/suppliers' }]} />

<svelte:head>
	{@html `<script type="application/ld+json">${JSON.stringify(data.itemList)}</script>`}
</svelte:head>

<section class="space-y-4 sm:space-y-6">
	<div class="max-w-2xl space-y-2">
		<h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">Supplier directory</h1>
		<p class="text-muted-foreground">
			{suppliers.length} halal-certified suppliers across {new Set(suppliers.map((s) => s.country)).size} countries — filter by business type and check certifications before you inquire.
		</p>
	</div>

	<!-- Business type cards (also act as filters) -->
	<div class="space-y-4">
		<div class="grid gap-2 sm:grid-cols-3">
			{#each typeCards as t (t.value)}
				{@const meta = typeMeta[t.value]}
				<button
					type="button"
					onclick={() => (activeType = activeType === t.value ? 'all' : t.value)}
					aria-pressed={activeType === t.value}
					class="group text-left"
				>
					<Card class={`p-3.5 transition-all group-hover:shadow-md sm:p-4 ${activeType === t.value ? 'ring-2 ring-primary' : ''}`}>
						<div class="flex items-center gap-2.5">
							<div class={`flex size-9 shrink-0 items-center justify-center rounded-lg ${t.cls}`}>
								<t.icon class="size-4"></t.icon>
							</div>
							<div class="min-w-0">
								<h3 class="truncate text-sm font-medium">{meta?.label ?? t.value}</h3>
								<p class="text-[10px] text-muted-foreground">{typeCount(t.value)} compan{typeCount(t.value) === 1 ? 'y' : 'ies'}</p>
							</div>
						</div>
					</Card>
				</button>
			{/each}
		</div>
	</div>

	<!-- Country filter + name search -->
	<div class="space-y-2">
		<div class="w-full sm:max-w-xs">
			<Input
				bind:value={query}
				type="search"
				placeholder="Search suppliers by name..."
				class="text-xs"
			/>
		</div>
		<FilterPills
			options={countryOptions}
			bind:value={activeCountry}
			ariaLabel="Filter suppliers by country"
		/>
	</div>

	<!-- Supplier grid -->
	<div class="space-y-4">
		<div class="flex flex-wrap items-end justify-between gap-2">
			<div>
				<h2 class="text-lg font-semibold">
					{activeType === 'all' ? 'Verified suppliers' : (typeMeta[activeType]?.label ?? activeType) + 's'}
				</h2>
				<p class="text-xs text-muted-foreground">{filtered.length} compan{filtered.length === 1 ? 'y' : 'ies'}</p>
			</div>
			{#if activeType !== 'all' || activeCountry !== 'all' || query.trim()}
				<Button
					variant="outline"
					size="sm"
					class="text-[10px]"
					onclick={() => {
						activeType = 'all';
						activeCountry = 'all';
						query = '';
					}}
				>
					Clear filter
				</Button>
			{/if}
		</div>

		{#if pagedSuppliers.length === 0}
			<div class="rounded-xl bg-card p-8 text-center ring-1 ring-foreground/10">
				<p class="text-sm font-medium">No suppliers match these filters</p>
				<p class="mt-1 text-xs text-muted-foreground">New suppliers are joining during test mode — check back soon.</p>
			</div>
		{:else}
			<div class="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3">
				{#each pagedSuppliers as s, i (s.slug)}
					<a
						href={localizeHref(`/supplier/${s.slug}`)}
						class="group flex h-full flex-col rounded-xl bg-card p-2.5 ring-1 ring-foreground/10 transition-all hover:-translate-y-0.5 hover:shadow-md sm:rounded-xl sm:p-3"
					>
						<div class="flex items-center gap-2.5">
							<div class={`flex size-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold sm:size-10 ${TILE_COLORS[i % TILE_COLORS.length]}`}>
								{s.logoInitials ?? s.name?.slice(0, 2) ?? '?'}
							</div>
							<div class="min-w-0 flex-1">
								<h3 class="truncate text-xs font-medium transition-colors group-hover:text-primary sm:text-sm">
									{s.name}
								</h3>
								<div class="mt-0.5 flex flex-wrap items-center gap-1">
									{#if s.status === 'active'}
										<span class="inline-flex items-center gap-0.5 text-[9px] font-medium text-success">
											<ShieldCheck class="size-2.5"></ShieldCheck>
											Verified
										</span>
									{/if}
									{#if s.isBrand}
										<span class="inline-flex items-center rounded-full border border-accent-rose/20 bg-accent-rose/10 px-1.5 py-px text-[9px] font-medium text-accent-rose">Brand</span>
									{/if}
								</div>
							</div>
						</div>
						{#if s.description}
							<p class="mt-1.5 hidden text-[10px] leading-snug text-muted-foreground line-clamp-2 sm:block">{s.description}</p>
						{/if}
						<div class="mt-auto flex flex-wrap items-center gap-1 pt-2">
							{#if s.country}
								<Badge variant="outline" class="text-[9px] font-medium {regionBadgeClass(getRegion(s.country))}">
									{s.country}
								</Badge>
							{/if}
							{#if s.businessType}
								<Badge variant="outline" class="text-[9px] font-medium {typeMeta[s.businessType]?.cls ?? ''}">
									{typeMeta[s.businessType]?.label ?? s.businessType}
								</Badge>
							{/if}
							<span class="ml-auto text-[10px] text-muted-foreground">
								{productCount(s.slug)} product{productCount(s.slug) === 1 ? '' : 's'}
							</span>
						</div>
					</a>
				{/each}
			</div>
			<Paginator bind:page {totalPages} />
		{/if}
	</div>

	<!-- Certifying Bodies -->
	<div class="space-y-4">
		<div class="flex items-end justify-between gap-2">
			<div>
				<h2 class="text-lg font-semibold">Recognised certifying bodies</h2>
				<p class="text-xs text-muted-foreground">Suppliers on HalalNeo carry certificates from these recognised bodies.</p>
			</div>
			<Button href={localizeHref('/certifying-bodies')} variant="outline" size="sm" class="shrink-0 text-xs">
				View all 15
				<ArrowRight class="size-3.5" />
			</Button>
		</div>
	</div>
</section>
