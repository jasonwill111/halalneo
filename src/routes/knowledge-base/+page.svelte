<script lang="ts">
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import Icon from '#lib/components/site/icon.svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import {
		Card,
		CardHeader,
		CardTitle,
		CardDescription,
		CardContent
	} from '#lib/components/ui/card/index.js';
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
	import BookOpen from '@lucide/svelte/icons/book-open';
	import SearchIcon from '@lucide/svelte/icons/search';
	import MessageCircle from '@lucide/svelte/icons/message-circle';
	import GlobeIcon from '@lucide/svelte/icons/globe';
	import CalendarIcon from '@lucide/svelte/icons/calendar';
	import BookMarkedIcon from '@lucide/svelte/icons/book-marked';
	import Breadcrumb from '#lib/components/site/breadcrumb.svelte';
	import { TILE_COLORS } from '#lib/utils/tile-colors.js';
	import { Input } from '#lib/components/ui/input/index.js';

	let { data } = $props();
	let search = $state('');

	const filteredSections = $derived(
		search.trim()
			? (data.sections ?? []).filter((s: any) =>
					s.title.toLowerCase().includes(search.toLowerCase())
				)
			: data.sections ?? []
	);

	const subForms = $derived([
		{
			title: 'Market Guides',
			description: 'Country-by-country halal certification requirements, costs, and market entry guides.',
			count: data.marketGuidesCount ?? 0,
			href: '/market-guides',
			icon: GlobeIcon,
			countLabel: 'market guides'
		},
		{
			title: 'Trade Shows',
			description: 'Global halal trade shows, exhibitions, and industry events calendar.',
			count: data.tradeShowsCount ?? 0,
			href: '/trade-shows',
			icon: CalendarIcon,
			countLabel: 'events'
		},
		{
			title: 'Glossary',
			description: 'Halal trade terminology, definitions, and industry jargon explained.',
			count: data.glossaryCount ?? 0,
			href: '/glossary',
			icon: BookMarkedIcon,
			countLabel: 'terms'
		}
	]);

	// Icon tile palette — shared with homepage/categories/certifiers for cross-page consistency
	const tileColors = TILE_COLORS;

	// Top-3 by views desc; fallback to latest 3 (API returns createdAt desc) when
	// rows carry no view counts.
	const popularArticles = $derived.by(() => {
		const articles = (data.articles ?? []) as Array<{ slug: string; section: string | null; title: string; views?: number | null }>;
		const viewed = articles.filter((a) => (a.views ?? 0) > 0).toSorted((a, b) => (b.views ?? 0) - (a.views ?? 0));
		return viewed.length >= 3 ? viewed.slice(0, 3) : articles.slice(0, 3);
	});
</script>

<Breadcrumb items={[{ label: 'Knowledge Base', href: '/knowledge-base' }]} />

<section class="space-y-4 sm:space-y-6">
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
				{(data.articles ?? []).length} articles across {(data.sections ?? []).length} areas of halal trade
				—from certification and sourcing to logistics, labeling and market entry.
			</p>
		</div>
		<div class="flex flex-col gap-3 sm:flex-row">
			<Button href={localizeHref('/search')} variant="outline" size="lg">
				<SearchIcon class="size-4"></SearchIcon>
				Search all articles
			</Button>
		</div>
	</div>

	<div class="relative">
		<SearchIcon class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
		<Input
			type="search"
			placeholder="Search sections..."
			class="pl-9"
			bind:value={search}
		/>
	</div>

	<!-- Resource Hubs -->
	<div class="space-y-3">
		<h2 class="text-sm font-semibold text-foreground">Explore by Category</h2>
		<div class="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-3">
			{#each subForms as form, i (form.href)}
				<a href={localizeHref(form.href)} class="group h-full">
					<Card hoverable class="h-full transition-shadow group-hover:shadow-md">
						<CardHeader class="gap-3">
							<div
								class="flex size-10 items-center justify-center rounded-lg {tileColors[
									i % tileColors.length
								]}"
							>
								<form.icon class="size-5" />
							</div>
							<div class="space-y-1">
								<CardTitle class="text-lg">{form.title}</CardTitle>
								<CardDescription>{form.description}</CardDescription>
							</div>
						</CardHeader>
						<CardContent class="space-y-3">
							<p class="text-sm text-muted-foreground">
								{form.count} {form.countLabel}
							</p>
							<Button variant="outline" size="sm" class="w-full">
								Explore
								<ArrowUpRight class="size-4" data-icon="inline-end" />
							</Button>
						</CardContent>
					</Card>
				</a>
			{/each}
		</div>
	</div>

<!-- KB Sections -->
	<div class="space-y-3">
		<h2 class="text-sm font-semibold text-foreground">Knowledge Base Sections</h2>
		<div class="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-3">
		{#each filteredSections as section, i (section.slug)}
			<article>
			<Card hoverable class="h-full overflow-hidden">
				<CardHeader class="gap-3">
					<div
						class="flex size-10 items-center justify-center rounded-lg {tileColors[
							i % tileColors.length
						]}"
					>
						<Icon name={section.icon} class="size-5"></Icon>
					</div>
					<div class="space-y-1">
						<CardTitle class="text-lg">{section.title}</CardTitle>
						<CardDescription>{section.description}</CardDescription>
					</div>
				</CardHeader>
				<CardContent class="space-y-3">
					{@const count = (data.articles ?? []).filter((a: any) => a.section === section.slug).length}
					<p class="text-sm text-muted-foreground">
						{count} article{count === 1 ? '' : 's'}
					</p>
					<Button
						href={localizeHref(`/knowledge-base/${section.slug}`)}
						variant="outline"
						size="sm"
					>
						Browse the section
						<ArrowUpRight class="size-4" data-icon="inline-end"></ArrowUpRight>
					</Button>
				</CardContent>
			</Card>
			</article>
		{/each}
		</div>
	</div>

	<!-- Popular Articles -->
	{#if popularArticles.length > 0}
		<div>
			<h2 class="mb-2.5 text-sm font-semibold text-foreground">Popular Articles</h2>
			<div class="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
				{#each popularArticles as article, i (article.slug)}
					<a
						href={localizeHref(`/knowledge-base/${article.section ?? ''}/${article.slug}`)}
						class="group flex items-center gap-2.5 rounded-xl ring-1 ring-foreground/10 bg-card p-3 hover:shadow-md transition-all"
					>
						<div class="flex size-8 shrink-0 items-center justify-center rounded-lg {TILE_COLORS[i % TILE_COLORS.length]}">
							<BookOpen class="size-4"></BookOpen>
						</div>
						<div class="min-w-0">
							<h3 class="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">{article.title}</h3>
							{#if (article.views ?? 0) > 0}
								<p class="mt-0.5 text-xs text-muted-foreground">{article.views} reads</p>
							{/if}
						</div>
					</a>
				{/each}
			</div>
		</div>
	{/if}

	<div class="rounded-xl ring-1 ring-primary/20 bg-primary/5 p-6 text-center">
		<div class="mx-auto mb-3 flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
			<MessageCircle class="size-6" />
		</div>
		<h3 class="mb-1 text-sm font-bold text-foreground">Need Help?</h3>
		<p class="mb-4 text-sm text-muted-foreground">
			Analyze ingredients for halal compliance instantly.
		</p>
		<Button href={localizeHref('/tools/ingredient-checker')}>
			Ingredient Checker
			<ArrowUpRight class="size-4" data-icon="inline-end" />
		</Button>
	</div>
</section>
