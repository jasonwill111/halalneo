<script lang="ts">
	import { localizeHref } from '$lib/paraglide/runtime.js';
	import { adminData } from '$lib/stores/admin-data.svelte';
	import Icon from '$lib/components/site/icon.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '$lib/components/ui/card';
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
</script>

<svelte:head><title>Categories —HalalNeo</title></svelte:head>

<section class="space-y-8">
	<div class="max-w-2xl space-y-2">
		<h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">Product categories</h1>
		<p class="text-muted-foreground">
			Browse certified halal products by vertical. Each category lists certified SKUs across
			suppliers.
		</p>
	</div>

	<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
		{#each adminData.categories as category}
			{@const count = adminData.skus.filter((s) => s.categorySlug === category.slug).length}
			<Card hoverable>
				<CardHeader class="gap-3">
					<div class="flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
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
		{/each}
	</div>
</section>