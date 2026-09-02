<script lang="ts">
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '#lib/components/ui/card/index.js';
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
	import Breadcrumb from '#lib/components/site/breadcrumb.svelte';
	import TrustBadges from '#lib/components/site/trust-badges.svelte';

	let { data } = $props();

	const verified = $derived((data.suppliers ?? []).filter((s: any) => s.status === 'active'));
	const productCount = (slug: string) =>
		(data.products ?? []).filter((s: any) => s.supplierSlug === slug).length;
</script>

<Breadcrumb items={[{ label: 'Suppliers', href: '/suppliers' }]} />

<section class="space-y-8">
	<div class="max-w-2xl space-y-2">
		<h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">Verified suppliers</h1>
		<p class="text-muted-foreground">
			{verified.length} active suppliers across 5 countries, each with independently verified halal certification
			documents.
		</p>
	</div>

	{#if !data.suppliers}
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each Array(6) as _}
				<Card>
					<CardHeader class="gap-3">
						<div class="flex items-center justify-between">
							<div class="h-11 w-11 animate-pulse rounded-xl bg-muted"></div>
							<div class="h-5 w-14 animate-pulse rounded bg-muted"></div>
						</div>
						<div class="space-y-1">
							<div class="h-4 w-3/4 animate-pulse rounded bg-muted"></div>
							<div class="h-3 w-1/2 animate-pulse rounded bg-muted"></div>
						</div>
					</CardHeader>
				</Card>
			{/each}
		</div>
	{:else}
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each (data.suppliers ?? []) as supplier (supplier.slug)}
				<Card hoverable>
					<CardHeader class="gap-3">
						<div class="flex items-center justify-between">
							<div
								class="flex size-11 items-center justify-center rounded-xl bg-primary/15 text-sm font-semibold text-primary"
							>
								{supplier.logoInitials}
							</div>
							<Badge variant={supplier.status === 'active' ? 'default' : 'secondary'}>
								{supplier.status}
							</Badge>
						</div>
						<div class="space-y-1">
							<CardTitle class="text-base">{supplier.name}</CardTitle>
							<CardDescription>
								{supplier.country} · {supplier.businessType}
								{supplier.isBrand ? ' · brand' : ''}
							</CardDescription>
						</div>
					</CardHeader>
					<CardContent class="space-y-3">
						<TrustBadges certifications={supplier.certifications} status={supplier.status} compact={true} />
						<p class="line-clamp-3 text-sm text-muted-foreground">{supplier.description}</p>
						<div class="flex items-center justify-between text-sm">
							<span class="text-muted-foreground">Est.</span>
							<span class="font-medium">{supplier.yearEstablished}</span>
						</div>
						<div class="flex items-center justify-between text-sm">
							<span class="text-muted-foreground">Products</span>
							<span class="font-medium">{productCount(supplier.slug)}</span>
						</div>
						<div class="flex items-center justify-between text-sm">
							<span class="text-muted-foreground">Certifications</span>
							<span class="font-medium">{supplier.certifications.length}</span>
						</div>
						<Button
							href={localizeHref(`/suppliers/${supplier.slug}`)}
							variant="outline"
							size="sm"
							class="w-full"
						>
							View supplier
							<ArrowUpRight class="size-4" data-icon="inline-end"></ArrowUpRight>
						</Button>
					</CardContent>
				</Card>
			{:else}
				<div class="col-span-full flex flex-col items-center justify-center py-12 text-center">
					<p class="text-lg font-medium text-muted-foreground">No suppliers found</p>
					<p class="text-sm text-muted-foreground">Try adjusting your search or filters.</p>
				</div>
			{/each}
		</div>
	{/if}
</section>
