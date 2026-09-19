<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Skeleton } from '#lib/components/ui/skeleton/index.js';
	import { cn } from '#lib/utils.js';
	import FilterPills from '#lib/components/site/filter-pills.svelte';
	import Paginator from '#lib/components/site/paginator.svelte';
	import Package from '@lucide/svelte/icons/package';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import Inbox from '@lucide/svelte/icons/inbox';
	import { toast } from 'svelte-sonner';
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

	onMount(async () => {
		try {
			const res = await fetch('/api/inquiries/mine');
			if (res.ok) {
				const body = (await res.json()) as { items?: MyInquiry[] };
				inquiries = body.items ?? [];
			} else {
				toast.error('Could not load your inquiries. Please refresh.');
			}
		} catch {
			toast.error('Network error — could not load your inquiries.');
		} finally {
			loading = false;
		}
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
		if (status === 'active') return 'border-l-success';
		if (status === 'pending') return 'border-l-primary';
		if (status === 'flagged') return 'border-l-warn';
		return 'border-l-muted';
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

<div class="flex-1 min-w-0">
	<div class="mb-2 flex items-center justify-between">
		<div>
			<h2 class="text-sm font-bold text-foreground">My Inquiries</h2>
			<p class="text-2xs text-muted-foreground">{inquiries.length} total inquiries</p>
		</div>
	</div>

	<div class="mb-2">
		<FilterPills
			options={statusOptions}
			bind:value={activeTab}
			ariaLabel="Filter inquiries by status"
		/>
	</div>

	{#if loading}
		<div class="space-y-1.5">
			{#each Array(3) as _, i (i)}
				<Skeleton class="h-24 rounded-xl" />
			{/each}
		</div>
	{:else if filtered.length === 0}
		<div class="rounded-xl bg-card p-6 text-center ring-1 ring-foreground/10">
			<Inbox class="mx-auto size-6 text-muted-foreground/30"></Inbox>
			<p class="mt-2 text-2xs-plus text-muted-foreground">
				{activeTab === 'all'
					? 'No inquiries yet.'
					: 'No inquiries in this status.'}
			</p>
			{#if activeTab === 'all'}
				<p class="mt-1 text-2xs text-muted-foreground">
					Send an inquiry from any product or supplier page and track it here.
				</p>
				<Button href="/suppliers" variant="outline" size="sm" class="mt-3 h-7 text-2xs">
					Browse suppliers
					<ChevronRight class="size-3"></ChevronRight>
				</Button>
			{/if}
		</div>
	{:else}
		<div class="space-y-1.5">
			{#each paged as item (item.id)}
				<div
					class={cn(
						'group rounded-xl bg-card border-l-2 p-2 ring-1 ring-foreground/10 transition-all hover:border-primary/20 hover:shadow-md',
						statusBorder(item.status)
					)}
				>
					<div class="flex items-start gap-2">
						<div
							class={cn(
								'flex size-8 shrink-0 items-center justify-center rounded-lg text-2xs font-bold',
								statusIconBg(item.status)
							)}
						>
							<Package class="size-4"></Package>
						</div>
						<div class="min-w-0 flex-1">
							<div class="flex items-start justify-between gap-2">
								<div>
									<h3
										class="text-2xs-plus font-semibold text-foreground group-hover:text-primary transition-colors"
									>
										{item.subject}
									</h3>
									{#if item.supplierSlug}
										<p class="mt-0 text-2xs text-muted-foreground">
											To:
											<a
												href="/supplier/{item.supplierSlug}"
												class="text-primary hover:underline">{item.supplierSlug}</a
											>
										</p>
									{/if}
								</div>
								<Badge variant="secondary" class={`px-1.5 py-0.5 text-2xs capitalize ${badgeColor(item.status)}`}>
									<span class="size-1 rounded-full bg-current"></span>
									{item.status}
								</Badge>
							</div>
							<p class="mt-1 text-2xs text-muted-foreground line-clamp-2">{item.message}</p>
							<div class="mt-1.5 flex items-center gap-2">
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
										class="inline-flex h-5 items-center gap-0.5 text-2xs font-medium text-primary"
									>
										View product
										<ChevronRight class="size-2.5"></ChevronRight>
									</Button>
								{:else if item.supplierSlug}
									<Button
										href="/supplier/{item.supplierSlug}"
										variant="ghost"
										size="sm"
										class="inline-flex h-5 items-center gap-0.5 text-2xs font-medium text-primary"
									>
										View supplier
										<ChevronRight class="size-2.5"></ChevronRight>
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
