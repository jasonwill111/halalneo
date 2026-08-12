<script lang="ts">
	import { localizeHref } from '$lib/paraglide/runtime.js';
	import { adminData } from '$lib/stores/admin-data.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '$lib/components/ui/breadcrumb';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import { error } from '@sveltejs/kit';
	import { marked } from 'marked';

	let { params } = $props();

	const post = $derived(
		adminData.blogPosts.find((p) => p.slug === params.slug && p.status === 'published')
	);
	const html = $derived(post ? marked.parse(post.body) : '');

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

		<div class="max-w-3xl space-y-6">
			<div class="space-y-3">
				<h1 class="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
					{post.title}
				</h1>
				<div class="flex items-center gap-2 text-sm text-muted-foreground">
					<span class="font-medium text-foreground/80">{post.author}</span>
					<span>·</span>
					<time datetime={post.date}>{post.date}</time>
				</div>
				<p class="text-lg text-muted-foreground">{post.excerpt}</p>
				<div class="flex flex-wrap gap-1.5 pt-1">
					{#each post.tags as tag}
						<Badge variant="secondary">{tag}</Badge>
					{/each}
				</div>
			</div>

			<div class="prose prose-green max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-p:text-foreground/90 prose-li:marker:text-muted-foreground dark:prose-invert">
				{@html html}
			</div>

			<div class="border-t border-border pt-6">
				<Button href={localizeHref('/blog')} variant="ghost" size="sm">
					<ArrowLeft class="size-4"></ArrowLeft>
					Back to Blog
				</Button>
			</div>
		</div>
	</section>
{/if}
