<script lang="ts">
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Card, CardContent } from '#lib/components/ui/card/index.js';
	import Breadcrumb from '#lib/components/site/breadcrumb.svelte';
	import ShareButtons from '#lib/components/site/share-buttons.svelte';
	import RelatedLinks from '#lib/components/site/related-links.svelte';
	import { sanitizeHtml } from '#lib/sanitize.js';
	import { marked } from 'marked';
	import { onMount } from 'svelte';

	let { data } = $props();

	const seo = $derived(data.seo ?? {});
	const item = $derived(data.item);
	const related = $derived(data.related ?? []);

	let activeId = $state('');

	function slugifyHeading(text: string): string {
		return text
			.toLowerCase()
			.trim()
			.replace(/<[^>]*>/g, '')
			.replace(/[^a-z0-9\u4e00-\u9fa5\s-]/g, '')
			.replace(/\s+/g, '-')
			.replace(/-+/g, '-')
			.replace(/^-+|-+$/g, '');
	}

	// Bodies are stored as Markdown in D1 (some legacy rows are raw HTML).
	// Convert Markdown -> HTML, ensure every h2 has an id for the TOC.
	const renderedBody = $derived.by(() => {
		const raw = (item?.body ?? item?.content ?? '') as string;
		if (!raw) return '';
		let html: string;
		if (/<\s*h[12][\s>]/i.test(raw)) {
			html = raw;
		} else {
			html = marked.parse(raw, { async: false }) as string;
		}
		html = html.replace(/<h2>([^<]+)<\/h2>/g, (_, t: string) => {
			const id = slugifyHeading(t);
			return id ? `<h2 id="${id}">${t}</h2>` : `<h2>${t}</h2>`;
		});
		return sanitizeHtml(html);
	});

	const tocItems = $derived.by(() => {
		const matches = renderedBody.match(/<h2[^>]*id="([^"]*)"[^>]*>([^<]+)<\/h2>/g) ?? [];
		return matches
			.map((m: string) => {
				const idMatch = m.match(/id="([^"]*)"/);
				const textMatch = m.match(/>([^<]+)</);
				return { id: idMatch?.[1] ?? '', text: textMatch?.[1]?.trim() ?? '' };
			})
			.filter((t: { id: string; text: string }) => t.id && t.text);
	});

	let articleEl: HTMLElement | undefined = $state();

	onMount(() => {
		if (!articleEl) return;
		const headings = articleEl.querySelectorAll('h2[id]');
		if (headings.length === 0) return;
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) activeId = entry.target.id;
				}
			},
			{ rootMargin: '-20% 0px -70% 0px' }
		);
		headings.forEach((h) => observer.observe(h));
		return () => observer.disconnect();
	});

	const baseUrl = 'https://halalneo.com';
	const ogImage = $derived(seo.ogImage ?? `${baseUrl}/api/media/og-default.png`);

	const breadcrumbSchema = $derived({
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: [
			{ '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
			{
				'@type': 'ListItem',
				position: 2,
				name: 'Knowledge Base',
				item: `${baseUrl}/knowledge-base`
			},
			{
				'@type': 'ListItem',
				position: 3,
				name: data.section ?? '',
				item: `${baseUrl}/knowledge-base/${data.section}`
			},
			{
				'@type': 'ListItem',
				position: 4,
				name: item?.title ?? '',
				item: `${baseUrl}/knowledge-base/${data.section}/${data.article}`
			}
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
						logo: { '@type': 'ImageObject', url: `${baseUrl}/api/media/og-default.png` }
					}
				}
			: null
	);
</script>

<svelte:head>
	<title>{data.item?.title ?? 'Knowledge Base Article'} — HalalNeo</title>
	<meta
		name="description"
		content={data.item?.summary?.slice(0, 160) ??
			data.item?.body?.replace(/<[^>]*>/g, '').slice(0, 160)}
	/>
	{#if articleSchema}
		{@html `<script type="application/ld+json">${JSON.stringify(articleSchema)}</script>`}
	{/if}
	{@html `<script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>`}
</svelte:head>

<div class="py-8">
	{#if data.item}
		<Breadcrumb
			items={[
				{ label: 'Knowledge Base', href: '/knowledge-base' },
				{
					label: data.item.sectionName ?? 'Section',
					href: `/knowledge-base/${data.item.sectionSlug}`
				},
				{ label: data.item.title ?? 'Article' }
			]}
		/>

		<div class="flex gap-6">
			<aside class="hidden w-56 shrink-0 lg:block">
				<div class="sticky top-20 space-y-6">
					<Card>
						<CardContent class="p-4">
							<h3 class="mb-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
								On this page
							</h3>
							<nav class="space-y-1">
								{#each tocItems as tocItem}
									<a
										href="#{tocItem.id}"
										class="block rounded-md px-2 py-1 text-xs transition-colors hover:bg-accent hover:text-accent-foreground {activeId ===
										tocItem.id
											? 'bg-accent font-medium text-accent-foreground'
											: 'text-muted-foreground'}"
									>
										{tocItem.text}
									</a>
								{/each}
							</nav>
						</CardContent>
					</Card>

					<div class="rounded-xl border border-primary/20 bg-primary/5 p-4">
						<h4 class="mb-1 text-sm font-semibold">Need Help?</h4>
						<p class="mb-3 text-xs text-muted-foreground">
							Check if ingredients are halal compliant.
						</p>
						<Button href={localizeHref('/tools/ingredient-checker')} size="sm" class="w-full"
							>Ingredient Checker</Button
						>
					</div>
				</div>
			</aside>

		<article class="min-w-0 flex-1 space-y-6" bind:this={articleEl}>
			<header class="space-y-4">
				<div class="flex flex-wrap items-center gap-2">
					<Badge variant="secondary">{data.item.sectionName}</Badge>
					<Badge variant="outline">{data.item.readTime}</Badge>
				</div>
				<h1 class="text-3xl font-bold tracking-tight sm:text-4xl">{data.item.title}</h1>
				<p class="text-lg text-muted-foreground">{data.item.summary}</p>
			</header>

			<div class="prose max-w-none prose-neutral dark:prose-invert overflow-hidden [&_*]:scroll-mt-24">
				{@html renderedBody}
			</div>

				<div class="flex flex-wrap gap-2 border-t border-border pt-6">
					{#each data.item.tags ?? [] as tag}
						<a href={localizeHref(`/search?q=${encodeURIComponent(tag)}`)}>
							<Badge
								variant="secondary"
								class="transition-colors hover:text-primary hover:shadow-md">{tag}</Badge
							>
						</a>
					{/each}
				</div>

				<div class="space-y-3 rounded-xl border border-border bg-muted/40 p-4">
					<span class="text-sm text-muted-foreground">Found this helpful? Share it with your network.</span>
					<ShareButtons title={data.item.title ?? ''} text={data.item.summary ?? ''} />
				</div>

				{#if related.length > 0}
					<section class="space-y-4 border-t border-border pt-8">
						<h2 class="text-xl font-semibold tracking-tight">Related Articles</h2>
						<div class="grid gap-3 sm:grid-cols-3">
							{#each related as rel}
								<a
									href={localizeHref(`/knowledge-base/${rel.sectionSlug}/${rel.slug}`)}
									class="group block rounded-xl bg-card p-4 shadow-sm transition-all hover:shadow-md"
								>
									<h3 class="text-sm font-semibold transition-colors group-hover:text-primary">
										{rel.title}
									</h3>
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
					<Button href={localizeHref(`/knowledge-base/${data.item.sectionSlug}`)} variant="outline">
						← Back to {data.item.sectionName}
					</Button>
				</footer>

			<div class="mt-8 border-t border-border pt-6">
				<RelatedLinks
					title="Explore More"
					items={[
						{ label: 'Halal Certifying Bodies', description: 'Browse accredited halal certification organizations worldwide.', href: '/certifying-bodies' },
						{ label: 'Market Guides', description: 'Regional halal market insights and compliance guides.', href: '/market-guides' },
						{ label: 'AI Ingredient Checker', description: 'Verify if ingredients are halal with our AI-powered tool.', href: '/tools/ingredient-checker' }
					]}
				/>
			</div>
			</article>
		</div>
	{:else}
		<div class="flex min-h-[50vh] items-center justify-center">
			<div class="space-y-4 text-center">
				<p class="text-lg text-muted-foreground">Article coming soon.</p>
				<Button href={localizeHref('/knowledge-base')} variant="outline"
					>Browse Knowledge Base</Button
				>
			</div>
		</div>
	{/if}
</div>

