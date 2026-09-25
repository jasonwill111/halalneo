<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '#lib/components/ui/table/index.js';
	import {
		Dialog,
		DialogContent,
		DialogDescription,
		DialogFooter,
		DialogHeader,
		DialogTitle
	} from '#lib/components/ui/dialog/index.js';
	import {
		Select,
		SelectGroup,
		SelectContent,
		SelectItem,
		SelectTrigger
	} from '#lib/components/ui/select/index.js';
	import * as Field from '#lib/components/ui/field/index.js';
	import { Skeleton } from '#lib/components/ui/skeleton/index.js';
	import {
		Empty,
		EmptyContent,
		EmptyDescription,
		EmptyHeader,
		EmptyTitle
	} from '#lib/components/ui/empty/index.js';
	import BrandedEmptyMedia from '#lib/components/site/branded-empty-media.svelte';
	import ErrorRetry from '#lib/components/site/error-retry.svelte';
	import Search from '@lucide/svelte/icons/search';
	import RefreshCw from '@lucide/svelte/icons/refresh-cw';
	import MessageCircle from '@lucide/svelte/icons/message-circle';
	import StatTile from '#lib/components/site/stat-tile.svelte';
	import { toast } from 'svelte-sonner';
	import {
		describeFetchFailure,
		describeThrownFailure,
		type LoadFailure
	} from '#lib/utils/load-error.js';
	import {
		INQUIRY_STATUSES,
		type InquiryDto,
		type InquiryListResponse,
		type InquiryStatus
	} from '#lib/schemas/inquiries.js';

	let search = $state('');
	let items = $state<InquiryDto[]>([]);
	let total = $state(0);
	let loading = $state(true);
	let loadFailure = $state<LoadFailure | null>(null);

	let dialogOpen = $state(false);
	let selectedId = $state<string | null>(null);
	let updating = $state(false);

	const selectedInquiry = $derived(items.find((i) => i.id === selectedId) ?? null);

	const filtered = $derived.by(() => {
		if (!search.trim()) return items;
		const q = search.toLowerCase();
		return items.filter(
			(inq) =>
				inq.id.toLowerCase().includes(q) ||
				inq.subject.toLowerCase().includes(q) ||
				inq.buyerSlug.toLowerCase().includes(q) ||
				(inq.supplierSlug ?? '').toLowerCase().includes(q)
		);
	});

	const activeCount = $derived(items.filter((i) => i.status === 'active').length);
	const flaggedCount = $derived(items.filter((i) => i.status === 'flagged').length);

	function statusColor(s: string): string {
		if (s === 'active') return 'bg-success/10 text-success';
		if (s === 'pending') return 'bg-warn/10 text-warn';
		if (s === 'closed') return 'bg-muted text-muted-foreground';
		if (s === 'flagged') return 'bg-destructive/10 text-destructive';
		return 'bg-muted text-muted-foreground';
	}

	async function loadItems() {
		loading = true;
		loadFailure = null;
		try {
			const res = await fetch('/api/inquiries?limit=100');
			if (!res.ok) {
				loadFailure = describeFetchFailure(res);
				items = [];
				total = 0;
				return;
			}
			const data = (await res.json().catch(() => null)) as InquiryListResponse | null;
			items = data?.items ?? [];
			total = data?.total ?? items.length;
		} catch (error: unknown) {
			loadFailure = describeThrownFailure(error);
			items = [];
			total = 0;
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		void loadItems();
	});

	function viewInquiry(inq: InquiryDto) {
		selectedId = inq.id;
		dialogOpen = true;
	}

	/** Status triage goes through PATCH /api/inquiries/:id (enum-constrained). */
	async function updateStatus(status: InquiryStatus) {
		if (!selectedInquiry || updating) return;
		const id = selectedInquiry.id;
		updating = true;
		try {
			const res = await fetch(`/api/inquiries/${encodeURIComponent(id)}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ status })
			});
			if (res.ok) {
				toast.success(`Status updated to ${status}`);
				await loadItems();
				return;
			}
			const body = (await res.json().catch(() => ({}))) as { error?: string };
			toast.error(body.error || 'Could not update this inquiry.');
		} catch {
			toast.error('Network error — the status was not updated.');
		} finally {
			updating = false;
		}
	}
</script>

<svelte:head>
	<title>Inquiries — HalalNeo Admin</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="space-y-4 sm:space-y-6">
	<div class="flex flex-wrap items-end justify-between gap-4">
		<div class="flex flex-col gap-1">
			<h1 class="text-xl font-semibold tracking-tight sm:text-2xl">Inquiries</h1>
			<p class="max-w-2xl text-xs text-muted-foreground sm:text-sm">
				Manage buyer inquiries and support requests.
			</p>
		</div>
	</div>

	<div class="relative max-w-sm">
		<Search
			class="pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
		></Search>
		<Input bind:value={search} placeholder="Search inquiries..." class="ps-9" />
	</div>

	<div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
		<StatTile value={total} label="Total Inquiries" {loading} />
		<StatTile value={activeCount} label="Active" {loading} />
		<StatTile value={flaggedCount} label="Flagged" tone="warn" {loading} />
	</div>

	{#if loading}
		<div class="min-w-0 overflow-x-auto rounded-xl ring-1 ring-foreground/10">
			<Table class="min-w-[58rem]">
				<TableHeader>
					<TableRow class="hover:bg-transparent">
						<TableHead class="whitespace-nowrap">ID</TableHead>
						<TableHead class="whitespace-nowrap">Buyer</TableHead>
						<TableHead class="whitespace-nowrap">Supplier</TableHead>
						<TableHead class="whitespace-nowrap">Subject</TableHead>
						<TableHead class="whitespace-nowrap">Status</TableHead>
						<TableHead class="text-end">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{#each [0, 1, 2] as row (row)}
						<TableRow>
							<TableCell><Skeleton class="h-4 w-16" /></TableCell>
							<TableCell><Skeleton class="h-4 w-24" /></TableCell>
							<TableCell><Skeleton class="h-4 w-24" /></TableCell>
							<TableCell><Skeleton class="h-4 w-full max-w-xs" /></TableCell>
							<TableCell><Skeleton class="h-4 w-16" /></TableCell>
							<TableCell class="text-end"><Skeleton class="ms-auto h-7 w-14" /></TableCell>
						</TableRow>
					{/each}
				</TableBody>
			</Table>
		</div>
	{:else if loadFailure}
		<ErrorRetry failure={loadFailure} subject="inquiries" onretry={loadItems} />
	{:else if filtered.length === 0}
		<Empty class="border">
			<EmptyHeader>
				<BrandedEmptyMedia variant="icon">
					<MessageCircle />
				</BrandedEmptyMedia>
				<EmptyTitle>
					{search.trim() ? 'No matching inquiries' : 'No inquiries yet'}
				</EmptyTitle>
				<EmptyDescription>
					{search.trim()
						? `Nothing matches “${search.trim()}” in the loaded inquiries.`
						: 'Buyer messages and support requests will appear here.'}
				</EmptyDescription>
			</EmptyHeader>
			<EmptyContent>
				{#if search.trim()}
					<Button variant="outline" size="sm" onclick={() => (search = '')}>Clear search</Button>
				{:else}
					<Button variant="outline" size="sm" onclick={loadItems}>
						<RefreshCw class="size-4"></RefreshCw>
						Refresh inquiries
					</Button>
				{/if}
			</EmptyContent>
		</Empty>
	{:else}
		<div class="min-w-0 overflow-x-auto rounded-xl ring-1 ring-foreground/10">
			<Table class="min-w-[58rem]">
				<TableHeader>
					<TableRow class="hover:bg-transparent">
						<TableHead class="whitespace-nowrap">ID</TableHead>
						<TableHead class="whitespace-nowrap">Buyer</TableHead>
						<TableHead class="whitespace-nowrap">Supplier</TableHead>
						<TableHead class="whitespace-nowrap">Subject</TableHead>
						<TableHead class="whitespace-nowrap">Status</TableHead>
						<TableHead class="text-end">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{#each filtered as inq (inq.id)}
						<TableRow>
							<TableCell class="font-medium whitespace-nowrap"
								>{inq.id.slice(0, 8) || '—'}</TableCell
							>
							<TableCell class="whitespace-nowrap">{inq.buyerSlug}</TableCell>
							<TableCell class="whitespace-nowrap">{inq.supplierSlug ?? '—'}</TableCell>
							<TableCell class="max-w-xs truncate">{inq.subject}</TableCell>
							<TableCell>
								<Badge
									variant="secondary"
									class={`px-1.5 py-0.5 text-2xs capitalize ${statusColor(inq.status)}`}
									>{inq.status}</Badge
								>
							</TableCell>
							<TableCell class="text-end">
								<Button
									variant="ghost"
									size="sm"
									class="h-7 text-2xs"
									onclick={() => viewInquiry(inq)}
								>
									View
								</Button>
							</TableCell>
						</TableRow>
					{/each}
				</TableBody>
			</Table>
		</div>
	{/if}

	{#if !loading && !loadFailure && total > items.length}
		<p class="text-xs text-muted-foreground">
			Showing {items.length} of {total} inquiries (API caps at 100).
		</p>
	{/if}
</div>

<Dialog bind:open={dialogOpen}>
	<DialogContent class="max-h-[85dvh] overflow-y-auto sm:max-w-lg">
		{#if selectedInquiry}
			<DialogHeader>
				<DialogTitle>{selectedInquiry.subject}</DialogTitle>
				<DialogDescription>
					Inquiry {selectedInquiry.id}
				</DialogDescription>
			</DialogHeader>

			<div class="flex flex-col gap-4">
				<div class="grid grid-cols-2 gap-4 text-sm">
					<div>
						<p class="text-2xs text-muted-foreground">Buyer</p>
						<p class="font-medium">{selectedInquiry.buyerSlug}</p>
					</div>
					<div>
						<p class="text-2xs text-muted-foreground">Supplier</p>
						<p class="font-medium">{selectedInquiry.supplierSlug ?? '—'}</p>
					</div>
					<div>
						<p class="text-2xs text-muted-foreground">Product</p>
						<p class="font-medium">{selectedInquiry.productSlug ?? '—'}</p>
					</div>
					<div>
						<p class="text-2xs text-muted-foreground">Status</p>
						<p class="font-medium capitalize">{selectedInquiry.status}</p>
					</div>
				</div>

				<div class="rounded-lg bg-muted/50 p-3">
					<p class="mb-1 text-2xs text-muted-foreground">Message</p>
					<p class="text-sm whitespace-pre-wrap">{selectedInquiry.message}</p>
				</div>

				<Field.Field>
					<Field.FieldLabel>Update Status</Field.FieldLabel>
					<Select
						value={selectedInquiry.status}
						onValueChange={(v) => {
							if (!v) return;
							void updateStatus(v as InquiryStatus);
						}}
						type="single"
					>
						<SelectTrigger class="w-full capitalize" disabled={updating}>
							{selectedInquiry.status}
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								{#each INQUIRY_STATUSES as s (s)}
									<SelectItem value={s}>{s}</SelectItem>
								{/each}
							</SelectGroup>
						</SelectContent>
					</Select>
				</Field.Field>
			</div>

			<DialogFooter>
				<Button variant="outline" onclick={() => (dialogOpen = false)}>Close</Button>
			</DialogFooter>
		{/if}
	</DialogContent>
</Dialog>
