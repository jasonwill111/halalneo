<script lang="ts">
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import Breadcrumb from '#lib/components/site/breadcrumb.svelte';
	import ShareButtons from '#lib/components/site/share-buttons.svelte';
	import RelatedLinks from '#lib/components/site/related-links.svelte';
	import MapPinIcon from '@lucide/svelte/icons/map-pin';
	import TrophyIcon from '@lucide/svelte/icons/trophy';
	import { sanitizeHtml } from '#lib/sanitize.js';

	let { data } = $props();
	const story = $derived(data.story);
</script>

<svelte:head>
	{@html `<script type="application/ld+json">${JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'Article',
		headline: story?.title ?? '',
		description: story?.excerpt ?? '',
		url: `https://halalneo.com/success-stories/${data.slug}`
	})}</script>`}
</svelte:head>

{#if story}
	<div class="mx-auto max-w-3xl space-y-4 sm:space-y-6">
		<Breadcrumb items={[{ label: 'Success Stories', href: '/success-stories' }, { label: story.title ?? 'Story' }]} />

		<header class="space-y-3">
			<div class="flex flex-wrap items-center gap-1.5">
				<Badge class="bg-success/15 text-success text-[10px]">
					<TrophyIcon class="size-3" />
					Success story
				</Badge>
				{#if story.dealValue}
					<Badge variant="outline" class="text-[10px]">{story.dealValue}</Badge>
				{/if}
				{#if story.buyerCountry}
					<span class="inline-flex items-center gap-1 text-xs text-muted-foreground">
						<MapPinIcon class="size-3.5" />
						Buyer in {story.buyerCountry}
					</span>
				{/if}
			</div>
			<h1 class="text-2xl font-bold tracking-tight sm:text-3xl">{story.title}</h1>
			{#if story.excerpt}
				<p class="text-sm leading-relaxed text-muted-foreground sm:text-base">{story.excerpt}</p>
			{/if}
		</header>

		{#if story.image}
			<img
				src={story.image}
				alt={story.title}
				class="aspect-[16/10] w-full rounded-xl object-cover"
				loading="eager"
				decoding="async"
			/>
		{/if}

		<div class="prose prose-sm max-w-none text-sm leading-relaxed">
			{@html sanitizeHtml(story.body ?? '')}
		</div>

		{#if story.supplierSlug}
			<div class="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
				<p class="text-xs text-muted-foreground">Supplied by</p>
				<p class="mt-0.5 truncate text-sm font-semibold">{data.supplierName}</p>
				<Button
					href={localizeHref(`/supplier/${story.supplierSlug}`)}
					variant="outline"
					size="sm"
					class="mt-2"
				>
					View supplier profile
				</Button>
			</div>
		{/if}

		<div class="flex items-center gap-2">
			<span class="text-xs text-muted-foreground">Share:</span>
			<ShareButtons title={story.title ?? 'HalalNeo success story'} text={story.excerpt ?? ''} />
		</div>

		<RelatedLinks
			title="More success stories"
			items={(data.related ?? []).map((s: any) => ({
				label: s.title,
				description: s.dealValue ?? s.buyerCountry,
				href: `/success-stories/${s.slug}`
			}))}
		/>
	</div>
{:else}
	<div class="flex min-h-[50vh] items-center justify-center">
		<div class="space-y-4 text-center">
			<p class="text-lg text-muted-foreground">Story not found.</p>
			<Button href={localizeHref('/success-stories')} variant="outline">Browse Stories</Button>
		</div>
	</div>
{/if}
