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

	let { data } = $props();
	let search = $state('');
	let activeCategory = $state('all');

	const blogImages = ['/api/media/blog-featured-1.webp', '/api/media/blog-featured-2.webp', '/api/media/blog-1.webp', '/api/media/blog-2.webp', '/api/media/blog-3.webp'];

	const categoryOptions = $derived([
		{ value: 'all', label: 'All' },
		...Array.from(
			new Set((data.posts ?? []).map((p: any) => p.category).filter((c): c is string => !!c))
		)
			.sort()
			.map((c) => ({
				value: c,
				label: c,
				count: (data.posts ?? []).filter((p: any) => p.category === c && p.status === 'published')
					.length
			}))
	]);

	const published = $derived(
		(data.posts ?? [])
			.filter((p: any) => p.status === 'published')
			.toSorted((a: any, b: any) => (b.date ?? '').localeCompare(a.date ?? ''))
			.filter((p: any) =>
				search.trim()
					? p.title.toLowerCase().includes(search.toLowerCase())
					: true
			)
			.filter((p: any) => (activeCategory === 'all' ? true : p.category === activeCategory))
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
	{@html `<script type="application/ld+json">${JSON.stringify(data.itemList)}</script>`}
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
		<div
			class="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground"
		>
			No published posts yet.
		</div>
	{:else}
		<div class="grid gap-3 sm:grid-cols-2">
			{#each paged as post, idx (post.slug)}
				<Card class="overflow-hidden">
					<article>
						<a href={localizeHref(`/blog/${post.slug}`)} class="group block">
							<div class="aspect-[2/1] overflow-hidden bg-muted">
								<img src={post.featuredImage || blogImages[idx % blogImages.length]} srcset={`${post.featuredImage || blogImages[idx % blogImages.length]}?w=480 480w, ${post.featuredImage || blogImages[idx % blogImages.length]} 1200w`} sizes="(max-width: 640px) 100vw, 600px" alt={post.title} class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" decoding="async" width="600" height="300" />
							</div>
							<CardContent class="space-y-2 pt-3">
								<div class="flex items-center gap-2 text-xs text-muted-foreground">
									{#if post.category}
										<Badge variant="outline" class="text-[10px]">{post.category}</Badge>
									{/if}
									<span class="font-medium text-foreground/80">{post.author}</span>
									<span>·</span>
									<time datetime={post.date}>{post.date}</time>
								</div>
								<CardTitle class="text-lg leading-snug group-hover:text-primary">
									{post.title}
								</CardTitle>
								<p class="text-sm text-muted-foreground">{post.excerpt}</p>
								<div class="flex flex-wrap gap-1.5 pt-1">
									{#each post.tags as tag (tag)}
										<Badge variant="secondary">{tag}</Badge>
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
