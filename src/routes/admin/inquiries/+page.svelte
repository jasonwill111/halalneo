<script lang="ts">
	import { adminData, upsertItem } from '#lib/stores/admin-data.svelte.js';
	import type { Inquiry } from '#lib/data/types.js';
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
	import Search from '@lucide/svelte/icons/search';
	import StatTile from '#lib/components/site/stat-tile.svelte';

	let search = $state('');
	let dialogOpen = $state(false);
	let selectedInquiry = $state<Inquiry | null>(null);

	const inquiries = $derived(adminData.inquiries ?? []);

	const filtered = $derived.by(() => {
		if (!search.trim()) return inquiries;
		const q = search.toLowerCase();
		return inquiries.filter(
			(inq) =>
				inq.id?.toLowerCase().includes(q) ||
				inq.subject?.toLowerCase().includes(q) ||
				inq.buyerSlug?.toLowerCase().includes(q) ||
				inq.supplierSlug?.toLowerCase().includes(q)
		);
	});

	const totalInquiries = $derived(inquiries.length);
	const activeCount = $derived(inquiries.filter((i) => i.status === 'active').length);
	const flaggedCount = $derived(inquiries.filter((i) => i.status === 'flagged').length);

	function statusColor(s: string): string {
		if (s === 'active') return 'bg-success/10 text-success';
		if (s === 'in-progress') return 'bg-primary/10 text-primary';
		if (s === 'pending') return 'bg-warn/10 text-warn';
		if (s === 'closed') return 'bg-muted text-muted-foreground';
		if (s === 'flagged') return 'bg-destructive/10 text-destructive';
		return 'bg-muted text-muted-foreground';
	}

	function viewInquiry(inq: Inquiry) {
		selectedInquiry = inq;
		dialogOpen = true;
	}

	function updateStatus(newStatus: Inquiry['status']) {
		if (!selectedInquiry) return;
		upsertItem<Inquiry>('inquiries', { ...selectedInquiry, status: newStatus }, selectedInquiry);
		selectedInquiry = { ...selectedInquiry, status: newStatus };
	}
</script>

<svelte:head>
	<title>Inquiries — HalalNeo Admin</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="flex flex-col gap-6">
	<div class="flex flex-wrap items-end justify-between gap-4">
		<div class="flex flex-col gap-1">
			<h1 class="text-2xl font-semibold tracking-tight sm:text-3xl">Inquiries</h1>
			<p class="max-w-2xl text-sm text-muted-foreground">
				Manage buyer inquiries and support requests.
			</p>
		</div>
	</div>

	<div class="relative max-w-sm">
		<Search
			class="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
		></Search>
		<Input bind:value={search} placeholder="Search inquiries..." class="pl-9" />
	</div>

	<div class="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
		<StatTile value={totalInquiries} label="Total Inquiries" />
		<StatTile value={activeCount} label="Active" />
		<StatTile value={flaggedCount} label="Flagged" tone="warn" />
	</div>

	<div class="overflow-x-auto rounded-xl ring-1 ring-foreground/10">
		<Table>
			<TableHeader>
				<TableRow class="hover:bg-transparent">
					<TableHead>ID</TableHead>
					<TableHead>Buyer</TableHead>
					<TableHead>Supplier</TableHead>
					<TableHead>Subject</TableHead>
					<TableHead>Status</TableHead>
					<TableHead class="text-right">Actions</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{#each filtered as inq (inq.id)}
					<TableRow>
						<TableCell class="font-medium">{inq.id ?? '—'}</TableCell>
						<TableCell>{inq.buyerSlug}</TableCell>
						<TableCell>{inq.supplierSlug ?? '—'}</TableCell>
						<TableCell>{inq.subject}</TableCell>
						<TableCell>
							<Badge
								variant="secondary"
								class={`px-1.5 py-0.5 text-[10px] capitalize ${statusColor(inq.status ?? '')}`}
								>{inq.status}</Badge
							>
						</TableCell>
						<TableCell class="text-right">
							<Button
								variant="ghost"
								size="sm"
								class="h-7 text-[10px]"
								onclick={() => viewInquiry(inq)}
							>
								View
							</Button>
						</TableCell>
					</TableRow>
				{:else}
					<TableRow>
						<TableCell colspan={6} class="py-8 text-center text-sm text-muted-foreground">
							No inquiries found.
						</TableCell>
					</TableRow>
				{/each}
			</TableBody>
		</Table>
	</div>
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
						<p class="text-[10px] text-muted-foreground">Buyer</p>
						<p class="font-medium">{selectedInquiry.buyerSlug}</p>
					</div>
					<div>
						<p class="text-[10px] text-muted-foreground">Supplier</p>
						<p class="font-medium">{selectedInquiry.supplierSlug ?? '—'}</p>
					</div>
					<div>
						<p class="text-[10px] text-muted-foreground">Product</p>
						<p class="font-medium">{selectedInquiry.productSlug ?? '—'}</p>
					</div>
					<div>
						<p class="text-[10px] text-muted-foreground">Status</p>
						<p class="font-medium capitalize">{selectedInquiry.status}</p>
					</div>
				</div>

				<div class="rounded-lg bg-muted/50 p-3">
					<p class="mb-1 text-[10px] text-muted-foreground">Message</p>
					<p class="text-sm whitespace-pre-wrap">{selectedInquiry.message}</p>
				</div>

				<Field.Field>
					<Field.FieldLabel>Update Status</Field.FieldLabel>
					<Select
						value={selectedInquiry.status}
						onValueChange={(v) => {
							if (!v || !selectedInquiry) return;
							const newStatus = v as Inquiry['status'];
							selectedInquiry = { ...selectedInquiry, status: newStatus };
							updateStatus(newStatus);
						}}
						type="single"
					>
						<SelectTrigger class="w-full capitalize">{selectedInquiry.status}</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								<SelectItem value="active">active</SelectItem>
								<SelectItem value="pending">pending</SelectItem>
								<SelectItem value="in-progress">in-progress</SelectItem>
								<SelectItem value="closed">closed</SelectItem>
								<SelectItem value="flagged">flagged</SelectItem>
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
