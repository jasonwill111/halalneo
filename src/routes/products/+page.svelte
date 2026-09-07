<script lang="ts">
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Card, CardContent } from '#lib/components/ui/card/index.js';
	import Icon from '#lib/components/site/icon.svelte';
	import Breadcrumb from '#lib/components/site/breadcrumb.svelte';
	import { TILE_COLORS } from '#lib/utils/tile-colors.js';

	let { data } = $props();

	const productCategories = $derived((data.categories ?? []) as { slug: string; name: string; description: string; icon: string }[]);

	const markets = [
		{ region: 'ASEAN', countries: 'Malaysia, Indonesia, Singapore, Thailand, Philippines' },
		{ region: 'GCC', countries: 'Saudi Arabia, UAE, Qatar, Kuwait, Bahrain, Oman' },
		{ region: 'Türkiye & Central Asia', countries: 'Türkiye, Azerbaijan, Kazakhstan, Uzbekistan' },
		{ region: 'South Asia', countries: 'Pakistan, Bangladesh, India, Sri Lanka' },
		{ region: 'Africa', countries: 'South Africa, Nigeria, Kenya, Egypt, Morocco' },
		{ region: 'Western Markets', countries: 'United States, Canada, EU, United Kingdom, Australia' }
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
			Browse halal-certified products by category, certification, or target market.
		</p>
	</div>

	<!-- Marketplace Coming Soon -->
	<div class="rounded-xl ring-1 ring-foreground/10 bg-card p-4 text-center sm:p-8">
		<Badge variant="secondary" class="mb-3">Coming Soon</Badge>
		<h2 class="text-xl font-semibold tracking-tight">Product listings</h2>
		<p class="mx-auto mt-2 max-w-xl text-muted-foreground">
			We're building a verified product catalogue. Every listing will include certification scope, pricing, MOQ, and origin country — all backed by real certifying body data.
		</p>
		<div class="mt-4">
			<Button href={localizeHref('/register')} size="sm">Join the waitlist</Button>
		</div>
	</div>

	<!-- Product Categories -->
	<div class="space-y-4">
		<div>
			<h2 class="text-lg font-semibold">Product categories</h2>
			<p class="text-xs text-muted-foreground">Halal-certified products across these categories.</p>
		</div>
		<div class="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
			{#each productCategories as cat, i}
				<a href={localizeHref(`/categories/${cat.slug}`)} class="group h-full">
					<Card hoverable class="h-full p-3 transition-shadow group-hover:shadow-md sm:p-4">
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
								<p class="mt-0.5 hidden text-xs text-muted-foreground line-clamp-2 sm:block">{cat.description}</p>
							</div>
						</CardContent>
					</Card>
				</a>
			{/each}
		</div>
	</div>

	<!-- Target Markets -->
	<div class="space-y-4">
		<div>
			<h2 class="text-lg font-semibold">Target markets</h2>
			<p class="text-xs text-muted-foreground">Products available for import across these regions.</p>
		</div>
		<div class="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3">
			{#each markets as market}
				<Card class="p-3 sm:p-4">
					<h3 class="truncate text-xs font-semibold sm:text-sm">{market.region}</h3>
					<p class="mt-0.5 line-clamp-2 text-[10px] text-muted-foreground sm:mt-1 sm:text-xs">{market.countries}</p>
				</Card>
			{/each}
		</div>
	</div>
</section>
