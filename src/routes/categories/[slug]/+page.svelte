<script lang="ts">
	import { localizeHref } from '$lib/paraglide/runtime.js';
	import { adminData, getCategory, getMerchant } from '$lib/stores/admin-data.svelte';
	import Icon from '$lib/components/site/icon.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '$lib/components/ui/card';
	import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '$lib/components/ui/breadcrumb';
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
	import { error } from '@sveltejs/kit';

	let { params } = $props();

	const category = $derived(getCategory(params.slug));
	const products = $derived(category ? adminData.skus.filter((s) => s.categorySlug === category.slug) : []);

	$effect(() => {
		if (!category) error(404, 'Category not found');
	});
</script>

<svelte:head><title>{category?.name ?? 'Category'} — HalalNeo</title></svelte:head>

{#if category}
	<section class="space-y-8">
		<Breadcrumb>
			<BreadcrumbList>
				<BreadcrumbItem>
					<BreadcrumbLink href={localizeHref('/categories')}>Categories</BreadcrumbLink>
				</BreadcrumbItem>
				<BreadcrumbSeparator />
				<BreadcrumbItem>
					<BreadcrumbPage>{category.name}</BreadcrumbPage>
				</BreadcrumbItem>
			</BreadcrumbList>
		</Breadcrumb>

		<div class="flex items-start gap-4">
			<div class="flex size-12 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
				<Icon name={category.icon} class="size-6"></Icon>
			</div>
			<div class="space-y-1">
				<h1 class="text-3xl font-semibold tracking-tight">{category.name}</h1>
				<p class="max-w-2xl text-muted-foreground">{category.description}</p>
			</div>
		</div>

		<div class="space-y-4">
			<h2 class="text-lg font-semibold">
				{products.length} product{products.length === 1 ? '' : 's'}
			</h2>
			<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{#each products as product}
					{@const merchant = getMerchant(product.merchantSlug)}
					<Card>
						<CardHeader class="gap-3">
							<div class="flex items-center justify-between">
								<Badge
									variant={product.certStatus === 'certified' ? 'default' : product.certStatus === 'pending' ? 'secondary' : 'destructive'}
								>
									{product.certStatus}
								</Badge>
								<span class="text-sm font-medium text-muted-foreground">{product.originCountry}</span>
							</div>
							<div class="space-y-1">
								<CardTitle class="text-base">{product.name}</CardTitle>
								<CardDescription>{product.shortDescription}</CardDescription>
							</div>
						</CardHeader>
						<CardContent class="space-y-3">
							<div class="flex items-center justify-between text-sm">
								<span class="text-muted-foreground">MOQ</span>
								<span class="font-medium">{product.moq}</span>
							</div>
							<div class="flex items-center justify-between text-sm">
								<span class="text-muted-foreground">Price</span>
								<span class="font-medium">{product.priceRange}</span>
							</div>
							{#if merchant}
								<p class="text-sm text-muted-foreground">
									by <span class="font-medium text-foreground">{merchant.name}</span>
									· {merchant.country}
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
		</div>
	</section>
{/if}