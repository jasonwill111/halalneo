<script lang="ts">
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Card } from '#lib/components/ui/card/index.js';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import Breadcrumb from '#lib/components/site/breadcrumb.svelte';
	import Paginator from '#lib/components/site/paginator.svelte';

	let { data } = $props();

	const suppliers = $derived((data.suppliers ?? []) as any[]);
	const products = $derived((data.products ?? []) as any[]);

	const PAGE_SIZE = 9;
	let page = $state(1);
	const totalPages = $derived(Math.max(1, Math.ceil(suppliers.length / PAGE_SIZE)));
	const pagedSuppliers = $derived(suppliers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE));

	const productCount = (slug: string): number => products.filter((p: any) => p.supplierSlug === slug).length;

	const businessTypes = [
		'Food Manufacturers',
		'Cosmetics & Personal Care',
		'Pharmaceutical',
		'Food Service & Catering',
		'Ingredients & Additives',
		'Packaging & Logistics'
	];
</script>

<Breadcrumb items={[{ label: 'Suppliers', href: '/suppliers' }]} />

<svelte:head>
	{@html `<script type="application/ld+json">${JSON.stringify(data.itemList)}</script>`}
</svelte:head>

<section class="space-y-6">
	<div class="max-w-2xl space-y-2">
		<h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">Supplier directory</h1>
		<p class="text-muted-foreground">
			Browse halal-certified suppliers by certification body, business type, or region.
		</p>
	</div>

	<!-- Marketplace Coming Soon -->
	<div class="rounded-xl ring-1 ring-foreground/10 bg-card p-4 text-center sm:p-8">
		<Badge variant="secondary" class="mb-3">Coming Soon</Badge>
		<h2 class="text-xl font-semibold tracking-tight">Direct ordering</h2>
		<p class="mx-auto mt-2 max-w-xl text-muted-foreground">
			Browse verified profiles today. Checkout, escrow and order tracking are on the way —
			inquiries already reach suppliers directly.
		</p>
		<div class="mt-4">
			<Button href={localizeHref('/register')} size="sm">Join the waitlist</Button>
		</div>
	</div>

	<!-- Verified Suppliers -->
	{#if suppliers.length > 0}
		<div class="space-y-4">
			<div class="flex items-end justify-between gap-2">
				<div>
					<h2 class="text-lg font-semibold">Verified suppliers</h2>
					<p class="text-xs text-muted-foreground">{suppliers.length} certified suppliers on HalalNeo.</p>
				</div>
			</div>
			<div class="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3">
				{#each pagedSuppliers as s}
					<a
						href={localizeHref(`/suppliers/${s.slug}`)}
						class="group flex items-center gap-2.5 rounded-lg bg-card p-2.5 ring-1 ring-foreground/10 transition-all hover:shadow-md hover:-translate-y-0.5 sm:rounded-xl sm:p-3"
					>
						<div class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary sm:size-10">
							{s.logoInitials ?? s.name?.slice(0, 2) ?? '?'}
						</div>
						<div class="min-w-0 flex-1">
							<h3 class="truncate text-xs font-medium transition-colors group-hover:text-primary sm:text-sm">
								{s.name}
							</h3>
							<p class="mt-0.5 truncate text-[10px] text-muted-foreground sm:text-xs">
								{s.country} · {productCount(s.slug)} product{productCount(s.slug) === 1 ? '' : 's'}
							</p>
						</div>
						{#if s.status === 'active'}
							<ShieldCheck class="size-3.5 shrink-0 text-success sm:size-4" />
						{/if}
					</a>
				{/each}
			</div>
			<Paginator bind:page {totalPages} />
		</div>
	{/if}

	<!-- Certifying Bodies -->
	<div class="space-y-4">
		<div class="flex items-end justify-between gap-2">
			<div>
				<h2 class="text-lg font-semibold">Recognised certifying bodies</h2>
				<p class="text-xs text-muted-foreground">Suppliers on HalalNeo carry certificates from these recognised bodies.</p>
			</div>
			<Button href={localizeHref('/certifying-bodies')} variant="outline" size="sm" class="shrink-0 text-xs">
				View all 15
				<ArrowRight class="size-3.5" />
			</Button>
		</div>
	</div>

	<!-- Business Types -->
	<div class="space-y-4">
		<div>
			<h2 class="text-lg font-semibold">Supplier categories</h2>
			<p class="text-xs text-muted-foreground">Halal-certified suppliers across these industries.</p>
		</div>
		<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
			{#each businessTypes as type}
				<Card class="p-4">
					<h3 class="text-sm font-medium">{type}</h3>
					<p class="mt-1 text-xs text-muted-foreground">Coming soon</p>
				</Card>
			{/each}
		</div>
	</div>
</section>
