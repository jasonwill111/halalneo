<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.js';

	let { data } = $props();
</script>

<svelte:head>
	<title>{data.seo.title}</title>
	<meta name="description" content={data.seo.description} />
</svelte:head>

<div class="container mx-auto max-w-7xl px-4 py-8">
	{#if data.item}
		<article class="space-y-6">
			<h1 class="text-3xl font-bold tracking-tight">{data.item.title}</h1>
			<div class="prose prose-neutral dark:prose-invert max-w-none">
				{@html data.item.content}
			</div>
		</article>
	{:else}
		<div class="flex min-h-[50vh] items-center justify-center">
			<div class="text-center space-y-4">
				<p class="text-muted-foreground text-lg">Page not found.</p>
				<Button href="/" variant="outline">Go Home</Button>
			</div>
		</div>
	{/if}
</div>
