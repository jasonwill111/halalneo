<script lang="ts">
	import { createRawSnippet } from 'svelte';
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import BlockRenderer from '#lib/components/content/block-renderer.svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import { page } from '$app/state';

	let { data } = $props();

	const seo = $derived(data.seo ?? {});
	const item = $derived(data.item);

	const baseUrl = 'https://halalneo.com';
	const pageTitle = $derived(seo.title ?? `${item?.title ?? 'Page'} — HalalNeo`);
	const pageDescription = $derived(seo.description ?? '');
	const pageUrl = $derived(`${baseUrl}${page.url.pathname}`);

	const jsonLdSnippet = createRawSnippet(() => ({
		render: () =>
			`\u003cscript type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebPage', name: pageTitle, description: pageDescription, url: pageUrl })}\u003c/script>`
	}));

	const legacyBody = createRawSnippet(() => ({
		render: () => item?.content ?? ''
	}));
</script>

<svelte:head>
	{@render jsonLdSnippet()}
</svelte:head>

<div class="mx-auto max-w-6xl py-8">
	{#if data.item}
		<article class="space-y-4 sm:space-y-6">
			<h1 class="text-3xl font-bold tracking-tight">{data.item.title}</h1>
			{#if item.contentBlocks?.length}
				<BlockRenderer blocks={item.contentBlocks} />
			{:else}
				<div class="content-body">
					{@render legacyBody()}
				</div>
			{/if}
		</article>
	{:else}
		<div class="flex min-h-[50vh] items-center justify-center">
			<div class="space-y-4 text-center">
				<p class="text-sm text-muted-foreground">Page not found.</p>
				<Button href={localizeHref('/')} variant="outline">Go Home</Button>
			</div>
		</div>
	{/if}
</div>
