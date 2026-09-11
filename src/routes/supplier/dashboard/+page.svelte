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
	import { Input } from '#lib/components/ui/input/index.js';
	import { Textarea } from '#lib/components/ui/textarea/index.js';
	import { Field, FieldLabel } from '#lib/components/ui/field/index.js';
	import BarChart3 from '@lucide/svelte/icons/bar-chart-3';
	import Tag from '@lucide/svelte/icons/tag';

	// TODO: Replace with authenticated user's supplier slug from session/load function
	const SUPPLIER_SLUG = 'nusantara-foods';
	const supplier = $derived(adminData.suppliers.find((s) => s.slug === SUPPLIER_SLUG));
	const supplierProducts = $derived(adminData.products.filter((p) => p.supplierSlug === SUPPLIER_SLUG));
	const supplierInquiries = $derived(adminData.inquiries.filter((i) => i.supplierSlug === SUPPLIER_SLUG));

	// ---- Real analytics (membership-scoped, live data; filled by $effect below) ----
	let mySlug = $state<string | null>(null);
	let analytics = $state<{ profileViewsTotal: number; profileViews30d: number; daily: Array<{ day: string; views: number }>; topProducts: any[] } | null>(null);

	const stats = $derived([
		{ label: 'Total Products', value: String(supplierProducts.length), change: `${supplierProducts.filter((p) => p.status === 'active').length} active` },
		{ label: 'Active Inquiries', value: String(supplierInquiries.filter((i) => i.status === 'active' || i.status === 'pending').length), change: 'awaiting response' },
		{ label: 'Revenue (MTD)', value: '$8,450', change: '+18% vs last month' },
		{
			label: 'Profile Views',
			value: analytics ? String(analytics.profileViewsTotal) : '—',
			change: analytics ? `${analytics.profileViews30d} in last 30 days` : 'real data once linked'
		}
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

	// ---- Membership + analytics fetch; promo publish form (1/week free) ----
	$effect(() => {
		fetch('/api/supplier-memberships')
			.then((r) => (r.ok ? r.json() : { items: [] }))
			.then((j: any) => {
				mySlug = j.items?.[0]?.supplierSlug ?? null;
				if (mySlug) {
					fetch(`/api/analytics?supplierSlug=${encodeURIComponent(mySlug)}`)
						.then((r) => (r.ok ? r.json() : null))
						.then((a: any) => {
							if (a) analytics = a;
						})
						.catch(() => {});
				}
			})
			.catch(() => {});
	});

	const maxDaily = $derived(Math.max(1, ...(analytics?.daily ?? []).map((d) => d.views)));

	// ---- Quick-deal publish form (1/week free) ----
	let dealTitle = $state('');
	let dealDesc = $state('');
	let dealDiscount = $state('');
	let dealPrice = $state('');
	let dealMoq = $state('');
	let dealValid = $state('');
	let dealSending = $state(false);
	let dealResult = $state<string | null>(null);

	async function publishDeal() {
		if (!mySlug || !dealTitle.trim()) return;
		dealSending = true;
		dealResult = null;
		try {
			const res = await fetch('/api/promotions', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					supplierSlug: mySlug,
					title: dealTitle.trim(),
					description: dealDesc.trim() || null,
					discountPct: dealDiscount ? Number(dealDiscount) : null,
					priceMin: dealPrice.trim() || null,
					moq: dealMoq.trim() || null,
					validUntil: dealValid || null
				})
			});
			const j = (await res.json().catch(() => ({}))) as any;
			if (res.ok) {
				dealTitle = '';
				dealDesc = '';
				dealDiscount = '';
				dealPrice = '';
				dealMoq = '';
				dealValid = '';
				dealResult = null;
			} else {
				dealResult = j.error ?? 'Failed to publish deal.';
			}
		} finally {
			dealSending = false;
		}
	}
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

