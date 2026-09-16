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
 			: data.categories ?? []
 	);

	const totalPages = $derived(Math.max(1, Math.ceil(filteredCategories.length / PAGE_SIZE)));
	const pagedCategories = $derived(
		filteredCategories.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
	);

	// Subcategories derived from the parentSlug hierarchy (no hardcoded list)
	const subcategories = $derived(
		(data.categories ?? []).filter((c: any) => c.parentSlug != null)
	);

	// Icon tile palette — shared with homepage/certifiers/KB for cross-page consistency
	const tileColors = TILE_COLORS;
</script>

<svelte:head>
	{@html `<script type="application/ld+json">${JSON.stringify(itemList ?? {})}</script>`}
</svelte:head>

<section class="space-y-4 sm:space-y-6">
	<div class="max-w-2xl space-y-2">
		<h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">Product categories</h1>
		<p class="text-muted-foreground">
			Browse certified halal products by vertical. Each category lists certified SKUs across
			suppliers.
		</p>
	</div>

	<div class="relative">
		<SearchIcon class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
		<Input
			type="search"
			placeholder="Search categories..."
			class="pl-9"
			bind:value={search}
		/>
	</div>

	<div class="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3">
			{#each pagedCategories as category, i (category.slug)}
				{@const count = (data.products ?? []).filter((s: any) => s.categorySlug === category.slug).length}
				<article>
				<Card hoverable>
					<CardHeader class="gap-2 sm:gap-3">
						<div
							class="flex size-8 shrink-0 items-center justify-center rounded-lg sm:size-10 {tileColors[
								i % tileColors.length
							]}"
						>
							<Icon name={category.icon} class="size-4 sm:size-5"></Icon>
						</div>
						<div class="min-w-0 space-y-0.5 sm:space-y-1">
							<CardTitle class="truncate text-sm sm:text-lg">{category.name}</CardTitle>
							<CardDescription class="hidden sm:block">{category.description}</CardDescription>
						</div>
					</CardHeader>
					<CardContent class="space-y-2 sm:space-y-3">
						<p class="text-xs text-muted-foreground sm:text-sm">
							{count} product{count === 1 ? '' : 's'}
						</p>
						<Button href={localizeHref(`/category/${category.slug}`)} variant="outline" size="sm" class="w-full text-xs sm:w-auto">
							View products
							<ArrowUpRight class="size-3.5 sm:size-4" data-icon="inline-end"></ArrowUpRight>
						</Button>
					</CardContent>
				</Card>
				</article>
			{:else}
				<Empty class="col-span-full">
					<EmptyMedia><SearchIcon class="size-6 text-muted-foreground"></SearchIcon></EmptyMedia>
					<EmptyTitle>No categories found</EmptyTitle>
					<EmptyDescription>Try adjusting your search.</EmptyDescription>
				</Empty>
			{/each}
	</div>

	<Paginator page={page} totalPages={totalPages} />

	{#if subcategories.length > 0}
		<!-- Popular Subcategories (data-driven from parentSlug hierarchy) -->
		<div class="mt-4">
			<h2 class="mb-2 text-sm font-semibold text-foreground">Popular Subcategories</h2>
			<div class="flex flex-wrap gap-1.5">
				{#each subcategories as sub (sub.slug)}
					<a href={localizeHref(`/category/${sub.slug}`)}>
						<Badge variant="secondary" class="font-medium transition-colors hover:text-primary"
							>{sub.name}</Badge
						>
					</a>
				{/each}
			</div>
		</div>
	{/if}
</section>
