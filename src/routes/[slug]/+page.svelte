<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.js';
	import { page } from '$app/state';

	let { data } = $props();

	const seo = $derived(data.seo ?? {});
	const item = $derived(data.item);

	const baseUrl = 'https://halalneo.com';
	const ogImage = $derived(seo.ogImage ?? `${baseUrl}/og-default.svg`);
	const pageTitle = $derived(seo.title ?? `${item?.title ?? 'Page'} — HalalNeo`);
	const pageDescription = $derived(seo.description ?? '');
	const pageUrl = $derived(`${baseUrl}${page.url.pathname}`);
</script>

<svelte:head>
	{@html `<script type="application/ld+json">${JSON.stringify({"@context":"https://schema.org","@type":"WebPage","name":pageTitle,"description":pageDescription,"url":pageUrl})}</script>`}
</svelte:head>

<div class="container mx-auto max-w-7xl px-4 py-8">
	{#if data.item}
		<article class="space-y-6">
			<h1 class="text-3xl font-bold tracking-tight">{data.item.title}</h1>
			<div class="prose max-w-none prose-neutral dark:prose-invert">
				{@html data.item.content}
			</div>
		</article>
	{:else}
		<div class="flex min-h-[50vh] items-center justify-center">
			<div class="space-y-4 text-center">
				<p class="text-lg text-muted-foreground">Page not found.</p>
				<Button href="/" variant="outline">Go Home</Button>
			</div>
		</div>
	{/if}
</div>
