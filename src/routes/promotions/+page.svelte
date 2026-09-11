<script lang="ts">
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import Breadcrumb from '#lib/components/site/breadcrumb.svelte';
	import Paginator from '#lib/components/site/paginator.svelte';
	import SearchIcon from '@lucide/svelte/icons/search';
	import TagIcon from '@lucide/svelte/icons/tag';
	import ClockIcon from '@lucide/svelte/icons/clock';
	import PackageIcon from '@lucide/svelte/icons/package';

	let { data } = $props();

	let query = $state('');
	let page = $state(1);
	const PAGE_SIZE = 9;

	const promos = $derived((data.promos ?? []) as any[]);
	const names = $derived((data.supplierNames ?? {}) as Record<string, string>);

	const filtered = $derived(
		promos.filter((p: any) => {
			const q = query.trim().toLowerCase();
			if (!q) return true;
			return (
				(p.title ?? '').toLowerCase().includes(q) ||
				(p.description ?? '').toLowerCase().includes(q) ||
				(names[p.supplierSlug] ?? '').toLowerCase().includes(q)
			);
		})
	);

	const totalPages = $derived(Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)));
	const paged = $derived(filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE));

	$effect(() => {
		void query;
		page = 1;
	});

	function priceText(p: any): string {
		if (!p.priceMin) return '';
		const range = p.priceMax ? `$${p.priceMin}–$${p.priceMax}` : `$${p.priceMin}`;
		return p.priceUnit ? `${range}/${p.priceUnit}` : range;
	}

	function daysLeft(v: string | null | undefined): string | null {
		if (!v) return null;
		const t = new Date(v).getTime();
		if (isNaN(t)) return null;
		const d = Math.ceil((t - Date.now()) / 86400000);
		if (d < 0) return 'Ended';
		if (d === 0) return 'Ends today';
		return `${d}d left`;
	}
</script>

<Breadcrumb items={[{ label: 'Quick Deals', href: '/promotions' }]} />

<section class="space-y-4 sm:space-y-6">
	<div class="max-w-2xl space-y-2">
		<div class="flex items-center gap-2 text-sm font-medium text-muted-foreground">
			<TagIcon class="size-4" />
			Quick Deals
		</div>
		<h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">Clearance offers</h1>
		<p class="text-muted-foreground">
			Time-boxed deals from halal suppliers — discounted stock while it lasts.
		</p>
	</div>

	<div class="relative max-w-xs">
		<SearchIcon class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
		<Input type="search" placeholder="Search deals..." class="pl-9 text-xs" bind:value={query} />
	</div>

	{#if paged.length === 0}
		<div class="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
			<PackageIcon class="mx-auto mb-3 size-10 opacity-40" />
			<p class="text-sm font-medium">No active deals right now</p>
			<p class="mt-1 text-xs">Suppliers publish clearance offers here — check back soon.</p>
		</div>
	{:else}
		<div class="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3">
			{#each paged as p (p.id)}
				<a
					href={localizeHref(`/promotions/${p.id}`)}
					class="group relative flex h-full flex-col rounded-xl bg-card p-3 ring-1 ring-foreground/10 transition-all hover:-translate-y-0.5 hover:shadow-md sm:p-4"
				>
					{#if p.discountPct}
						<span class="absolute top-2 right-2 rounded-full bg-destructive/90 px-2 py-0.5 text-[10px] font-bold text-white">
							-{p.discountPct}%
						</span>
					{/if}
					<p class="text-[10px] font-medium text-muted-foreground">{names[p.supplierSlug] ?? p.supplierSlug}</p>
					<h3 class="mt-0.5 line-clamp-2 text-xs font-semibold leading-snug transition-colors group-hover:text-primary sm:text-sm">
						{p.title}
					</h3>
					{#if priceText(p)}
						<p class="mt-1 text-sm font-bold text-primary sm:text-base">{priceText(p)}</p>
					{/if}
					<div class="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 pt-2 text-[10px] text-muted-foreground">
						{#if p.moq}
							<span>MOQ {p.moq}</span>
						{/if}
						{#if daysLeft(p.validUntil)}
							<span class="inline-flex items-center gap-1">
								<ClockIcon class="size-3" />
								{daysLeft(p.validUntil)}
							</span>
						{/if}
					</div>
				</a>
			{/each}
		</div>
		<Paginator bind:page {totalPages} />
	{/if}
</section>
