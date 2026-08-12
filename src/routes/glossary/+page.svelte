<script lang="ts">
	import { adminData } from '$lib/stores/admin-data.svelte';
	import { Card, CardContent, CardTitle } from '$lib/components/ui/card';
	import BookText from '@lucide/svelte/icons/book-text';

	const sorted = $derived(adminData.glossary.toSorted((a, b) => a.term.localeCompare(b.term)));

	const grouped = $derived(Object.groupBy(sorted, (t) => t.term[0].toUpperCase()));
	const letters = $derived(Object.keys(grouped).toSorted());
</script>

<svelte:head><title>Glossary — HalalNeo</title></svelte:head>

<section class="space-y-8">
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

	<nav class="flex flex-wrap gap-1.5" aria-label="Glossary index">
		{#each letters as letter}
			<a
				href="#term-{letter}"
				class="flex size-8 items-center justify-center rounded-lg text-sm font-medium text-muted-foreground transition-all outline-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
			>
				{letter}
			</a>
		{/each}
	</nav>

	<div class="space-y-8">
		{#each letters as letter}
			<div class="space-y-3">
				<h2 id="term-{letter}" class="text-lg font-semibold scroll-mt-24">{letter}</h2>
				<div class="grid gap-3 sm:grid-cols-2">
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
		{/each}
	</div>
</section>