<script lang="ts">
	import { localizeHref } from '$lib/paraglide/runtime.js';
	import { adminData } from '$lib/stores/admin-data.svelte';
	import Icon from '$lib/components/site/icon.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '$lib/components/ui/card';
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
	import BookOpen from '@lucide/svelte/icons/book-open';
	import SearchIcon from '@lucide/svelte/icons/search';
</script>

<svelte:head><title>Knowledge Base —HalalNeo</title></svelte:head>

<section class="space-y-8">
	<div class="space-y-4">
		<div class="flex items-center gap-2 text-sm font-medium text-muted-foreground">
			<BookOpen class="size-4"></BookOpen>
			Knowledge Base
		</div>
		<div class="max-w-2xl space-y-2">
			<h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">
				Halal trade intelligence, explained
			</h1>
			<p class="text-muted-foreground">
				{adminData.kbArticles.length} articles across {adminData.kbSections.length} areas of halal trade —from
				certification and sourcing to logistics, labeling and market entry.
			</p>
		</div>
		<div class="flex flex-col gap-3 sm:flex-row">
			<Button href={localizeHref('/search')} variant="outline" size="lg">
				<SearchIcon class="size-4"></SearchIcon>
				Search all articles
			</Button>
		</div>
	</div>

	<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
		{#each adminData.kbSections as section}
			<Card hoverable>
				<CardHeader class="gap-3">
					<div class="flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
						<Icon name={section.icon} class="size-5"></Icon>
					</div>
					<div class="space-y-1">
						<CardTitle class="text-lg">{section.title}</CardTitle>
						<CardDescription>{section.description}</CardDescription>
					</div>
				</CardHeader>
				<CardContent class="space-y-3">
					{@const count = adminData.kbArticles.filter((a) => a.section === section.slug).length}
					<p class="text-sm text-muted-foreground">
						{count} article{count === 1 ? '' : 's'}
					</p>
					<Button href={localizeHref(`/knowledge-base/${section.slug}`)} variant="outline" size="sm">
						Browse the section
						<ArrowUpRight class="size-4" data-icon="inline-end"></ArrowUpRight>
					</Button>
				</CardContent>
			</Card>
		{/each}
	</div>
</section>