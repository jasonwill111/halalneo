<script lang="ts">
	import { localizeHref } from '$lib/paraglide/runtime.js';
	import { adminData, getMerchant, getCategory } from '$lib/stores/admin-data.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Badge } from '$lib/components/ui/badge';
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';

	let query = $state('');

	const filtered = $derived(
		adminData.skus.filter((s) => {
			const q = query.trim().toLowerCase();
			if (!q) return true;
			return (
				s.name.toLowerCase().includes(q) ||
				s.shortDescription.toLowerCase().includes(q) ||
				s.originCountry.toLowerCase().includes(q) ||
				s.features.some((f) => f.toLowerCase().includes(q))
			);
		})
	);
</script>

<svelte:head><title>Products �?HalalNeo</title></svelte:head>

<section class="space-y-8">
	<div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
		<div class="max-w-2xl space-y-2">
			<h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">Certified products</h1>
			<p class="text-muted-foreground">
				{adminData.skus.length} SKUs sourced from {new Set(adminData.skus.map((s) => s.merchantSlug)).size} certified
				suppliers.
			</p>
		</div>
		<div class="w-full sm:w-72">
			<Input bind:value={query} type="search" placeholder="Filter products" />
		</div>
	</div>

	<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
		{#each filtered as product}
			{@const merchant = getMerchant(product.merchantSlug)}
			{@const category = getCategory(product.categorySlug)}
			<Card hoverable>
				<CardHeader class="gap-3">
					<div class="flex items-center justify-between">
						<Badge
							variant={product.certStatus === 'certified' ? 'default' : product.certStatus === 'pending' ? 'secondary' : 'destructive'}
						>
							{product.certStatus}
						</Badge>
						<Badge variant="outline">{category?.name ?? product.categorySlug}</Badge>
					</div>
					<div class="space-y-1">
						<CardTitle class="text-base">{product.name}</CardTitle>
						<CardDescription>{product.shortDescription}</CardDescription>
					</div>
				</CardHeader>
				<CardContent class="space-y-3">
					<div class="space-y-1.5 rounded-lg bg-muted p-3 text-sm">
						<div class="flex items-center justify-between">
							<span class="text-muted-foreground">MOQ</span>
							<span class="font-medium">{product.moq}</span>
						</div>
						<div class="flex items-center justify-between">
							<span class="text-muted-foreground">Price</span>
							<span class="font-medium">{product.priceRange}</span>
						</div>
						<div class="flex items-center justify-between">
							<span class="text-muted-foreground">Origin</span>
							<span class="font-medium">{product.originCountry}</span>
						</div>
					</div>
					{#if merchant}
						<p class="text-sm text-muted-foreground">
							by <span class="font-medium text-foreground">{merchant.name}</span>
						</p>
					{/if}
					<Button href={localizeHref(`/products/${product.slug}`)} variant="outline" size="sm" class="w-full">
						View product
						<ArrowUpRight class="size-4" data-icon="inline-end"></ArrowUpRight>
					</Button>
				</CardContent>
			</Card>
		{/each}
	</div>

	{#if filtered.length === 0}
		<p class="py-10 text-center text-muted-foreground">No products match “{query}�?</p>
	{/if}
</section>