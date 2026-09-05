<script lang="ts">
	import { Card, CardContent, CardTitle } from '#lib/components/ui/card/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import BookText from '@lucide/svelte/icons/book-text';
	import SearchIcon from '@lucide/svelte/icons/search';
	import Breadcrumb from '#lib/components/site/breadcrumb.svelte';
	import { Input } from '#lib/components/ui/input/index.js';

	let { data } = $props();
	let search = $state('');

	const definedTermSet = $derived(
		JSON.stringify({
			'@context': 'https://schema.org',
			'@type': 'DefinedTermSet',
			name: 'Halal Trade Glossary',
			description:
				'Definitions of halal certification, trade, finance, logistics and regulatory terms for B2B buyers and suppliers.',
			url: 'https://halalneo.com/glossary',
			hasDefinedTerm: ((data.terms ?? []) as any[]).slice(0, 100).map((t: any) => ({
				'@type': 'DefinedTerm',
				name: t.term,
				description: t.definition,
				url: `https://halalneo.com/glossary#term-${encodeURIComponent(t.term)}`,
				inDefinedTermSet: 'https://halalneo.com/glossary'
			}))
		})
	);

	const sorted = $derived(
		(data.terms ?? [])
			.toSorted((a: any, b: any) => a.term.localeCompare(b.term))
			.filter((t: any) =>
				search.trim()
					? t.term.toLowerCase().includes(search.toLowerCase()) ||
						t.definition.toLowerCase().includes(search.toLowerCase())
					: true
			)
	);

	const grouped = $derived(Object.groupBy(sorted, (t: any) => t.term[0].toUpperCase()));
	const letters = $derived(Object.keys(grouped).toSorted());
</script>

<Breadcrumb items={[{ label: 'Glossary', href: '/glossary' }]} />

<svelte:head>
	{@html `<script type="application/ld+json">${definedTermSet}</script>`}
</svelte:head>

<section class="space-y-6">
	<div class="max-w-2xl space-y-2">
		<div class="flex items-center gap-2 text-sm font-medium text-muted-foreground">
			<BookText class="size-4"></BookText>
			Glossary
		</div>
		<h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">Halal trade glossary</h1>
		<p class="text-muted-foreground">
			{sorted.length} terms covering certification, sourcing, logistics and market entry.
		</p>
	</div>

	<div class="relative">
		<SearchIcon class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
		<Input
			type="search"
			placeholder="Search glossary terms..."
			class="pl-9"
			bind:value={search}
		/>
	</div>

	<nav class="flex flex-wrap gap-1.5" aria-label="Glossary index">
		{#each letters as letter}
			<Button href="#term-{letter}" variant="ghost" size="icon" class="size-8">
				{letter}
			</Button>
		{/each}
	</nav>

	<div class="space-y-6">
		{#each letters as letter}
			<div class="space-y-3">
				<h2 id="term-{letter}" class="scroll-mt-24 text-lg font-semibold">{letter}</h2>
				<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
					{#each grouped[letter] as term}
						<Card>
							<CardContent class="space-y-1 pt-4">
								<CardTitle class="text-base">{term.term}</CardTitle>
								<p class="text-sm text-muted-foreground">{term.definition}</p>
							</CardContent>
						</Card>
					{/each}
				</div>
			</div>
		{:else}
			<div class="flex flex-col items-center justify-center py-12 text-center">
				<p class="text-lg font-medium text-muted-foreground">No glossary terms found</p>
				<p class="text-sm text-muted-foreground">Try adjusting your search.</p>
			</div>
		{/each}
	</div>
</section>
