<script lang="ts">
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Card, CardContent, CardHeader, CardTitle } from '#lib/components/ui/card/index.js';
	import Paginator from '#lib/components/site/paginator.svelte';

	let { data } = $props();

	const PAGE_SIZE = 9;
	let page = $state(1);
	const articles = $derived(data.item?.articles ?? []);
	const totalPages = $derived(Math.max(1, Math.ceil(articles.length / PAGE_SIZE)));
	const paged = $derived(articles.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE));
</script>

<svelte:head>
	{@html `\u003cscript type="application/ld+json">${JSON.stringify(data.itemList ?? {})}\u003c/script>`}
	{@html `\u003cscript type="application/ld+json">${JSON.stringify(data.collectionPage ?? {})}\u003c/script>`}
</svelte:head>

<div class="mx-auto max-w-6xl py-8">
	{#if data.item}
		<header class="mb-8 space-y-2">
			<h1 class="text-3xl font-bold tracking-tight">{data.item.name}</h1>
			<p class="text-xs text-muted-foreground sm:text-sm">{data.item.description}</p>
			<div class="flex flex-wrap gap-2">
				<Badge>{data.item.articleCount} articles</Badge>
			</div>
		</header>

		{#if paged.length === 0}
			<p class="text-sm text-muted-foreground">No articles in this section yet.</p>
		{:else}
			<div
				class="grid grid-cols-2 gap-2 sm:grid-cols-[repeat(auto-fit,minmax(280px,1fr))] sm:gap-3"
			>
				{#each paged as article (article.slug)}
					<Card class="p-3 sm:p-4">
						<CardHeader>
							<CardTitle class="text-sm sm:text-base">{article.title}</CardTitle>
						</CardHeader>
						<CardContent class="space-y-3">
							<p class="hidden text-xs text-muted-foreground sm:line-clamp-3 sm:text-sm">
								{article.summary}
							</p>
							<Button
								href={localizeHref(`/knowledge-base/${data.item.slug}/${article.slug}`)}
								variant="outline"
								size="sm"
							>
								Read Article
							</Button>
						</CardContent>
					</Card>
				{/each}
			</div>
			<Paginator bind:page {totalPages} />
		{/if}
	{:else}
		<div class="flex min-h-[50vh] items-center justify-center">
			<div class="space-y-4 text-center">
				<p class="text-sm text-muted-foreground">Knowledge base section coming soon.</p>
				<Button href={localizeHref('/knowledge-base')} variant="outline"
					>Browse Knowledge Base</Button
				>
			</div>
		</div>
	{/if}
</div>
