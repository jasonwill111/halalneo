<script lang="ts">
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { Card, CardContent, CardTitle } from '#lib/components/ui/card/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { FieldError } from '#lib/components/ui/field/index.js';
	import { Skeleton } from '#lib/components/ui/skeleton/index.js';
	import {
		Empty,
		EmptyHeader,
		EmptyTitle,
		EmptyDescription,
		EmptyContent
	} from '#lib/components/ui/empty/index.js';
	import BrandedEmptyMedia from '#lib/components/site/branded-empty-media.svelte';
	import Breadcrumb from '#lib/components/site/breadcrumb.svelte';
	import CertificationSeal from '#lib/components/site/certification-seal.svelte';
	import ErrorRetry from '#lib/components/site/error-retry.svelte';
	import { TILE_COLORS } from '#lib/utils/tile-colors.js';
	import {
		describeFetchFailure,
		describeThrownFailure,
		type LoadFailure
	} from '#lib/utils/load-error.js';
	import { recognitionStatusLabel, type RecognitionStatus } from '#lib/data/recognition.js';
	import SearchIcon from '@lucide/svelte/icons/search';
	import ShieldCheckIcon from '@lucide/svelte/icons/shield-check';
	import CheckCircleIcon from '@lucide/svelte/icons/circle-check';
	import XCircleIcon from '@lucide/svelte/icons/circle-x';
	import ClockIcon from '@lucide/svelte/icons/clock';
	import CopyIcon from '@lucide/svelte/icons/copy';
	import FileDownIcon from '@lucide/svelte/icons/file-down';
	import ExternalLinkIcon from '@lucide/svelte/icons/external-link';
	import { z } from 'zod';
	import { toast } from 'svelte-sonner';
	import { focusFirstInvalid } from '#lib/utils/forms.js';
	import Loader2 from '@lucide/svelte/icons/loader-2';

	// Zod schema for search validation (trimmed, min length so FTS has a token)
	const searchSchema = z.object({
		q: z
			.string()
			.trim()
			.min(2, 'Type at least 2 characters to search.')
			.max(100, 'Keep the search under 100 characters.')
	});

	interface VerifyRecognition {
		bodyId: string;
		bodyName: string;
		status: RecognitionStatus;
	}

	interface VerifyResult {
		type: 'supplier' | 'product';
		slug: string;
		name: string;
		certStatus?: string | null;
		certifications?: unknown[];
		country?: string | null;
		businessType?: string | null;
		category?: string | null;
		supplierName?: string | null;
		recognitions?: VerifyRecognition[] | null;
	}

	// The API returns certification entries as objects ({ body: { name } } or
	// { name }) — collapse to display names so badges never render [object Object].
	function certNames(r: VerifyResult): string[] {
		return (r.certifications ?? [])
			.map((c) => {
				if (typeof c === 'string') return c;
				if (c && typeof c === 'object') {
					const o = c as { name?: unknown; body?: { name?: unknown } };
					if (typeof o.body?.name === 'string') return o.body.name;
					if (typeof o.name === 'string') return o.name;
				}
				return '';
			})
			.filter(Boolean);
	}

	let { data } = $props();
	let query = $state('');
	let errors = $state<Record<string, string>>({});
	let formEl = $state<HTMLFormElement | null>(null);
	let pending = $state(false);
	let searchFailure = $state<LoadFailure | null>(null);
	let results = $state.raw<VerifyResult[]>([]);
	let searched = $state(false);

	// Seed/resync the input from ?q= on navigation. Reads only `data.q` (never
	// `query`), otherwise the effect would depend on the input it writes to and
	// would erase every keystroke.
	let lastUrlQuery: string | null = null;
	$effect(() => {
		const q = data.q ?? '';
		if (q !== lastUrlQuery) {
			lastUrlQuery = q;
			query = q;
		}
	});

	const copyToClipboard = async (text: string) => {
		try {
			await navigator.clipboard.writeText(text);
			return true;
		} catch {
			// Fallback for older browsers
			try {
				const el = document.createElement('textarea');
				el.value = text;
				document.body.appendChild(el);
				el.select();
				document.execCommand('copy');
				document.body.removeChild(el);
				return true;
			} catch {
				return false;
			}
		}
	};

	async function copyResults() {
		const ok = await copyToClipboard(results.map((r) => r.name).join(', '));
		if (ok) toast.success(`Copied ${results.length} result${results.length === 1 ? '' : 's'}.`);
		else toast.error('Could not access the clipboard. Select and copy manually.');
	}

	async function copyName(name: string) {
		const ok = await copyToClipboard(name);
		if (ok) toast.success('Name copied.');
		else toast.error('Could not access the clipboard. Select and copy manually.');
	}

	const exportResults = () => {
		const payload = {
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
		const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `halalneo-results-${new Date().toISOString().split('T')[0]}.json`;
		a.click();
		URL.revokeObjectURL(url);
		toast.success('Results exported as JSON.');
	};

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
		(
			(data.certifiers?.length ? data.certifiers : fallbackCertifiers) as {
				id: string;
				name: string;
				country: string;
			}[]
		).map((c, i) => ({ ...c, color: TILE_COLORS[i % TILE_COLORS.length] }))
	);

	async function runSearch() {
		if (pending) return;
		pending = true;
		searched = true;
		searchFailure = null;
		results = [];
		try {
			const res = await fetch(`/api/verify?q=${encodeURIComponent(query.trim())}`);
			const json = (await res.json().catch(() => ({}))) as {
				results?: VerifyResult[];
				error?: string;
			};
			if (!res.ok) {
				const failure = describeFetchFailure(res);
				searchFailure = json.error ? { ...failure, message: json.error } : failure;
				return;
			}
			results = json.results ?? [];
		} catch (err) {
			searchFailure = describeThrownFailure(err);
		} finally {
			pending = false;
		}
	}

	function resetSearch() {
		query = '';
		errors = {};
		results = [];
		searchFailure = null;
		searched = false;
	}

	async function handleSearch(e: Event) {
		e.preventDefault();
		if (pending) return;
		errors = {};
		const parsed = searchSchema.safeParse({ q: query });
		if (!parsed.success) {
			const fieldErrors: Record<string, string> = {};
			for (const issue of parsed.error.issues) {
				const key = String(issue.path[0] ?? '');
				if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
			}
			errors = fieldErrors;
			focusFirstInvalid(formEl);
			return;
		}
		await runSearch();
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
		<p class="text-xs text-muted-foreground sm:text-sm">
			Search by certificate number, brand name, product name, or certifying body. Results
			cross-reference suppliers and products on HalalNeo.
		</p>
	</div>

	<form onsubmit={handleSearch} class="space-y-1.5" bind:this={formEl}>
		<div class="flex gap-2">
			<div class="relative flex-1">
				<SearchIcon class="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					type="search"
					placeholder="Search certificates, brands, products..."
					class="pl-9"
					bind:value={query}
					maxlength={100}
					aria-label="Search by certificate number, brand, product or certifying body"
					aria-invalid={errors.q ? true : undefined}
					aria-describedby={errors.q ? 'search-error' : undefined}
					oninput={() => {
						if (errors.q) errors = { ...errors, q: '' };
					}}
				/>
			</div>
			<Button type="submit" disabled={pending} aria-busy={pending}>
				{#if pending}
					<Loader2 class="size-3.5 animate-spin" />
					Searching...
				{:else}
					Verify
				{/if}
			</Button>
		</div>
		{#if errors.q}
			<FieldError id="search-error">{errors.q}</FieldError>
		{/if}
	</form>

	<div class="space-y-3">
		<h2 class="text-sm font-medium text-muted-foreground">Supported certifiers</h2>
		<div class="flex flex-wrap gap-2">
			{#each certifiers as c (c.id ?? c.name)}
				<Button
					variant="outline"
					size="sm"
					class={`h-7 border-transparent px-2.5 text-xs font-medium hover:opacity-80 ${c.color}`}
					onclick={() => {
						query = c.name;
						errors = {};
					}}
				>
					{c.name}
					<span class="ml-1 opacity-60">{c.country}</span>
				</Button>
			{/each}
		</div>
	</div>

	{#if searched}
		{#if pending}
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
		{:else if searchFailure}
			<ErrorRetry
				failure={searchFailure}
				subject="verification results"
				onretry={() => runSearch()}
			/>
		{:else if results.length === 0}
			<Empty>
				<EmptyHeader>
					<BrandedEmptyMedia><XCircleIcon class="size-6 text-muted-foreground"></XCircleIcon></BrandedEmptyMedia>
					<EmptyTitle>No certificates found</EmptyTitle>
					<EmptyDescription>
						Nothing matched “{query.trim()}”. Try a different certificate number, brand or product
						name, or pick one of the supported certifiers above.
					</EmptyDescription>
				</EmptyHeader>
				<EmptyContent>
					<Button variant="outline" size="sm" onclick={resetSearch}>Clear search</Button>
					<Button variant="link" size="sm" href={localizeHref('/certifying-bodies')}
						>Browse certifying bodies</Button
					>
				</EmptyContent>
			</Empty>
		{:else}
			<div class="space-y-2">
				<div class="flex items-center justify-between">
					<p class="text-sm text-muted-foreground">
						{results.length} result{results.length !== 1 ? 's' : ''} found
					</p>
					<div class="flex items-center gap-2">
						<Button variant="outline" size="sm" class="h-7 text-xs" onclick={() => copyResults()}>
							Copy results<CopyIcon class="ml-1 size-3" />
						</Button>
						<Button variant="outline" size="sm" class="h-7 text-xs" onclick={exportResults}>
							Export<FileDownIcon class="ml-1 size-3" />
						</Button>
					</div>
				</div>
				<div class="grid grid-cols-2 gap-3">
					{#each results as r (r.type + ':' + r.slug)}
						<Card class="bg-card transition-shadow hover:shadow-md">
							<CardContent class="space-y-2 p-4">
								<div class="flex items-start justify-between gap-2">
									<div class="min-w-0 flex-1 space-y-1">
										<div class="flex min-w-0 items-center gap-1.5">
											<CardTitle class="truncate text-sm leading-snug">{r.name}</CardTitle>
											{#if r.certStatus === 'certified'}
												<CheckCircleIcon class="size-4 shrink-0 text-success" />
											{:else if r.certStatus === 'pending'}
												<ClockIcon class="size-4 shrink-0 text-warn" />
											{:else}
												<XCircleIcon class="size-4 shrink-0 text-destructive" />
											{/if}
										</div>
										{#if r.type === 'supplier'}
											<p class="truncate text-xs text-muted-foreground">
												{r.country} · {r.businessType}
											</p>
											{#if r.recognitions?.length}
												<div class="mt-1 flex flex-wrap gap-1">
													{#each r.recognitions as rec (rec.bodyId)}
														<Badge
															variant="secondary"
															class={`text-3xs ${
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
											<p class="truncate text-xs text-muted-foreground">
												{r.category} · {r.supplierName}
											</p>
										{/if}
									</div>
									<Button
										variant="outline"
										type="button"
										class="shrink-0 rounded p-1 text-muted-foreground hover:text-foreground"
										onclick={() => copyName(r.name)}
										aria-label={`Copy ${r.name}`}
									>
										<CopyIcon class="size-3" />
									</Button>
								</div>

								<div class="flex flex-wrap items-center gap-1">
									{#if certNames(r).length > 0}
										<CertificationSeal
											name={certNames(r)[0]}
											status={r.certStatus === 'certified'
												? 'certified'
												: r.certStatus === 'pending'
													? 'pending'
													: 'not-certified'}
										/>
									{/if}
									{#each certNames(r) as cert (cert)}
										<Badge variant="secondary" class="text-2xs">{cert}</Badge>
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
										href={localizeHref(
											r.type === 'supplier' ? `/supplier/${r.slug}` : `/product/${r.slug}`
										)}
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
