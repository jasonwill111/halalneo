<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Card, CardContent } from '#lib/components/ui/card/index.js';
	import { Avatar, AvatarFallback } from '#lib/components/ui/avatar/index.js';

	let { data } = $props();
</script>

<svelte:head>
	<title>{data.seo.title}</title>
	<meta name="description" content={data.seo.description} />
</svelte:head>

<div class="container mx-auto max-w-3xl px-4 py-8">
	{#if data.item}
		<article class="space-y-8">
			<header class="space-y-4">
				<div class="flex flex-wrap gap-2">
					{#each data.item.tags as tag}
						<Badge variant="secondary">{tag}</Badge>
					{/each}
				</div>
				<h1 class="text-3xl font-bold tracking-tight sm:text-4xl">{data.item.title}</h1>
				<div class="flex items-center gap-3">
					<Avatar>
						<AvatarFallback>{data.item.author.initials}</AvatarFallback>
					</Avatar>
					<div>
						<p class="text-sm font-medium">{data.item.author.name}</p>
						<p class="text-xs text-muted-foreground">{data.item.date}</p>
					</div>
				</div>
			</header>

			<div class="prose prose-neutral dark:prose-invert max-w-none">
				{@html data.item.content}
			</div>

			<Card>
				<CardContent class="flex items-center justify-between p-4">
					<p class="text-sm text-muted-foreground">Found this helpful?</p>
					<div class="flex gap-2">
						<Button variant="outline" size="sm">Share</Button>
						<Button variant="outline" size="sm">Bookmark</Button>
					</div>
				</CardContent>
			</Card>
		</article>
	{:else}
		<div class="flex min-h-[50vh] items-center justify-center">
			<div class="text-center space-y-4">
				<p class="text-muted-foreground text-lg">Blog post coming soon.</p>
				<Button href="/blog" variant="outline">Browse Articles</Button>
			</div>
		</div>
	{/if}
</div>
