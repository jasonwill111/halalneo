<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import Box from '@lucide/svelte/icons/box';
	import { getFavorites, toggleFavorite } from '#lib/favorites.js';
	import { products } from '#lib/data/products.js';

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

	$effect(() => {
		favorites = getFavorites();
	});

	const savedItems = $derived.by(() => {
		const items: SavedItem[] = [];
		for (const slug of favorites) {
			const product = products.find((p) => p.slug === slug);
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
					href: `/products/${product.slug}`,
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
	const filtered = $derived(tab === 'products' ? savedItems.filter((i) => i.type === 'product') : savedItems.filter((i) => i.type === 'supplier'));
</script>

<svelte:head>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="flex-1">
	<div class="mb-2 flex gap-1">
		<Button variant="ghost" size="sm" onclick={() => (tab = 'products')} class={`rounded-lg px-2 py-0.5 text-[11px] font-medium ${tab === 'products' ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}>
			Products ({savedItems.filter((i) => i.type === 'product').length})
		</Button>
		<Button variant="ghost" size="sm" onclick={() => (tab = 'suppliers')} class={`rounded-lg px-2 py-0.5 text-[11px] font-medium ${tab === 'suppliers' ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}>
			Suppliers ({savedItems.filter((i) => i.type === 'supplier').length})
		</Button>
	</div>

	{#if filtered.length === 0}
		<div class="rounded-xl bg-card p-8 text-center shadow-sm">
			<Box class="mx-auto size-8 text-muted-foreground/30"></Box>
			<p class="mt-2 text-[11px] text-muted-foreground">No saved items yet.</p>
		</div>
	{:else}
		<div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
			{#each filtered as item (item.slug)}
				<a href={item.href} class="group rounded-xl bg-card p-2 shadow-sm transition-all hover:shadow-md">
					<div class="mb-1 h-16 rounded bg-muted flex items-center justify-center text-muted-foreground/30">
						<Box class="size-6"></Box>
					</div>
					<div class="flex items-center gap-0.5">
						<Badge variant="secondary" class="px-1 text-[8px]">{item.badge}</Badge>
					</div>
					<h3 class="mb-0.5 mt-1 text-[10px] font-medium line-clamp-2 group-hover:text-primary transition-colors">{item.name}</h3>
					{#if item.price}
						<div class="flex items-baseline gap-0.5">
							<span class="text-[10px] font-bold text-primary">{item.price}</span>
						</div>
					{/if}
				<p class="mt-0.5 text-[9px] text-muted-foreground">{item.subtitle}</p>
				<Button variant="ghost" size="sm" class="mt-0.5 h-auto p-0 text-[8px] text-muted-foreground hover:underline" onclick={(e) => { e.preventDefault(); removeFavorite(item.slug); }}>Remove</Button>
				</a>
			{/each}
		</div>
	{/if}
</div>
