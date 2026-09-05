<script lang="ts">
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Card, CardContent } from '#lib/components/ui/card/index.js';
	import { Avatar, AvatarFallback } from '#lib/components/ui/avatar/index.js';
	import Breadcrumb from '#lib/components/site/breadcrumb.svelte';
	import { sanitizeHtml } from '#lib/sanitize.js';

	let { data } = $props();

	const blogImages = [
		'/api/media/blog-featured-1.webp',
		'/api/media/blog-featured-2.webp',
		'/api/media/blog-1.webp',
		'/api/media/blog-2.webp',
		'/api/media/blog-3.webp'
	];

	const seo = $derived(data.seo ?? {});
	const item = $derived(data.item);
	const readTime = $derived((data.item as any)?.readTime as string | undefined);

	const baseUrl = 'https://halalneo.com';
	const ogImage = $derived(seo.ogImage ?? `${baseUrl}/api/media/og-default.svg`);

	const blogSchema = $derived(
		item
			? {
					'@context': 'https://schema.org',
					'@type': 'BlogPosting',
					headline: item.title,
					image: ogImage,
					author: item.author ? { '@type': 'Person', name: item.author.name } : undefined,
					datePublished: item.date,
					dateModified: item.date,
					mainEntityOfPage: {
						'@type': 'WebPage',
						'@id': `${baseUrl}/blog/${data.slug}`
					},
					wordCount: Math.ceil((item.content?.length ?? 0) / 5),
					articleSection: item.tags?.length ? item.tags.join(', ') : undefined,
					publisher: {
						'@type': 'Organization',
						name: 'HalalNeo',
						logo: { '@type': 'ImageObject', url: `${baseUrl}/api/media/og-default.svg` }
					}
				}
			: null
	);
</script>

