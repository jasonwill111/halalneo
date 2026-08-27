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
		<article class="space-y-8">
			<header class="space-y-2">
				<h1 class="text-3xl font-bold tracking-tight">{data.item.name}</h1>
				<div class="flex flex-wrap gap-2">
					<Badge variant="secondary">{data.item.category}</Badge>
					<Badge variant="outline">{data.item.certification}</Badge>
				</div>
			</header>

			<div class="grid gap-6 md:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>Specifications</CardTitle>
					</CardHeader>
					<CardContent class="space-y-3">
						<p class="text-muted-foreground">{data.item.description}</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Supplier Information</CardTitle>
					</CardHeader>
					<CardContent class="space-y-3">
						<p class="text-muted-foreground">{data.item.supplier}</p>
						<Button variant="outline">Contact Supplier</Button>
					</CardContent>
				</Card>
			</div>
		</article>
	{:else}
		<div class="flex min-h-[50vh] items-center justify-center">
			<div class="text-center space-y-4">
				<p class="text-muted-foreground text-lg">Product details coming soon.</p>
				<Button href="/products" variant="outline">Browse Products</Button>
			</div>
		</div>
	{/if}
</div>
