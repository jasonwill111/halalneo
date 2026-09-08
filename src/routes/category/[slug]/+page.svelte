<script lang="ts">
	import { Badge } from '#lib/components/ui/badge/index.js';
	import {
		Select,
		SelectContent,
		SelectItem,
		SelectTrigger
	} from '#lib/components/ui/select/index.js';
	import * as ToggleGroup from '#lib/components/ui/toggle-group/index.js';
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import Package from '@lucide/svelte/icons/package';
	import Breadcrumb from '#lib/components/site/breadcrumb.svelte';
	import RelatedLinks from '#lib/components/site/related-links.svelte';
	import Paginator from '#lib/components/site/paginator.svelte';

	let { data } = $props();
	const category = $derived(data.category);
	const products = $derived(data.products ?? []);

	let certFilter = $state('all');
	let countryFilter = $state('all');
	let sortBy = $state('default');

	const countries = $derived([
		...new Set(products.map((p: any) => p.originCountry).filter(Boolean))
	]);

	const filtered = $derived.by(() => {
		let list = [...products];
		if (certFilter !== 'all') list = list.filter((p: any) => p.certStatus === certFilter);
		if (countryFilter !== 'all') list = list.filter((p: any) => p.originCountry === countryFilter);
		if (sortBy === 'price-asc')
			list.sort((a: any, b: any) => (a.priceMin ?? Infinity) - (b.priceMin ?? Infinity));
		if (sortBy === 'price-desc')
			list.sort((a: any, b: any) => (b.priceMin ?? -Infinity) - (a.priceMin ?? -Infinity));
		if (sortBy === 'name') list.sort((a: any, b: any) => a.name.localeCompare(b.name));
		return list;
	});

	const PAGE_SIZE = 12;
	let page = $state(1);
	const totalPages = $derived(Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)));
	const paged = $derived(filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE));

	// Reset to first page whenever filters change
	$effect(() => {
		void certFilter;
		void countryFilter;
		void sortBy;
		page = 1;
	});
</script>

<Breadcrumb
	items={[{ label: 'Categories', href: '/categories' }, { label: category?.name ?? data.slug }]}
/>

<div class="py-8">
	<header class="mb-6 space-y-2">
		<h1 class="text-3xl font-bold tracking-tight">{category?.name ?? data.slug}</h1>
		{#if category?.description}
			<p class="text-muted-foreground">{category.description}</p>
		{/if}
		<Badge variant="secondary">{filtered.length} products</Badge>
	</header>

	{#if products.length > 0}
		<!-- Filter bar -->
		<div class="mb-6 flex flex-wrap items-center gap-2">
			<ToggleGroup.Root type="single" bind:value={certFilter} size="sm" variant="outline" aria-label="Filter by certification status">
				<ToggleGroup.Item value="all">All</ToggleGroup.Item>
				<ToggleGroup.Item value="certified">Certified</ToggleGroup.Item>
				<ToggleGroup.Item value="pending">Pending</ToggleGroup.Item>
			</ToggleGroup.Root>

			{#if countries.length > 0}
				<Select type="single" bind:value={countryFilter}>
					<SelectTrigger class="h-8 w-40 text-xs">
						{countryFilter === 'all' ? 'All origins' : countryFilter}
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All origins</SelectItem>
						{#each countries as country}
							<SelectItem value={country}>{country}</SelectItem>
						{/each}
					</SelectContent>
				</Select>
			{/if}

			<Select type="single" bind:value={sortBy}>
				<SelectTrigger class="h-8 w-40 text-xs">
					{sortBy === 'default'
						? 'Sort: Default'
						: sortBy === 'price-asc'
							? 'Price: Low to High'
							: sortBy === 'price-desc'
								? 'Price: High to Low'
								: 'Name A-Z'}
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="default">Sort: Default</SelectItem>
					<SelectItem value="price-asc">Price: Low to High</SelectItem>
					<SelectItem value="price-desc">Price: High to Low</SelectItem>
					<SelectItem value="name">Name A-Z</SelectItem>
				</SelectContent>
			</Select>
		</div>

		<!-- Product grid -->
		<div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
			{#each paged as product (product.slug)}
				<a
					href={localizeHref(`/product/${product.slug}`)}
					class="group rounded-xl bg-card p-3 ring-1 ring-foreground/10 transition-all hover:shadow-md"
				>
					<div
						class="relative mb-2 flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-muted"
					>
						{#if product.image && (product.image.startsWith('/') || product.image.startsWith('http'))}
							<img
								src={product.image}
								alt={product.name}
								class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
								loading="lazy"
								decoding="async"
							/>
						{:else}
							<Package class="size-8 text-muted-foreground/30" />
						{/if}
					{#if product.certStatus === 'certified'}
						<Badge class="absolute top-1.5 left-1.5 bg-success/10 text-success hover:bg-success/20">
							Halal
						</Badge>
					{:else if product.certStatus === 'pending'}
						<Badge class="absolute top-1.5 left-1.5 bg-warn/10 text-warn hover:bg-warn/20">
							Pending
						</Badge>
					{/if}
					</div>
					{#if product.moq}
						<p class="mb-1 text-[10px] text-muted-foreground">MOQ: {product.moq}</p>
					{/if}
					<h3
						class="line-clamp-2 text-sm font-medium text-foreground transition-colors group-hover:text-primary"
					>
						{product.name}
					</h3>
					<div class="mt-1 flex items-center justify-between gap-2">
						{#if product.originCountry}
							<p class="truncate text-xs text-muted-foreground">{product.originCountry}</p>
						{:else}
							<p class="truncate text-xs text-muted-foreground">{product.supplierSlug}</p>
						{/if}
						{#if product.priceMin}
							<span class="shrink-0 text-sm font-bold text-primary">
								${product.priceMin}{product.priceUnit ? `/${product.priceUnit}` : ''}
							</span>
						{/if}
					</div>
				</a>
			{/each}
		</div>
		<Paginator bind:page {totalPages} />
	{:else}
		<div class="flex min-h-[30vh] items-center justify-center">
			<p class="text-sm text-muted-foreground">No products in this category yet.</p>
		</div>
	{/if}

	<RelatedLinks
		title="Related guides"
		items={(data.relatedArticles ?? []).map((a: any) => ({
			label: a.title,
			description: a.readTime ?? '',
			href: `/knowledge-base/${a.section ?? a.sectionSlug}/${a.slug}`
		}))}
	/>
</div>
