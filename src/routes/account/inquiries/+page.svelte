<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Skeleton } from '#lib/components/ui/skeleton/index.js';
	import {
		Empty,
		EmptyContent,
		EmptyDescription,
		EmptyHeader,
		EmptyTitle
	} from '#lib/components/ui/empty/index.js';
	import { cn } from '#lib/utils.js';
	import FilterPills from '#lib/components/site/filter-pills.svelte';
	import Paginator from '#lib/components/site/paginator.svelte';
	import BrandedEmptyMedia from '#lib/components/site/branded-empty-media.svelte';
	import ErrorRetry from '#lib/components/site/error-retry.svelte';
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import type { LoadFailure } from '#lib/utils/load-error.js';
	import { describeFetchFailure, describeThrownFailure } from '#lib/utils/load-error.js';
	import Package from '@lucide/svelte/icons/package';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import Inbox from '@lucide/svelte/icons/inbox';
	import { onMount } from 'svelte';

	interface MyInquiry {
		id: string;
		supplierSlug: string | null;
		productSlug: string | null;
		subject: string;
		message: string;
		status: string;
		createdAt?: string | null;
	}

	let inquiries = $state<MyInquiry[]>([]);
	let loading = $state(true);
	let failure = $state<LoadFailure | null>(null);

	async function loadInquiries(): Promise<void> {
		loading = true;
		failure = null;
		try {
			const res = await fetch('/api/inquiries/mine');
			if (!res.ok) {
				failure = describeFetchFailure(res);
				return;
			}
			const body = (await res.json()) as { items?: MyInquiry[] };
			inquiries = body.items ?? [];
		} catch (error) {
			failure = describeThrownFailure(error);
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		void loadInquiries();
	});

	const statusTabs = ['all', 'active', 'pending', 'closed', 'flagged'] as const;
	let activeTab = $state<string>('all');

	const statusOptions = $derived(
		statusTabs.map((s) => ({
			value: s,
			label: s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1),
			count: s === 'all' ? inquiries.length : inquiries.filter((i) => i.status === s).length
		}))
	);

	const filtered = $derived(
		activeTab === 'all' ? inquiries : inquiries.filter((i) => i.status === activeTab)
	);

	// Client-side pagination: /api/inquiries/mine caps at 100 rows server-side.
	const PAGE_SIZE = 8;
	let page = $state(1);
	$effect(() => {
		void activeTab;
		void filtered.length;
		page = 1;
	});
	const totalPages = $derived(Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)));
	const paged = $derived(filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE));

	function statusBorder(status: string): string {
		if (status === 'active') return 'border-s-success';
		if (status === 'pending') return 'border-s-primary';
		if (status === 'flagged') return 'border-s-warn';
		return 'border-s-muted';
	}

	function statusIconBg(status: string): string {
		if (status === 'active') return 'bg-success/10 text-success';
		if (status === 'pending') return 'bg-primary/10 text-primary';
		if (status === 'flagged') return 'bg-warn/10 text-warn';
		return 'bg-muted text-muted-foreground';
	}

	function badgeColor(status: string): string {
		if (status === 'active') return 'bg-success/10 text-success';
		if (status === 'pending') return 'bg-primary/10 text-primary';
		if (status === 'flagged') return 'bg-warn/10 text-warn';
		return 'bg-muted text-muted-foreground';
	}

	function formatDate(iso?: string | null): string {
		if (!iso) return '';
		const d = new Date(iso);
		if (Number.isNaN(d.getTime())) return '';
		return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
	}
</script>

