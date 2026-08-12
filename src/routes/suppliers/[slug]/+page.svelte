<script lang="ts">
	import { localizeHref } from '$lib/paraglide/runtime.js';
	import { adminData, getMerchant, getCategory } from '$lib/stores/admin-data.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table';
	import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '$lib/components/ui/breadcrumb';
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
	import { error } from '@sveltejs/kit';

	let { params } = $props();

	const merchant = $derived(getMerchant(params.slug));
	const products = $derived(merchant ? adminData.skus.filter((s) => s.merchantSlug === merchant.slug) : []);

	$effect(() => {
		if (!merchant) error(404, 'Supplier not found');
	});
</script>

<svelte:head><title>{merchant?.name ?? 'Supplier'} — HalalNeo</title></svelte:head>

{#if merchant}
	<section class="space-y-8">
		<Breadcrumb>
			<BreadcrumbList>
				<BreadcrumbItem>
					<BreadcrumbLink href={localizeHref('/suppliers')}>Suppliers</BreadcrumbLink>
				</BreadcrumbItem>
				<BreadcrumbSeparator />
				<BreadcrumbItem>
					<BreadcrumbPage>{merchant.name}</BreadcrumbPage>
				</BreadcrumbItem>
			</BreadcrumbList>
		</Breadcrumb>

		<div class="space-y-4">
			<div class="flex items-start gap-4">
				<div class="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-lg font-semibold text-primary">
					{merchant.logoInitials}
				</div>
				<div class="space-y-1">
					<div class="flex flex-wrap items-center gap-2">
						<h1 class="text-3xl font-semibold tracking-tight">{merchant.name}</h1>
						<Badge variant={merchant.status === 'active' ? 'default' : 'secondary'}>
							{merchant.status}
						</Badge>
					</div>
					<p class="text-muted-foreground">
						{merchant.country} · {merchant.businessType}
						{merchant.isBrand ? ' · brand' : ''} · Est. {merchant.yearEstablished}
					</p>
				</div>
			</div>
			<p class="max-w-3xl text-muted-foreground">{merchant.description}</p>
		</div>

		<div class="space-y-4">
			<h2 class="text-lg font-semibold">Certifications</h2>
			<Card>
				<CardHeader>
					<CardTitle class="text-base">Halal certification documents</CardTitle>
					<CardDescription>
						Verify document numbers with the listed certifying bodies before placing orders.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Body</TableHead>
								<TableHead>Standard / scope</TableHead>
								<TableHead>Certificate no.</TableHead>
								<TableHead>Expires</TableHead>
								<TableHead>Status</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{#each merchant.certifications as cert}
								<TableRow>
									<TableCell class="font-medium">{cert.body.name}</TableCell>
									<TableCell>
										{cert.scope}
										<span class="block text-xs text-muted-foreground">{cert.body.country}</span>
									</TableCell>
									<TableCell class="font-mono text-xs">{cert.number}</TableCell>
									<TableCell>{cert.expiry}</TableCell>
									<TableCell>
										<Badge
											variant={cert.status === 'certified' ? 'default' : cert.status === 'pending' ? 'secondary' : 'destructive'}
										>
											{cert.status}
										</Badge>
									</TableCell>
								</TableRow>
							{/each}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>

		<div class="space-y-4">
			<h2 class="text-lg font-semibold">
				{products.length} product{products.length === 1 ? '' : 's'}
			</h2>
			<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{#each products as product}
					{@const category = getCategory(product.categorySlug)}
					<Card>
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
							</div>
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