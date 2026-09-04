<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Card, CardContent } from '#lib/components/ui/card/index.js';
	import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '#lib/components/ui/table/index.js';
	import Plus from '@lucide/svelte/icons/plus';
	import MessageCircle from '@lucide/svelte/icons/message-circle';
	import Package from '@lucide/svelte/icons/package';
	import TrendingUp from '@lucide/svelte/icons/trending-up';
	import { adminData } from '#lib/stores/admin-data.svelte.js';

	// TODO: Replace with authenticated user's supplier slug from session/load function
	const SUPPLIER_SLUG = 'nusantara-foods';
	const supplier = $derived(adminData.suppliers.find((s) => s.slug === SUPPLIER_SLUG));
	const supplierProducts = $derived(adminData.products.filter((p) => p.supplierSlug === SUPPLIER_SLUG));
	const supplierInquiries = $derived(adminData.inquiries.filter((i) => i.supplierSlug === SUPPLIER_SLUG));

	const stats = $derived([
		{ label: 'Total Products', value: String(supplierProducts.length), change: `${supplierProducts.filter((p) => p.status === 'active').length} active` },
		{ label: 'Active Inquiries', value: String(supplierInquiries.filter((i) => i.status === 'active' || i.status === 'pending').length), change: 'awaiting response' },
		{ label: 'Revenue (MTD)', value: '$8,450', change: '+18% vs last month' },
		{ label: 'Profile Views', value: '312', change: '+24% this week' }
	]);

	const orders = $derived(
		supplierInquiries.slice(0, 5).map((inq) => ({
			id: inq.id,
			buyer: inq.buyerSlug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
			product: inq.productSlug?.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || 'General Inquiry',
			amount: '—',
			status: inq.status === 'active' ? 'Processing' : inq.status === 'pending' ? 'Pending' : inq.status === 'flagged' ? 'Flagged' : 'Closed'
		}))
	);
</script>

<svelte:head>
	<title>Supplier Dashboard — HalalNeo</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="mb-3 rounded-xl border border-success/20 bg-success/5 p-3">
	<div class="flex items-center gap-2">
		<TrendingUp class="size-4 text-success"></TrendingUp>
		<span class="text-[10px] font-medium text-success">Welcome back, {supplier?.name ?? 'Supplier'}!</span>
		<span class="ml-1.5 text-[10px] text-success/70">Your profile is fully verified</span>
	</div>
</div>

<div class="mb-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
	{#each stats as s}
		<Card class="p-3">
			<CardContent class="p-0">
				<div class="flex items-center justify-between mb-1">
					<span class="text-[10px] font-medium text-muted-foreground">{s.label}</span>
					<div class="flex size-5 items-center justify-center">
						<Package class="size-3 text-muted-foreground"></Package>
					</div>
				</div>
				<div class="text-xl font-bold text-foreground">{s.value}</div>
				<div class="text-[10px] text-success">{s.change}</div>
			</CardContent>
		</Card>
	{/each}
</div>

<div class="mb-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
	<Button variant="outline" class="flex items-center justify-start gap-2 rounded-xl p-3">
		<div class="flex size-8 items-center justify-center rounded-lg bg-primary/10">
			<Plus class="size-4 text-primary"></Plus>
		</div>
		<div class="text-left">
			<div class="text-[11px] font-medium">Add Product</div>
			<div class="text-[10px] text-muted-foreground">List a new item</div>
		</div>
	</Button>
	<Button variant="outline" class="flex items-center justify-start gap-2 rounded-xl p-3">
		<div class="flex size-8 items-center justify-center rounded-lg bg-primary/10">
			<MessageCircle class="size-4 text-primary"></MessageCircle>
		</div>
		<div class="text-left">
			<div class="text-[11px] font-medium">View Messages</div>
			<div class="text-[10px] text-muted-foreground">{supplierInquiries.filter((i) => i.status === 'pending').length} unread inquiries</div>
		</div>
	</Button>
</div>

<div class="rounded-xl bg-card p-3 ring-1 ring-foreground/10">
	<div class="mb-2 flex items-center justify-between">
		<h2 class="text-[11px] font-bold">Recent Orders</h2>
		<Button variant="ghost" size="sm" class="text-[10px]">View all</Button>
	</div>
	<div class="overflow-x-auto">
		{#if orders.length === 0}
			<div class="flex flex-col items-center justify-center py-12 text-center">
				<p class="text-sm font-medium text-muted-foreground">No orders yet</p>
				<p class="text-[10px] text-muted-foreground">Orders will appear here once buyers place them.</p>
			</div>
		{:else}
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead class="text-[10px]">Order ID</TableHead>
						<TableHead class="text-[10px]">Buyer</TableHead>
						<TableHead class="text-[10px]">Product</TableHead>
						<TableHead class="text-[10px]">Amount</TableHead>
						<TableHead class="text-[10px]">Status</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{#each orders as order}
						<TableRow>
							<TableCell class="text-[10px] font-medium">{order.id}</TableCell>
							<TableCell class="text-[10px]">{order.buyer}</TableCell>
							<TableCell class="text-[10px] text-muted-foreground">{order.product}</TableCell>
							<TableCell class="text-[10px] font-medium">{order.amount}</TableCell>
							<TableCell>
								<Badge variant="secondary" class="capitalize text-[10px]">{order.status}</Badge>
							</TableCell>
						</TableRow>
					{/each}
				</TableBody>
			</Table>
		{/if}
	</div>
</div>
