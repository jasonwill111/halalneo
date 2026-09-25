<script lang="ts">
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { SvelteMap } from 'svelte/reactivity';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Card, CardContent } from '#lib/components/ui/card/index.js';
	import Icon from '#lib/components/site/icon.svelte';
	import Breadcrumb from '#lib/components/site/breadcrumb.svelte';
	import Paginator from '#lib/components/site/paginator.svelte';
	import { Input } from '#lib/components/ui/input/index.js';
	import { TILE_COLORS } from '#lib/utils/tile-colors.js';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import Clock3 from '@lucide/svelte/icons/clock-3';
	import CircleDashed from '@lucide/svelte/icons/circle-dashed';
	import MapPin from '@lucide/svelte/icons/map-pin';
	import Package from '@lucide/svelte/icons/package';
	import SearchIcon from '@lucide/svelte/icons/search';
	import {
		Empty,
		EmptyHeader,
		EmptyTitle,
		EmptyDescription,
		EmptyContent
	} from '#lib/components/ui/empty/index.js';
	import BrandedEmptyMedia from '#lib/components/site/branded-empty-media.svelte';
	import ErrorRetry from '#lib/components/site/error-retry.svelte';

	let { data } = $props();

	type ProductRow = {
		slug: string;
		name: string;
		image?: string | null;
		categorySlug?: string | null;
		supplierSlug?: string | null;
		priceMin?: number | null;
		priceMax?: number | null;
		priceUnit?: string | null;
		moq?: string | null;
		certStatus?: string | null;
	};

	const allProducts = $derived((data.products ?? []) as ProductRow[]);
	const productCategories = $derived(
		(data.categories ?? []) as { slug: string; name: string; description: string; icon: string }[]
	);

	const certByCategory = $derived.by(() => {
		const map = new SvelteMap<string, number>();
		for (const c of productCategories) {
			map.set(c.slug, allProducts.filter((p) => p.categorySlug === c.slug).length);
		}
		return map;
	});

	const certifiedByCategory = $derived.by(() => {
		const map = new SvelteMap<string, number>();
		for (const c of productCategories) {
			map.set(
				c.slug,
				allProducts.filter((p) => p.categorySlug === c.slug && p.certStatus === 'certified').length
			);
		}
		return map;
	});

	// Category filter — 'all' shows everything
	let activeCategory = $state('all');
	let query = $state('');
	const filtered = $derived(
		allProducts.filter((p) => {
			if (activeCategory !== 'all' && p.categorySlug !== activeCategory) return false;
			const q = query.trim().toLowerCase();
			if (q && !(p.name ?? '').toLowerCase().includes(q)) return false;
			return true;
		})
	);

	const PAGE_SIZE = 12;
	let page = $state(1);
	const totalPages = $derived(Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)));
	const paged = $derived(filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE));
	$effect(() => {
		void activeCategory;
		void query;
		page = 1;
	});

	const supplierNames = $derived.by(() => {
		const map = new SvelteMap<string, string>();
		for (const s of (data.suppliers ?? []) as Array<{ slug: string; name: string }>) {
			map.set(s.slug, s.name);
		}
		return map;
	});

	function priceLabel(p: ProductRow): string {
		if (!p.priceMin) return 'Price on request';
		const range = p.priceMax ? `$${p.priceMin}–$${p.priceMax}` : `$${p.priceMin}`;
		return p.priceUnit ? `${range} / ${p.priceUnit}` : range;
	}

	function certBadge(p: ProductRow) {
		if (p.certStatus === 'certified')
			return {
				text: 'Certified',
				cls: 'bg-success/10 text-success border-success/20',
				icon: ShieldCheck
			};
		if (p.certStatus === 'pending')
			return { text: 'Cert pending', cls: 'bg-warn/10 text-warn border-warn/20', icon: Clock3 };
		if (p.certStatus === 'not-certified')
			return {
				text: 'Not certified',
				cls: 'bg-destructive/10 text-destructive border-destructive/20',
				icon: CircleDashed
			};
		return null;
	}

	const markets = [
		{
			region: 'ASEAN',
			countries: 'Malaysia, Indonesia, Singapore, Thailand, Philippines',
			cls: 'bg-info/10 text-info'
		},
		{
			region: 'GCC',
			countries: 'Saudi Arabia, UAE, Qatar, Kuwait, Bahrain, Oman',
			cls: 'bg-warn/10 text-warn'
		},
		{
			region: 'Türkiye & Central Asia',
			countries: 'Türkiye, Azerbaijan, Kazakhstan, Uzbekistan',
			cls: 'bg-gold/10 text-gold'
		},
		{
			region: 'South Asia',
			countries: 'Pakistan, Bangladesh, India, Sri Lanka',
			cls: 'bg-teal/10 text-teal'
		},
		{
			region: 'Africa',
			countries: 'South Africa, Nigeria, Kenya, Egypt, Morocco',
			cls: 'bg-success/10 text-success'
		},
		{
			region: 'Western Markets',
			countries: 'United States, Canada, EU, UK, Australia',
			cls: 'bg-primary/10 text-primary'
		}
	];
