<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Card, CardContent } from '#lib/components/ui/card/index.js';
	import Breadcrumb from '#lib/components/site/breadcrumb.svelte';
	import { sanitizeHtml } from '#lib/sanitize.js';
	import Share2 from '@lucide/svelte/icons/share-2';
	import Bookmark from '@lucide/svelte/icons/bookmark';
	import ExternalLink from '@lucide/svelte/icons/external-link';

	let { data } = $props();

	const seo = $derived(data.seo ?? {});
	const item = $derived(data.item);
	const related = $derived(data.related ?? []);

	let activeId = $state('');

	const tocItems = $derived.by(() => {
		if (!item?.body) return [];
		const matches = item.body.match(/<h2[^>]*id="([^"]*)"[^>]*>([^<]+)<\/h2>/g) ?? [];
		return matches.map((m: string) => {
			const idMatch = m.match(/id="([^"]*)"/);
			const textMatch = m.match(/>([^<]+)</);
			return { id: idMatch?.[1] ?? '', text: textMatch?.[1]?.trim() ?? '' };
		}).filter((t: {id: string; text: string}) => t.id && t.text);
	});

	const baseUrl = 'https://halalneo.com';
	const ogImage = $derived(seo.ogImage ?? `${baseUrl}/og-default.svg`);

	const breadcrumbSchema = $derived({
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: [
			{ '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
			{ '@type': 'ListItem', position: 2, name: 'Knowledge Base', item: `${baseUrl}/knowledge-base` },
			{ '@type': 'ListItem', position: 3, name: data.section ?? '', item: `${baseUrl}/knowledge-base/${data.section}` },
			{ '@type': 'ListItem', position: 4, name: item?.title ?? '', item: `${baseUrl}/knowledge-base/${data.section}/${data.article}` }
		]
	});

	const articleSchema = $derived(
		item
			? {
					'@context': 'https://schema.org',
					'@type': 'Article',
					headline: item.title,
					abstract: item.summary,
					image: ogImage,
					url: `${baseUrl}/knowledge-base/${item.sectionSlug}/${data.slug}`,
					mainEntityOfPage: {
						'@type': 'WebPage',
						'@id': `${baseUrl}/knowledge-base/${item.sectionSlug}/${data.slug}`
					},
					author: { '@type': 'Organization', name: 'HalalNeo' },
					publisher: {
						'@type': 'Organization',
						name: 'HalalNeo',
						logo: { '@type': 'ImageObject', url: `${baseUrl}/og-default.svg` }
					}
				}
			: null
	);
</script>

<svelte:head>
	<title>{data.item?.title ?? 'Knowledge Base Article'} — HalalNeo</title>
	<meta name="description" content={data.item?.summary?.slice(0, 160) ?? data.item?.body?.replace(/<[^>]*>/g, '').slice(0, 160)} />
	{#if articleSchema}
		{@html `<script type="application/ld+json">${JSON.stringify(articleSchema)}</script>`}
	{/if}
	{@html `<script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>`}
</svelte:head>

<div class="container mx-auto max-w-7xl px-4 py-8 sm:px-6">
	{#if data.item}
		<Breadcrumb items={[
			{ label: 'Knowledge Base', href: '/knowledge-base' },
			{ label: data.item.sectionName ?? 'Section', href: `/knowledge-base/${data.item.sectionSlug}` },
			{ label: data.item.title ?? 'Article' }
		]} />

		<div class="flex gap-6">
			<aside class="hidden w-56 shrink-0 lg:block">
				<div class="sticky top-20 space-y-6">
					<Card>
						<CardContent class="p-4">
							<h3 class="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">On this page</h3>
							<nav class="space-y-1">
								{#each tocItems as tocItem}
									<a
										href="#{tocItem.id}"
										class="block rounded-md px-2 py-1 text-xs transition-colors hover:bg-accent hover:text-accent-foreground {activeId === tocItem.id ? 'bg-accent font-medium text-accent-foreground' : 'text-muted-foreground'}"
									>
										{tocItem.text}
									</a>
								{/each}
							</nav>
						</CardContent>
					</Card>

					<div class="rounded-xl border border-primary/20 bg-primary/5 p-4">
						<h4 class="mb-1 text-sm font-semibold">Need Help?</h4>
						<p class="mb-3 text-xs text-muted-foreground">Check if ingredients are halal compliant.</p>
						<Button href="/tools/ingredient-checker" size="sm" class="w-full">Ingredient Checker</Button>
					</div>
				</div>
			</aside>

			<article class="min-w-0 flex-1 space-y-8">
				<header class="space-y-4">
					<div class="flex flex-wrap items-center gap-2">
						<Badge variant="secondary">{data.item.sectionName}</Badge>
						<Badge variant="outline">{data.item.readTime}</Badge>
					</div>
					<h1 class="text-3xl font-bold tracking-tight sm:text-4xl">{data.item.title}</h1>
					<p class="text-lg text-muted-foreground">{data.item.summary}</p>
				</header>

				<div class="prose max-w-none prose-neutral dark:prose-invert">
					{@html sanitizeHtml(data.item.body ?? data.item.content)}
				</div>

				<div class="flex flex-wrap gap-2 border-t border-border pt-6">
					{#each (data.item.tags ?? []) as tag}
						<Badge variant="secondary">{tag}</Badge>
					{/each}
				</div>

				<div class="flex items-center justify-between rounded-xl border border-border bg-muted/40 px-4 py-3">
					<span class="text-sm text-muted-foreground">Found this helpful?</span>
					<div class="flex items-center gap-2">
						<Button variant="outline" size="sm"><Share2 class="mr-1 size-3.5" /> Share</Button>
						<Button variant="outline" size="sm"><Bookmark class="mr-1 size-3.5" /> Bookmark</Button>
						<Button variant="outline" size="sm"><ExternalLink class="mr-1 size-3.5" /> Copy Link</Button>
					</div>
				</div>

				{#if related.length > 0}
					<section class="space-y-4 border-t border-border pt-8">
						<h2 class="text-xl font-semibold tracking-tight">Related Articles</h2>
						<div class="grid gap-3 sm:grid-cols-3">
							{#each related as rel}
								<a href="/knowledge-base/{rel.sectionSlug}/{rel.slug}" class="group block rounded-xl bg-card shadow-sm p-4 transition-all hover:shadow-md">
									<h3 class="text-sm font-semibold group-hover:text-primary transition-colors">{rel.title}</h3>
									<p class="mt-1 line-clamp-2 text-xs text-muted-foreground">{rel.summary}</p>
									<div class="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground">
										<span>{rel.readTime}</span>
									</div>
								</a>
							{/each}
						</div>
					</section>
				{/if}

				<footer class="border-t border-border pt-6">
					<Button href="/knowledge-base/{data.item.sectionSlug}" variant="outline">
						← Back to {data.item.sectionName}
					</Button>
				</footer>

				<div class="mt-8 border-t border-border pt-6">
					<h2 class="text-xl font-semibold tracking-tight mb-4">Explore More</h2>
					<div class="grid gap-4 sm:grid-cols-3">
						<a href="/certifying-bodies" class="group block rounded-xl border border-border bg-card p-5 transition-all hover:shadow-md">
							<div class="mb-2">
								<svg class="size-5 text-primary/60 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/></svg>
							</div>
							<h3 class="text-sm font-semibold group-hover:text-primary transition-colors">Halal Certifying Bodies</h3>
							<p class="text-xs text-muted-foreground mt-1">Browse accredited halal certification organizations worldwide.</p>
							<span class="text-xs font-medium text-primary mt-2 inline-block group-hover:translate-x-0.5 transition-transform">View Bodies &rarr;</span>
						</a>
						<a href="/market-guides" class="group block rounded-xl border border-border bg-card p-5 transition-all hover:shadow-md">
							<div class="mb-2">
								<svg class="size-5 text-primary/60 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/></svg>
							</div>
							<h3 class="text-sm font-semibold group-hover:text-primary transition-colors">Market Guides</h3>
							<p class="text-xs text-muted-foreground mt-1">Regional halal market insights and compliance guides.</p>
							<span class="text-xs font-medium text-primary mt-2 inline-block group-hover:translate-x-0.5 transition-transform">Read Guides &rarr;</span>
						</a>
						<a href="/tools/ingredient-checker" class="group block rounded-xl border border-border bg-card p-5 transition-all hover:shadow-md">
							<div class="mb-2">
								<svg class="size-5 text-primary/60 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"/></svg>
							</div>
							<h3 class="text-sm font-semibold group-hover:text-primary transition-colors">AI Ingredient Checker</h3>
							<p class="text-xs text-muted-foreground mt-1">Verify if ingredients are halal with our AI-powered tool.</p>
							<span class="text-xs font-medium text-primary mt-2 inline-block group-hover:translate-x-0.5 transition-transform">Check Ingredients &rarr;</span>
						</a>
					</div>
				</div>
			</article>
		</div>
	{:else}
		<div class="flex min-h-[50vh] items-center justify-center">
			<div class="space-y-4 text-center">
				<p class="text-lg text-muted-foreground">Article coming soon.</p>
				<Button href="/knowledge-base" variant="outline">Browse Knowledge Base</Button>
			</div>
		</div>
	{/if}
</div>
