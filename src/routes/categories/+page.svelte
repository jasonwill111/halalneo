<script lang="ts">
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import Icon from '#lib/components/site/icon.svelte';
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
	import SearchIcon from '@lucide/svelte/icons/search';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { TILE_COLORS } from '#lib/utils/tile-colors.js';
	import {
		Empty,
		EmptyHeader,
		EmptyMedia,
		EmptyTitle,
		EmptyDescription,
		EmptyContent
	} from '#lib/components/ui/empty/index.js';
	import ErrorRetry from '#lib/components/site/error-retry.svelte';
	import Paginator from '#lib/components/site/paginator.svelte';
	import SeoMeta from '#lib/components/seo-meta.svelte';
	import type { CategoryRecord } from '#lib/schemas/categories.js';

	let { data } = $props();
	let search = $state('');
	const PAGE_SIZE = 9;
	let page = $state(1);
	$effect(() => {
		void search;
		page = 1;
	});

	/**
	 * `shortDescription` / `requirements` / `certifications` are legacy columns that the
	 * `/api/categories` projection no longer emits, so they stay optional here and the
	 * cards fall through to their existing fallbacks.
	 */
	type CategoryRow = CategoryRecord & {
		shortDescription?: string | null;
		requirements?: unknown[] | null;
		certifications?: unknown[] | null;
	};

	const rows: CategoryRow[] = $derived(data.categories ?? []);

	const filteredCategories = $derived(
		search.trim()
			? rows.filter((c: CategoryRow) => c.name.toLowerCase().includes(search.toLowerCase()))
			: rows
	);

	const pagedCategories = $derived(
		filteredCategories.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
	);
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

<section class="space-y-4 py-8 sm:space-y-6">
	<div class="max-w-3xl space-y-2 text-center sm:text-left">
		<h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">Halal product categories</h1>
		<p class="text-xs text-muted-foreground sm:text-sm">
			{data.categories.length} categorized product groups with detailed certification, sourcing, and market
			information.
		</p>
	</div>

	<div class="space-y-4">
		<div class="relative w-full max-w-sm">
			<SearchIcon class="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
			<Input bind:value={search} type="search" placeholder="Search categories..." class="pl-9" />
		</div>
	</div>

	<div class="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3">
		{#if data.loadError && pagedCategories.length === 0}
			<div class="col-span-full">
				<ErrorRetry failure={data.loadError} subject="categories" />
			</div>
		{:else if pagedCategories.length === 0}
			<div class="col-span-full">
				<Empty>
					<EmptyHeader>
						<EmptyMedia><SearchIcon class="size-6 text-muted-foreground"></SearchIcon></EmptyMedia>
						<EmptyTitle>No categories found</EmptyTitle>
						<EmptyDescription>Try different search terms or view all categories.</EmptyDescription>
					</EmptyHeader>
					<EmptyContent>
						{#if search.trim()}
							<Button variant="outline" size="sm" onclick={() => (search = '')}>Clear search</Button
							>
						{:else}
							<Button size="sm" href={localizeHref('/products')}>Browse products</Button>
						{/if}
						<Button variant="link" size="sm" href={localizeHref('/contact')}
							>Suggest a category</Button
						>
					</EmptyContent>
				</Empty>
			</div>
		{:else}
			{#each pagedCategories as category, i (category.slug)}
				<a
					href={localizeHref(`/category/${category.slug}`)}
					class="group press-scale flex flex-col overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 transition-all hover:-translate-y-0.5 hover:shadow-md"
				>
					<div class="flex items-start gap-2.5 p-2.5 sm:gap-3 sm:p-4">
						<div
							class="flex size-9 shrink-0 items-center justify-center rounded-lg sm:size-11 {TILE_COLORS[
								i % TILE_COLORS.length
							]}"
						>
							<Icon name={category.icon ?? ''} class="size-4 sm:size-5" />
						</div>
						<div class="min-w-0 flex-1">
							<h2
								class="truncate text-xs font-semibold transition-colors group-hover:text-primary sm:text-base"
							>
								{category.name}
							</h2>
							<p class="mt-1 line-clamp-2 hidden text-xs text-muted-foreground sm:block">
								{category.shortDescription ||
									category.description?.substring(0, 120) ||
									`Detailed information about ${category.name} halal requirements`}
							</p>
						</div>
					</div>
					<div
						class="hidden flex-wrap items-center justify-between gap-2 border-t border-border/50 px-4 py-2.5 sm:flex"
					>
						<div class="flex flex-wrap gap-2">
							{#if category.requirements?.length}
								<Badge variant="outline" class="text-2xs"
									>{category.requirements?.length ?? 0} cert. req.</Badge
								>
							{/if}
							{#if category.certifications?.length}
								<Badge variant="secondary" class="text-2xs"
									>{category.certifications?.length ?? 0} certs. recognized</Badge
								>
							{/if}
						</div>
						<ArrowUpRight
							class="size-4 text-muted-foreground transition-transform group-hover:rotate-45 group-hover:text-primary"
						/>
					</div>
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
	{@html `\u003cscript type="application/ld+json">${JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: [
			{ '@type': 'ListItem', position: 1, name: 'Home', item: 'https://halalneo.com/' },
			{
				'@type': 'ListItem',
				position: 2,
				name: 'Categories',
				item: 'https://halalneo.com/categories'
			}
		]
	})}\u003c/script>`}

	<!-- Structured Data: Collection -->
	{@html `\u003cscript type="application/ld+json">${JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'CollectionPage',
		name: 'Halal Product Categories',
		description: seoDescription(),
		hasPart: filteredCategories.slice(0, 10).map((cat) => ({
			'@type': 'Product',
			name: cat.name,
			description: cat.shortDescription || cat.description,
			sku: cat.slug,
			category: 'Halal Products'
		}))
	})}\u003c/script>`}
</svelte:head>
