<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '#lib/components/ui/card/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { localizeHref } from '#lib/paraglide/runtime.js';

	let { data } = $props();
	const category = $derived(data.category);
	const products = $derived(data.products ?? []);
</script>

<div class="container mx-auto max-w-7xl px-4 py-8">
	<header class="mb-8 space-y-2">
		<h1 class="text-3xl font-bold tracking-tight">{category?.name ?? data.slug}</h1>
		{#if category?.description}
			<p class="text-muted-foreground">{category.description}</p>
		{/if}
		<Badge variant="secondary">{products.length} products</Badge>
	</header>

	{#if products.length > 0}
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each products as product}
				<Card hoverable>
					<CardHeader>
						<CardTitle class="text-lg">{product.name}</CardTitle>
					</CardHeader>
					<CardContent class="space-y-3">
						{#if product.shortDescription}
							<p class="text-sm text-muted-foreground">{product.shortDescription}</p>
						{/if}
						{#if product.priceMin}
							<p class="text-sm font-semibold text-primary">
								${product.priceMin}{product.priceMax ? ` - $${product.priceMax}` : ''}
							</p>
						{/if}
						<Button href={localizeHref(`/products/${product.slug}`)} variant="outline" size="sm">
							View Details
						</Button>
					</CardContent>
				</Card>
			{/each}
		</div>
	{:else}
		<div class="flex min-h-[30vh] items-center justify-center">
			<p class="text-sm text-muted-foreground">No products in this category yet.</p>
		</div>
	{/if}
</div>