<svelte:head>
	<title>{data.item?.title ?? 'Blog Post'} — HalalNeo</title>
	<meta
		name="description"
		content={data.item?.excerpt?.slice(0, 160) ?? data.item?.content?.slice(0, 160)}
	/>
	{#if blogSchema}
		{@html `<script type="application/ld+json">${JSON.stringify(blogSchema)}</script>`}
	{/if}
</svelte:head>

<div class="mx-auto max-w-3xl py-8">
	{#if data.item}
		<Breadcrumb
			items={[{ label: 'Blog', href: '/blog' }, { label: data.item.title ?? 'Blog Post' }]}
		/>
		<article class="space-y-6">
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
						<div class="flex items-center gap-2 text-xs text-muted-foreground">
							<time>{data.item.date}</time>
							{#if readTime}
								<span>·</span>
								<span>{readTime}</span>
							{/if}
						</div>
					</div>
				</div>
			</header>

			{#if data.item.image}
				<img
					src={data.item.image}
					alt={data.item.title}
					class="aspect-[2/1] w-full rounded-xl object-cover"
					loading="eager"
					fetchpriority="high"
					decoding="async"
					width="1200"
					height="600"
					onerror={(e) => {
						e.currentTarget.style.display = 'none';
					}}
				/>
			{:else}
				<div class="relative overflow-hidden rounded-xl border border-border">
					<div class="aspect-[2/1] w-full">
						<img
							src={blogImages[0]}
							alt={data.item.title}
							class="h-full w-full object-cover"
							loading="eager"
							fetchpriority="high"
							decoding="async"
							width="1200"
							height="600"
						/>
					</div>
				</div>
			{/if}

			<div class="prose max-w-none prose-neutral dark:prose-invert overflow-hidden">
				{@html sanitizeHtml(data.item.content)}
			</div>

			<div class="flex flex-wrap gap-2 border-t border-border pt-6">
				{#each data.item.tags as tag}
					<Badge variant="secondary">{tag}</Badge>
				{/each}
			</div>

			<Card>
				<CardContent class="flex items-center justify-between p-4">
					<p class="text-sm text-muted-foreground">Found this helpful?</p>
					<div class="flex gap-2">
						<Button variant="outline" size="sm">Share</Button>
						<Button variant="outline" size="sm">Bookmark</Button>
						<Button
							variant="outline"
							size="sm"
							href="https://twitter.com/intent/tweet?text={encodeURIComponent(
								data.item.title ?? ''
							)}&url={encodeURIComponent('https://halalneo.com/blog/' + data.slug)}"
							target="_blank"
							rel="noopener">Twitter</Button
						>
					</div>
				</CardContent>
			</Card>

			{#if data.related?.length}
				<section class="space-y-4 border-t border-border pt-8">
					<h2 class="text-xl font-semibold tracking-tight">Related articles</h2>
					<div class="grid gap-3 sm:grid-cols-3">
						{#each data.related as related}
							<a
								href={localizeHref(`/blog/${related.slug}`)}
								class="group block rounded-xl border border-border bg-card p-4 transition-all hover:shadow-md"
							>
								<div class="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
									<span class="font-medium text-foreground/80">{related.author.name}</span>
									<span>·</span>
									<time>{related.date}</time>
								</div>
								<h3
									class="mb-2 text-sm leading-snug font-semibold transition-colors group-hover:text-primary"
								>
									{related.title}
								</h3>
								<p class="line-clamp-2 text-xs text-muted-foreground">{related.excerpt}</p>
								{#if related.tags?.length}
									<div class="mt-3 flex flex-wrap gap-1.5">
										{#each related.tags as tag}
											<span
												class="inline-flex items-center rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-secondary-foreground"
												>{tag}</span
											>
										{/each}
									</div>
								{/if}
							</a>
						{/each}
					</div>
				</section>
			{/if}

			<div class="mt-8 border-t border-border pt-6">
				<h2 class="mb-4 text-xl font-semibold tracking-tight">Explore Related Resources</h2>
				<div class="grid gap-4 sm:grid-cols-3">
					<a
						href={localizeHref('/products')}
						class="group block rounded-xl border border-border bg-card p-4 transition-all hover:shadow-md"
					>
						<div class="mb-2">
							<svg
								class="size-5 text-primary/60 transition-colors group-hover:text-primary"
								fill="none"
								stroke="currentColor"
								stroke-width="1.5"
								viewBox="0 0 24 24"
								><path
									d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
								/></svg
							>
						</div>
						<h3 class="text-sm font-semibold transition-colors group-hover:text-primary">
							Browse Halal Products
						</h3>
						<p class="mt-1 text-xs text-muted-foreground">
							Explore our catalog of certified halal products.
						</p>
						<span
							class="mt-2 inline-block text-xs font-medium text-primary transition-transform group-hover:translate-x-0.5"
							>Browse Products &rarr;</span
						>
					</a>
					<a
						href={localizeHref('/suppliers')}
						class="group block rounded-xl border border-border bg-card p-4 transition-all hover:shadow-md"
					>
						<div class="mb-2">
							<svg
								class="size-5 text-primary/60 transition-colors group-hover:text-primary"
								fill="none"
								stroke="currentColor"
								stroke-width="1.5"
								viewBox="0 0 24 24"
								><path
									d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z"
								/></svg
							>
						</div>
						<h3 class="text-sm font-semibold transition-colors group-hover:text-primary">
							Find Certified Suppliers
						</h3>
						<p class="mt-1 text-xs text-muted-foreground">
							Connect with verified halal-certified suppliers.
						</p>
						<span
							class="mt-2 inline-block text-xs font-medium text-primary transition-transform group-hover:translate-x-0.5"
							>Find Suppliers &rarr;</span
						>
					</a>
					<a
						href={localizeHref('/knowledge-base')}
						class="group block rounded-xl border border-border bg-card p-4 transition-all hover:shadow-md"
					>
						<div class="mb-2">
							<svg
								class="size-5 text-primary/60 transition-colors group-hover:text-primary"
								fill="none"
								stroke="currentColor"
								stroke-width="1.5"
								viewBox="0 0 24 24"
								><path
									d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
								/></svg
							>
						</div>
						<h3 class="text-sm font-semibold transition-colors group-hover:text-primary">
							Read Knowledge Base
						</h3>
						<p class="mt-1 text-xs text-muted-foreground">
							Guides, certifications, and halal compliance insights.
						</p>
						<span
							class="mt-2 inline-block text-xs font-medium text-primary transition-transform group-hover:translate-x-0.5"
							>Read Articles &rarr;</span
						>
					</a>
				</div>
			</div>
		</article>
	{:else}
		<div class="flex min-h-[50vh] items-center justify-center">
			<div class="space-y-4 text-center">
				<p class="text-lg text-muted-foreground">Blog post coming soon.</p>
				<Button href={localizeHref('/blog')} variant="outline">Browse Articles</Button>
			</div>
		</div>
	{/if}
</div>
