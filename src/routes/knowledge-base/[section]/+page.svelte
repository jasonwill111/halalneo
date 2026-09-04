<script lang="ts">
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Card, CardContent, CardHeader, CardTitle } from '#lib/components/ui/card/index.js';

	let { data } = $props();
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

		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each data.item.articles as article}
				<Card>
					<CardHeader>
						<CardTitle class="text-lg">{article.title}</CardTitle>
					</CardHeader>
					<CardContent class="space-y-3">
						<p class="text-sm text-muted-foreground">{article.summary}</p>
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
	{:else}
		<div class="flex min-h-[50vh] items-center justify-center">
			<div class="space-y-4 text-center">
				<p class="text-lg text-muted-foreground">Knowledge base section coming soon.</p>
				<Button href={localizeHref('/knowledge-base')} variant="outline">Browse Knowledge Base</Button>
			</div>
		</div>
	{/if}
</div>
