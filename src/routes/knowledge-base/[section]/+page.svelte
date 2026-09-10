<script lang="ts">
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Card, CardContent, CardHeader, CardTitle } from '#lib/components/ui/card/index.js';
	import Paginator from '#lib/components/site/paginator.svelte';

	let { data } = $props();

	const PAGE_SIZE = 9;
	let page = $state(1);
	const articles = $derived((data.item?.articles ?? []) as any[]);
	const totalPages = $derived(Math.max(1, Math.ceil(articles.length / PAGE_SIZE)));
	const paged = $derived(articles.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE));
</script>

<svelte:head>
	{@html `<script type="application/ld+json">${JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'CollectionPage',
		name: data.seo.title,
		description: data.seo.description,
		url: `https://halalneo.com/knowledge-base/${data.item?.slug ?? ''}`,
		isPartOf: { '@type': 'WebSite', name: 'HalalNeo', url: 'https://halalneo.com' }
	})}</script>`}
</svelte:head>

<div class="py-8">
	{#if data.item}
		<header class="mb-8 space-y-2">
			<h1 class="text-3xl font-bold tracking-tight">{data.item.name}</h1>
			<p class="text-muted-foreground">{data.item.description}</p>
			<div class="flex flex-wrap gap-2">
				<Badge>{data.item.articleCount} articles</Badge>
			</div>
		</header>

		{#if paged.length === 0}
			<p class="text-sm text-muted-foreground">No articles in this section yet.</p>
		{:else}
			<div class="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-3">
				{#each paged as article (article.slug)}
					<Card>
						<CardHeader>
							<CardTitle class="text-sm sm:text-lg">{article.title}</CardTitle>
						</CardHeader>
						<CardContent class="space-y-3">
							<p class="hidden text-xs text-muted-foreground sm:line-clamp-3 sm:text-sm">{article.summary}</p>
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
				<p class="text-lg text-muted-foreground">Knowledge base section coming soon.</p>
				<Button href={localizeHref('/knowledge-base')} variant="outline">Browse Knowledge Base</Button>
			</div>
		</div>
	{/if}
</div>