<svelte:head>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="min-w-0 space-y-3">
	<div class="min-w-0 space-y-1">
		<h1 class="text-xl sm:text-2xl">My inquiries</h1>
		<p class="max-w-2xl text-xs text-muted-foreground sm:text-sm">
			Track conversations with suppliers and follow up on product questions here.
		</p>
	</div>

	{#if loading}
		<div class="min-w-0 space-y-2">
			{#each Array(3) as _, i (i)}
				<Skeleton class="h-24 rounded-xl" />
			{/each}
		</div>
	{:else if failure}
		<ErrorRetry {failure} subject="your inquiries" onretry={loadInquiries} />
	{:else}
		<div class="min-w-0">
			<div class="mb-2 flex items-center justify-between gap-2">
				<p class="text-xs text-muted-foreground">{inquiries.length} total inquiries</p>
			</div>
			<div class="mb-3 min-w-0">
				<FilterPills
					options={statusOptions}
					bind:value={activeTab}
					ariaLabel="Filter inquiries by status"
				/>
			</div>

			{#if filtered.length === 0}
				<Empty class="min-h-64 border border-border/60 bg-card/40 p-5">
					<EmptyHeader>
						<BrandedEmptyMedia variant="icon">
							<Inbox class="size-6 text-muted-foreground"></Inbox>
						</BrandedEmptyMedia>
						{#if activeTab === 'all'}
							<EmptyTitle>No inquiries yet</EmptyTitle>
							<EmptyDescription class="text-xs sm:text-sm">
								Start a conversation from a product or supplier page and track it here.
							</EmptyDescription>
						{:else}
							<EmptyTitle>No inquiries in this status</EmptyTitle>
							<EmptyDescription class="text-xs sm:text-sm">
								Try another status to see the rest of your inquiry history.
							</EmptyDescription>
						{/if}
					</EmptyHeader>
					<EmptyContent>
						{#if activeTab === 'all'}
							<Button href={localizeHref('/suppliers')} variant="outline" size="sm">
								Browse suppliers
								<ChevronRight class="size-3 rtl:rotate-180"></ChevronRight>
							</Button>
						{:else}
							<Button type="button" variant="outline" size="sm" onclick={() => (activeTab = 'all')}>
								View all inquiries
							</Button>
						{/if}
					</EmptyContent>
				</Empty>
			{:else}
				<div class="min-w-0 space-y-2">
					{#each paged as item (item.id)}
						<div
							class={cn(
								'group min-w-0 rounded-xl border-s-2 bg-card p-2 ring-1 ring-foreground/10 transition-[transform,box-shadow] duration-base ease-spring hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-md',
								statusBorder(item.status)
							)}
						>
							<div class="flex min-w-0 items-start gap-2">
								<div
									class={cn(
										'flex size-8 shrink-0 items-center justify-center rounded-lg text-2xs font-bold',
										statusIconBg(item.status)
									)}
								>
									<Package class="size-4"></Package>
								</div>
								<div class="min-w-0 flex-1">
									<div class="flex min-w-0 items-start justify-between gap-2">
										<div class="min-w-0 flex-1">
											<h3
												class="line-clamp-2 min-w-0 text-xs font-semibold break-words text-foreground transition-colors group-hover:text-primary"
											>
												{item.subject}
											</h3>
											{#if item.supplierSlug}
												<p class="mt-0 min-w-0 text-2xs break-words text-muted-foreground">
													To:
													<a
														href="/supplier/{item.supplierSlug}"
														class="break-words text-primary hover:underline">{item.supplierSlug}</a
													>
												</p>
											{/if}
										</div>
										<Badge
											variant="secondary"
											class={`shrink-0 px-1.5 py-0.5 text-2xs capitalize ${badgeColor(item.status)}`}
										>
											<span class="size-1 rounded-full bg-current"></span>
											{item.status}
										</Badge>
									</div>
									<p class="mt-1 line-clamp-2 min-w-0 text-2xs break-words text-muted-foreground">
										{item.message}
									</p>
									<div class="mt-1.5 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
										{#if formatDate(item.createdAt)}
											<span class="text-2xs text-muted-foreground">
												Sent {formatDate(item.createdAt)}
											</span>
										{/if}
										{#if item.productSlug}
											<Button
												href="/product/{item.productSlug}"
												variant="ghost"
												size="sm"
												class="inline-flex h-6 min-w-0 text-2xs font-medium text-primary"
											>
												View product
												<ChevronRight class="size-2.5 rtl:rotate-180"></ChevronRight>
											</Button>
										{:else if item.supplierSlug}
											<Button
												href="/supplier/{item.supplierSlug}"
												variant="ghost"
												size="sm"
												class="inline-flex h-6 min-w-0 text-2xs font-medium text-primary"
											>
												View supplier
												<ChevronRight class="size-2.5 rtl:rotate-180"></ChevronRight>
											</Button>
										{/if}
									</div>
								</div>
							</div>
						</div>
					{/each}
				</div>
				<Paginator bind:page {totalPages} />
			{/if}
		</div>
	{/if}
</div>
