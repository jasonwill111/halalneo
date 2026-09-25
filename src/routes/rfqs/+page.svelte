<script lang="ts">
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import Breadcrumb from '#lib/components/site/breadcrumb.svelte';
	import ErrorRetry from '#lib/components/site/error-retry.svelte';
	import FilterPills from '#lib/components/site/filter-pills.svelte';
	import Paginator from '#lib/components/site/paginator.svelte';
	import SearchIcon from '@lucide/svelte/icons/search';
	import FileTextIcon from '@lucide/svelte/icons/file-text';
	import MapPinIcon from '@lucide/svelte/icons/map-pin';
	import PackageIcon from '@lucide/svelte/icons/package';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import ClockIcon from '@lucide/svelte/icons/clock';
	import {
		Empty,
		EmptyHeader,
		EmptyTitle,
		EmptyDescription,
		EmptyContent
	} from '#lib/components/ui/empty/index.js';
	import BrandedEmptyMedia from '#lib/components/site/branded-empty-media.svelte';

	let { data } = $props();

	let query = $state('');
	let activeCategory = $state('all');
	let page = $state(1);
	const PAGE_SIZE = 9;

	interface BuyingRequestRow {
		categorySlug?: string | null;
		title?: string | null;
		description?: string | null;
		destination?: string | null;
	}

	const rfqs = $derived(data.rfqs ?? []);

	const categoryOptions = $derived([
		{ value: 'all', label: 'All categories' },
		...((data.categories ?? []) as Array<{ slug: string; name: string }>).map((c) => ({
			value: c.slug,
			label: c.name
		}))
	]);

	const filtered = $derived(
		rfqs.filter((r: BuyingRequestRow) => {
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
		<div class="max-w-2xl space-y-1.5">
			<div class="flex items-center gap-2 text-2xs font-medium text-muted-foreground">
				<FileTextIcon class="size-3.5" />
				Buying Requests
			</div>
			<h1 class="text-xl font-semibold tracking-tight sm:text-2xl">Live sourcing needs</h1>
			<p class="max-w-2xl text-xs text-muted-foreground sm:text-sm">
				{filtered.length} open buying requests from halal buyers — quote directly, no middlemen. Posting
				is free (1 request/week).
			</p>
		</div>
		<Button href={localizeHref('/rfqs/new')} class="shrink-0 gap-1.5">
			<PlusIcon class="size-4" />
			Post a request
		</Button>
	</div>

	<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
		<div class="relative flex-1 sm:max-w-xs">
			<SearchIcon class="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
			<Input
				type="search"
				placeholder="Search requests..."
				class="ps-9 text-xs"
				bind:value={query}
			/>
		</div>
		<FilterPills
			options={categoryOptions}
			bind:value={activeCategory}
			ariaLabel="Filter buying requests by category"
		/>
	</div>

	{#if (data.rfqs ?? []).length > 0}
		<p class="text-2xs text-muted-foreground">
			Showing {filtered.length} of {(data.rfqs ?? []).length} buying requests
		</p>
	{/if}

	{#if data.loadError && paged.length === 0}
		<ErrorRetry failure={data.loadError} subject="buying requests" />
	{:else if paged.length === 0}
		<Empty>
			<EmptyHeader>
				<BrandedEmptyMedia
					><PackageIcon class="size-6 text-muted-foreground"></PackageIcon></BrandedEmptyMedia
				>
				<EmptyTitle>
					{query.trim() || activeCategory !== 'all'
						? 'No buying requests match these filters'
						: 'No buying requests yet'}
				</EmptyTitle>
				<EmptyDescription
					>Be the first — post your sourcing need and let suppliers quote.</EmptyDescription
				>
			</EmptyHeader>
			<EmptyContent>
				{#if query.trim() || activeCategory !== 'all'}
					<Button
						variant="outline"
						size="sm"
						onclick={() => {
							query = '';
							activeCategory = 'all';
						}}>Clear filters</Button
					>
				{/if}
				<Button href={localizeHref('/rfqs/new')} size="sm"
					><PlusIcon class="size-3.5" data-icon="inline-start" />Post a request</Button
				>
			</EmptyContent>
		</Empty>
	{:else}
		<div class="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3">
			{#each paged as r (r.id)}
				<a
					href={localizeHref(`/rfqs/${r.id}`)}
					class="group press-scale flex h-full flex-col rounded-xl bg-card p-3 ring-1 ring-foreground/10 transition-[transform,box-shadow] duration-base ease-spring hover:-translate-y-0.5 hover:shadow-md sm:p-4"
				>
					<div class="flex items-start justify-between gap-2">
						<h3
							class="line-clamp-2 text-xs leading-snug font-semibold transition-colors group-hover:text-primary sm:text-sm"
						>
							{r.title}
						</h3>
						{#if r.quantity}
							<Badge variant="secondary" class="shrink-0 text-2xs tabular-nums">{r.quantity}</Badge>
						{/if}
					</div>
					<p
						class="mt-1.5 line-clamp-2 hidden text-2xs-plus leading-snug text-muted-foreground sm:block"
					>
						{r.description}
					</p>
					<div
						class="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 pt-2 text-2xs text-muted-foreground"
					>
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
						<span class="ms-auto font-semibold text-primary">Quote →</span>
					</div>
				</a>
			{/each}
		</div>
		<Paginator bind:page {totalPages} />
	{/if}
</section>
