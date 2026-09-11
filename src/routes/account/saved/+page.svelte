<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Tabs, TabsList, TabsTrigger } from '#lib/components/ui/tabs/index.js';
	import Box from '@lucide/svelte/icons/box';
	import { getFavorites, toggleFavorite } from '#lib/favorites.js';
	import { onMount } from 'svelte';

	interface SavedItem {
		type: 'product' | 'supplier';
		name: string;
		subtitle: string;
		price?: string;
		badge: string;
		href: string;
		slug: string;
	}

	// Reactive favorites list — re-reads from localStorage when modified
	let favorites = $state<string[]>([]);
	// Product catalogue from D1 (cached API) — resolves saved slugs to display data.
	// $state.raw: only ever reassigned, never deep-mutated (reads use .find).
	let catalog = $state.raw<any[]>([]);
	// Server-backed follows (login) — supplier directory info joined by API.
	let following = $state<any[]>([]);

	onMount(async () => {
		favorites = getFavorites();
		try {
			const res = await fetch('/api/products?limit=100');
			if (res.ok) catalog = ((((await res.json()) as any)).items ?? []);
		} catch {
			catalog = [];
		}
		try {
			const fres = await fetch('/api/follows');
			if (fres.ok) following = (((await fres.json()) as any).items ?? []);
		} catch {
			following = [];
		}
	});

	async function unfollow(slug: string) {
		try {
			const res = await fetch(`/api/follows?supplierSlug=${encodeURIComponent(slug)}`, { method: 'DELETE' });
			if (res.ok) following = following.filter((f) => f.supplierSlug !== slug);
		} catch {
			// silent
		}
	}

	const savedItems = $derived.by(() => {
		const items: SavedItem[] = [];
		for (const slug of favorites) {
			const product = catalog.find((p) => p.slug === slug);
			if (product) {
				const priceDisplay = product.priceMin
					? `$${product.priceMin}${product.priceMax ? ` - $${product.priceMax}` : ''}${product.priceUnit ? ` / ${product.priceUnit}` : ''}`
					: undefined;
				items.push({
					type: 'product',
					name: product.name,
					subtitle: product.shortDescription,
					price: priceDisplay,
					badge: product.categorySlug,
					href: `/product/${product.slug}`,
					slug: product.slug
				});
			}
		}
		return items;
	});

	function removeFavorite(slug: string) {
		toggleFavorite(slug);
		favorites = getFavorites();
	}

	let tab = $state('products');
	const productCount = $derived(savedItems.filter((i) => i.type === 'product').length);
	const supplierCount = $derived(savedItems.filter((i) => i.type === 'supplier').length);
	const filtered = $derived(tab === 'products' ? savedItems.filter((i) => i.type === 'product') : savedItems.filter((i) => i.type === 'supplier'));
</script>

<svelte:head>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="flex-1">
	<Tabs bind:value={tab} class="mb-3">
		<TabsList variant="line">
			<TabsTrigger value="products">Products <span class="ml-1 opacity-70">({productCount})</span></TabsTrigger>
			<TabsTrigger value="suppliers">Suppliers <span class="ml-1 opacity-70">({supplierCount})</span></TabsTrigger>
			<TabsTrigger value="following">Following <span class="ml-1 opacity-70">({following.length})</span></TabsTrigger>
		</TabsList>
	</Tabs>

	{#if tab === 'following'}
		{#if following.length === 0}
			<div class="rounded-xl bg-card p-8 text-center ring-1 ring-foreground/10">
				<Box class="mx-auto size-8 text-muted-foreground/30"></Box>
				<p class="mt-2 text-[11px] text-muted-foreground">You're not following any suppliers yet.</p>
			</div>
		{:else}
			<div class="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
				{#each following as f (f.supplierSlug)}
					<article class="group relative rounded-xl bg-card p-2.5 ring-1 ring-foreground/10 transition-all hover:shadow-md">
						<a href={`/supplier/${f.supplierSlug}`} class="block">
							<div class="mb-2 flex h-20 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary">
								{f.logoInitials ?? (f.name ?? '?').slice(0, 2).toUpperCase()}
							</div>
							<h3 class="line-clamp-2 text-xs font-medium transition-colors group-hover:text-primary">{f.name ?? f.supplierSlug}</h3>
							{#if f.country}
								<p class="mt-0.5 line-clamp-1 text-[10px] text-muted-foreground">{f.country}</p>
							{/if}
						</a>
						<Button
							variant="ghost"
							size="sm"
							class="mt-1.5 h-6 text-[10px] text-muted-foreground hover:text-destructive"
							onclick={() => unfollow(f.supplierSlug)}
						>
							Unfollow
						</Button>
					</article>
				{/each}
			</div>
		{/if}
	{:else if filtered.length === 0}
		<div class="rounded-xl bg-card p-8 text-center ring-1 ring-foreground/10">
			<Box class="mx-auto size-8 text-muted-foreground/30"></Box>
			<p class="mt-2 text-[11px] text-muted-foreground">No saved items yet.</p>
		</div>
	{:else}
		<div class="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
			{#each filtered as item (item.slug)}
				<article class="group relative rounded-xl bg-card p-2.5 ring-1 ring-foreground/10 transition-all hover:shadow-md">
					<a href={item.href} class="block">
						<div class="mb-2 flex h-20 items-center justify-center rounded-md bg-muted text-muted-foreground/30">
							<Box class="size-6"></Box>
						</div>
						<Badge variant="secondary" class="px-1.5 text-[10px]">{item.badge}</Badge>
						<h3 class="mt-1.5 line-clamp-2 text-xs font-medium transition-colors group-hover:text-primary">{item.name}</h3>
						{#if item.price}
							<p class="mt-1 text-xs font-bold text-primary">{item.price}</p>
						{/if}
						<p class="mt-0.5 line-clamp-1 text-[10px] text-muted-foreground">{item.subtitle}</p>
					</a>
					<Button
						variant="ghost"
						size="sm"
						class="absolute top-2 right-2 h-6 px-1.5 text-[10px] text-muted-foreground opacity-0 transition-opacity hover:bg-transparent hover:text-destructive group-hover:opacity-100"
						onclick={(e) => {
							e.preventDefault();
							removeFavorite(item.slug);
						}}
					>
						Remove
					</Button>
				</article>
			{/each}
		</div>
	{/if}
</div>
