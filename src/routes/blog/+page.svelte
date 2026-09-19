<script lang="ts">
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { Card, CardContent, CardTitle } from '#lib/components/ui/card/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import Newspaper from '@lucide/svelte/icons/newspaper';
	import SearchIcon from '@lucide/svelte/icons/search';
	import Breadcrumb from '#lib/components/site/breadcrumb.svelte';
	import { Input } from '#lib/components/ui/input/index.js';
	import Paginator from '#lib/components/site/paginator.svelte';
	import FilterPills from '#lib/components/site/filter-pills.svelte';
	import { Empty, EmptyMedia, EmptyTitle } from '#lib/components/ui/empty/index.js';

	let { data } = $props();
	let search = $state('');
	let activeCategory = $state('all');

	interface BlogPostRow {
		title: string;
		category?: string | null;
		status?: string | null;
		date?: string | null;
	}

	const blogImages = ['/api/media/blog-featured-1.webp', '/api/media/blog-featured-2.webp', '/api/media/blog-1.webp', '/api/media/blog-2.webp', '/api/media/blog-3.webp'];

	const categoryOptions = $derived([
		{ value: 'all', label: 'All' },
		...Array.from(
			new Set((data.posts ?? []).map((p: BlogPostRow) => p.category).filter((c): c is string => !!c))
		)
			.sort()
			.map((c) => ({
				value: c,
				label: c,
				count: (data.posts ?? []).filter((p: BlogPostRow) => p.category === c && p.status === 'published')
					.length
			}))
	]);

	const published = $derived(
		(data.posts ?? [])
			.filter((p: BlogPostRow) => p.status === 'published')
			.toSorted((a: BlogPostRow, b: BlogPostRow) => (b.date ?? '').localeCompare(a.date ?? ''))
			.filter((p: BlogPostRow) =>
				search.trim()
					? p.title.toLowerCase().includes(search.toLowerCase())
					: true
			)
			.filter((p: BlogPostRow) => (activeCategory === 'all' ? true : p.category === activeCategory))
	);

	const PAGE_SIZE = 6;
	let page = $state(1);
	const totalPages = $derived(Math.max(1, Math.ceil(published.length / PAGE_SIZE)));
	const paged = $derived(published.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE));

	$effect(() => {
		void search;
		void activeCategory;
		page = 1;
	});
</script>

<Breadcrumb items={[{ label: 'Blog', href: '/blog' }]} />

<svelte:head>
	{@html `\u003cscript type="application/ld+json">${JSON.stringify(data.itemList)}\u003c/script>`}
</svelte:head>

<section class="space-y-4 sm:space-y-6">
	<div class="max-w-2xl space-y-2">
		<div class="flex items-center gap-2 text-sm font-medium text-muted-foreground">
			<Newspaper class="size-4"></Newspaper>
			Blog
		</div>
		<h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">News & insights</h1>
		<p class="text-muted-foreground">
			Updates on halal certification, sourcing and market intelligence.
		</p>
	</div>

	<div class="relative">
		<SearchIcon class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
		<Input
			type="search"
			placeholder="Search articles..."
			class="pl-9"
			bind:value={search}
		/>
	</div>

	{#if categoryOptions.length > 1}
		<FilterPills
			options={categoryOptions}
			bind:value={activeCategory}
			ariaLabel="Filter posts by category"
		/>
	{/if}

	{#if published.length === 0}
		<Empty>
			<EmptyMedia><Newspaper class="size-6 text-muted-foreground"></Newspaper></EmptyMedia>
			<EmptyTitle>No published posts yet.</EmptyTitle>
		</Empty>
	{:else}
		<div class="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-3">
			{#each paged as post, idx (post.slug)}
				<Card class="overflow-hidden">
					<article>
						<a href={localizeHref(`/blog/${post.slug}`)} class="group block">
							<div class="aspect-[16/10] overflow-hidden bg-muted sm:aspect-[4/3]">
								<img
									src={post.featuredImage || blogImages[idx % blogImages.length]}
									alt={post.title}
									class="h-full w-full object-cover transition-transform duration-slow group-hover:scale-105"
									loading="lazy"
									decoding="async"
									width="600"
									height="400"
								/>
							</div>
							<CardContent class="space-y-2 pt-3 sm:space-y-3 sm:pt-4">
								<div class="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
									{#if post.category}
										<Badge variant="outline" class="text-2xs">{post.category}</Badge>
									{/if}
									<span class="font-medium text-foreground/80">{post.author}</span>
									{#if post.date}
										<span>·</span>
										<time datetime={post.date}
											>{new Date(post.date).toLocaleDateString('en-US', {
												year: 'numeric',
												month: 'short',
												day: 'numeric'
											})}</time
										>
									{/if}
								</div>
								<CardTitle class="line-clamp-2 text-sm leading-snug group-hover:text-primary sm:text-lg">
									{post.title}
								</CardTitle>
								{#if post.excerpt && post.excerpt.trim()}
									<p 
										class="hidden text-sm text-muted-foreground line-clamp-2 sm:block"
										title={post.excerpt}
									>
										{post.excerpt}
									</p>
								{/if}
								<div class="flex flex-wrap gap-1.5 pt-1">
									{#each post.tags as tag (tag)}
										<Badge variant="secondary" class="text-2xs max-w-[60px] truncate">
											{tag}
										</Badge>
									{/each}
								</div>
							</CardContent>
						</a>
					</article>
				</Card>
			{/each}
		</div>
		<Paginator bind:page {totalPages} />
	{/if}
</section>
