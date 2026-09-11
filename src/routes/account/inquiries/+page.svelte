<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { cn } from '#lib/utils.js';
	import FilterPills from '#lib/components/site/filter-pills.svelte';
	import Package from '@lucide/svelte/icons/package';
	import MessageCircle from '@lucide/svelte/icons/message-circle';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';

	const inquiries = [
		{ title: 'Pharmaceutical API Inquiry', to: 'PharmaChem Industries', status: 'Active', time: '2 days ago', message: 'Interested in bulk purchase of pharmaceutical grade API — Ibuprofen 99%. Requesting quote for 500kg monthly supply with JAKIM certification.' },
		{ title: 'Halal Gelatin Sample Request', to: 'Nusantara Foods', status: 'Active', time: '5 days ago', message: 'Requesting samples of halal beef gelatin powder for confectionery application. MOQ and lead time please.' },
		{ title: 'Cosmetics Raw Material Quote', to: 'Medina Halal Meats', status: 'Pending', time: '1 week ago', message: 'Looking for halal-certified glycerin and emollient base oils in 200L drums.' },
		{ title: 'Dairy Ingredients Inquiry', to: 'Santosa Beverages', status: 'Closed', time: '2 weeks ago', message: 'Whey protein isolate and milk powder sourcing for infant formula project.' }
	];

	const statusTabs = ['All', 'Active', 'Pending', 'Closed'];
	let activeTab = $state('All');

	const statusOptions = $derived(
		statusTabs.map((s) => ({
			value: s,
			label: s,
			count: s === 'All' ? inquiries.length : inquiries.filter((i) => i.status === s).length
		}))
	);

	const filtered = $derived(
		activeTab === 'All' ? inquiries : inquiries.filter((i) => i.status === activeTab)
	);

	function statusBorder(status: string): string {
		if (status === 'Active') return 'border-l-success';
		if (status === 'Pending') return 'border-l-primary';
		return 'border-l-muted';
	}

	function statusIconBg(status: string): string {
		if (status === 'Active') return 'bg-success/10 text-success';
		if (status === 'Pending') return 'bg-primary/10 text-primary';
		return 'bg-muted text-muted-foreground';
	}

	function badgeColor(status: string): string {
		return status === 'Active' ? 'bg-success/10 text-success' : status === 'Pending' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground';
	}
</script>

<svelte:head>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="flex-1 min-w-0">
	<div class="mb-2 flex items-center justify-between">
		<div>
			<h2 class="text-sm font-bold text-foreground">My Inquiries</h2>
			<p class="text-[10px] text-muted-foreground">{inquiries.length} total inquiries</p>
		</div>
	</div>

	<div class="mb-2">
		<FilterPills
			options={statusOptions}
			bind:value={activeTab}
			ariaLabel="Filter inquiries by status"
		/>
	</div>

	{#if filtered.length === 0}
		<div class="rounded-xl bg-card p-6 text-center ring-1 ring-foreground/10">
			<Package class="mx-auto size-6 text-muted-foreground/30"></Package>
			<p class="mt-2 text-[11px] text-muted-foreground">No inquiries in this status.</p>
		</div>
	{:else}
		<div class="space-y-1.5">
			{#each filtered as item (item.title)}
				<div class={cn('group rounded-xl bg-card border-l-2 p-2 ring-1 ring-foreground/10 transition-all hover:border-primary/20 hover:shadow-md', statusBorder(item.status))}>
					<div class="flex items-start gap-2">
						<div class={cn('flex size-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold', statusIconBg(item.status))}>
							<Package class="size-4"></Package>
						</div>
						<div class="min-w-0 flex-1">
							<div class="flex items-start justify-between gap-2">
								<div>
									<h3 class="text-[11px] font-semibold text-foreground group-hover:text-primary transition-colors">{item.title}</h3>
									<p class="mt-0 text-[10px] text-muted-foreground">To: {item.to}</p>
								</div>
								<Badge variant="secondary" class={`px-1.5 py-0.5 text-[10px] ${badgeColor(item.status)}`}>
									<span class="size-1 rounded-full bg-current"></span>
									{item.status}
								</Badge>
							</div>
							<p class="mt-1 text-[10px] text-muted-foreground line-clamp-2">{item.message}</p>
							<div class="mt-1.5 flex items-center gap-2">
								<span class="text-[10px] text-muted-foreground">Sent {item.time}</span>
								<Button variant="ghost" size="sm" class="inline-flex h-5 items-center gap-0.5 text-[10px] font-medium text-primary">
									<MessageCircle class="size-2.5"></MessageCircle>
									Quick Reply
								</Button>
								<Button variant="ghost" size="sm" class="inline-flex h-5 items-center gap-0.5 text-[10px] font-medium text-muted-foreground">
									View
									<ChevronRight class="size-2.5"></ChevronRight>
								</Button>
							</div>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
