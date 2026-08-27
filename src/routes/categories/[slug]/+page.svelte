<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '#lib/components/ui/card/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';

	let { data } = $props();
</script>

<svelte:head>
	<title>{data.seo.title}</title>
	<meta name="description" content={data.seo.description} />
</svelte:head>

<div class="container mx-auto max-w-7xl px-4 py-8">
	{#if data.item}
		<header class="space-y-2 mb-8">
			<h1 class="text-3xl font-bold tracking-tight">{data.item.name}</h1>
			<p class="text-muted-foreground">{data.item.description}</p>
			<div class="flex flex-wrap gap-2">
				<Badge>{data.item.productCount} products</Badge>
			</div>
		</header>

		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each data.item.products as product}
				<Card>
					<CardHeader>
						<CardTitle class="text-lg">{product.name}</CardTitle>
					</CardHeader>
					<CardContent class="space-y-3">
						<p class="text-sm text-muted-foreground">{product.description}</p>
						<Button href={`/products/${product.slug}`} variant="outline" size="sm">
							View Details
						</Button>
					</CardContent>
				</Card>
			{/each}
		</div>
	{:else}
		<div class="flex min-h-[50vh] items-center justify-center">
			<div class="text-center space-y-4">
				<p class="text-muted-foreground text-lg">Category details coming soon.</p>
				<Button href="/categories" variant="outline">Browse Categories</Button>
			</div>
		</div>
	{/if}
</div>
