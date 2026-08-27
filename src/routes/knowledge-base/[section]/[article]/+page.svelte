<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';

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
					<Button href={`/knowledge-base/${data.item.sectionSlug}`} variant="outline" size="sm">
						{data.item.sectionName}
					</Button>
					<Badge variant="secondary">{data.item.readTime}</Badge>
				</div>
				<h1 class="text-3xl font-bold tracking-tight sm:text-4xl">{data.item.title}</h1>
				<p class="text-muted-foreground text-lg">{data.item.summary}</p>
			</header>

			<div class="prose prose-neutral dark:prose-invert max-w-none">
				{@html data.item.content}
			</div>

			<footer class="border-t pt-6">
				<div class="flex flex-wrap justify-between gap-4">
					<Button href={`/knowledge-base/${data.item.sectionSlug}`} variant="outline">
						← Back to {data.item.sectionName}
					</Button>
					<div class="flex gap-2">
						<Button variant="outline" size="sm">Share</Button>
						<Button variant="outline" size="sm">Print</Button>
					</div>
				</div>
			</footer>
		</article>
	{:else}
		<div class="flex min-h-[50vh] items-center justify-center">
			<div class="text-center space-y-4">
				<p class="text-muted-foreground text-lg">Article coming soon.</p>
				<Button href="/knowledge-base" variant="outline">Browse Knowledge Base</Button>
			</div>
		</div>
	{/if}
</div>
