<script lang="ts">
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Card, CardContent } from '#lib/components/ui/card/index.js';
	import Icon from '#lib/components/site/icon.svelte';
	import Breadcrumb from '#lib/components/site/breadcrumb.svelte';
	import Paginator from '#lib/components/site/paginator.svelte';
	import { TILE_COLORS } from '#lib/utils/tile-colors.js';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import Clock3 from '@lucide/svelte/icons/clock-3';
	import CircleDashed from '@lucide/svelte/icons/circle-dashed';
	import MapPin from '@lucide/svelte/icons/map-pin';
	import Package from '@lucide/svelte/icons/package';

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
	const productCategories = $derived((data.categories ?? []) as { slug: string; name: string; description: string; icon: string }[]);

	const certByCategory = $derived.by(() => {
		const map = new Map<string, number>();
		for (const c of productCategories) {
			map.set(
				c.slug,
				allProducts.filter((p) => p.categorySlug === c.slug).length
			);
		}
		return map;
	});

	// Category filter — 'all' shows everything
	let activeCategory = $state('all');
	const filtered = $derived(
		activeCategory === 'all' ? allProducts : allProducts.filter((p) => p.categorySlug === activeCategory)
	);

	const PAGE_SIZE = 12;
	let page = $state(1);
	const totalPages = $derived(Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)));
	const paged = $derived(filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE));
	$effect(() => {
		activeCategory;
		page = 1;
	});

	const supplierNames = $derived.by(() => {
		const map = new Map<string, string>();
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
		if (p.certStatus === 'certified') return { text: 'Certified', cls: 'bg-success/10 text-success border-success/20', icon: ShieldCheck };
		if (p.certStatus === 'pending') return { text: 'Cert pending', cls: 'bg-warn/10 text-warn border-warn/20', icon: Clock3 };
		if (p.certStatus === 'not-certified') return { text: 'Not certified', cls: 'bg-destructive/10 text-destructive border-destructive/20', icon: CircleDashed };
		return null;
	}

	const markets = [
		{ region: 'ASEAN', countries: 'Malaysia, Indonesia, Singapore, Thailand, Philippines', cls: 'bg-info/10 text-info' },
		{ region: 'GCC', countries: 'Saudi Arabia, UAE, Qatar, Kuwait, Bahrain, Oman', cls: 'bg-warn/10 text-warn' },
		{ region: 'Türkiye & Central Asia', countries: 'Türkiye, Azerbaijan, Kazakhstan, Uzbekistan', cls: 'bg-accent-rose/10 text-accent-rose' },
		{ region: 'South Asia', countries: 'Pakistan, Bangladesh, India, Sri Lanka', cls: 'bg-accent-purple/10 text-accent-purple' },
		{ region: 'Africa', countries: 'South Africa, Nigeria, Kenya, Egypt, Morocco', cls: 'bg-success/10 text-success' },
		{ region: 'Western Markets', countries: 'United States, Canada, EU, UK, Australia', cls: 'bg-primary/10 text-primary' }
	];
</script>

<Breadcrumb items={[{ label: 'Products', href: '/products' }]} />

<svelte:head>
	{@html `<script type="application/ld+json">${JSON.stringify(data.itemList)}</script>`}
</svelte:head>

<section class="space-y-6">
	<div class="max-w-2xl space-y-2">
		<h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">Halal product catalogue</h1>
		<p class="text-muted-foreground">
			{allProducts.length} halal-certified products from verified suppliers — filter by category, check certification scope and pricing at a glance.
		</p>
	</div>

	<!-- Product Categories -->
	<div class="space-y-4">
		<div>
			<h2 class="text-lg font-semibold">Product categories</h2>
			<p class="text-xs text-muted-foreground">Halal-certified products across these categories.</p>
		</div>
		<div class="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
			{#each productCategories as cat, i (cat.slug)}
				<button
					type="button"
					onclick={() => (activeCategory = activeCategory === cat.slug ? 'all' : cat.slug)}
					aria-pressed={activeCategory === cat.slug}
					class="group h-full text-left"
				>
					<Card hoverable class={`h-full p-3 transition-shadow group-hover:shadow-md sm:p-4 ${activeCategory === cat.slug ? 'ring-2 ring-primary' : ''}`}>
						<CardContent class="flex items-center gap-2.5 p-0 sm:gap-3">
							<div
								class="flex size-9 shrink-0 items-center justify-center rounded-lg sm:size-10 {TILE_COLORS[
									i % TILE_COLORS.length
								]}"
							>
								<Icon name={cat.icon ?? 'Package'} class="size-4 sm:size-5" />
							</div>
							<div class="min-w-0">
								<h3 class="truncate text-xs font-medium transition-colors group-hover:text-primary sm:text-sm">{cat.name}</h3>
								<p class="mt-0.5 text-[10px] text-muted-foreground sm:text-xs">{certByCategory.get(cat.slug) ?? 0} product{(certByCategory.get(cat.slug) ?? 0) === 1 ? '' : 's'}</p>
							</div>
						</CardContent>
					</Card>
				</button>
			{/each}
		</div>
	</div>

	<!-- Product grid -->
	<div class="space-y-4">
		<div class="flex flex-wrap items-end justify-between gap-2">
			<div>
				<h2 class="text-lg font-semibold">
					{activeCategory === 'all' ? 'All products' : (productCategories.find((c) => c.slug === activeCategory)?.name ?? 'Products')}
				</h2>
				<p class="text-xs text-muted-foreground">{filtered.length} listing{filtered.length === 1 ? '' : 's'}</p>
			</div>
			{#if activeCategory !== 'all'}
				<Button variant="outline" size="sm" class="text-[10px]" onclick={() => (activeCategory = 'all')}>
					Clear filter
				</Button>
			{/if}
		</div>

		{#if paged.length === 0}
			<div class="rounded-xl bg-card p-8 text-center ring-1 ring-foreground/10">
				<Package class="mx-auto mb-2 size-6 text-muted-foreground"></Package>
				<p class="text-sm font-medium">No products in this category yet</p>
				<p class="mt-1 text-xs text-muted-foreground">New listings are added as suppliers onboard during test mode.</p>
			</div>
		{:else}
			<div class="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
				{#each paged as p (p.slug)}
					{@const cert = certBadge(p)}
					<a
						href={localizeHref(`/product/${p.slug}`)}
						class="group flex h-full flex-col rounded-xl bg-card ring-1 ring-foreground/10 transition-all hover:-translate-y-0.5 hover:shadow-md"
					>
						<div class="relative aspect-[16/10] overflow-hidden rounded-t-xl bg-muted">
							{#if p.image}
								<img
									src={p.image}
									alt={p.name}
									class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
									loading="lazy"
									decoding="async"
									width="320"
									height="200"
								/>
							{:else}
								<div class="flex h-full w-full items-center justify-center {TILE_COLORS[(p.slug?.length ?? 0) % TILE_COLORS.length]}">
									<Icon name="Package" class="size-7 opacity-60" />
								</div>
							{/if}
							{#if cert}
								<span class="absolute top-1.5 left-1.5 inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[9px] font-semibold backdrop-blur-sm {cert.cls} bg-background/80">
									<cert.icon class="size-2.5"></cert.icon>
									{cert.text}
								</span>
							{/if}
						</div>
						<div class="flex flex-1 flex-col gap-1 p-2.5 sm:p-3">
							<h3 class="line-clamp-2 text-xs font-medium leading-snug transition-colors group-hover:text-primary sm:text-sm">
								{p.name}
							</h3>
							{#if p.moq}
								<p class="hidden text-[10px] text-muted-foreground sm:block">MOQ: {p.moq}</p>
							{/if}
							<div class="mt-auto flex items-center justify-between gap-1.5 pt-1">
								<span class="truncate text-[11px] font-semibold text-primary">{priceLabel(p)}</span>
								<span class="max-w-[45%] truncate text-[10px] text-muted-foreground">
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
	<div class="space-y-4">
		<div>
			<h2 class="text-lg font-semibold">Target markets</h2>
			<p class="text-xs text-muted-foreground">Products available for import across these regions.</p>
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
					<p class="mt-1.5 line-clamp-2 text-[10px] text-muted-foreground sm:text-xs">{market.countries}</p>
				</Card>
			{/each}
		</div>
	</div>
</section>
