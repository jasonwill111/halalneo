<script lang="ts">
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { Card, CardContent, CardTitle } from '#lib/components/ui/card/index.js';
	import BookText from '@lucide/svelte/icons/book-text';
	import SearchIcon from '@lucide/svelte/icons/search';
	import Breadcrumb from '#lib/components/site/breadcrumb.svelte';
	import FilterPills from '#lib/components/site/filter-pills.svelte';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import {
		Empty,
		EmptyHeader,
		EmptyTitle,
		EmptyDescription,
		EmptyContent
	} from '#lib/components/ui/empty/index.js';
	import BrandedEmptyMedia from '#lib/components/site/branded-empty-media.svelte';
	import ErrorRetry from '#lib/components/site/error-retry.svelte';
	import Paginator from '#lib/components/site/paginator.svelte';
	import type { GlossaryTerm } from '#lib/types/index.js';

	let { data } = $props();
	let search = $state('');
	let activeLetter = $state('all');
	const PAGE_SIZE = 3;
	let page = $state(1);
	$effect(() => {
		void search;
		void activeLetter;
		page = 1;
	});

	const definedTermSet = $derived(
		JSON.stringify({
			'@context': 'https://schema.org',
			'@type': 'DefinedTermSet',
			name: 'Halal Trade Glossary',
			description:
				'Definitions of halal certification, trade, finance, logistics and regulatory terms for B2B buyers and suppliers.',
			url: 'https://halalneo.com/glossary',
			hasDefinedTerm: (data.terms ?? []).slice(0, 100).map((t: GlossaryTerm) => ({
				'@type': 'DefinedTerm',
				name: t.term,
				description: t.definition,
				// Letter anchors are what the page actually renders (`id="term-{letter}"`);
				// per-term ids don't exist.
				url: `https://halalneo.com/glossary#term-${t.term[0].toUpperCase()}`,
				inDefinedTermSet: 'https://halalneo.com/glossary'
			}))
		})
	);

	const allSorted = $derived(
		(data.terms ?? []).toSorted((a: GlossaryTerm, b: GlossaryTerm) => a.term.localeCompare(b.term))
	);

	const allGrouped = $derived(
		Object.groupBy(allSorted, (t: GlossaryTerm) => t.term[0].toUpperCase())
	);
	const allLetters = $derived(Object.keys(allGrouped).toSorted());

	const pillOptions = $derived([
		{ value: 'all', label: 'All', count: allSorted.length },
		...allLetters.map((letter) => ({
			value: letter,
			label: letter,
			count: allGrouped[letter]?.length ?? 0
		}))
	]);

	// Search takes precedence over the letter filter; letter filtering is client-side
	// so all terms stay server-rendered in HTML for SEO.
	const sorted = $derived(
		allSorted.filter((t: GlossaryTerm) => {
			if (search.trim()) {
				const q = search.toLowerCase();
				return t.term.toLowerCase().includes(q) || t.definition.toLowerCase().includes(q);
			}
			if (activeLetter !== 'all') {
				return t.term[0].toUpperCase() === activeLetter;
			}
			return true;
		})
	);

	const grouped = $derived(Object.groupBy(sorted, (t: GlossaryTerm) => t.term[0].toUpperCase()));
	const letters = $derived(Object.keys(grouped).toSorted());
	const totalPages = $derived(Math.max(1, Math.ceil(letters.length / PAGE_SIZE)));
	const paginatedLetters = $derived(letters.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE));

	const isSearching = $derived(search.trim().length > 0);
</script>

<Breadcrumb items={[{ label: 'Glossary', href: '/glossary' }]} />

<svelte:head>
	{@html `\u003cscript type="application/ld+json">${definedTermSet}\u003c/script>`}
</svelte:head>

<section class="space-y-4 sm:space-y-6">
	<div class="max-w-2xl space-y-2">
		<div class="flex items-center gap-2 text-sm font-medium text-muted-foreground">
			<BookText class="size-4"></BookText>
			Glossary
		</div>
		<h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">Halal trade glossary</h1>
		<p class="text-xs text-muted-foreground sm:text-sm">
			{sorted.length} terms covering certification, sourcing, logistics and market entry.
		</p>
	</div>

	<div class="relative">
		<SearchIcon class="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
		<Input type="search" placeholder="Search glossary terms..." class="pl-9" bind:value={search} />
	</div>

	{#if !isSearching}
		<FilterPills
			options={pillOptions}
			bind:value={activeLetter}
			ariaLabel="Filter glossary by letter"
		/>
	{/if}

	{#if data.loadError}
		<ErrorRetry failure={data.loadError} subject="glossary terms" />
	{/if}

	<div class="space-y-4 sm:space-y-6">
		{#each paginatedLetters as letter (letter)}
			<div class="space-y-3">
				<h2 id="term-{letter}" class="scroll-mt-24 text-base font-semibold">{letter}</h2>
				<div class="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3">
					{#each grouped[letter] as term (term.term)}
						<Card class="p-3 sm:p-4">
							<CardContent class="space-y-1 pt-4">
								<CardTitle class="text-sm sm:text-base">{term.term}</CardTitle>
								<p class="text-sm text-muted-foreground">{term.definition}</p>
							</CardContent>
						</Card>
					{/each}
				</div>
			</div>
		{:else}
			{#if !data.loadError}
				<Empty>
					<EmptyHeader>
						<BrandedEmptyMedia><BookText class="size-6 text-muted-foreground"></BookText></BrandedEmptyMedia>
						<EmptyTitle>No glossary terms found</EmptyTitle>
						<EmptyDescription>Try adjusting your search.</EmptyDescription>
					</EmptyHeader>
					<EmptyContent>
						{#if search.trim()}
							<Button variant="outline" size="sm" onclick={() => (search = '')}>Clear search</Button
							>
						{:else}
							<Button size="sm" href={localizeHref('/knowledge-base')}
								>Browse the knowledge base</Button
							>
						{/if}
					</EmptyContent>
				</Empty>
			{/if}
		{/each}
	</div>

	<Paginator bind:page {totalPages} />
</section>
