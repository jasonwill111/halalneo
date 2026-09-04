<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import {
		Select,
		SelectContent,
		SelectItem,
		SelectTrigger
	} from '#lib/components/ui/select/index.js';
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import Package from '@lucide/svelte/icons/package';
	import Breadcrumb from '#lib/components/site/breadcrumb.svelte';
	import RelatedLinks from '#lib/components/site/related-links.svelte';

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
			<div class="flex gap-1.5">
				<Button
					variant={certFilter === 'all' ? 'default' : 'outline'}
					size="sm"
					onclick={() => (certFilter = 'all')}
				>
					All
				</Button>
				<Button
					variant={certFilter === 'certified' ? 'default' : 'outline'}
					size="sm"
					onclick={() => (certFilter = 'certified')}
				>
					Certified
				</Button>
				<Button
					variant={certFilter === 'pending' ? 'default' : 'outline'}
					size="sm"
					onclick={() => (certFilter = 'pending')}
				>
					Pending
				</Button>
			</div>

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
			{#each filtered as product (product.slug)}
				<a
					href={localizeHref(`/products/${product.slug}`)}
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
							<span
								class="absolute top-1.5 left-1.5 rounded-full bg-success/10 px-1.5 py-0.5 text-[10px] font-semibold text-success"
							>
								Halal
							</span>
						{:else if product.certStatus === 'pending'}
							<span
								class="absolute top-1.5 left-1.5 rounded-full bg-warn/10 px-1.5 py-0.5 text-[10px] font-semibold text-warn"
							>
								Pending
							</span>
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
