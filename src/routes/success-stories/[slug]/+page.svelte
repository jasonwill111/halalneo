<script lang="ts">
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Card, CardContent } from '#lib/components/ui/card/index.js';
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
	{@html `\u003cscript type="application/ld+json">${JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'Article',
		headline: story?.title ?? '',
		description: story?.excerpt ?? story?.body?.slice(0, 200) ?? '',
		url: `https://halalneo.com/success-stories/${data.slug}`,
		image: story?.image ? [story.image] : [],
		author: story?.supplierSlug
			? { '@type': 'Organization', name: data.supplierName ?? story.supplierSlug }
			: { '@type': 'Organization', name: 'HalalNeo' },
		datePublished: story?.createdAt
			? new Date(story.createdAt).toISOString()
			: new Date().toISOString(),
		dateModified: story?.updatedAt
			? new Date(story.updatedAt).toISOString()
			: new Date().toISOString(),
		publisher: {
			'@type': 'Organization',
			name: 'HalalNeo',
			url: 'https://halalneo.com',
			logo: {
				'@type': 'ImageObject',
				url: 'https://halalneo.com/brand/og-default.png',
				width: 600,
				height: 600
			}
		},
		mainEntityOfPage: {
			'@type': 'WebPage',
			'@id': `https://halalneo.com/success-stories/${data.slug}`
		},
		...(story.dealValue
			? { about: [{ '@type': 'MonetaryAmount', currency: 'USD', value: story.dealValue }] }
			: {})
	})}\u003c/script>`}
</svelte:head>

{#if story}
	<div class="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
		<Breadcrumb
			items={[
				{ label: 'Success Stories', href: '/success-stories' },
				{ label: story.title ?? 'Story' }
			]}
		/>

		<div class="grid items-start gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
			<main class="min-w-0 space-y-4 sm:space-y-6">
				<header class="space-y-3">
					<div class="flex flex-wrap items-center gap-1.5">
						<Badge class="bg-success/15 text-2xs text-success">
							<TrophyIcon class="size-3" />
							Success story
						</Badge>
						{#if story.dealValue}
							<Badge variant="outline" class="text-2xs">{story.dealValue}</Badge>
						{/if}
						{#if story.buyerCountry}
							<span class="inline-flex items-center gap-1 text-xs text-muted-foreground">
								<MapPinIcon class="size-3.5" />
								Buyer in {story.buyerCountry}
							</span>
						{/if}
					</div>
					<h1 class="text-xl font-bold tracking-tight sm:text-2xl">{story.title}</h1>
					{#if story.excerpt}
						<p class="text-sm leading-relaxed text-muted-foreground sm:text-base">
							{story.excerpt}
						</p>
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

				<div class="content-body content-body-sm max-w-[65ch] overflow-hidden">
					{@html sanitizeHtml(story.body ?? '')}
				</div>

				{#if story.supplierSlug}
					<div class="rounded-xl bg-card p-3 ring-1 ring-foreground/10 sm:p-4">
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
					<ShareButtons
						title={story.title ?? 'HalalNeo success story'}
						text={story.excerpt ?? ''}
					/>
				</div>

				<RelatedLinks
					title="More success stories"
					items={(data.related ?? []).map((s) => ({
						label: s.title,
						description: s.dealValue ?? s.buyerCountry ?? '',
						href: `/success-stories/${s.slug}`
					}))}
				/>
			</main>

			<aside class="min-w-0 lg:shrink-0">
				<div class="space-y-4 lg:sticky lg:top-20 lg:z-10 lg:self-start">
					{#if story.supplierSlug}
						<Card class="bg-card">
							<CardContent class="space-y-4 p-5">
								<div>
									<h4 class="text-sm font-semibold">Supplier Information</h4>
									<p class="text-xs text-muted-foreground">Verified certified supplier</p>
								</div>
								<div class="space-y-2">
									<p class="text-sm font-medium">{data.supplierName}</p>
									<Button
										href={localizeHref(`/supplier/${story.supplierSlug}`)}
										variant="outline"
										size="sm"
										class="w-full"
									>
										View full profile
									</Button>
								</div>
							</CardContent>
						</Card>
					{/if}

					{#if data.related && data.related.length > 0}
						<Card class="bg-card">
							<CardContent class="space-y-3 p-5">
								<h4 class="text-sm font-semibold">More Success Stories</h4>
								<div class="space-y-3">
									{#each data.related.slice(0, 5) as s (s.slug)}
										<a
											href={localizeHref(`/success-stories/${s.slug}`)}
											class="group block rounded-lg bg-card p-3 ring-1 ring-foreground/10 transition-shadow hover:ring-foreground/20"
										>
											<h5 class="line-clamp-2 text-xs font-medium group-hover:text-primary">
												{s.title}
											</h5>
											<p class="mt-0.5 text-2xs text-muted-foreground">
												{s.dealValue ?? s.buyerCountry}
											</p>
										</a>
									{/each}
								</div>
							</CardContent>
						</Card>
					{/if}

					<Card class="border-primary/20 bg-primary/5">
						<CardContent class="space-y-4 p-5">
							<div class="text-sm">
								<h4 class="font-semibold">Share this Success</h4>
								<p class="mt-1 text-xs text-muted-foreground">
									Spread the word about this achievement.
								</p>
							</div>
							<ShareButtons title={story.title ?? ''} text={story.excerpt ?? ''} />
						</CardContent>
					</Card>

					<Button href={localizeHref('/success-stories')} variant="outline" class="w-full">
						View All Success Stories
					</Button>
				</div>
			</aside>
		</div>
	</div>
{:else}
	<div class="flex min-h-[50vh] items-center justify-center">
		<div class="space-y-4 text-center">
			<p class="text-sm text-muted-foreground">Story not found.</p>
			<Button href={localizeHref('/success-stories')} variant="outline">Browse Stories</Button>
		</div>
	</div>
{/if}
