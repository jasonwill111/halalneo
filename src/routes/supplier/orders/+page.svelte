<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Card, CardContent } from '#lib/components/ui/card/index.js';
	import ClipboardList from '@lucide/svelte/icons/clipboard-list';
	import { adminData } from '#lib/stores/admin-data.svelte.js';

	// TODO: Replace with authenticated user's supplier slug from session/load function
	const SUPPLIER_SLUG = 'nusantara-foods';

	const orders = $derived(
		adminData.inquiries
			.filter((i) => i.supplierSlug === SUPPLIER_SLUG)
			.map((inq) => ({
				id: inq.id,
				buyer: inq.buyerSlug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
				product: inq.productSlug?.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || 'General Inquiry',
				amount: '—',
				date: 'Recent',
				status: inq.status === 'active' ? 'Processing' : inq.status === 'pending' ? 'Pending' : inq.status === 'flagged' ? 'Flagged' : 'Closed'
			}))
	);

	function badgeColor(status: string): string {
		if (status === 'Processing') return 'bg-primary/10 text-primary';
		if (status === 'Pending') return 'bg-warn/10 text-warn';
		if (status === 'Shipped') return 'bg-info/10 text-info';
		if (status === 'Delivered') return 'bg-success/10 text-success';
		if (status === 'Flagged') return 'bg-accent-rose/10 text-accent-rose';
		return 'bg-destructive/10 text-destructive';
	}
</script>

<svelte:head>
	<title>Orders — HalalNeo</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="rounded-xl bg-card p-3 shadow-sm">
	<div class="mb-2 flex items-center justify-between">
		<h2 class="text-sm font-bold">Orders</h2>
		<Button variant="ghost" size="sm" class="text-[10px]">Filter</Button>
	</div>

	<div class="space-y-1.5">
		{#if orders.length === 0}
			<div class="flex flex-col items-center justify-center py-12 text-center">
				<p class="text-sm font-medium text-muted-foreground">No orders yet</p>
				<p class="text-[10px] text-muted-foreground">Orders will appear here once buyers place them.</p>
			</div>
		{:else}
			{#each orders as order}
				<div class="rounded-lg bg-muted/40 px-2.5 py-2">
					<div class="flex items-center justify-between">
						<div>
							<p class="text-[11px] font-semibold">{order.id}</p>
							<p class="text-[10px] text-muted-foreground">{order.date}</p>
						</div>
						<Badge variant="secondary" class={`px-1.5 py-0.5 text-[10px] ${badgeColor(order.status)}`}>{order.status}</Badge>
					</div>
					<div class="mt-1.5 flex items-center justify-between">
						<div>
							<p class="text-[10px] font-medium">{order.product}</p>
							<p class="text-[10px] text-muted-foreground">{order.buyer}</p>
						</div>
						<div class="text-right">
							<p class="text-[11px] font-semibold">{order.amount}</p>
							<Button variant="ghost" size="sm" class="h-5 text-[10px] text-primary">View details</Button>
						</div>
					</div>
				</div>
			{/each}
		{/if}
	</div>
</div>
