<script lang="ts">
	import { localizeHref } from '$lib/paraglide/runtime.js';
	import { getSku, getMerchant, getCategory } from '$lib/stores/admin-data.svelte';
	import Icon from '$lib/components/site/icon.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '$lib/components/ui/breadcrumb';
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import CheckCircle from '@lucide/svelte/icons/check-circle';
	import { error } from '@sveltejs/kit';

	let { params } = $props();

	const sku = $derived(getSku(params.slug));
	const merchant = $derived(sku ? getMerchant(sku.merchantSlug) : undefined);
	const category = $derived(sku ? getCategory(sku.categorySlug) : undefined);

	$effect(() => {
		if (!sku) error(404, 'Product not found');
	});
</script>

<svelte:head><title>{sku?.name ?? 'Product'} — HalalNeo</title></svelte:head>

{#if sku && merchant && category}
	<section class="space-y-8">
		<Breadcrumb>
			<BreadcrumbList>
				<BreadcrumbItem>
					<BreadcrumbLink href={localizeHref('/products')}>Products</BreadcrumbLink>
				</BreadcrumbItem>
				<BreadcrumbSeparator />
				<BreadcrumbItem>
					<BreadcrumbLink href={localizeHref(`/categories/${category.slug}`)}>
						{category.name}
					</BreadcrumbLink>
				</BreadcrumbItem>
				<BreadcrumbSeparator />
				<BreadcrumbItem>
					<BreadcrumbPage>{sku.name}</BreadcrumbPage>
				</BreadcrumbItem>
			</BreadcrumbList>
		</Breadcrumb>

		<div class="grid gap-8 lg:grid-cols-[1fr_380px]">
			<div class="space-y-6">
				<div class="space-y-3">
					<div class="flex items-center gap-2">
						<div class="flex size-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
							<Icon name={category.icon} class="size-5"></Icon>
						</div>
						<Badge
							variant={sku.certStatus === 'certified' ? 'default' : sku.certStatus === 'pending' ? 'secondary' : 'destructive'}
						>
							{sku.certStatus}
						</Badge>
					</div>
					<h1 class="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
						{sku.name}
					</h1>
					<p class="max-w-2xl text-lg text-muted-foreground">{sku.shortDescription}</p>
				</div>

				<Card>
					<CardHeader>
						<CardTitle class="text-base">Product specifications</CardTitle>
					</CardHeader>
					<CardContent class="grid gap-x-8 gap-y-4 sm:grid-cols-2">
						<div class="space-y-1.5">
							<p class="text-sm text-muted-foreground">Origin</p>
							<p class="font-medium">{sku.originCountry}</p>
						</div>
						<div class="space-y-1.5">
							<p class="text-sm text-muted-foreground">Category</p>
							<p class="font-medium">{category.name}</p>
						</div>
						<div class="space-y-1.5">
							<p class="text-sm text-muted-foreground">Units</p>
							<p class="font-medium">{sku.units}</p>
						</div>
						<div class="space-y-1.5">
							<p class="text-sm text-muted-foreground">MOQ</p>
							<p class="font-medium">{sku.moq}</p>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle class="text-base">Key features</CardTitle>
					</CardHeader>
					<CardContent>
						<ul class="space-y-2.5">
							{#each sku.features as feature}
								<li class="flex items-start gap-2 text-sm text-muted-foreground">
									<CheckCircle class="mt-0.5 size-4 shrink-0 text-primary"></CheckCircle>
									<span>{feature}</span>
								</li>
							{/each}
						</ul>
					</CardContent>
				</Card>
			</div>

			<div class="space-y-4 lg:sticky lg:top-24 lg:self-start">
				<Card>
					<CardHeader>
						<CardTitle class="text-base">Pricing</CardTitle>
						<CardDescription>Indicative price range supplied by merchant</CardDescription>
					</CardHeader>
					<CardContent class="space-y-3">
						<div class="flex items-center justify-between text-sm">
							<span class="text-muted-foreground">Price range</span>
							<span class="font-medium">{sku.priceRange}</span>
						</div>
						<div class="flex items-center justify-between text-sm">
							<span class="text-muted-foreground">Minimum order</span>
							<span class="font-medium">{sku.moq}</span>
						</div>
						<Button variant="default" class="w-full">
							Request quote
							<ArrowUpRight class="size-4" data-icon="inline-end"></ArrowUpRight>
						</Button>
						<p class="text-center text-xs text-muted-foreground">
							Demo only — quoting coming with auth.
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardContent class="space-y-3 pt-6">
						<div class="flex items-center gap-3">
							<div class="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
								{merchant.logoInitials}
							</div>
							<div class="min-w-0">
								<p class="truncate font-medium">{merchant.name}</p>
								<p class="truncate text-sm text-muted-foreground">
									{merchant.country} · {merchant.businessType}
								</p>
							</div>
						</div>
						<Button href={localizeHref(`/suppliers/${merchant.slug}`)} variant="outline" size="sm" class="w-full">
							View supplier
							<ArrowUpRight class="size-4" data-icon="inline-end"></ArrowUpRight>
						</Button>
					</CardContent>
				</Card>
			</div>
		</div>

		<div>
			<Button href={localizeHref(`/categories/${category.slug}`)} variant="ghost" size="sm">
				<ArrowLeft class="size-4"></ArrowLeft>
				More from {category.name}
			</Button>
		</div>
	</section>
{/if}