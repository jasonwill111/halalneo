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
 	import { Skeleton } from '#lib/components/ui/skeleton/index.js';
 	import Search from '@lucide/svelte/icons/search';
 	import Eye from '@lucide/svelte/icons/eye';
 	import Trash2 from '@lucide/svelte/icons/trash-2';
 	import StatTile from '#lib/components/site/stat-tile.svelte';
 	import ConfirmDialog from '#lib/components/site/confirm-dialog.svelte';
 	import { toast } from 'svelte-sonner';

	let search = $state('');
	let items = $state<any[]>([]);
	let total = $state(0);
	let loading = $state(true);
	let page = $state(1);
	const limit = 20;

	let detailOpen = $state(false);
	let selected = $state<any | null>(null);
	let confirmId = $state<string | null>(null);
	let confirmTitle = $state('');

	const statusOptions = ['active', 'expired', 'draft'];

	async function loadItems() {
		loading = true;
		try {
			const params = new URLSearchParams({ limit: String(limit), offset: String((page - 1) * limit) });
			if (search.trim()) params.set('search', search.trim());
			const res = await fetch(`/api/promotions?${params}`);
			if (res.ok) {
				const data = (await res.json()) as { items: any[]; total: number };
				items = data.items ?? [];
				total = data.total ?? 0;
			}
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		void page;
		void search;
		loadItems();
	});

	function viewDetail(item: any) {
		selected = item;
		detailOpen = true;
	}

	function confirmDelete(item: any) {
		confirmId = item.id;
		confirmTitle = item.title;
	}

	async function doDelete() {
		if (!confirmId) return;
		try {
			const res = await fetch(`/api/promotions/${confirmId}`, { method: 'DELETE' });
			if (res.ok) {
				toast.success('Promotion deleted');
				await loadItems();
			} else {
				const data = (await res.json()) as { error?: string };
				toast.error(data.error ?? 'Delete failed');
			}
		} catch {
			toast.error('Network error');
		}
		confirmId = null;
		confirmTitle = '';
	}

	async function updateStatus(id: string, status: string) {
		try {
			const res = await fetch(`/api/promotions/${id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ status })
			});
			if (res.ok) {
				toast.success(`Status updated to ${status}`);
				await loadItems();
			} else {
				const data = (await res.json()) as { error?: string };
				toast.error(data.error ?? 'Update failed');
			}
		} catch {
			toast.error('Network error');
		}
	}

	function statusColor(s: string): string {
		if (s === 'active') return 'bg-success/10 text-success';
		if (s === 'expired') return 'bg-muted text-muted-foreground';
		if (s === 'draft') return 'bg-warn/10 text-warn';
		return 'bg-muted text-muted-foreground';
	}

	function formatDate(d: string): string {
		if (!d) return '—';
		try {
			return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
		} catch {
			return d;
		}
	}
</script>

<svelte:head>
	<title>Promotions — HalalNeo Admin</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="space-y-4 sm:space-y-6">
	<div class="flex flex-wrap items-end justify-between gap-4">
		<div class="flex flex-col gap-1">
			<h1 class="text-2xl font-semibold tracking-tight sm:text-3xl">Promotions</h1>
			<p class="max-w-2xl text-sm text-muted-foreground">
				Manage supplier promotions, deals, and special offers.
			</p>
		</div>
	</div>

	<div class="relative max-w-sm">
		<Search class="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
		<Input bind:value={search} placeholder="Search promotions..." class="pl-9" />
	</div>

	<div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
		<StatTile value={total} label="Total Promos" />
		<StatTile value={items.filter((p) => p.status === 'active').length} label="Active" />
		<StatTile value={items.filter((p) => p.discountPct).length} label="With Discount" />
	</div>

	<div class="overflow-x-auto rounded-xl ring-1 ring-foreground/10">
		<Table>
			<TableHeader>
				<TableRow class="hover:bg-transparent">
					<TableHead>Title</TableHead>
					<TableHead>Supplier</TableHead>
					<TableHead>Discount</TableHead>
					<TableHead>Price Range</TableHead>
					<TableHead>Valid Until</TableHead>
					<TableHead>Status</TableHead>
					<TableHead class="text-right">Actions</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{#if loading}
					<TableRow>
						<TableCell colspan={7} class="py-8 text-center">
							<Skeleton class="h-5 w-32 mx-auto" />
						</TableCell>
					</TableRow>
				{:else if items.length === 0}
					<TableRow>
						<TableCell colspan={7} class="py-8 text-center text-sm text-muted-foreground">No promotions found.</TableCell>
					</TableRow>
				{:else}
					{#each items as p (p.id)}
						<TableRow>
							<TableCell>
								<div class="min-w-0">
									<p class="truncate font-medium">{p.title}</p>
									<p class="truncate text-xs text-muted-foreground">{p.id}</p>
								</div>
							</TableCell>
							<TableCell class="text-xs">{p.supplierSlug ?? '—'}</TableCell>
							<TableCell class="text-xs">{p.discountPct ? `${p.discountPct}%` : '—'}</TableCell>
							<TableCell class="text-xs">
								{p.priceMin ?? '—'}{p.priceMax ? ` – ${p.priceMax}` : ''}{p.priceUnit ? ` ${p.priceUnit}` : ''}
							</TableCell>
							<TableCell class="text-xs">{formatDate(p.validUntil ?? '')}</TableCell>
							<TableCell>
								<Badge variant="secondary" class={`px-1.5 py-0.5 text-[10px] capitalize ${statusColor(p.status ?? 'active')}`}>
									{p.status ?? 'active'}
								</Badge>
							</TableCell>
							<TableCell class="text-right">
								<div class="flex items-center justify-end gap-1">
									<Button variant="ghost" size="icon" aria-label="View" class="size-8" onclick={() => viewDetail(p)}>
										<Eye class="size-3.5" />
									</Button>
									<Button
										variant="ghost"
										size="icon"
										aria-label="Delete"
										class="size-8 hover:bg-destructive/10 hover:text-destructive"
										onclick={() => confirmDelete(p)}
									>
										<Trash2 class="size-3.5" />
									</Button>
								</div>
							</TableCell>
						</TableRow>
					{/each}
				{/if}
			</TableBody>
		</Table>
	</div>

	{#if total > limit}
		<div class="flex justify-center gap-2">
			<Button variant="outline" size="sm" disabled={page <= 1} onclick={() => page--}>Previous</Button>
			<span class="flex items-center px-3 text-sm text-muted-foreground">
				Page {page} of {Math.ceil(total / limit)}
			</span>
			<Button variant="outline" size="sm" disabled={page >= Math.ceil(total / limit)} onclick={() => page++}>Next</Button>
		</div>
	{/if}
</div>

<Dialog bind:open={detailOpen}>
	<DialogContent class="max-h-[85dvh] overflow-y-auto sm:max-w-lg">
		<DialogHeader>
			<DialogTitle>{selected?.title ?? 'Promotion Detail'}</DialogTitle>
			<DialogDescription>{selected?.id}</DialogDescription>
		</DialogHeader>
		{#if selected}
			<div class="space-y-3 text-sm">
				<div><span class="text-muted-foreground">Supplier:</span> {selected.supplierSlug ?? '—'}</div>
				<div><span class="text-muted-foreground">Product:</span> {selected.productSlug ?? '—'}</div>
				<div><span class="text-muted-foreground">Discount:</span> {selected.discountPct ? `${selected.discountPct}%` : '—'}</div>
				<div><span class="text-muted-foreground">Price Range:</span> {selected.priceMin ?? '—'}{selected.priceMax ? ` – ${selected.priceMax}` : ''}{selected.priceUnit ? ` ${selected.priceUnit}` : ''}</div>
				<div><span class="text-muted-foreground">MOQ:</span> {selected.moq ?? '—'}</div>
				<div><span class="text-muted-foreground">Valid Until:</span> {formatDate(selected.validUntil ?? '')}</div>
				<div><span class="text-muted-foreground">Description:</span> {selected.description ?? '—'}</div>
				<div><span class="text-muted-foreground">Status:</span> {selected.status ?? 'active'}</div>
				<div><span class="text-muted-foreground">Created:</span> {formatDate(selected.createdAt ?? '')}</div>
			</div>
			<div class="mt-4 flex flex-wrap gap-2">
				{#each statusOptions as s}
					<Button
						variant={selected.status === s ? 'default' : 'outline'}
						size="sm"
						disabled={selected.status === s}
						onclick={() => updateStatus(selected.id, s)}
					>
						{s}
					</Button>
				{/each}
			</div>
		{/if}
		<DialogFooter>
			<Button variant="outline" onclick={() => (detailOpen = false)}>Close</Button>
		</DialogFooter>
	</DialogContent>
</Dialog>

<ConfirmDialog
	open={confirmId !== null}
	title="Delete promotion?"
	description={confirmId ? `Delete "${confirmTitle}"? This cannot be undone.` : undefined}
	confirmLabel="Delete"
	onconfirm={doDelete}
/>
