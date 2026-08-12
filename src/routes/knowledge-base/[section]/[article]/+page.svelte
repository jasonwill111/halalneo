<script lang="ts">
	import { localizeHref } from '$lib/paraglide/runtime.js';
	import { getArticle, getSection } from '$lib/stores/admin-data.svelte';
	import Icon from '$lib/components/site/icon.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '$lib/components/ui/breadcrumb';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import { error } from '@sveltejs/kit';
	import { marked } from 'marked';

	let { params } = $props();

	const section = $derived(getSection(params.section));
	const article = $derived(getArticle(params.section, params.article));
	const html = $derived(article ? marked.parse(article.body) : '');

	$effect(() => {
		if (!section || !article) error(404, 'Article not found');
	});
</script>

<svelte:head><title>{article?.title ?? 'Article'} — HalalNeo</title></svelte:head>

{#if section && article}
	<section class="space-y-8">
		<Breadcrumb>
			<BreadcrumbList>
				<BreadcrumbItem>
					<BreadcrumbLink href={localizeHref('/knowledge-base')}>Knowledge Base</BreadcrumbLink>
				</BreadcrumbItem>
				<BreadcrumbSeparator />
				<BreadcrumbItem>
					<BreadcrumbLink href={localizeHref(`/knowledge-base/${section.slug}`)}>
						{section.title}
					</BreadcrumbLink>
				</BreadcrumbItem>
				<BreadcrumbSeparator />
				<BreadcrumbItem>
					<BreadcrumbPage>{article.title}</BreadcrumbPage>
				</BreadcrumbItem>
			</BreadcrumbList>
		</Breadcrumb>

		<div class="max-w-3xl space-y-6">
			<div class="space-y-3">
				<div class="flex items-center gap-2">
					<div class="flex size-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
						<Icon name={section.icon} class="size-4"></Icon>
					</div>
					<span class="text-sm font-medium text-muted-foreground">{section.title}</span>
				</div>
				<h1 class="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
					{article.title}
				</h1>
				<p class="text-lg text-muted-foreground">{article.summary}</p>
				<div class="flex flex-wrap gap-1.5 pt-1">
					{#each article.tags as tag}
						<Badge variant="secondary">{tag}</Badge>
					{/each}
				</div>
			</div>

			<div class="prose prose-green max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-p:text-foreground/90 prose-li:marker:text-muted-foreground dark:prose-invert">
				{@html html}
			</div>

			<div class="border-t border-border pt-6">
				<Button href={localizeHref(`/knowledge-base/${section.slug}`)} variant="ghost" size="sm">
					<ArrowLeft class="size-4"></ArrowLeft>
					Back to {section.title}
				</Button>
			</div>
		</div>
	</section>
{/if}