<script lang="ts">
	import { localizeHref } from '$lib/paraglide/runtime.js';
	import { adminData, getSection } from '$lib/stores/admin-data.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardTitle, CardDescription } from '$lib/components/ui/card';
	import { Empty, EmptyMedia, EmptyTitle, EmptyDescription } from '$lib/components/ui/empty';
	import SearchIcon from '@lucide/svelte/icons/search';
	import FileText from '@lucide/svelte/icons/file-text';
	import BookText from '@lucide/svelte/icons/book-text';
	import Store from '@lucide/svelte/icons/store';
	import Package from '@lucide/svelte/icons/package';

	let query = $state('');

	type Result =
		| { kind: 'article'; section: string; slug: string; title: string; summary: string }
		| { kind: 'term'; term: string; definition: string }
		| { kind: 'supplier'; slug: string; name: string; country: string }
		| { kind: 'sku'; slug: string; name: string; description: string };

	const allResults = $derived.by(() => {
		const q = query.trim().toLowerCase();
		if (!q) return [];
		const results: Result[] = [];
		for (const a of adminData.kbArticles) {
			if (a.title.toLowerCase().includes(q) || a.summary.toLowerCase().includes(q) || a.tags.some((t) => t.toLowerCase().includes(q))) {
				results.push({ kind: 'article', section: a.section, slug: a.slug, title: a.title, summary: a.summary });
			}
		}
		for (const t of adminData.glossary) {
			if (t.term.toLowerCase().includes(q) || t.definition.toLowerCase().includes(q)) {
				results.push({ kind: 'term', term: t.term, definition: t.definition });
			}
		}
		for (const m of adminData.merchants) {
			if (m.name.toLowerCase().includes(q) || m.country.toLowerCase().includes(q) || m.description.toLowerCase().includes(q)) {
				results.push({ kind: 'supplier', slug: m.slug, name: m.name, country: m.country });
			}
		}
		for (const s of adminData.skus) {
			if (s.name.toLowerCase().includes(q) || s.shortDescription.toLowerCase().includes(q) || s.features.some((f) => f.toLowerCase().includes(q))) {
				results.push({ kind: 'sku', slug: s.slug, name: s.name, description: s.shortDescription });
			}
		}
		return results;
	});

	const resultCount = $derived(allResults.length);
</script>

<svelte:head><title>Search — HalalNeo</title></svelte:head>

<section class="mx-auto max-w-3xl space-y-8">
	<div class="space-y-2">
		<h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">Search</h1>
		<p class="text-muted-foreground">
			Search knowledge articles, glossary terms, suppliers and products.
		</p>
	</div>

	<div class="relative">
		<SearchIcon class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"></SearchIcon>
		<input
			bind:value={query}
			type="search"
			placeholder="Try “halal slaughter”, “JAKIM”, “rendang”…"
			class="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm transition-all outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
		/>
	</div>

	{#if query.trim() === ''}
		<Empty>
			<EmptyMedia><SearchIcon class="size-6 text-muted-foreground"></SearchIcon></EmptyMedia>
			<EmptyTitle>Start typing to search</EmptyTitle>
			<EmptyDescription>Search across 15 articles, 30 glossary terms, 7 suppliers and 12 products.</EmptyDescription>
		</Empty>
	{:else if resultCount === 0}
		<Empty>
			<EmptyMedia><SearchIcon class="size-6 text-muted-foreground"></SearchIcon></EmptyMedia>
			<EmptyTitle>No results</EmptyTitle>
			<EmptyDescription>Nothing matched “{query.trim()}”. Try a different term.</EmptyDescription>
		</Empty>
	{:else}
		<div class="space-y-2">
			<p class="text-sm text-muted-foreground">{resultCount} result{resultCount === 1 ? '' : 's'}</p>
			<div class="space-y-3">
				{#each allResults as result}
					{#if result.kind === 'article'}
						<Card>
							<CardContent class="space-y-1 pt-4">
								<div class="flex items-center gap-2">
									<FileText class="size-4 text-primary"></FileText>
									<span class="text-xs font-medium text-muted-foreground">
										{getSection(result.section)?.title ?? result.section}
									</span>
								</div>
								<a
									href={localizeHref(`/knowledge-base/${result.section}/${result.slug}`)}
									class="text-base font-medium transition-colors outline-none hover:text-primary focus-visible:underline"
								>
									{result.title}
								</a>
								<CardDescription>{result.summary}</CardDescription>
							</CardContent>
						</Card>
					{:else if result.kind === 'term'}
						<Card>
							<CardContent class="space-y-1 pt-4">
								<div class="flex items-center gap-2">
									<BookText class="size-4 text-primary"></BookText>
									<span class="text-xs font-medium text-muted-foreground">Glossary</span>
								</div>
								<a
									href={localizeHref(`/glossary#term-${result.term[0].toUpperCase()}`)}
									class="text-base font-medium transition-colors outline-none hover:text-primary focus-visible:underline"
								>
									{result.term}
								</a>
								<CardDescription>{result.definition}</CardDescription>
							</CardContent>
						</Card>
					{:else if result.kind === 'supplier'}
						<a href={localizeHref(`/suppliers/${result.slug}`)} class="block">
							<Card hoverable class="transition-colors hover:bg-muted/50">
								<CardContent class="flex items-center gap-3 pt-4">
									<span class="flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
										<Store class="size-4"></Store>
									</span>
									<div class="space-y-0.5">
										<CardTitle class="text-base">{result.name}</CardTitle>
										<CardDescription>Supplier · {result.country}</CardDescription>
									</div>
								</CardContent>
							</Card>
						</a>
					{:else}
						<a href={localizeHref(`/products/${result.slug}`)} class="block">
							<Card hoverable class="transition-colors hover:bg-muted/50">
								<CardContent class="flex items-center gap-3 pt-4">
									<span class="flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
										<Package class="size-4"></Package>
									</span>
									<div class="space-y-0.5">
										<CardTitle class="text-base">{result.name}</CardTitle>
										<CardDescription>Product · {result.description}</CardDescription>
									</div>
								</CardContent>
							</Card>
						</a>
					{/if}
				{/each}
			</div>
		</div>
	{/if}
</section>