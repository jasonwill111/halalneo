<script lang="ts">
	import { localizeHref } from '$lib/paraglide/runtime.js';
	import { adminData } from '$lib/stores/admin-data.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';

	const verified = $derived(adminData.merchants.filter((m) => m.status === 'active'));
	const productCount = (slug: string) => adminData.skus.filter((s) => s.merchantSlug === slug).length;
</script>

<svelte:head><title>Suppliers — HalalNeo</title></svelte:head>

<section class="space-y-8">
	<div class="max-w-2xl space-y-2">
		<h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">Verified suppliers</h1>
		<p class="text-muted-foreground">
			{verified.length} active suppliers across 5 countries, each with independently verified
			halal certification documents.
		</p>
	</div>

	<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
		{#each adminData.merchants as merchant}
			<Card hoverable>
				<CardHeader class="gap-3">
					<div class="flex items-center justify-between">
						<div class="flex size-11 items-center justify-center rounded-xl bg-primary/15 text-sm font-semibold text-primary">
							{merchant.logoInitials}
						</div>
						<Badge variant={merchant.status === 'active' ? 'default' : 'secondary'}>
							{merchant.status}
						</Badge>
					</div>
					<div class="space-y-1">
						<CardTitle class="text-base">{merchant.name}</CardTitle>
						<CardDescription>
							{merchant.country} · {merchant.businessType}
							{merchant.isBrand ? ' · brand' : ''}
						</CardDescription>
					</div>
				</CardHeader>
				<CardContent class="space-y-3">
					<p class="line-clamp-3 text-sm text-muted-foreground">{merchant.description}</p>
					<div class="flex items-center justify-between text-sm">
						<span class="text-muted-foreground">Est.</span>
						<span class="font-medium">{merchant.yearEstablished}</span>
					</div>
					<div class="flex items-center justify-between text-sm">
						<span class="text-muted-foreground">Products</span>
						<span class="font-medium">{productCount(merchant.slug)}</span>
					</div>
					<div class="flex items-center justify-between text-sm">
						<span class="text-muted-foreground">Certifications</span>
						<span class="font-medium">{merchant.certifications.length}</span>
					</div>
					<Button href={localizeHref(`/suppliers/${merchant.slug}`)} variant="outline" size="sm" class="w-full">
						View supplier
						<ArrowUpRight class="size-4" data-icon="inline-end"></ArrowUpRight>
					</Button>
				</CardContent>
			</Card>
		{/each}
	</div>
</section>