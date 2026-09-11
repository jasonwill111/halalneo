<script lang="ts">
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import Breadcrumb from '#lib/components/site/breadcrumb.svelte';
	import Paginator from '#lib/components/site/paginator.svelte';
	import TrophyIcon from '@lucide/svelte/icons/trophy';
	import MapPinIcon from '@lucide/svelte/icons/map-pin';

	let { data } = $props();

	let page = $state(1);
	const PAGE_SIZE = 9;

	const stories = $derived((data.stories ?? []) as any[]);
	const totalPages = $derived(Math.max(1, Math.ceil(stories.length / PAGE_SIZE)));
	const paged = $derived(stories.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE));
</script>

<Breadcrumb items={[{ label: 'Success Stories', href: '/success-stories' }]} />

<section class="space-y-4 sm:space-y-6">
	<div class="max-w-2xl space-y-2">
		<div class="flex items-center gap-2 text-sm font-medium text-muted-foreground">
			<TrophyIcon class="size-4" />
			Success Stories
		</div>
		<h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">Deals closed on HalalNeo</h1>
		<p class="text-muted-foreground">
			Real buyers who sourced certified suppliers, real suppliers who won export orders.
		</p>
	</div>

	{#if paged.length === 0}
		<div class="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
			<TrophyIcon class="mx-auto mb-3 size-10 opacity-40" />
			<p class="text-sm font-medium">First success stories are on the way</p>
			<p class="mt-1 text-xs">Closed a deal through HalalNeo? Tell us — we feature real trades.</p>
		</div>
	{:else}
		<div class="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3">
			{#each paged as s (s.slug)}
				<a
					href={localizeHref(`/success-stories/${s.slug}`)}
					class="group flex h-full flex-col rounded-xl bg-card p-3 ring-1 ring-foreground/10 transition-all hover:-translate-y-0.5 hover:shadow-md sm:p-4"
				>
					<div class="flex flex-wrap items-center gap-1.5">
						{#if s.dealValue}
							<Badge class="bg-success/15 text-success text-[10px]">{s.dealValue}</Badge>
						{/if}
						{#if s.buyerCountry}
							<span class="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
								<MapPinIcon class="size-3" />
								{s.buyerCountry}
							</span>
						{/if}
					</div>
					<h3 class="mt-1.5 line-clamp-2 text-xs font-semibold leading-snug transition-colors group-hover:text-primary sm:text-sm">
						{s.title}
					</h3>
					{#if s.excerpt}
						<p class="mt-1 line-clamp-2 hidden text-[11px] leading-snug text-muted-foreground sm:block">
							{s.excerpt}
						</p>
					{/if}
					<span class="mt-auto pt-2 text-[10px] font-semibold text-primary">Read story →</span>
				</a>
			{/each}
		</div>
		<Paginator bind:page {totalPages} />
	{/if}
</section>
