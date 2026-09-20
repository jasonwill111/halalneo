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
	import ErrorRetry from '#lib/components/site/error-retry.svelte';
	import { TILE_COLORS } from '#lib/utils/tile-colors.js';
	import { focusFirstInvalid } from '#lib/utils/forms.js';
	import { FieldError } from '#lib/components/ui/field/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import Paginator from '#lib/components/site/paginator.svelte';
	import {
		Empty,
		EmptyHeader,
		EmptyTitle,
		EmptyDescription,
		EmptyContent
	} from '#lib/components/ui/empty/index.js';
	import BrandedEmptyMedia from '#lib/components/site/branded-empty-media.svelte';
	import { z } from 'zod';

	let { data } = $props();

	// Search is validated before it filters: trimmed, at least 2 characters so the
	// section list is not filtered on a stray keystroke, capped so absurd queries
	// never reach the derived filter.
	const MAX_SEARCH = 60;
	const searchSchema = z.object({
		q: z
			.string()
			.trim()
			.min(2, 'Type at least 2 characters to filter sections.')
			.max(MAX_SEARCH, `Keep the search under ${MAX_SEARCH} characters.`)
	});

	let query = $state('');
	let search = $state('');
	let errors = $state<Record<string, string>>({});
	let formEl = $state<HTMLFormElement | null>(null);
	const PAGE_SIZE = 9;
	let page = $state(1);

	function handleSearch(e: SubmitEvent) {
		e.preventDefault();
		errors = {};
		const parsed = searchSchema.safeParse({ q: query });
		if (!parsed.success) {
			const fieldErrors: Record<string, string> = {};
			for (const issue of parsed.error.issues) {
				const key = String(issue.path[0] ?? '');
				if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
			}
			errors = fieldErrors;
			focusFirstInvalid(formEl);
			return;
		}
		search = parsed.data.q;
	}

	// Submit stays disabled while the query fails the same schema `handleSearch`
	// checks, so an empty/whitespace search can never be attempted.
	const canSearch = $derived(searchSchema.safeParse({ q: query }).success);

	$effect(() => {
		void search;
		page = 1;
	});

	interface KbSectionRow {
		title: string;
	}

	const filteredSections = $derived(
		search.trim()
			? (data.sections ?? []).filter((s: KbSectionRow) =>
					s.title.toLowerCase().includes(search.toLowerCase())
				)
			: (data.sections ?? [])
	);
	const totalPages = $derived(Math.max(1, Math.ceil(filteredSections.length / PAGE_SIZE)));
	const pagedSections = $derived(filteredSections.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE));

	const subForms = $derived([
		{
			title: 'Market Guides',
			description:
				'Country-by-country halal certification requirements, costs, and market entry guides.',
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
		const articles = (data.articles ?? []) as Array<{
			slug: string;
			section: string | null;
			title: string;
			views?: number | null;
		}>;
		const viewed = articles
			.filter((a) => (a.views ?? 0) > 0)
			.toSorted((a, b) => (b.views ?? 0) - (a.views ?? 0));
		return viewed.length >= 3 ? viewed.slice(0, 3) : articles.slice(0, 3);
	});
</script>

<svelte:head>
	{@html `\u003cscript type="application/ld+json">${JSON.stringify(data.itemList ?? {})}\u003c/script>`}
	{@html `\u003cscript type="application/ld+json">${JSON.stringify(data.collectionPage ?? {})}\u003c/script>`}
</svelte:head>

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
			<p class="text-xs text-muted-foreground sm:text-sm">
				{(data.articles ?? []).length} articles across {(data.sections ?? []).length} areas of halal trade
				—from certification and sourcing to logistics, labeling and market entry.
			</p>
		</div>
	</div>

	<form bind:this={formEl} onsubmit={handleSearch} class="space-y-1.5">
		<div class="flex gap-2">
			<div class="relative flex-1">
				<SearchIcon class="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					type="search"
					placeholder="Search sections..."
					class="pl-9 text-xs sm:text-sm"
					bind:value={query}
					maxlength={MAX_SEARCH}
					aria-label="Search knowledge base sections"
					aria-invalid={errors.q ? true : undefined}
					aria-describedby={errors.q ? 'kb-search-error' : undefined}
					oninput={() => {
						if (errors.q) errors = { ...errors, q: '' };
						if (!query.trim() && search) search = '';
					}}
				/>
			</div>
			<Button type="submit" variant="outline" size="sm" disabled={!canSearch} class="shrink-0">
				Search
			</Button>
		</div>
		{#if errors.q}
			<FieldError id="kb-search-error">{errors.q}</FieldError>
		{/if}
	</form>

	<!-- Resource Hubs -->
	<div class="space-y-3">
		<h2 class="text-sm font-semibold text-foreground">Explore by Category</h2>
		<div class="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3">
			{#each subForms as form, i (form.href)}
				<a href={localizeHref(form.href)} class="group h-full">
					<Card hoverable class="h-full p-2.5 transition-shadow group-hover:shadow-md sm:p-4">
						<CardHeader class="gap-2 sm:gap-3">
							<div
								class="flex size-8 items-center justify-center rounded-lg sm:size-10 {tileColors[
									i % tileColors.length
								]}"
							>
								<form.icon class="size-4 sm:size-5" />
							</div>
							<div class="space-y-1">
								<CardTitle class="text-sm sm:text-base">{form.title}</CardTitle>
								<CardDescription class="hidden sm:block">{form.description}</CardDescription>
							</div>
						</CardHeader>
						<CardContent class="space-y-2 sm:space-y-3">
							<p class="text-xs text-muted-foreground sm:text-sm">
								{form.count}
								{form.countLabel}
							</p>
							<Button variant="outline" size="sm" class="w-full sm:w-auto">
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
	<div class="flex items-center justify-between gap-2">
		<h2 class="text-sm font-semibold text-foreground">Knowledge Base Sections</h2>
		<Button
			href={localizeHref('/search')}
			variant="link"
			size="sm"
			class="text-2xs-plus sm:text-xs"
		>
			<SearchIcon class="size-3.5" />
			Search all articles
		</Button>
	</div>
	<div class="space-y-3">
		<div class="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3">
			{#each pagedSections as section, i (section.slug)}
				<article>
					<Card hoverable class="h-full overflow-hidden p-2.5 sm:p-4">
						<CardHeader class="gap-2 sm:gap-3">
							<div
								class="flex size-8 items-center justify-center rounded-lg sm:size-10 {tileColors[
									i % tileColors.length
								]}"
							>
								<Icon name={section.icon} class="size-4 sm:size-5"></Icon>
							</div>
							<div class="space-y-1">
								<CardTitle class="text-sm sm:text-base">{section.title}</CardTitle>
								<CardDescription class="hidden sm:block">
									{section.description}
								</CardDescription>
							</div>
						</CardHeader>
						<CardContent class="space-y-2 sm:space-y-3">
							{@const count = (data.articles ?? []).filter(
								(a) => a.section === section.slug
							).length}
							<p class="text-xs text-muted-foreground sm:text-sm">
								{count} article{count === 1 ? '' : 's'}
							</p>
							<Button
								href={localizeHref(`/knowledge-base/${section.slug}`)}
								variant="outline"
								size="sm"
								class="w-full sm:w-auto"
							>
								Browse
								<ArrowUpRight class="size-4" data-icon="inline-end"></ArrowUpRight>
							</Button>
						</CardContent>
					</Card>
				</article>
			{:else}
				<div class="col-span-full">
					{#if data.loadError && pagedSections.length === 0}
						<ErrorRetry failure={data.loadError} subject="knowledge base sections" />
					{:else}
						<Empty>
							<EmptyHeader>
								<BrandedEmptyMedia><BookOpen class="size-6 text-muted-foreground"></BookOpen></BrandedEmptyMedia>
								<EmptyTitle>No sections found</EmptyTitle>
								<EmptyDescription>
									{#if search}
										No section title matches “{search}”. Try a broader term such as “certification”
										or “logistics”.
									{:else}
										Knowledge base sections are published here as guides are written.
									{/if}
								</EmptyDescription>
							</EmptyHeader>
							<EmptyContent>
								{#if search}
									<Button
										variant="outline"
										size="sm"
										onclick={() => {
											query = '';
											search = '';
											errors = {};
										}}>Clear search</Button
									>
								{:else}
									<Button size="sm" href={localizeHref('/market-guides')}
										>Explore market guides</Button
									>
								{/if}
								<Button variant="link" size="sm" href={localizeHref('/contact')}
									>Ask us a question</Button
								>
							</EmptyContent>
						</Empty>
					{/if}
				</div>
			{/each}
		</div>
	</div>

	<Paginator {page} {totalPages} />

	<!-- Popular Articles -->
	{#if popularArticles.length > 0}
		<div>
			<h2 class="mb-2.5 text-sm font-semibold text-foreground">Popular Articles</h2>
			<div class="grid grid-cols-2 gap-2 sm:grid-cols-2 lg:grid-cols-3">
				{#each popularArticles as article, i (article.slug)}
					<a
						href={localizeHref(`/knowledge-base/${article.section ?? ''}/${article.slug}`)}
						class="group flex items-center gap-2.5 rounded-xl bg-card p-3 ring-1 ring-foreground/10 transition-all hover:shadow-md"
					>
						<div
							class="flex size-8 shrink-0 items-center justify-center rounded-lg {TILE_COLORS[
								i % TILE_COLORS.length
							]}"
						>
							<BookOpen class="size-4"></BookOpen>
						</div>
						<div class="min-w-0">
							<h3
								class="truncate text-sm font-medium text-foreground transition-colors group-hover:text-primary"
							>
								{article.title}
							</h3>
							{#if (article.views ?? 0) > 0}
								<p class="mt-0.5 text-xs text-muted-foreground">{article.views} reads</p>
							{/if}
						</div>
					</a>
				{/each}
			</div>
		</div>
	{/if}

	<div class="rounded-xl bg-primary/5 p-4 text-center ring-1 ring-primary/20 sm:p-6">
		<div
			class="mx-auto mb-3 flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground sm:size-12"
		>
			<MessageCircle class="size-4 sm:size-6" />
		</div>
		<h3 class="mb-1 text-sm font-bold text-foreground">Need Help?</h3>
		<p class="mb-3 text-xs text-muted-foreground sm:mb-4 sm:text-sm">
			Analyze ingredients for halal compliance instantly.
		</p>
		<Button href={localizeHref('/tools/ingredient-checker')}>
			Ingredient Checker
			<ArrowUpRight class="size-4" data-icon="inline-end" />
		</Button>
	</div>
</section>
