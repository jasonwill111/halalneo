<script lang="ts">
	import { Card, CardContent, CardTitle } from '#lib/components/ui/card/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import Breadcrumb from '#lib/components/site/breadcrumb.svelte';
	import SearchIcon from '@lucide/svelte/icons/search';
	import ShieldCheckIcon from '@lucide/svelte/icons/shield-check';
	import CheckCircleIcon from '@lucide/svelte/icons/circle-check';
	import XCircleIcon from '@lucide/svelte/icons/circle-x';
	import ClockIcon from '@lucide/svelte/icons/clock';
	import ExternalLinkIcon from '@lucide/svelte/icons/external-link';

	let { data } = $props();
	let query = $state(data.q ?? '');

	// Resync when navigating between ?q= values (same component instance)
	$effect(() => {
		const q = data.q ?? '';
		if (q !== query) query = q;
	});
	let loading = $state(false);
	let results = $state.raw<any[]>([]);
	let searched = $state(false);

	const certifiers = [
		{ name: 'JAKIM', country: 'Malaysia', color: 'bg-info/10 text-info' },
		{ name: 'MUI / LPPOM', country: 'Indonesia', color: 'bg-success/10 text-success' },
		{ name: 'ESMA', country: 'UAE', color: 'bg-accent-purple/10 text-accent-purple' },
		{ name: 'GAC', country: 'Gulf States', color: 'bg-warn/10 text-warn' },
		{ name: 'IFANCA', country: 'USA', color: 'bg-accent-rose/10 text-accent-rose' },
		{ name: 'SFDA', country: 'Saudi Arabia', color: 'bg-primary/10 text-primary' },
		{ name: 'Halal Food Council (HFC)', country: 'Singapore', color: 'bg-info/10 text-info' },
		{ name: 'MHJ', country: 'Japan', color: 'bg-success/10 text-success' }
	];

	async function handleSearch(e: Event) {
		e.preventDefault();
		if (!query.trim()) return;
		loading = true;
		searched = true;
		try {
			const res = await fetch(`/api/verify?q=${encodeURIComponent(query.trim())}`);
			const json = ((await res.json()) as any);
			results = json.results ?? [];
		} catch {
			results = [];
		} finally {
			loading = false;
		}
	}
</script>

<Breadcrumb items={[{ label: 'Verify', href: '/verify' }]} />

<section class="space-y-6">
	<div class="max-w-2xl space-y-2">
		<div class="flex items-center gap-2 text-sm font-medium text-muted-foreground">
			<ShieldCheckIcon class="size-4"></ShieldCheckIcon>
			Certificate Verification
		</div>
		<h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">Verify halal certification</h1>
		<p class="text-muted-foreground">
			Search by certificate number, brand name, product name, or certifying body. Results
			cross-reference suppliers and products on HalalNeo.
		</p>
	</div>

	<form onsubmit={handleSearch} class="flex gap-2">
		<div class="relative flex-1">
			<SearchIcon class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
			<Input
				type="search"
				placeholder="Search certificates, brands, products..."
				class="pl-9"
				bind:value={query}
			/>
		</div>
		<Button type="submit" disabled={loading || !query.trim()}>
			{#if loading}
				Searching...
			{:else}
				Verify
			{/if}
		</Button>
	</form>

	<div class="space-y-3">
		<h2 class="text-sm font-medium text-muted-foreground">Supported certifiers</h2>
		<div class="flex flex-wrap gap-2">
			{#each certifiers as c}
				<Button
					variant="outline"
					size="sm"
					class={`h-7 border-transparent px-2.5 text-xs font-medium hover:opacity-80 ${c.color}`}
					onclick={() => { query = c.name; }}
				>
					{c.name}
					<span class="ml-1 opacity-60">{c.country}</span>
				</Button>
			{/each}
		</div>
	</div>

	{#if searched}
		{#if loading}
			<div class="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
				<div class="mx-auto mb-3 size-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
				<p class="text-sm">Searching across suppliers and products...</p>
			</div>
		{:else if results.length === 0}
			<div class="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
				<XCircleIcon class="mx-auto mb-3 size-10 opacity-40" />
				<p class="text-sm font-medium">No certificates found</p>
				<p class="mt-1 text-xs">Try a different search term or browse certifiers below.</p>
			</div>
		{:else}
			<div class="space-y-2">
				<p class="text-sm text-muted-foreground">{results.length} result{results.length !== 1 ? 's' : ''} found</p>
				<div class="grid gap-3 sm:grid-cols-2">
					{#each results as r (r.type + ':' + r.slug)}
						<Card class="bg-card transition-shadow hover:shadow-md">
							<CardContent class="space-y-2 p-4">
								<div class="flex items-start justify-between gap-2">
									<div class="space-y-1">
										<CardTitle class="text-sm leading-snug">{r.name}</CardTitle>
										{#if r.type === 'supplier'}
											<p class="text-xs text-muted-foreground">{r.country} · {r.businessType}</p>
										{:else}
											<p class="text-xs text-muted-foreground">{r.category} · {r.supplierName}</p>
										{/if}
									</div>
									{#if r.certStatus === 'certified'}
										<CheckCircleIcon class="size-5 shrink-0 text-success" />
									{:else if r.certStatus === 'pending'}
										<ClockIcon class="size-5 shrink-0 text-warn" />
									{:else}
										<XCircleIcon class="size-5 shrink-0 text-destructive" />
									{/if}
								</div>

								<div class="flex flex-wrap gap-1">
									{#each (r.certifications ?? []) as cert}
										<Badge variant="secondary" class="text-[10px]">{cert}</Badge>
									{/each}
								</div>

								<div class="flex items-center gap-2 pt-1">
									{#if r.certStatus === 'certified'}
										<Badge class="bg-success/15 text-success">Certified</Badge>
									{:else if r.certStatus === 'pending'}
										<Badge class="bg-warn/15 text-warn">Pending</Badge>
									{:else}
										<Badge variant="secondary">Uncertified</Badge>
									{/if}
									<Button
										href={r.type === 'supplier' ? `/suppliers/${r.slug}` : `/products/${r.slug}`}
										variant="outline"
										size="sm"
										class="ml-auto h-7 text-xs"
									>
										View
										<ExternalLinkIcon class="size-3" />
									</Button>
								</div>
							</CardContent>
						</Card>
					{/each}
				</div>
			</div>
		{/if}
	{/if}
</section>
