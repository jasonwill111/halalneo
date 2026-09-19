<script lang="ts">
	import type { PageProps } from './$types';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Skeleton } from '#lib/components/ui/skeleton/index.js';
	import { Empty, EmptyMedia } from '#lib/components/ui/empty/index.js';
	import FilterPills from '#lib/components/site/filter-pills.svelte';
	import Paginator from '#lib/components/site/paginator.svelte';
	import ErrorRetry from '#lib/components/site/error-retry.svelte';
	import { describeFetchFailure, describeThrownFailure, type LoadFailure } from '#lib/utils/load-error.js';
	import { INQUIRY_STATUSES, type InquiryDto, type InquiryListResponse } from '#lib/schemas/inquiries.js';
	import Inbox from '@lucide/svelte/icons/inbox';
	import ShieldQuestion from '@lucide/svelte/icons/shield-question';

	let { data }: PageProps = $props();

	const PAGE_SIZE = 20;

	/** `''` = every status; the API omits the `status` filter for that case. */
	const STATUS_OPTIONS = [
		{ value: '', label: 'All' },
		...INQUIRY_STATUSES.map((s) => ({ value: s, label: s[0].toUpperCase() + s.slice(1) }))
	];

	const STATUS_BADGE: Record<string, string> = {
		active: 'bg-success/10 text-success',
		pending: 'bg-warn/10 text-warn',
		flagged: 'bg-destructive/10 text-destructive',
		closed: 'bg-muted text-muted-foreground'
	};

	// Session-derived by src/routes/supplier/+layout.server.ts — never hardcoded.
	const supplierSlug = $derived(data.supplierSlug);

	let status = $state('');
	let page = $state(1);
	let items = $state<InquiryDto[]>([]);
	let total = $state(0);
	let loading = $state(true);
	let loadFailure = $state<LoadFailure | null>(null);

	let requestId = 0;

	const totalPages = $derived(Math.max(1, Math.ceil(total / PAGE_SIZE)));
	const activeStatus = $derived(
		STATUS_OPTIONS.find((o) => o.value === status)?.value ?? ''
	);

	function humanizeSlug(slug: string | null | undefined, fallback: string): string {
		if (!slug) return fallback;
		return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
	}

	function formatDate(raw: string | null | undefined): string {
		if (!raw) return '—';
		const d = new Date(raw);
		return Number.isNaN(d.getTime())
			? '—'
			: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
	}

	async function loadInquiries(slug: string, statusCode: string, pageIndex: number) {
		const id = ++requestId;
		loading = true;
		loadFailure = null;
		const params = new SvelteURLSearchParams({
			supplierSlug: slug,
			limit: String(PAGE_SIZE),
			offset: String((pageIndex - 1) * PAGE_SIZE)
		});
		if (statusCode) params.set('status', statusCode);
		try {
			const res = await fetch(`/api/inquiries?${params}`);
			if (id !== requestId) return;
			if (!res.ok) {
				items = [];
				total = 0;
				loadFailure = describeFetchFailure(res);
				return;
			}
			const payload = (await res.json().catch(() => null)) as InquiryListResponse | null;
			if (id !== requestId) return;
			items = payload?.items ?? [];
			total = payload?.total ?? 0;
		} catch (e) {
			if (id !== requestId) return;
			items = [];
			total = 0;
			loadFailure = describeThrownFailure(e);
		} finally {
			if (id === requestId) loading = false;
		}
	}

	$effect(() => {
		const slug = supplierSlug;
		const code = activeStatus;
		const pageIndex = page;
		if (!slug) {
			loading = false;
			return;
		}
		void loadInquiries(slug, code, pageIndex);
	});
</script>

<svelte:head>
	<title>Inquiries — HalalNeo</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="space-y-1">
	<h1 class="text-2xl font-semibold tracking-tight sm:text-3xl">Inquiries</h1>
	<p class="text-sm text-muted-foreground">
		{loading
			? 'Loading your inquiries…'
			: `${total} message${total === 1 ? '' : 's'} from buyers`}
	</p>
</div>

{#if !supplierSlug}
	<div class="mt-4 rounded-xl bg-card p-6 ring-1 ring-foreground/10">
		<Empty>
			<EmptyMedia><ShieldQuestion class="size-6 text-muted-foreground" /></EmptyMedia>
			<div class="space-y-1">
				<p class="font-medium">No supplier account linked</p>
				<p class="text-sm text-muted-foreground">
					Buyer inquiries are delivered to the supplier account they were sent to. Apply for
					access and an administrator will link this account to your company.
				</p>
			</div>
			<Button class="mt-2" size="sm" href={localizeHref('/supplier/onboarding')}>
				Apply to become a supplier
			</Button>
		</Empty>
	</div>
{:else}
	<div class="mt-3">
		<FilterPills
			options={STATUS_OPTIONS}
			bind:value={status}
			ariaLabel="Filter inquiries by status"
		/>
	</div>

	<ErrorRetry
		failure={loadFailure}
		subject="your inquiries"
		onretry={() => loadInquiries(supplierSlug ?? '', activeStatus, page)}
	/>

	<div class="mt-4 space-y-2">
		{#if loading}
			<div class="space-y-2" aria-label="Loading inquiries">
				{#each [0, 1, 2] as i (i)}
					<Skeleton class="h-24 w-full rounded-xl" />
				{/each}
			</div>
		{:else if loadFailure}
			<p class="rounded-xl bg-card px-4 py-12 text-center text-sm text-muted-foreground ring-1 ring-foreground/10">
				Inquiries unavailable — use “Try again” above.
			</p>
		{:else if items.length === 0}
			<div class="rounded-xl bg-card px-4 py-12 text-center ring-1 ring-foreground/10">
				<Empty>
					<EmptyMedia><Inbox class="size-6 text-muted-foreground" /></EmptyMedia>
					<div class="space-y-1">
						<p class="font-medium">No inquiries{activeStatus ? ` marked ${activeStatus}` : ''}</p>
						<p class="max-w-sm text-sm text-muted-foreground">
							Messages buyers send from your public profile or product pages land here.
						</p>
					</div>
				</Empty>
			</div>
		{:else}
			{#each items as inquiry (inquiry.id)}
				<article class="rounded-xl bg-card px-4 py-3 ring-1 ring-foreground/10">
					<div class="flex flex-wrap items-start justify-between gap-2">
						<div class="min-w-0">
							<h2 class="truncate text-sm font-semibold" title={inquiry.subject}>
								{inquiry.subject}
							</h2>
							<p class="mt-0.5 text-xs text-muted-foreground">
								{humanizeSlug(inquiry.buyerSlug, 'Buyer')}
								· {formatDate(inquiry.createdAt)}
							</p>
						</div>
						<Badge
							variant="secondary"
							class="shrink-0 capitalize {STATUS_BADGE[inquiry.status] ?? 'bg-muted text-muted-foreground'}"
						>
							{inquiry.status}
						</Badge>
					</div>
					{#if inquiry.productSlug}
						<p class="mt-2 text-xs text-muted-foreground">
							About
							<a
								href={localizeHref(`/product/${inquiry.productSlug}`)}
								class="font-medium text-primary hover:underline"
							>
								{humanizeSlug(inquiry.productSlug, 'this listing')}
							</a>
						</p>
					{/if}
					<p class="mt-2 text-sm/relaxed break-words text-foreground/90">{inquiry.message}</p>
				</article>
			{/each}
		{/if}
	</div>

	<Paginator bind:page {totalPages} />
{/if}
