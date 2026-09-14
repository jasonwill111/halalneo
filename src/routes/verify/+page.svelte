<script lang="ts">
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { Card, CardContent, CardTitle } from '#lib/components/ui/card/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import Breadcrumb from '#lib/components/site/breadcrumb.svelte';
	import { TILE_COLORS } from '#lib/utils/tile-colors.js';
	import { recognitionStatusLabel } from '#lib/data/recognition.js';
	import SearchIcon from '@lucide/svelte/icons/search';
	import ShieldCheckIcon from '@lucide/svelte/icons/shield-check';
	import CheckCircleIcon from '@lucide/svelte/icons/circle-check';
	import XCircleIcon from '@lucide/svelte/icons/circle-x';
	import ClockIcon from '@lucide/svelte/icons/clock';
	import CopyIcon from '@lucide/svelte/icons/copy';
	import FileDownIcon from '@lucide/svelte/icons/file-down';
	import ExternalLinkIcon from '@lucide/svelte/icons/external-link';

	let { data } = $props();
	let query = $state(data.q ?? '');

	const copyToClipboard = async (text: string) => {
		try {
			await navigator.clipboard.writeText(text);
		} catch {
			// Fallback for older browsers
			const el = document.createElement('textarea');
			el.value = text;
			document.body.appendChild(el);
			el.select();
			document.execCommand('copy');
			document.body.removeChild(el);
		}
	};

	const exportResults = () => {
		const data = {
			timestamp: new Date().toISOString(),
			query: query.trim(),
			count: results.length,
			results: results.map((r) => ({
				name: r.name,
				type: r.type,
				certStatus: r.certStatus,
				certifications: r.certifications
			}))
		};
		const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `halalneo-results-${new Date().toISOString().split('T')[0]}.json`;
		a.click();
		URL.revokeObjectURL(url);
	};

	// Resync when navigating between ?q= values (same component instance)
	$effect(() => {
		const q = data.q ?? '';
		if (q !== query) query = q;
	});
	let loading = $state(false);
	let results = $state.raw<any[]>([]);
	let searched = $state(false);

	const fallbackCertifiers = [
		{ id: 'jakim', name: 'JAKIM', country: 'Malaysia' },
		{ id: 'mui', name: 'MUI / LPPOM', country: 'Indonesia' },
		{ id: 'esma', name: 'ESMA', country: 'UAE' },
		{ id: 'gac', name: 'GAC', country: 'Gulf States' },
		{ id: 'ifanca', name: 'IFANCA', country: 'USA' },
		{ id: 'sfda', name: 'SFDA', country: 'Saudi Arabia' },
		{ id: 'hfc', name: 'Halal Food Council (HFC)', country: 'Singapore' },
		{ id: 'mhj', name: 'MHJ', country: 'Japan' }
	];

	const certifiers = $derived(
		((data.certifiers?.length ? data.certifiers : fallbackCertifiers) as {
			id: string;
			name: string;
			country: string;
		}[]).map((c, i) => ({ ...c, color: TILE_COLORS[i % TILE_COLORS.length] }))
	);

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

<section class="space-y-4 sm:space-y-6">
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
			{#each certifiers as c, i (c.id ?? c.name)}
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
				<div class="flex items-center justify-between">
					<p class="text-sm text-muted-foreground">{results.length} result{results.length !== 1 ? 's' : ''} found</p>
					<div class="flex items-center gap-2">
						<Button
							variant="outline" size="sm" class="h-7 text-xs"
							onclick={() => copyToClipboard(results.map((r) => r.name).join(', '))}
						>
							Copy results<CopyIcon class="size-3 ml-1" />
						</Button>
						<Button variant="outline" size="sm" class="h-7 text-xs" onclick={exportResults}>
							Export<FileDownIcon class="size-3 ml-1" />
						</Button>
					</div>
				</div>
				<div class="grid gap-3 sm:grid-cols-2">
					{#each results as r (r.type + ':' + r.slug)}
						<Card class="bg-card transition-shadow hover:shadow-md">
							<CardContent class="space-y-2 p-4">
								<div class="flex items-start justify-between gap-2">
									<div class="space-y-1 min-w-0 flex-1">
										<div class="flex items-center gap-1.5 min-w-0">
											<CardTitle class="text-sm leading-snug truncate">{r.name}</CardTitle>
											{#if r.certStatus === 'certified'}
												<CheckCircleIcon class="size-4 shrink-0 text-success" />
											{:else if r.certStatus === 'pending'}
												<ClockIcon class="size-4 shrink-0 text-warn" />
											{:else}
												<XCircleIcon class="size-4 shrink-0 text-destructive" />
											{/if}
										</div>
										{#if r.type === 'supplier'}
											<p class="text-xs text-muted-foreground truncate">{r.country} · {r.businessType}</p>
											{#if r.recognitions?.length}
												<div class="flex flex-wrap gap-1 mt-1">
													{#each r.recognitions as rec (rec.bodyId)}
														<Badge
															variant="secondary"
															class={`text-[9px] ${
																rec.status === 'recognised'
																	? 'bg-success/15 text-success'
																	: rec.status === 'mutual'
																		? 'bg-warn/15 text-warn'
																		: 'bg-info/15 text-info'
															}`}
														>
															{rec.bodyName}: {recognitionStatusLabel(rec.status)}
														</Badge>
													{/each}
												</div>
											{/if}
										{:else}
											<p class="text-xs text-muted-foreground truncate">{r.category} · {r.supplierName}</p>
										{/if}
									</div>
									<button
										type="button"
										class="shrink-0 rounded p-1 text-muted-foreground hover:text-foreground"
										onclick={() => copyToClipboard(r.name)}
										aria-label="Copy name"
									>
										<CopyIcon class="size-3" />
									</button>
								</div>

								<div class="flex flex-wrap gap-1">
									{#each (r.certifications ?? []) as cert, j (cert)}
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
										href={localizeHref(r.type === 'supplier' ? `/supplier/${r.slug}` : `/product/${r.slug}`)}
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
