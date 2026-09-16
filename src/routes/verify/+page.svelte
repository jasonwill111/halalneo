<script lang="ts">
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { Card, CardContent, CardTitle } from '#lib/components/ui/card/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Skeleton } from '#lib/components/ui/skeleton/index.js';
	import { Empty, EmptyMedia, EmptyTitle, EmptyDescription } from '#lib/components/ui/empty/index.js';
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
	import { z } from 'zod';
	import { focusFirstInvalid } from '#lib/utils/forms.js';

	// Zod schema for search validation
	const searchSchema = z.object({
		q: z.string().min(1, 'Search term is required')
	});

	let { data } = $props();
	let query = $state(data.q ?? '');
	let errors = $state<Record<string, string>>({});
	let formEl = $state<HTMLFormElement | null>(null);
	let busy = $state(false); // Renamed from loading to align with form discipline

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

	// Sync busy state with loading for form discipline
	$effect(() => {
		busy = loading;
	});

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
		// Reset errors
		errors = {};

		// Validate with Zod
		const result = searchSchema.safeParse({ q: query });

		if (!result.success) {
			const fieldErrors: Record<string, string> = {};
			for (const issue of result.error.issues) {
				if (issue.path.length > 0 && typeof issue.path[0] === 'string') {
					fieldErrors[issue.path[0]] = issue.message;
				}
			}
			errors = fieldErrors;

			if (formEl) {
				focusFirstInvalid(formEl);
			}
			return;
		}

		busy = true;
		searched = true;
		try {
			const res = await fetch(`/api/verify?q=${encodeURIComponent(query.trim())}`);
			const json = ((await res.json()) as any);
			results = json.results ?? [];
		} catch {
			results = [];
		} finally {
			loading = false;
			busy = false;
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

	<form onsubmit={handleSearch} class="flex gap-2" bind:this={formEl}>
		<div class="relative flex-1">
			<SearchIcon class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
			<Input
				type="search"
				placeholder="Search certificates, brands, products..."
				class="pl-9"
				bind:value={query}
				aria-invalid={!!errors.q}
				aria-describedby={errors.q ? 'search-error' : undefined}
			/>
			{#if errors.q}
				<span id="search-error" class="sr-only">{errors.q}</span>
			{/if}
		</div>
		<Button type="submit" disabled={busy}>
			{#if busy}
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
			<div class="grid grid-cols-2 gap-3" aria-label="Searching certificates" aria-busy="true">
				{#each Array(4) as _, i (i)}
					<Card class="bg-card">
						<CardContent class="space-y-2 p-4">
							<div class="flex items-start justify-between gap-2">
								<div class="flex-1 space-y-1.5">
									<Skeleton class="h-4 w-3/4" />
									<Skeleton class="h-3 w-1/2" />
								</div>
								<Skeleton class="size-5 shrink-0 rounded-full" />
							</div>
							<div class="flex gap-1">
								<Skeleton class="h-5 w-16 rounded-full" />
								<Skeleton class="h-5 w-20 rounded-full" />
							</div>
							<div class="flex items-center gap-2 pt-1">
								<Skeleton class="h-5 w-20 rounded-full" />
								<Skeleton class="ml-auto h-7 w-16 rounded-md" />
							</div>
						</CardContent>
					</Card>
				{/each}
				<p class="sr-only">Searching across suppliers and products…</p>
			</div>
		{:else if results.length === 0}
			<Empty>
				<EmptyMedia><XCircleIcon class="size-6 text-muted-foreground"></XCircleIcon></EmptyMedia>
				<EmptyTitle>No certificates found</EmptyTitle>
				<EmptyDescription>Try a different search term or browse certifiers below.</EmptyDescription>
			</Empty>
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
				<div class="grid grid-cols-2 gap-3">
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
									<Button
										variant="outline"
										type="button"
										class="shrink-0 rounded p-1 text-muted-foreground hover:text-foreground"
										onclick={() => copyToClipboard(r.name)}
										aria-label="Copy name"
									>
										<CopyIcon class="size-3" />
									</Button>
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
