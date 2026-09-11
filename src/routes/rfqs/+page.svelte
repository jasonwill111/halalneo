<script lang="ts">
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Card, CardContent } from '#lib/components/ui/card/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import Breadcrumb from '#lib/components/site/breadcrumb.svelte';
	import FilterPills from '#lib/components/site/filter-pills.svelte';
	import Paginator from '#lib/components/site/paginator.svelte';
	import SearchIcon from '@lucide/svelte/icons/search';
	import FileTextIcon from '@lucide/svelte/icons/file-text';
	import MapPinIcon from '@lucide/svelte/icons/map-pin';
	import PackageIcon from '@lucide/svelte/icons/package';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import ClockIcon from '@lucide/svelte/icons/clock';

	let { data } = $props();

	let query = $state('');
	let activeCategory = $state('all');
	let page = $state(1);
	const PAGE_SIZE = 9;

	const rfqs = $derived((data.rfqs ?? []) as any[]);

	const categoryOptions = $derived([
		{ value: 'all', label: 'All categories' },
		...((data.categories ?? []) as Array<{ slug: string; name: string }>).map((c) => ({
			value: c.slug,
			label: c.name
		}))
	]);

	const filtered = $derived(
		rfqs.filter((r: any) => {
			if (activeCategory !== 'all' && r.categorySlug !== activeCategory) return false;
			const q = query.trim().toLowerCase();
			if (!q) return true;
			return (
				(r.title ?? '').toLowerCase().includes(q) ||
				(r.description ?? '').toLowerCase().includes(q) ||
				(r.destination ?? '').toLowerCase().includes(q)
			);
		})
	);

	const totalPages = $derived(Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)));
	const paged = $derived(filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE));

	$effect(() => {
		void query;
		void activeCategory;
		page = 1;
	});

	function timeAgo(v: string | number | null | undefined): string {
		if (!v) return '';
		const t = new Date(v).getTime();
		if (isNaN(t)) return '';
		const days = Math.floor((Date.now() - t) / 86400000);
		if (days <= 0) return 'today';
		if (days === 1) return 'yesterday';
		if (days < 30) return `${days}d ago`;
		return new Date(t).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
	}
</script>

<Breadcrumb items={[{ label: 'Buying Requests', href: '/rfqs' }]} />

<section class="space-y-4 sm:space-y-6">
	<div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
		<div class="max-w-2xl space-y-2">
			<div class="flex items-center gap-2 text-sm font-medium text-muted-foreground">
				<FileTextIcon class="size-4" />
				Buying Requests
			</div>
			<h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">Live sourcing needs</h1>
			<p class="text-muted-foreground">
				{filtered.length} open buying requests from halal buyers — quote directly, no middlemen.
				Posting is free (1 request/week).
			</p>
		</div>
		<Button href={localizeHref('/rfqs/new')} class="shrink-0 gap-1.5">
			<PlusIcon class="size-4" />
			Post a request
		</Button>
	</div>

	<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
		<div class="relative flex-1 sm:max-w-xs">
			<SearchIcon class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
			<Input type="search" placeholder="Search requests..." class="pl-9 text-xs" bind:value={query} />
		</div>
		<FilterPills
			options={categoryOptions}
			bind:value={activeCategory}
			ariaLabel="Filter buying requests by category"
		/>
	</div>

	{#if paged.length === 0}
		<div class="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
			<PackageIcon class="mx-auto mb-3 size-10 opacity-40" />
			<p class="text-sm font-medium">No buying requests match these filters</p>
			<p class="mt-1 text-xs">Be the first — post your sourcing need and let suppliers quote.</p>
			<Button href={localizeHref('/rfqs/new')} variant="outline" size="sm" class="mt-4">
				Post a request
			</Button>
		</div>
	{:else}
		<div class="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3">
			{#each paged as r (r.id)}
				<a
					href={localizeHref(`/rfqs/${r.id}`)}
					class="group flex h-full flex-col rounded-xl bg-card p-3 ring-1 ring-foreground/10 transition-all hover:-translate-y-0.5 hover:shadow-md sm:p-4"
				>
					<div class="flex items-start justify-between gap-2">
						<h3 class="line-clamp-2 text-xs font-semibold leading-snug transition-colors group-hover:text-primary sm:text-sm">
							{r.title}
						</h3>
						{#if r.quantity}
							<Badge variant="secondary" class="shrink-0 text-[10px]">{r.quantity}</Badge>
						{/if}
					</div>
					<p class="mt-1.5 line-clamp-2 hidden text-[11px] leading-snug text-muted-foreground sm:block">
						{r.description}
					</p>
					<div class="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 pt-2 text-[10px] text-muted-foreground">
						{#if r.destination}
							<span class="inline-flex items-center gap-1">
								<MapPinIcon class="size-3" />
								{r.destination}
							</span>
						{/if}
						{#if r.createdAt}
							<span class="inline-flex items-center gap-1">
								<ClockIcon class="size-3" />
								{timeAgo(r.createdAt)}
							</span>
						{/if}
						<span class="ml-auto font-semibold text-primary">Quote →</span>
					</div>
				</a>
			{/each}
		</div>
		<Paginator bind:page {totalPages} />
	{/if}
</section>
