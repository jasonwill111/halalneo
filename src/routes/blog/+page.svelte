<script lang="ts">
	import { Card, CardContent, CardTitle } from '#lib/components/ui/card/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import Newspaper from '@lucide/svelte/icons/newspaper';
	import SearchIcon from '@lucide/svelte/icons/search';
	import Breadcrumb from '#lib/components/site/breadcrumb.svelte';
	import { Input } from '#lib/components/ui/input/index.js';

	let { data } = $props();
	let search = $state('');

	const published = $derived(
		(data.posts ?? [])
			.filter((p: any) => p.status === 'published')
			.toSorted((a: any, b: any) => (b.date ?? '').localeCompare(a.date ?? ''))
			.filter((p: any) =>
				search.trim()
					? p.title.toLowerCase().includes(search.toLowerCase())
					: true
			)
	);
</script>

<Breadcrumb items={[{ label: 'Blog', href: '/blog' }]} />

<section class="space-y-8">
	<div class="max-w-2xl space-y-2">
		<div class="flex items-center gap-2 text-sm font-medium text-muted-foreground">
			<Newspaper class="size-4"></Newspaper>
			Blog
		</div>
		<h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">News & insights</h1>
		<p class="text-muted-foreground">
			Updates on halal certification, sourcing and market intelligence.
		</p>
	</div>

	<div class="relative">
		<SearchIcon class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
		<Input
			type="search"
			placeholder="Search articles..."
			class="pl-9"
			bind:value={search}
		/>
	</div>

	{#if published.length === 0}
		<div
			class="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground"
		>
			No published posts yet.
		</div>
	{:else}
		<div class="grid gap-3 sm:grid-cols-2">
			{#each published as post (post.slug)}
				<Card>
					<a href="/blog/{post.slug}" class="group block">
						<CardContent class="space-y-2 pt-4">
							<div class="flex items-center gap-2 text-xs text-muted-foreground">
								<span class="font-medium text-foreground/80">{post.author}</span>
								<span>·</span>
								<time datetime={post.date}>{post.date}</time>
							</div>
							<CardTitle class="text-lg leading-snug group-hover:text-primary">
								{post.title}
							</CardTitle>
							<p class="text-sm text-muted-foreground">{post.excerpt}</p>
							<div class="flex flex-wrap gap-1.5 pt-1">
								{#each post.tags as tag}
									<Badge variant="secondary">{tag}</Badge>
								{/each}
							</div>
						</CardContent>
					</a>
				</Card>
			{/each}
		</div>
	{/if}
</section>
