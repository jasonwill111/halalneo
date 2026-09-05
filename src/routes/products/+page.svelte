<script lang="ts">
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Card, CardContent, CardHeader, CardTitle } from '#lib/components/ui/card/index.js';
	import Package from '@lucide/svelte/icons/package';
	import Breadcrumb from '#lib/components/site/breadcrumb.svelte';

	let { data } = $props();

	// Categories come from D1 via the page loader (same source as the API).
	// Category hero images are static art mapped by canonical slug.
	const catImages: Record<string, string> = {
		'food-beverages': '/api/media/cat-food-beverages.webp',
		'cosmetics-personal-care': '/api/media/cat-cosmetics.webp',
		'nutritional-supplements': '/api/media/cat-supplements.webp',
		'meat-poultry': '/api/media/cat-meat-poultry.webp',
		'dairy-eggs': '/api/media/cat-dairy-eggs.webp',
		'confectionery-snacks': '/api/media/cat-confectionery.webp',
		'beverages': '/api/media/cat-beverages.webp'
	};

	const productCategories = $derived((data.categories ?? []) as { slug: string; name: string; description: string }[]);

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
	<div class="rounded-xl ring-1 ring-foreground/10 bg-card p-6 text-center sm:p-8">
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
		<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
			{#each productCategories as cat}
				<article class="rounded-xl ring-1 ring-foreground/10 bg-card overflow-hidden">
					{#if catImages[cat.slug]}
						<div class="aspect-[4/3] overflow-hidden">
							<img src={catImages[cat.slug]} alt={cat.name} class="h-full w-full object-cover" loading="lazy" decoding="async" width="400" height="300" />
						</div>
					{:else}
						<div class="p-4">
							<Package class="size-5 text-primary mb-2" />
						</div>
					{/if}
					<div class="p-4">
						<h3 class="text-sm font-medium">{cat.name}</h3>
						<p class="mt-1 text-xs text-muted-foreground line-clamp-2">{cat.description}</p>
					</div>
				</article>
			{/each}
		</div>

		<!-- Target Markets -->
	<div class="space-y-4">
		<div>
			<h2 class="text-lg font-semibold">Target markets</h2>
			<p class="text-xs text-muted-foreground">Products available for import across these regions.</p>
		</div>
		<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
			{#each markets as market}
				<article class="rounded-xl ring-1 ring-foreground/10 bg-card p-4">
					<h3 class="text-sm font-semibold">{market.region}</h3>
					<p class="mt-1 text-xs text-muted-foreground">{market.countries}</p>
				</article>
			{/each}
		</div>
	</div>
</section>
