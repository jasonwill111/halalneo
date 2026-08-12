<script lang="ts">
	import { localizeHref } from '$lib/paraglide/runtime.js';
	import { adminData } from '$lib/stores/admin-data.svelte';
	import Icon from '$lib/components/site/icon.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/components/ui/card';
	import { Separator } from '$lib/components/ui/separator';
	import { Avatar, AvatarFallback } from '$lib/components/ui/avatar';
	import SearchIcon from '@lucide/svelte/icons/search';
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';

	const certifiedSkuCount = $derived(adminData.skus.filter((s) => s.certStatus === 'certified').length);
	const supplierCount = $derived(adminData.merchants.filter((m) => m.status === 'active').length);

	const stats = $derived([
		{ value: String(supplierCount), label: 'Verified suppliers' },
		{ value: String(certifiedSkuCount), label: 'Certified products' },
		{ value: String(adminData.kbSections.length), label: 'Knowledge sections' },
		{ value: String(adminData.glossary.length), label: 'Glossary terms' }
	]);

	const featuredSuppliers = $derived(adminData.merchants.filter((m) => m.status === 'active').slice(0, 4));
</script>

<svelte:head><title>HalalNeo — Halal trade intelligence for buyers and suppliers</title></svelte:head>

<section class="space-y-10">
	<div class="mx-auto max-w-3xl space-y-6 pt-10 text-center sm:pt-16">
		<Badge variant="secondary" class="gap-1.5">
			<ShieldCheck class="size-3.5"></ShieldCheck>
			Halal trade intelligence platform
		</Badge>
		<h1 class="text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
			Source halal. Verify it. Ship it.
		</h1>
		<p class="mx-auto max-w-2xl text-lg text-muted-foreground">
			HalalNeo is the trade-intelligence layer for halal sourcing — certified suppliers,
			verified certificates and the knowledge to buy with confidence.
		</p>
		<div class="flex flex-col items-center justify-center gap-3 sm:flex-row">
			<Button href={localizeHref('/products')} size="lg" class="w-full sm:w-auto">
				Browse certified products
			</Button>
			<Button href={localizeHref('/knowledge-base')} variant="outline" size="lg" class="w-full sm:w-auto">
				Visit the knowledge base
			</Button>
		</div>
		<div class="flex items-center justify-center gap-2 pt-2 text-sm text-muted-foreground">
			<SearchIcon class="size-4"></SearchIcon>
			<span>Halal certification covered across 8 recognized certifying bodies</span>
		</div>
	</div>

	<div class="mx-auto grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
		{#each stats as stat}
			<Card class="border-primary/15 bg-card/70 text-center backdrop-blur-sm">
				<CardHeader class="pb-1">
					<CardTitle class="text-3xl font-semibold tabular-nums">{stat.value}</CardTitle>
				</CardHeader>
				<CardContent class="pt-0">
					<p class="text-sm text-muted-foreground">{stat.label}</p>
				</CardContent>
			</Card>
		{/each}
	</div>
</section>

<Separator class="my-14" />

<section class="space-y-6">
	<div class="flex items-end justify-between gap-4">
		<div class="space-y-1">
			<h2 class="text-2xl font-semibold tracking-tight">Browse by category</h2>
			<p class="text-muted-foreground">Seven product verticals with halal certification.</p>
		</div>
		<Button href={localizeHref('/categories')} variant="ghost" size="sm">
			All categories
			<ArrowUpRight class="size-4" data-icon="inline-end"></ArrowUpRight>
		</Button>
	</div>
	<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
		{#each adminData.categories as category}
			<Button
				href={localizeHref(`/categories/${category.slug}`)}
				variant="outline"
				class="h-auto flex-col items-start gap-3 p-5 text-left"
			>
				<span class="flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
					<Icon name={category.icon} class="size-5"></Icon>
				</span>
				<span class="space-y-1 whitespace-normal">
					<span class="block font-medium">{category.name}</span>
					<span class="block text-sm font-normal text-muted-foreground">{category.description}</span>
				</span>
			</Button>
		{/each}
	</div>
</section>

<Separator class="my-14" />

<section class="space-y-6">
	<div class="flex items-end justify-between gap-4">
		<div class="space-y-1">
			<h2 class="text-2xl font-semibold tracking-tight">Featured suppliers</h2>
			<p class="text-muted-foreground">Certified manufacturers, wholesalers and traders.</p>
		</div>
		<Button href={localizeHref('/suppliers')} variant="ghost" size="sm">
			All suppliers
			<ArrowUpRight class="size-4" data-icon="inline-end"></ArrowUpRight>
		</Button>
	</div>
	<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
		{#each featuredSuppliers as merchant}
			<Card hoverable>
				<CardHeader class="flex flex-row items-center gap-3 space-y-0">
					<Avatar>
						<AvatarFallback>{merchant.logoInitials}</AvatarFallback>
					</Avatar>
					<div class="min-w-0 space-y-0.5">
						<CardTitle class="text-base leading-snug">{merchant.name}</CardTitle>
						<CardDescription>{merchant.country}</CardDescription>
					</div>
				</CardHeader>
				<CardContent class="space-y-3">
					<p class="line-clamp-2 text-sm text-muted-foreground">{merchant.description}</p>
					<div class="flex items-center justify-between">
						<Badge variant="secondary" class="capitalize">{merchant.businessType}</Badge>
						<Badge variant="outline" class="gap-1">
							<ShieldCheck class="size-3"></ShieldCheck>
							{merchant.certifications.length}
						</Badge>
					</div>
					<Button
						href={localizeHref(`/suppliers/${merchant.slug}`)}
						variant="outline"
						size="sm"
						class="w-full"
					>
						View profile
					</Button>
				</CardContent>
			</Card>
		{/each}
	</div>
</section>

<Separator class="my-14" />

<section class="space-y-6">
	<div class="space-y-1">
		<h2 class="text-2xl font-semibold tracking-tight">Knowledge base</h2>
		<p class="text-muted-foreground">
			{adminData.kbArticles.length} articles across {adminData.kbSections.length} areas of halal trade.
		</p>
	</div>
	<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
		{#each adminData.kbSections as section}
			<Card hoverable>
				<CardHeader class="gap-3">
					<div class="flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
						<Icon name={section.icon} class="size-5"></Icon>
					</div>
					<div class="space-y-1">
						<CardTitle class="text-base">{section.title}</CardTitle>
						<CardDescription>{section.description}</CardDescription>
					</div>
				</CardHeader>
				<CardContent>
					<Button href={localizeHref(`/knowledge-base/${section.slug}`)} variant="ghost" size="sm">
						Explore the section
						<ArrowUpRight class="size-4" data-icon="inline-end"></ArrowUpRight>
					</Button>
				</CardContent>
			</Card>
		{/each}
	</div>
</section>

<Separator class="my-14" />

<section class="rounded-xl border border-border bg-card p-8 text-center sm:p-12">
	<h2 class="text-2xl font-semibold tracking-tight sm:text-3xl">Ready to start sourcing?</h2>
	<p class="mx-auto mt-2 max-w-xl text-muted-foreground">
		Create a buyer account to shortlist certified suppliers and products, and keep up with halal
		trade intelligence.
	</p>
	<div class="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
		<Button href={localizeHref('/register')} size="lg">
			Create a free account
		</Button>
		<Button href={localizeHref('/glossary')} variant="outline" size="lg">
			Browse the glossary
		</Button>
	</div>
</section>