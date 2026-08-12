<script lang="ts">
	import { localizeHref } from '$lib/paraglide/runtime.js';
	import { getSection, getArticlesInSection } from '$lib/stores/admin-data.svelte';
	import Icon from '$lib/components/site/icon.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '$lib/components/ui/card';
	import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '$lib/components/ui/breadcrumb';
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
	import FileText from '@lucide/svelte/icons/file-text';
	import { error } from '@sveltejs/kit';

	let { params } = $props();

	const section = $derived(getSection(params.section));
	const articles = $derived(params.section ? getArticlesInSection(params.section) : []);

	$effect(() => {
		if (!section) error(404, 'Section not found');
	});
</script>

<svelte:head><title>{section?.title ?? 'Section'} — HalalNeo</title></svelte:head>

{#if section}
	<section class="space-y-8">
		<Breadcrumb>
			<BreadcrumbList>
				<BreadcrumbItem>
					<BreadcrumbLink href={localizeHref('/knowledge-base')}>Knowledge Base</BreadcrumbLink>
				</BreadcrumbItem>
				<BreadcrumbSeparator />
				<BreadcrumbItem>
					<BreadcrumbPage>{section.title}</BreadcrumbPage>
				</BreadcrumbItem>
			</BreadcrumbList>
		</Breadcrumb>

		<div class="flex items-start gap-4">
			<div class="flex size-12 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
				<Icon name={section.icon} class="size-6"></Icon>
			</div>
			<div class="space-y-1">
				<h1 class="text-3xl font-semibold tracking-tight">{section.title}</h1>
				<p class="max-w-2xl text-muted-foreground">{section.description}</p>
			</div>
		</div>

		<div class="space-y-4">
			<h2 class="text-lg font-semibold">
				{articles.length} article{articles.length === 1 ? '' : 's'}
			</h2>
			<div class="grid gap-4 sm:grid-cols-2">
				{#each articles as article}
					<Card>
						<CardHeader class="gap-3">
							<div class="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
								<FileText class="size-4"></FileText>
							</div>
							<div class="space-y-1">
								<CardTitle class="text-base">{article.title}</CardTitle>
								<CardDescription>{article.summary}</CardDescription>
							</div>
						</CardHeader>
						<CardContent class="space-y-3">
							<div class="flex flex-wrap gap-1.5">
								{#each article.tags as tag}
									<Badge variant="secondary">{tag}</Badge>
								{/each}
							</div>
							<Button
								href={localizeHref(`/knowledge-base/${section.slug}/${article.slug}`)}
								variant="ghost"
								size="sm"
							>
								Read the article
								<ArrowUpRight class="size-4" data-icon="inline-end"></ArrowUpRight>
							</Button>
						</CardContent>
					</Card>
				{/each}
			</div>
		</div>
	</section>
{/if}