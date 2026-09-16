<script lang="ts">
 	import { localizeHref } from '#lib/paraglide/runtime.js';
 	import Icon from '#lib/components/site/icon.svelte';
 	import { Button } from '#lib/components/ui/button/index.js';
 	import {
 		Card,
 		CardHeader,
 		CardTitle,
 		CardDescription,
 		CardContent
 	} from '#lib/components/ui/card/index.js';
 	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
 	import SearchIcon from '@lucide/svelte/icons/search';
 	import { Input } from '#lib/components/ui/input/index.js';
 	import { Badge } from '#lib/components/ui/badge/index.js';
 	import { TILE_COLORS } from '#lib/utils/tile-colors.js';
 	import { Empty, EmptyMedia, EmptyTitle, EmptyDescription } from '#lib/components/ui/empty/index.js';
 	import Paginator from '#lib/components/site/paginator.svelte';
 	import SeoMeta from '#lib/components/seo-meta.svelte';

 	let { data, itemList } = $props();
 	let search = $state('');
 	const PAGE_SIZE = 8;
 	let page = $state(1);
 	$effect(() => { page = 1; });

 	const filteredCategories = $derived(
 		search.trim()
 			? (data.categories ?? []).filter((c: any) =>
 					c.name.toLowerCase().includes(search.toLowerCase())
  				)
 			: data.categories
 	);

 	const pagedCategories = $derived(filteredCategories.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE));
 	const totalPages = $derived(Math.max(1, Math.ceil(filteredCategories.length / PAGE_SIZE)));

 	function seoDescription(): string {
 		return `Explore ${data.categories.length} halal product categories with detailed descriptions, certification requirements, and supplier networks for global halal trade.`;
 	}
</script>

<!-- SEO Meta Tags -->
<SeoMeta 
 	title="Halal Product Categories - Global Halal Certification & Sourcing Guide"
 	description="Browse 50+ defined halal product categories with detailed descriptions, certification standards, and supplier directories for global halal trade."
 	ogTitle="HalalNeo - Halal Product Categories Directory"
 	ogDescription="Comprehensive guide to halal product categories. Certification requirements, sourcing opportunities, and market insights for each category."
 	keywords="halal categories, halal product categories, halal certification types, food safety standards, halal product standards, import categories, halal product classification, haram versus halal products, islamic dietary laws, halal certification process"
 	canonical="/categories"
/>

<section class="space-y-4 sm:space-y-6 py-8">
	<div class="max-w-3xl space-y-2 text-center sm:text-left">
		<h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">Halal product categories</h1>
		<p class="text-muted-foreground">
			{data.categories.length} categorized product groups with detailed certification, sourcing, and market information.
		</p>
	</div>

	<div class="space-y-4">
		<div class="relative w-full max-w-sm">
			<SearchIcon class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
			<Input
				bind:value={search}
				type="search"
				placeholder="Search categories..."
				class="pl-9"
			/>
		</div>
	</div>

	<div class="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
		{#if pagedCategories.length === 0}
			<Empty>
				<EmptyMedia><SearchIcon class="size-6 text-muted-foreground"></SearchIcon></EmptyMedia>
				<EmptyTitle>No categories found</EmptyTitle>
				<EmptyDescription>Try different search terms or view all categories.</EmptyDescription>
			</Empty>
		{:else}
			{#each pagedCategories as category, i}
				<a
					href={localizeHref(`/category/${category.slug}`)}
					class="group flex flex-col overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 transition-all hover:-translate-y-0.5 hover:shadow-md"
				>
					<CardHeader class="pb-3">
						<div class="flex items-start gap-3">
							<div class="flex size-11 shrink-0 items-center justify-center rounded-lg {TILE_COLORS[i % TILE_COLORS.length]}">
								<Icon name={category.icon} class="size-5" />
							</div>
							<div class="flex-1">
								<CardTitle class="text-base group-hover:text-primary">{category.name}</CardTitle>
								<CardDescription class="mt-1 line-clamp-2">
									{category.shortDescription || category.description?.substring(0, 120) || `Detailed information about ${category.name} halal requirements`}
								</CardDescription>
							</div>
						</div>
					</CardHeader>
					<CardContent class="flex items-center justify-between pt-0">
						<div class="flex flex-wrap gap-2">
							{#if category.requirements?.length}
								<Badge variant="outline" class="text-[10px]">{category.requirements.length.toLocaleLowerCase()} cert. req.</Badge>
							{/if}
							{#if category.certifications?.length}
								<Badge variant="secondary" class="text-[10px]">{category.certifications.length.toLocaleLowerCase()} certs. recognized</Badge>
							{/if}
						</div>
						<ArrowUpRight class="size-4 text-muted-foreground group-hover:text-primary group-hover:rotate-45 transition-transform" />
					</CardContent>
				</a>
			{/each}
		{/if}
	</div>

	{#if totalPages > 1}
		<Paginator bind:page {totalPages} />
	{/if}
</section>

<svelte:head>
	<!-- Structured Data: Breadcrumb -->
	{@html `<script type="application/ld+json">${JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: [
			{ '@type': 'ListItem', position: 1, name: 'Home', item: 'https://halalneo.com/' },
			{ '@type': 'ListItem', position: 2, name: 'Categories', item: 'https://halalneo.com/categories' }
		]
	})}</script>`}
	
	<!-- Structured Data: Collection -->
	{@html `<script type="application/ld+json">${JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'CollectionPage',
		name: 'Halal Product Categories',
		description: seoDescription(),
		hasPart: filteredCategories.slice(0, 10).map(cat => ({
			'@type': 'Product',
			name: cat.name,
			description: cat.shortDescription || cat.description,
			sku: cat.slug,
			category: 'Halal Products'
		}))
	})}</script>`}
</svelte:head>
