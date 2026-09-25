<script lang="ts">
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import Breadcrumb from '#lib/components/site/breadcrumb.svelte';
	import ErrorRetry from '#lib/components/site/error-retry.svelte';
	import Paginator from '#lib/components/site/paginator.svelte';
	import TrophyIcon from '@lucide/svelte/icons/trophy';
	import MapPinIcon from '@lucide/svelte/icons/map-pin';
	import {
		Empty,
		EmptyHeader,
		EmptyTitle,
		EmptyDescription,
		EmptyContent
	} from '#lib/components/ui/empty/index.js';
	import BrandedEmptyMedia from '#lib/components/site/branded-empty-media.svelte';

	let { data } = $props();

	let page = $state(1);
	const PAGE_SIZE = 9;

	const stories = $derived(data.stories ?? []);
	const totalPages = $derived(Math.max(1, Math.ceil(stories.length / PAGE_SIZE)));
	const paged = $derived(stories.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE));
</script>

<svelte:head>
	{@html `\u003cscript type="application/ld+json">${JSON.stringify(data.itemList ?? {})}\u003c/script>`}
</svelte:head>

<Breadcrumb items={[{ label: 'Success Stories', href: '/success-stories' }]} />

<section class="space-y-4 sm:space-y-6">
	<div class="max-w-2xl space-y-2">
		<div class="flex items-center gap-2 text-sm font-medium text-muted-foreground">
			<TrophyIcon class="size-4" />
			Success Stories
		</div>
		<h1 class="text-xl font-semibold tracking-tight sm:text-2xl">Deals closed on HalalNeo</h1>
		<p class="max-w-2xl text-xs leading-relaxed text-muted-foreground sm:text-sm">
			Real buyers who sourced certified suppliers, real suppliers who won export orders.
		</p>
	</div>

	{#if data.loadError}
		<ErrorRetry failure={data.loadError} subject="success stories" />
	{:else if paged.length === 0}
		<Empty>
			<EmptyHeader>
				<BrandedEmptyMedia
					><TrophyIcon class="size-6 text-muted-foreground"></TrophyIcon></BrandedEmptyMedia
				>
				<EmptyTitle>First success stories are on the way</EmptyTitle>
				<EmptyDescription
					>Closed a deal through HalalNeo? Tell us — we feature real trades.</EmptyDescription
				>
			</EmptyHeader>
			<EmptyContent>
				<Button size="sm" href={localizeHref('/contact')}>Share your story</Button>
				<Button variant="link" size="sm" href={localizeHref('/products')}>Browse products</Button>
			</EmptyContent>
		</Empty>
	{:else}
		<div class="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3">
			{#each paged as s (s.slug)}
				<a
					href={localizeHref(`/success-stories/${s.slug}`)}
					class="group press-scale flex h-full min-w-0 flex-col rounded-xl bg-card p-2.5 ring-1 ring-foreground/10 transition-[transform,box-shadow] duration-base ease-spring hover:-translate-y-0.5 hover:shadow-md sm:p-4"
				>
					<div class="flex min-w-0 flex-wrap items-center gap-1.5">
						{#if s.dealValue}
							<Badge class="max-w-full truncate bg-success/15 text-2xs text-success"
								>{s.dealValue}</Badge
							>
						{/if}
						{#if s.buyerCountry}
							<span class="inline-flex min-w-0 items-center gap-1 text-2xs text-muted-foreground">
								<MapPinIcon class="size-3 shrink-0" />
								<span class="truncate">{s.buyerCountry}</span>
							</span>
						{/if}
					</div>
					<h3
						class="mt-1.5 line-clamp-2 min-w-0 text-xs leading-snug font-semibold transition-colors group-hover:text-primary sm:text-sm"
					>
						{s.title}
					</h3>
					{#if s.excerpt}
						<p
							class="mt-1 line-clamp-2 hidden min-w-0 text-2xs-plus leading-snug text-muted-foreground sm:block"
						>
							{s.excerpt}
						</p>
					{/if}
					<span class="mt-auto truncate pt-2 text-2xs font-semibold text-primary">Read story →</span
					>
				</a>
			{/each}
		</div>
		<Paginator bind:page {totalPages} />
	{/if}
</section>
