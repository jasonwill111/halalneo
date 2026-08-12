<script lang="ts">
	import { localizeHref } from '$lib/paraglide/runtime.js';
	import { adminData } from '$lib/stores/admin-data.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Card, CardContent } from '$lib/components/ui/card';
	import { Avatar, AvatarFallback } from '$lib/components/ui/avatar';
	import {
		Breadcrumb,
		BreadcrumbList,
		BreadcrumbItem,
		BreadcrumbLink,
		BreadcrumbSeparator,
		BreadcrumbPage
	} from '$lib/components/ui/breadcrumb';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import { resolve } from '$app/paths';
	import { error } from '@sveltejs/kit';
	import { marked } from 'marked';

	let { params } = $props();

	const post = $derived(
		adminData.blogPosts.find((p) => p.slug === params.slug && p.status === 'published')
	);
	const html = $derived(post ? marked.parse(post.body) : '');

	const readTime = $derived(
		post ? Math.max(1, Math.round(post.body.split(/\s+/).length / 200)) : 0
	);
	const formattedDate = $derived(
		post
			? new Date(`${post.date}T00:00:00`).toLocaleDateString('en-US', {
					year: 'numeric',
					month: 'short',
					day: 'numeric'
				})
			: ''
	);
	const authorInitials = $derived(
		post
			? post.author
					.split(/\s+/)
					.map((w) => w[0])
					.slice(0, 2)
					.join('')
					.toUpperCase()
			: ''
	);
	const related = $derived(
		post
			? adminData.blogPosts
					.filter(
						(p) =>
							p.slug !== post.slug &&
							p.status === 'published' &&
							p.tags.some((t) => post.tags.includes(t))
					)
					.concat(
						adminData.blogPosts
							.filter((p) => p.slug !== post.slug && p.status === 'published')
							.toSorted((a, b) => b.date.localeCompare(a.date))
					)
					.filter((p, i, arr) => arr.findIndex((q) => q.slug === p.slug) === i)
					.slice(0, 3)
			: []
	);

	$effect(() => {
		if (!post) error(404, 'Post not found');
	});
</script>

<svelte:head><title>{post?.title ?? 'Post'} — HalalNeo</title></svelte:head>

{#if post}
	<section class="space-y-8">
		<Breadcrumb>
			<BreadcrumbList>
				<BreadcrumbItem>
					<BreadcrumbLink href={localizeHref('/blog')}>Blog</BreadcrumbLink>
				</BreadcrumbItem>
				<BreadcrumbSeparator />
				<BreadcrumbItem>
					<BreadcrumbPage>{post.title}</BreadcrumbPage>
				</BreadcrumbItem>
			</BreadcrumbList>
		</Breadcrumb>

		<article class="max-w-3xl space-y-8">
			<header class="space-y-4">
				<div class="flex items-center gap-2 text-sm font-medium text-muted-foreground">
					<span class="text-primary">News & insights</span>
				</div>
				<h1 class="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
					{post.title}
				</h1>
				<p class="text-lg leading-relaxed text-muted-foreground">{post.excerpt}</p>

				<div class="flex items-center gap-3 pt-1">
					<Avatar class="size-8 rounded-lg">
						<AvatarFallback class="rounded-lg bg-accent text-xs text-accent-foreground">
							{authorInitials}
						</AvatarFallback>
					</Avatar>
					<div class="flex items-center gap-1.5 text-sm text-muted-foreground">
						<span class="font-medium text-foreground/80">{post.author}</span>
						<span aria-hidden="true">·</span>
						<time datetime={post.date}>{formattedDate}</time>
						<span aria-hidden="true">·</span>
						<span>{readTime} min read</span>
					</div>
				</div>
			</header>

			<hr class="border-border" />

			<div
				class="prose max-w-none prose-green dark:prose-invert prose-headings:font-semibold prose-headings:tracking-tight prose-h2:mt-10 prose-h2:first:mt-0 prose-p:leading-relaxed prose-p:text-foreground/90 prose-blockquote:border-l-primary prose-li:marker:text-muted-foreground"
			>
				<!-- eslint-disable-next-line svelte/no-at-html-tags -- admin-authored markdown from the data store -->
				{@html html}
			</div>

			<div class="space-y-4 border-t border-border pt-6">
				<div class="flex flex-wrap gap-1.5">
					{#each post.tags as tag (tag)}
						<Badge variant="secondary">{tag}</Badge>
					{/each}
				</div>
				<div class="flex flex-wrap items-center justify-between gap-3">
					<Button href={localizeHref('/blog')} variant="ghost" size="sm">
						<ArrowLeft class="size-4"></ArrowLeft>
						Back to Blog
					</Button>
					{#if related.length > 0}
						<Button href={localizeHref(`/blog/${related[0].slug}`)} variant="ghost" size="sm">
							Next article
							<ArrowRight class="size-4"></ArrowRight>
						</Button>
					{/if}
				</div>
			</div>
		</article>

		{#if related.length > 1}
			<div class="space-y-4">
				<h2 class="text-lg font-semibold tracking-tight">Keep reading</h2>
				<div class="grid gap-3 sm:grid-cols-3">
					{#each related as item (item.slug)}
						<Card>
							<a href={resolve('/blog/[slug]', { slug: item.slug })} class="group block">
								<CardContent class="space-y-2 pt-4">
									<p class="line-clamp-2 leading-snug font-medium group-hover:text-primary">
										{item.title}
									</p>
									<div class="flex items-center gap-1.5 text-xs text-muted-foreground">
										<span>{item.author}</span>
										<span aria-hidden="true">·</span>
										<time datetime={item.date}>
											{new Date(`${item.date}T00:00:00`).toLocaleDateString('en-US', {
												year: 'numeric',
												month: 'short',
												day: 'numeric'
											})}
										</time>
									</div>
								</CardContent>
							</a>
						</Card>
					{/each}
				</div>
			</div>
		{/if}
	</section>
{/if}
