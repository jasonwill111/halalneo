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

	let { data } = $props();
	let search = $state('');

	const filteredCategories = $derived(
		search.trim()
			? (data.categories ?? []).filter((c: any) =>
					c.name.toLowerCase().includes(search.toLowerCase())
				)
			: data.categories ?? []
	);

	// Icon tile palette — shared with homepage/certifiers/KB for cross-page consistency
	const tileColors = TILE_COLORS;
</script>

<section class="space-y-6">
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

	{#if !data.categories}
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each Array(6) as _}
				<Card>
					<CardHeader class="gap-3">
						<div class="h-10 w-10 animate-pulse rounded-lg bg-muted"></div>
						<div class="space-y-1">
							<div class="h-5 w-2/3 animate-pulse rounded bg-muted"></div>
							<div class="h-3 w-full animate-pulse rounded bg-muted"></div>
						</div>
					</CardHeader>
				</Card>
			{/each}
		</div>
	{:else}
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each filteredCategories as category, i}
				{@const count = (data.products ?? []).filter((s: any) => s.categorySlug === category.slug).length}
				<article>
				<Card hoverable>
					<CardHeader class="gap-3">
						<div
							class="flex size-10 items-center justify-center rounded-lg {tileColors[
								i % tileColors.length
							]}"
						>
							<Icon name={category.icon} class="size-5"></Icon>
						</div>
						<div class="space-y-1">
							<CardTitle class="text-lg">{category.name}</CardTitle>
							<CardDescription>{category.description}</CardDescription>
						</div>
					</CardHeader>
					<CardContent class="space-y-3">
						<p class="text-sm text-muted-foreground">
							{count} product{count === 1 ? '' : 's'}
						</p>
						<Button href={localizeHref(`/categories/${category.slug}`)} variant="outline" size="sm">
							View products
							<ArrowUpRight class="size-4" data-icon="inline-end"></ArrowUpRight>
						</Button>
					</CardContent>
				</Card>
				</article>
			{:else}
				<div class="col-span-full flex flex-col items-center justify-center py-12 text-center">
					<p class="text-lg font-medium text-muted-foreground">No categories found</p>
					<p class="text-sm text-muted-foreground">Try adjusting your search.</p>
				</div>
			{/each}
		</div>
	{/if}

	<!-- Popular Subcategories -->
	<div class="mt-4">
		<h2 class="mb-2 text-sm font-semibold text-foreground">Popular Subcategories</h2>
		<div class="flex flex-wrap gap-1.5">
			{#each ['Halal Cosmetics', 'Pharmaceutical API', 'Organic Food', 'Modest Fashion', 'Medical Devices', 'Nutraceuticals', 'Halal Tourism', 'Halal Finance'] as sub}
				<Badge variant="secondary" class="font-medium transition-colors hover:text-primary">{sub}</Badge>
			{/each}
		</div>
	</div>
</section>