<div class="mb-3 grid grid-cols-2 gap-2 lg:grid-cols-4">
				{#each stats as s (s.label)}
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
					{#each orders as order (order.id)}
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

<!-- Real profile analytics (live beacon data, membership-scoped) -->
<div class="mt-3 rounded-xl bg-card p-3 ring-1 ring-foreground/10">
	<div class="mb-2 flex items-center gap-1.5">
		<BarChart3 class="size-3.5 text-muted-foreground" />
		<h2 class="text-[11px] font-bold">Profile analytics</h2>
		{#if mySlug}
			<Badge variant="secondary" class="ml-auto text-[10px]">{mySlug}</Badge>
		{/if}
	</div>
	{#if !mySlug}
		<p class="rounded-xl bg-muted/40 px-3 py-4 text-center text-[11px] text-muted-foreground">
			Link your supplier account to unlock live profile analytics. Ask an admin to link
			your company after approval.
		</p>
	{:else if !analytics}
		<p class="px-1 py-3 text-center text-[11px] text-muted-foreground">Loading analytics…</p>
	{:else}
		<div class="mb-2 grid grid-cols-2 gap-2">
			<div class="rounded-xl bg-muted/50 px-3 py-2">
				<div class="text-[10px] text-muted-foreground">Total views</div>
				<div class="text-lg font-bold">{analytics.profileViewsTotal}</div>
			</div>
			<div class="rounded-xl bg-muted/50 px-3 py-2">
				<div class="text-[10px] text-muted-foreground">Last 30 days</div>
				<div class="text-lg font-bold">{analytics.profileViews30d}</div>
			</div>
		</div>
		{#if analytics.daily.length > 0}
			<div class="flex h-16 items-end gap-1" aria-hidden="true">
				{#each analytics.daily as d (d.day)}
					<div
						class="min-w-0 flex-1 rounded-sm bg-primary/70"
						style={`height: ${Math.max(6, Math.round((d.views / maxDaily) * 100))}%`}
						title={`${d.day}: ${d.views}`}
					></div>
				{/each}
			</div>
		{/if}
		{#if analytics.topProducts.length > 0}
			<h3 class="mb-1 mt-3 text-[10px] font-semibold text-muted-foreground">Top products by views</h3>
			<div class="space-y-1">
				{#each analytics.topProducts as p (p.slug)}
					<div class="flex items-center justify-between gap-2 text-[11px]">
						<span class="truncate font-medium">{p.name}</span>
						<span class="shrink-0 text-muted-foreground">{p.views ?? 0} views</span>
					</div>
				{/each}
			</div>
		{/if}
	{/if}
</div>

<!-- Publish a Quick Deal (1/week free) -->
<div class="mt-3 rounded-xl bg-card p-3 ring-1 ring-foreground/10">
	<div class="mb-2 flex items-center gap-1.5">
		<Tag class="size-3.5 text-muted-foreground" />
		<h2 class="text-[11px] font-bold">Publish a Quick Deal</h2>
	</div>
	{#if !mySlug}
		<p class="rounded-xl bg-muted/40 px-3 py-4 text-center text-[11px] text-muted-foreground">
			Link your supplier account to publish clearance deals to the public board.
		</p>
	{:else}
		{#if dealResult}
			<p class="mb-2 rounded-xl bg-destructive/10 px-3 py-2 text-xs text-destructive">{dealResult}</p>
		{/if}
		<form
			class="space-y-2"
			onsubmit={(e) => {
				e.preventDefault();
				publishDeal();
			}}
		>
			<Field>
				<FieldLabel>Deal title *</FieldLabel>
				<Input type="text" bind:value={dealTitle} placeholder="e.g. 20% off frozen chicken cartons" maxlength={200} class="text-xs" />
			</Field>
			<Field>
				<FieldLabel>Details</FieldLabel>
				<Textarea bind:value={dealDesc} placeholder="Stock quantity, terms..." rows={2} class="text-xs" />
			</Field>
			<div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
				<Field>
					<FieldLabel>Discount %</FieldLabel>
					<Input type="number" min={1} max={99} bind:value={dealDiscount} placeholder="20" class="text-xs" />
				</Field>
				<Field>
					<FieldLabel>Price</FieldLabel>
					<Input type="text" bind:value={dealPrice} placeholder="$4.10/kg" class="text-xs" />
				</Field>
				<Field>
					<FieldLabel>MOQ</FieldLabel>
					<Input type="text" bind:value={dealMoq} placeholder="100 cartons" class="text-xs" />
				</Field>
				<Field>
					<FieldLabel>Valid until</FieldLabel>
					<Input type="date" bind:value={dealValid} class="text-xs" />
				</Field>
			</div>
			<div class="flex items-center justify-between gap-2">
				<p class="text-[10px] text-muted-foreground">Free plan: 1 deal/week for {mySlug}</p>
				<Button type="submit" size="sm" disabled={dealSending || !dealTitle.trim()}>
					{dealSending ? 'Publishing...' : 'Publish deal'}
				</Button>
			</div>
		</form>
	{/if}
</div>