</script>

<Breadcrumb items={[{ label: 'Products', href: '/products' }]} />

<svelte:head>
	<!-- Structured Data: Breadcrumb -->
	{@html `\u003cscript type="application/ld+json">${JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: [
			{ '@type': 'ListItem', position: 1, name: 'Home', item: 'https://halalneo.com/' },
			{ '@type': 'ListItem', position: 2, name: 'Products', item: 'https://halalneo.com/products' }
		]
	})}\u003c/script>`}

	<!-- Structured Data: Product Schema (for top products) -->
	{#if allProducts.length > 0}
		{@html `\u003cscript type="application/ld+json">${JSON.stringify({
			'@context': 'https://schema.org',
			'@type': 'Product',
			name: allProducts[0].name,
			image: allProducts[0].image,
			description: 'Verified halal-certified products from certified suppliers',
			sku: allProducts[0].slug,
			brand: { '@type': 'Brand', name: 'HalalNeo' },
			offset: allProducts[0].priceMin ? `Price: $${allProducts[0].priceMin}` : 'Price on request'
		})}\u003c/script>`}
	{/if}
</svelte:head>

<section class="space-y-4 sm:space-y-6">
	<div class="max-w-2xl space-y-1">
		<h1 class="text-xl font-semibold tracking-tight sm:text-2xl">Halal product catalogue</h1>
		<p class="max-w-2xl text-xs text-muted-foreground sm:text-sm">
			{allProducts.length} halal-certified products from verified suppliers — filter by category, check
			certification scope and pricing at a glance.
		</p>
	</div>

	<!-- Product Categories -->
	<div class="space-y-2 sm:space-y-3">
		<div>
			<h2 class="text-sm font-semibold sm:text-base">Product categories</h2>
			<p class="text-xs text-muted-foreground">Halal-certified products across these categories.</p>
		</div>
		<div class="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
			{#each productCategories as cat, i (cat.slug)}
				<Button
					type="button"
					variant="outline"
					onclick={() => (activeCategory = activeCategory === cat.slug ? 'all' : cat.slug)}
					aria-pressed={activeCategory === cat.slug}
					class="h-full w-full border-0 bg-transparent p-0 text-start shadow-none"
				>
					<Card
						hoverable
						class={`h-full w-full p-3 transition-shadow group-hover:shadow-md sm:p-4 ${activeCategory === cat.slug ? 'ring-2 ring-primary' : ''}`}
					>
						<CardContent class="flex items-center gap-2.5 p-0 sm:gap-3">
							<div
								class="flex size-9 shrink-0 items-center justify-center rounded-lg sm:size-10 {TILE_COLORS[
									i % TILE_COLORS.length
								]}"
							>
								<Icon
									name={cat.icon ?? 'Package'}
									verified={(certifiedByCategory.get(cat.slug) ?? 0) > 0}
									class="size-4 sm:size-5"
								/>
							</div>
							<div class="min-w-0">
								<h3
									class="truncate text-xs font-medium transition-colors group-hover:text-primary sm:text-sm"
								>
									{cat.name}
								</h3>
								<p class="mt-0.5 text-2xs text-muted-foreground sm:text-xs">
									{certByCategory.get(cat.slug) ?? 0} product{(certByCategory.get(cat.slug) ??
										0) === 1
										? ''
										: 's'}
								</p>
							</div>
						</CardContent>
					</Card>
				</Button>
			{/each}
		</div>
	</div>

	<!-- Product grid -->
	<div class="space-y-2 sm:space-y-3">
		<div class="flex flex-wrap items-end justify-between gap-2">
			<div>
				<h2 class="text-sm font-semibold sm:text-base">
					{activeCategory === 'all'
						? 'All products'
						: (productCategories.find((c) => c.slug === activeCategory)?.name ?? 'Products')}
				</h2>
				<p class="text-xs text-muted-foreground" role="status" aria-live="polite">
					{filtered.length} listing{filtered.length === 1 ? '' : 's'}
				</p>
			</div>
			{#if activeCategory !== 'all' || query.trim()}
				<Button
					variant="outline"
					size="sm"
					class="text-2xs"
					onclick={() => {
						activeCategory = 'all';
						query = '';
					}}
				>
					Clear filters
				</Button>
			{/if}
		</div>
		<div class="relative w-full sm:max-w-xs">
			<label for="product-search" class="sr-only">Search products by name</label>
			<SearchIcon class="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
			<Input
				id="product-search"
				bind:value={query}
				type="search"
				placeholder="Search products by name..."
				class="ps-9"
			/>
		</div>

		{#if data.loadError && paged.length === 0}
			<ErrorRetry failure={data.loadError} subject="products" />
		{:else if paged.length === 0}
			<Empty>
				<EmptyHeader>
					<BrandedEmptyMedia
						><Package class="size-6 text-muted-foreground"></Package></BrandedEmptyMedia
					>
					<EmptyTitle
						>{query.trim()
							? `No products match "${query.trim()}"`
							: activeCategory !== 'all'
								? 'No products match these filters'
								: 'No products in this category yet'}</EmptyTitle
					>
					<EmptyDescription
						>New listings are added as suppliers onboard during test mode.</EmptyDescription
					>
				</EmptyHeader>
				<EmptyContent>
					{#if query.trim() || activeCategory !== 'all'}
						<Button
							variant="outline"
							size="sm"
							onclick={() => {
								activeCategory = 'all';
								query = '';
							}}>Clear filters</Button
						>
					{:else}
						<Button size="sm" href={localizeHref('/rfqs/new')}>Post a buying request</Button>
					{/if}
					<Button variant="link" size="sm" href={localizeHref('/suppliers')}
						>Browse suppliers instead</Button
					>
				</EmptyContent>
			</Empty>
		{:else}
			<div class="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
				{#each paged as p (p.slug)}
					{@const cert = certBadge(p)}
					<a
						href={localizeHref(`/product/${p.slug}`)}
						class="group press-scale flex h-full flex-col rounded-xl bg-card ring-1 ring-foreground/10 transition-[transform,box-shadow] duration-base ease-spring hover:-translate-y-0.5 hover:shadow-md"
					>
						<div class="relative aspect-[16/10] overflow-hidden rounded-t-xl bg-muted">
							{#if p.image}
								<img
									src={p.image}
									alt={p.name}
									class="h-full w-full object-cover transition-transform duration-slow group-hover:scale-105"
									loading="lazy"
									decoding="async"
									width="320"
									height="200"
								/>
							{:else}
								<div
									class="flex h-full w-full items-center justify-center {TILE_COLORS[
										(p.slug?.length ?? 0) % TILE_COLORS.length
									]}"
								>
									<Icon name="Package" class="size-7 opacity-60" />
								</div>
							{/if}
							{#if cert}
								<span
									class="absolute start-1.5 top-1.5 inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-2xs font-semibold {cert.cls}"
								>
									<cert.icon class="size-2.5"></cert.icon>
									{cert.text}
								</span>
							{/if}
						</div>
						<div class="flex flex-1 flex-col gap-1 p-2.5 sm:p-3">
							<h3
								class="truncate text-xs leading-snug font-medium transition-colors group-hover:text-primary sm:text-sm"
							>
								{p.name}
							</h3>
							{#if p.moq}
								<p class="hidden text-2xs text-muted-foreground sm:block">MOQ: {p.moq}</p>
							{/if}
							<div class="mt-auto flex items-center justify-between gap-1.5 pt-1">
								<span class="truncate text-2xs-plus font-semibold text-primary"
									>{priceLabel(p)}</span
								>
								<span class="max-w-[45%] truncate text-2xs text-muted-foreground">
									{supplierNames.get(p.supplierSlug ?? '') ?? p.supplierSlug}
								</span>
							</div>
						</div>
					</a>
				{/each}
			</div>
			<Paginator bind:page {totalPages} />
		{/if}
	</div>

	<!-- Target Markets -->
	<div class="space-y-2 sm:space-y-3">
		<div>
			<h2 class="text-sm font-semibold sm:text-base">Target markets</h2>
			<p class="text-xs text-muted-foreground">
				Products available for import across these regions.
			</p>
		</div>
		<div class="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3">
			{#each markets as market (market.region)}
				<Card class="p-3 sm:p-4">
					<div class="flex items-center gap-2">
						<div class="flex size-7 shrink-0 items-center justify-center rounded-lg {market.cls}">
							<MapPin class="size-3.5"></MapPin>
						</div>
						<h3 class="truncate text-xs font-semibold sm:text-sm">{market.region}</h3>
					</div>
					<p class="mt-1.5 line-clamp-2 text-2xs text-muted-foreground sm:text-xs">
						{market.countries}
					</p>
				</Card>
			{/each}
		</div>
	</div>
</section>
