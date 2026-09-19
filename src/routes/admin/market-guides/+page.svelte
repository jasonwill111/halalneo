<script lang="ts">
	import { tick } from 'svelte';
	import { z } from 'zod';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Textarea } from '#lib/components/ui/textarea/index.js';
	import * as Field from '#lib/components/ui/field/index.js';
	import { FieldError } from '#lib/components/ui/field/index.js';
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
	import { Skeleton } from '#lib/components/ui/skeleton/index.js';
	import {
		Empty,
		EmptyContent,
		EmptyDescription,
		EmptyHeader,
		EmptyMedia,
		EmptyTitle
	} from '#lib/components/ui/empty/index.js';
	import Search from '@lucide/svelte/icons/search';
	import Plus from '@lucide/svelte/icons/plus';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Globe from '@lucide/svelte/icons/globe';
	import CollapsibleSection from '#lib/components/site/collapsible-section.svelte';
	import ConfirmDialog from '#lib/components/site/confirm-dialog.svelte';
	import ErrorRetry from '#lib/components/site/error-retry.svelte';
	import Paginator from '#lib/components/site/paginator.svelte';
	import StatTile from '#lib/components/site/stat-tile.svelte';
	import { toast } from 'svelte-sonner';
	import {
		describeFetchFailure,
		describeThrownFailure,
		type LoadFailure
	} from '#lib/utils/load-error.js';
	import {
		focusFirstInvalid,
		mergeServerDetails,
		type ServerFieldDetails
	} from '#lib/utils/forms.js';
	import {
		MANDATE_STATUSES,
		MARKET_GUIDE_STATUSES,
		certifyingBodyRefSchema,
		marketGuideCreateSchema,
		marketGuideUpdateSchema,
		normaliseMandateStatus,
		normaliseMarketGuideStatus,
		slugifyMarketGuide,
		type CertifyingBodyRef,
		type MarketGuideDto,
		type MarketGuideInput,
		type MarketGuideListResponse,
		type MarketGuideMandateStatus,
		type MarketGuideStatus
	} from '#lib/schemas/market-guides.js';

	// ---------- list state (real API — never the demo store) ----------
	const PAGE_SIZE = 20;
	/** Placeholder rows while the list is in flight (§3.1 loading state). */
	const SKELETON_ROWS = [0, 1, 2, 3, 4];

	let guides = $state<MarketGuideDto[]>([]);
	let total = $state(0);
	let loading = $state(true);
	let loadFailure = $state<LoadFailure | null>(null);
	let search = $state('');
	let page = $state(1);

	// ---------- dialog state ----------
	let dialogOpen = $state(false);
	/** Row being edited, or `null` when creating. `slug` is the immutable key. */
	let editing = $state<MarketGuideDto | null>(null);
	let saving = $state(false);
	let deleting = $state(false);
	let formError = $state('');
	let fieldErrors = $state<Record<string, string>>({});
	let formEl = $state<HTMLFormElement | undefined>(undefined);

	// ---------- delete state ----------
	let confirmSlug = $state<string | null>(null);
	let confirmCountry = $state('');

	// Collapsible section state
	let marketExpanded = $state(false);
	let requirementsExpanded = $state(false);
	let insightsExpanded = $state(false);
	let seoExpanded = $state(false);

	type GuideForm = {
		slug: string;
		country: string;
		flag: string;
		region: string;
		muslimPopulation: string;
		totalPopulation: string;
		marketSizeUsd: string;
		mandateStatus: MarketGuideMandateStatus;
		mandatorySince: string;
		certifyingBodiesJson: string;
		importRequirements: string;
		standardBasis: string;
		certificateValidity: string;
		estimatedCostUsd: string;
		processingTime: string;
		keyInsights: string;
		opportunities: string;
		challenges: string;
		summary: string;
		metaTitle: string;
		metaDescription: string;
		keywords: string;
		status: MarketGuideStatus;
	};

	const emptyForm = (): GuideForm => ({
		slug: '',
		country: '',
		flag: '',
		region: '',
		muslimPopulation: '',
		totalPopulation: '',
		marketSizeUsd: '',
		mandateStatus: 'voluntary',
		mandatorySince: '',
		certifyingBodiesJson: '[]',
		importRequirements: '',
		standardBasis: '',
		certificateValidity: '',
		estimatedCostUsd: '',
		processingTime: '',
		keyInsights: '',
		opportunities: '',
		challenges: '',
		summary: '',
		metaTitle: '',
		metaDescription: '',
		keywords: '',
		status: 'active'
	});

	let form = $state<GuideForm>(emptyForm());

	const regionOptions = [
		'Southeast Asia',
		'Middle East',
		'South Asia',
		'Europe',
		'East Asia',
		'North America',
		'Africa',
		'Oceania'
	];

	const mandateOptions = MANDATE_STATUSES;

	/** Which collapsed section owns each field, so errors are never hidden (§3.4). */
	const MARKET_KEYS = [
		'muslimPopulation',
		'totalPopulation',
		'marketSizeUsd',
		'mandatorySince',
		'estimatedCostUsd',
		'processingTime',
		'certificateValidity',
		'standardBasis',
		'certifyingBodies',
		'certifyingBodiesJson'
	];
	const REQUIREMENTS_KEYS = ['importRequirements'];
	const INSIGHTS_KEYS = ['keyInsights', 'opportunities', 'challenges'];
	const SEO_KEYS = ['metaTitle', 'metaDescription', 'keywords'];

	/** `status=all` is the admin view (drafts/inactive included); limit=100 is the endpoint clamp (§5.9). */
	async function loadList(): Promise<void> {
		loading = true;
		loadFailure = null;
		try {
			const res = await fetch('/api/market-guides?status=all&limit=100');
			if (!res.ok) {
				const body = await readErrorBody(res);
				const failure = describeFetchFailure(res);
				loadFailure = { ...failure, message: body.error || failure.message };
				guides = [];
				total = 0;
				return;
			}
			const data = (await res.json()) as Partial<MarketGuideListResponse>;
			guides = Array.isArray(data.items) ? data.items : [];
			total = typeof data.total === 'number' ? data.total : guides.length;
		} catch (error) {
			loadFailure = describeThrownFailure(error);
			guides = [];
			total = 0;
		} finally {
			loading = false;
		}
	}

	async function readErrorBody(
		res: Response
	): Promise<{ error?: string; details?: ServerFieldDetails }> {
		try {
			const data = (await res.json()) as { error?: string; details?: ServerFieldDetails };
			return {
				error: typeof data.error === 'string' && data.error ? data.error : undefined,
				details: data.details
			};
		} catch {
			return {};
		}
	}

	$effect(() => {
		void loadList();
	});

	const filtered = $derived.by(() => {
		if (!search.trim()) return guides;
		const q = search.toLowerCase();
		return guides.filter(
			(g) =>
				g.country.toLowerCase().includes(q) ||
				g.slug.includes(q) ||
				(g.region ?? '').toLowerCase().includes(q)
		);
	});

	const totalPages = $derived(Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)));
	const paged = $derived(filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE));

	$effect(() => {
		void search;
		page = 1;
	});

	const activeCount = $derived(guides.filter((g) => g.status === 'active').length);
	const mandatoryCount = $derived(
		guides.filter((g) => normaliseMandateStatus(g.mandateStatus) === 'mandatory').length
	);

	function expandFor(keys: string[]): void {
		if (!keys.length) return;
		const hit = (list: string[]) => keys.some((k) => list.includes(k));
		if (hit(MARKET_KEYS)) marketExpanded = true;
		if (hit(REQUIREMENTS_KEYS)) requirementsExpanded = true;
		if (hit(INSIGHTS_KEYS)) insightsExpanded = true;
		if (hit(SEO_KEYS)) seoExpanded = true;
	}

	/** Text columns are `NOT NULL DEFAULT ''` in D1 — a blank input clears the value. */
	function fieldValue(value: string): string {
		return value.trim();
	}

	function parseCommaList(val: string): string[] {
		return val
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean);
	}

	/** Certifying bodies are edited as JSON text; validated with the shared item schema. */
	function parseCertifyingBodies(
		raw: string
	): { value: CertifyingBodyRef[] } | { error: string } {
		const text = raw.trim();
		if (!text || text === '[]') return { value: [] };
		let data: unknown;
		try {
			data = JSON.parse(text);
		} catch {
			return { error: 'Certifying Bodies must be a valid JSON array.' };
		}
		const parsed = z.array(certifyingBodyRefSchema).safeParse(data);
		if (!parsed.success) {
			return { error: 'Certifying Bodies must be a JSON array of { slug, name } objects.' };
		}
		return { value: parsed.data };
	}

	/** The JSON textarea is the visible control behind the `certifyingBodies` array. */
	function remapCertErrors(details: ServerFieldDetails): ServerFieldDetails {
		if (!details || !('certifyingBodies' in details)) return details;
		const { certifyingBodies: messages, ...rest } = details;
		return { ...rest, certifyingBodiesJson: messages };
	}

	async function showFieldErrors(details: ServerFieldDetails): Promise<void> {
		fieldErrors = mergeServerDetails({}, remapCertErrors(details));
		expandFor(Object.keys(fieldErrors));
		await tick();
		focusFirstInvalid(formEl);
	}

	function openCreate(): void {
		editing = null;
		form = emptyForm();
		formError = '';
		fieldErrors = {};
		marketExpanded = false;
		requirementsExpanded = false;
		insightsExpanded = false;
		seoExpanded = false;
		dialogOpen = true;
	}

	function openEdit(g: MarketGuideDto): void {
		editing = g;
		form = {
			slug: g.slug,
			country: g.country,
			flag: g.flag ?? '',
			region: g.region ?? '',
			muslimPopulation: g.muslimPopulation ?? '',
			totalPopulation: g.totalPopulation ?? '',
			marketSizeUsd: g.marketSizeUsd ?? '',
			mandateStatus: normaliseMandateStatus(g.mandateStatus),
			mandatorySince: g.mandatorySince ?? '',
			certifyingBodiesJson: JSON.stringify(g.certifyingBodies ?? [], null, 2),
			importRequirements: (g.importRequirements ?? []).join(', '),
			standardBasis: g.standardBasis ?? '',
			certificateValidity: g.certificateValidity ?? '',
			estimatedCostUsd: g.estimatedCostUsd ?? '',
			processingTime: g.processingTime ?? '',
			keyInsights: (g.keyInsights ?? []).join(', '),
			opportunities: (g.opportunities ?? []).join(', '),
			challenges: (g.challenges ?? []).join(', '),
			summary: g.summary ?? '',
			metaTitle: g.metaTitle ?? '',
			metaDescription: g.metaDescription ?? '',
			keywords: g.keywords ?? '',
			status: normaliseMarketGuideStatus(g.status)
		};
		formError = '';
		fieldErrors = {};
		marketExpanded = false;
		requirementsExpanded = false;
		insightsExpanded = false;
		seoExpanded = false;
		dialogOpen = true;
	}

	function buildPayload(bodies: CertifyingBodyRef[]): MarketGuideInput {
		return {
			slug: fieldValue(form.slug) || slugifyMarketGuide(form.country),
			country: fieldValue(form.country),
			flag: fieldValue(form.flag),
			region: fieldValue(form.region),
			muslimPopulation: fieldValue(form.muslimPopulation),
			totalPopulation: fieldValue(form.totalPopulation),
			marketSizeUsd: fieldValue(form.marketSizeUsd),
			mandateStatus: form.mandateStatus,
			mandatorySince: fieldValue(form.mandatorySince),
			certifyingBodies: bodies,
			importRequirements: parseCommaList(form.importRequirements),
			standardBasis: fieldValue(form.standardBasis),
			certificateValidity: fieldValue(form.certificateValidity),
			estimatedCostUsd: fieldValue(form.estimatedCostUsd),
			processingTime: fieldValue(form.processingTime),
			keyInsights: parseCommaList(form.keyInsights),
			opportunities: parseCommaList(form.opportunities),
			challenges: parseCommaList(form.challenges),
			summary: fieldValue(form.summary),
			metaTitle: fieldValue(form.metaTitle),
			metaDescription: fieldValue(form.metaDescription),
			keywords: fieldValue(form.keywords),
			status: form.status
		};
	}

	/** Same Zod schemas the API applies — client and server cannot drift (§6.4). */
	async function save(e: SubmitEvent): Promise<void> {
		e.preventDefault();
		if (saving) return;
		fieldErrors = {};
		formError = '';

		const bodies = parseCertifyingBodies(form.certifyingBodiesJson);
		if ('error' in bodies) {
			fieldErrors = { certifyingBodiesJson: bodies.error };
			marketExpanded = true;
			formError = bodies.error;
			await tick();
			focusFirstInvalid(formEl);
			return;
		}

		const payload = buildPayload(bodies.value);
		const parsed = editing
			? marketGuideUpdateSchema.safeParse(payload)
			: marketGuideCreateSchema.safeParse(payload);
		if (!parsed.success) {
			await showFieldErrors(parsed.error.flatten().fieldErrors);
			return;
		}

		saving = true;
		try {
			const res = await fetch(
				editing ? `/api/market-guides/${encodeURIComponent(editing.slug)}` : '/api/market-guides',
				{
					method: editing ? 'PUT' : 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(payload)
				}
			);
			if (res.ok) {
				dialogOpen = false;
				toast.success(editing ? 'Market guide updated' : 'Market guide created');
				await loadList();
				return;
			}
			// Failed write: dialog stays open and every input keeps its value (§3.4).
			const body = await readErrorBody(res);
			if (res.status === 400 && body.details) {
				await showFieldErrors(body.details);
			}
			formError =
				body.error && body.error !== 'Validation failed'
					? body.error
					: 'Could not save this market guide.';
			toast.error(formError);
		} catch {
			formError = 'Network error — your changes were not saved.';
			toast.error(formError);
		} finally {
			saving = false;
		}
	}

	function remove(g: MarketGuideDto): void {
		confirmSlug = g.slug;
		confirmCountry = g.country;
	}

	async function confirmedRemove(): Promise<void> {
		const slug = confirmSlug;
		if (!slug || deleting) return;
		deleting = true;
		try {
			const res = await fetch(`/api/market-guides/${encodeURIComponent(slug)}`, {
				method: 'DELETE'
			});
			if (res.ok) {
				toast.success('Market guide deleted');
				await loadList();
			} else {
				const body = await readErrorBody(res);
				toast.error(body.error || 'Could not delete this market guide.');
			}
		} catch {
			toast.error('Network error — the market guide was not deleted.');
		} finally {
			deleting = false;
			confirmSlug = null;
			confirmCountry = '';
		}
	}

	function statusColor(s: string): string {
		if (s === 'active') return 'bg-success/10 text-success';
		if (s === 'draft') return 'bg-warn/10 text-warn';
		// 'inactive' and legacy rows stay neutral — only token classes are used.
		return 'bg-muted text-muted-foreground';
	}
</script>

<svelte:head>
	<title>Market Guides — HalalNeo Admin</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="space-y-4 sm:space-y-6">
	<div class="flex flex-wrap items-end justify-between gap-4">
		<div class="flex flex-col gap-1">
			<h1 class="text-2xl font-semibold tracking-tight sm:text-3xl">Market Guides</h1>
			<p class="max-w-2xl text-sm text-muted-foreground">
				Manage country-specific halal market intelligence guides.
			</p>
		</div>
		<Button variant="default" size="sm" onclick={openCreate} disabled={saving}>
			<Plus class="size-4"></Plus>
			Add Guide
		</Button>
	</div>

	<div class="relative max-w-sm">
		<Search
			class="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
		></Search>
		<Input bind:value={search} placeholder="Search guides..." class="pl-9" />
	</div>

	<div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
		<StatTile value={guides.length} label="Total Guides" loading={loading} />
		<StatTile value={activeCount} label="Active" loading={loading} />
		<StatTile value={mandatoryCount} label="Mandatory Markets" loading={loading} />
	</div>

	{#if loadFailure}
		<ErrorRetry failure={loadFailure} subject="market guides" onretry={loadList} />
	{:else}
		<div class="overflow-x-auto rounded-xl ring-1 ring-foreground/10">
			<Table>
				<TableHeader>
					<TableRow class="hover:bg-transparent">
						<TableHead>Country</TableHead>
						<TableHead>Region</TableHead>
						<TableHead>Mandate</TableHead>
						<TableHead>Market Size</TableHead>
						<TableHead>Status</TableHead>
						<TableHead class="text-right">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{#if loading}
						{#each SKELETON_ROWS as row (row)}
							<TableRow>
								<TableCell>
									<Skeleton class="h-4 w-32"></Skeleton>
									<Skeleton class="mt-2 h-3 w-24"></Skeleton>
								</TableCell>
								<TableCell><Skeleton class="h-4 w-24"></Skeleton></TableCell>
								<TableCell><Skeleton class="h-4 w-20"></Skeleton></TableCell>
								<TableCell><Skeleton class="h-4 w-24"></Skeleton></TableCell>
								<TableCell><Skeleton class="h-5 w-16 rounded-full"></Skeleton></TableCell>
								<TableCell class="text-right">
									<Skeleton class="ml-auto h-8 w-16"></Skeleton>
								</TableCell>
							</TableRow>
						{/each}
					{:else if filtered.length === 0}
						<TableRow>
							<TableCell colspan={6} class="py-8">
								<Empty>
									<EmptyHeader>
										<EmptyMedia variant="icon"><Globe class="size-6" /></EmptyMedia>
										<EmptyTitle>
											{search.trim() ? 'No matching guides' : 'No market guides yet'}
										</EmptyTitle>
										<EmptyDescription>
											{search.trim()
												? `Nothing matches “${search.trim()}”. Try another country, region or slug.`
												: 'Create the first country guide to publish halal market intelligence.'}
										</EmptyDescription>
									</EmptyHeader>
									<EmptyContent>
										{#if search.trim()}
											<Button variant="outline" size="sm" onclick={() => (search = '')}
												>Clear search</Button
											>
										{:else}
											<Button variant="default" size="sm" onclick={openCreate}>
												<Plus class="size-4" />
												Add Guide
											</Button>
										{/if}
									</EmptyContent>
								</Empty>
							</TableCell>
						</TableRow>
					{:else}
						{#each paged as g (g.slug)}
							<TableRow>
								<TableCell>
									<div class="min-w-0">
										<p class="truncate font-medium">{g.flag ?? ''} {g.country}</p>
										<p class="truncate text-xs text-muted-foreground">{g.slug}</p>
									</div>
								</TableCell>
								<TableCell>{g.region ?? '—'}</TableCell>
								<TableCell class="capitalize">{g.mandateStatus ?? '—'}</TableCell>
								<TableCell>{g.marketSizeUsd ?? '—'}</TableCell>
								<TableCell>
									<Badge
										variant="secondary"
										class={`px-1.5 py-0.5 text-2xs capitalize ${statusColor(g.status ?? 'active')}`}
										>{g.status ?? 'active'}</Badge
									>
								</TableCell>
								<TableCell class="text-right">
									<div class="flex items-center justify-end gap-1">
										<Button
											variant="ghost"
											size="icon"
											aria-label="Edit"
											class="size-8"
											disabled={deleting}
											onclick={() => openEdit(g)}
										>
											<Pencil class="size-3.5"></Pencil>
										</Button>
										<Button
											variant="ghost"
											size="icon"
											aria-label="Delete"
											class="size-8 hover:bg-destructive/10 hover:text-destructive"
											disabled={deleting}
											onclick={() => remove(g)}
										>
											<Trash2 class="size-3.5"></Trash2>
										</Button>
									</div>
								</TableCell>
							</TableRow>
						{/each}
					{/if}
				</TableBody>
			</Table>
		</div>

		<Paginator bind:page {totalPages} />

		{#if !loading && !loadFailure && total > guides.length}
			<p class="text-center text-xs text-muted-foreground">
				Showing {guides.length} of {total} guides (API caps at 100 per request).
			</p>
		{/if}
	{/if}
</div>

<Dialog bind:open={dialogOpen}>
	<DialogContent class="max-h-[85dvh] overflow-y-auto sm:max-w-lg">
		<DialogHeader>
			<DialogTitle>{editing ? 'Edit market guide' : 'New market guide'}</DialogTitle>
			<DialogDescription>Create or update a country market guide.</DialogDescription>
		</DialogHeader>

		<form class="flex flex-col gap-4" bind:this={formEl} onsubmit={save}>
			<div class="grid grid-cols-2 gap-4">
				<Field.Field>
					<Field.FieldLabel>Country *</Field.FieldLabel>
					<Input
						bind:value={form.country}
						placeholder="Indonesia"
						maxlength={120}
						disabled={saving}
						aria-invalid={!!fieldErrors.country}
						oninput={() => { fieldErrors = { ...fieldErrors, country: '' }; }}
					/>
					{#if fieldErrors.country}<FieldError>{fieldErrors.country}</FieldError>{/if}
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel>Slug</Field.FieldLabel>
					<Input
						bind:value={form.slug}
						placeholder="indonesia"
						maxlength={200}
						disabled={!!editing || saving}
						aria-invalid={!!fieldErrors.slug}
						oninput={() => { fieldErrors = { ...fieldErrors, slug: '' }; }}
					/>
					{#if fieldErrors.slug}<FieldError>{fieldErrors.slug}</FieldError>{/if}
					{#if !editing}
						<p class="text-xs text-muted-foreground">
							URL segment — derived from the country when left blank.
						</p>
					{/if}
				</Field.Field>
			</div>

			<div class="grid grid-cols-2 gap-4">
				<Field.Field>
					<Field.FieldLabel>Flag (emoji)</Field.FieldLabel>
					<Input bind:value={form.flag} placeholder="🇮🇩" maxlength={16} disabled={saving} />
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel>Region</Field.FieldLabel>
					<Select bind:value={form.region} type="single">
						<SelectTrigger class="w-full" disabled={saving}>
							{form.region || 'Select region'}
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								<SelectItem value="">None</SelectItem>
								{#each regionOptions as r (r)}
									<SelectItem value={r}>{r}</SelectItem>
								{/each}
							</SelectGroup>
						</SelectContent>
					</Select>
				</Field.Field>
			</div>

			<div class="grid grid-cols-2 gap-4">
				<Field.Field>
					<Field.FieldLabel>Mandate Status</Field.FieldLabel>
					<Select bind:value={form.mandateStatus} type="single">
						<SelectTrigger class="w-full" disabled={saving}>{form.mandateStatus}</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								{#each mandateOptions as m (m)}
									<SelectItem value={m}>{m}</SelectItem>
								{/each}
							</SelectGroup>
						</SelectContent>
					</Select>
					{#if fieldErrors.mandateStatus}
						<FieldError>{fieldErrors.mandateStatus}</FieldError>
					{/if}
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel>Status</Field.FieldLabel>
					<Select bind:value={form.status} type="single">
						<SelectTrigger class="w-full" disabled={saving}>{form.status}</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								{#each MARKET_GUIDE_STATUSES as s (s)}
									<SelectItem value={s}>{s}</SelectItem>
								{/each}
							</SelectGroup>
						</SelectContent>
					</Select>
					{#if fieldErrors.status}<FieldError>{fieldErrors.status}</FieldError>{/if}
				</Field.Field>
			</div>

			<Field.Field>
				<Field.FieldLabel>Summary</Field.FieldLabel>
				<Textarea
					bind:value={form.summary}
					rows={3}
					maxlength={4000}
					placeholder="Brief market overview..."
					disabled={saving}
					aria-invalid={!!fieldErrors.summary}
					oninput={() => { fieldErrors = { ...fieldErrors, summary: '' }; }}
				/>
				{#if fieldErrors.summary}<FieldError>{fieldErrors.summary}</FieldError>{/if}
			</Field.Field>

			<!-- ===================== MARKET DATA (collapsed) ===================== -->
			<CollapsibleSection title="Market Data" bind:open={marketExpanded}>
				<div class="grid grid-cols-2 gap-4">
					<Field.Field>
						<Field.FieldLabel>Muslim Population</Field.FieldLabel>
						<Input
							bind:value={form.muslimPopulation}
							placeholder="~230 million"
							maxlength={160}
							disabled={saving}
						/>
					</Field.Field>
					<Field.Field>
						<Field.FieldLabel>Total Population</Field.FieldLabel>
						<Input
							bind:value={form.totalPopulation}
							placeholder="~275 million"
							maxlength={160}
							disabled={saving}
						/>
					</Field.Field>
				</div>
				<div class="grid grid-cols-2 gap-4">
					<Field.Field>
						<Field.FieldLabel>Market Size (USD)</Field.FieldLabel>
						<Input
							bind:value={form.marketSizeUsd}
							placeholder="$220B+"
							maxlength={200}
							disabled={saving}
						/>
					</Field.Field>
					<Field.Field>
						<Field.FieldLabel>Mandatory Since</Field.FieldLabel>
						<Input
							bind:value={form.mandatorySince}
							placeholder="October 2024"
							maxlength={200}
							disabled={saving}
						/>
					</Field.Field>
				</div>
				<div class="grid grid-cols-2 gap-4">
					<Field.Field>
						<Field.FieldLabel>Estimated Cost (USD)</Field.FieldLabel>
						<Input
							bind:value={form.estimatedCostUsd}
							placeholder="$500–$2,000"
							maxlength={200}
							disabled={saving}
						/>
					</Field.Field>
					<Field.Field>
						<Field.FieldLabel>Processing Time</Field.FieldLabel>
						<Input
							bind:value={form.processingTime}
							placeholder="3–6 months"
							maxlength={200}
							disabled={saving}
						/>
					</Field.Field>
				</div>
				<div class="grid grid-cols-2 gap-4">
					<Field.Field>
						<Field.FieldLabel>Certificate Validity</Field.FieldLabel>
						<Input
							bind:value={form.certificateValidity}
							placeholder="4 years"
							maxlength={200}
							disabled={saving}
						/>
					</Field.Field>
					<Field.Field>
						<Field.FieldLabel>Standard Basis</Field.FieldLabel>
						<Input
							bind:value={form.standardBasis}
							placeholder="HAS 23000"
							maxlength={300}
							disabled={saving}
						/>
					</Field.Field>
				</div>
				<Field.Field>
					<Field.FieldLabel>Certifying Bodies (JSON)</Field.FieldLabel>
					<Textarea
						bind:value={form.certifyingBodiesJson}
						rows={3}
						placeholder={'[{"slug":"bpjph","name":"BPJPH"}]'}
						disabled={saving}
						aria-invalid={!!fieldErrors.certifyingBodiesJson}
						oninput={() => { fieldErrors = { ...fieldErrors, certifyingBodiesJson: '' }; }}
					/>
					{#if fieldErrors.certifyingBodiesJson}
						<FieldError>{fieldErrors.certifyingBodiesJson}</FieldError>
					{/if}
				</Field.Field>
			</CollapsibleSection>

			<!-- ===================== REQUIREMENTS (collapsed) ===================== -->
			<CollapsibleSection title="Import Requirements" bind:open={requirementsExpanded}>
				<Field.Field>
					<Field.FieldLabel>Import Requirements (comma-separated)</Field.FieldLabel>
					<Textarea
						bind:value={form.importRequirements}
						rows={3}
						placeholder="Halal certificate, Labeling in local language, ..."
						disabled={saving}
						aria-invalid={!!fieldErrors.importRequirements}
						oninput={() => { fieldErrors = { ...fieldErrors, importRequirements: '' }; }}
					/>
					{#if fieldErrors.importRequirements}
						<FieldError>{fieldErrors.importRequirements}</FieldError>
					{/if}
				</Field.Field>
			</CollapsibleSection>

			<!-- ===================== INSIGHTS (collapsed) ===================== -->
			<CollapsibleSection title="Insights, Opportunities & Challenges" bind:open={insightsExpanded}>
				<Field.Field>
					<Field.FieldLabel>Key Insights (comma-separated)</Field.FieldLabel>
					<Textarea
						bind:value={form.keyInsights}
						rows={2}
						placeholder="Largest Muslim population, ..."
						disabled={saving}
						aria-invalid={!!fieldErrors.keyInsights}
						oninput={() => { fieldErrors = { ...fieldErrors, keyInsights: '' }; }}
					/>
					{#if fieldErrors.keyInsights}<FieldError>{fieldErrors.keyInsights}</FieldError>{/if}
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel>Opportunities (comma-separated)</Field.FieldLabel>
					<Textarea
						bind:value={form.opportunities}
						rows={2}
						placeholder="Growing middle class, ..."
						disabled={saving}
						aria-invalid={!!fieldErrors.opportunities}
						oninput={() => { fieldErrors = { ...fieldErrors, opportunities: '' }; }}
					/>
					{#if fieldErrors.opportunities}<FieldError>{fieldErrors.opportunities}</FieldError>{/if}
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel>Challenges (comma-separated)</Field.FieldLabel>
					<Textarea
						bind:value={form.challenges}
						rows={2}
						placeholder="Complex regulations, ..."
						disabled={saving}
						aria-invalid={!!fieldErrors.challenges}
						oninput={() => { fieldErrors = { ...fieldErrors, challenges: '' }; }}
					/>
					{#if fieldErrors.challenges}<FieldError>{fieldErrors.challenges}</FieldError>{/if}
				</Field.Field>
			</CollapsibleSection>

			<!-- ===================== SEO & METADATA (collapsed) ===================== -->
			<CollapsibleSection title="SEO & Metadata" bind:open={seoExpanded}>
				<Field.Field>
					<Field.FieldLabel>Meta Title</Field.FieldLabel>
					<Input
						bind:value={form.metaTitle}
						maxlength={60}
						placeholder="SEO page title (max 60 chars)"
						disabled={saving}
						aria-invalid={!!fieldErrors.metaTitle}
						oninput={() => { fieldErrors = { ...fieldErrors, metaTitle: '' }; }}
					/>
					{#if fieldErrors.metaTitle}<FieldError>{fieldErrors.metaTitle}</FieldError>{/if}
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel>Meta Description</Field.FieldLabel>
					<Textarea
						bind:value={form.metaDescription}
						maxlength={160}
						rows={2}
						placeholder="SEO description (max 160 chars)"
						disabled={saving}
						aria-invalid={!!fieldErrors.metaDescription}
						oninput={() => { fieldErrors = { ...fieldErrors, metaDescription: '' }; }}
					/>
					{#if fieldErrors.metaDescription}
						<FieldError>{fieldErrors.metaDescription}</FieldError>
					{/if}
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel>Keywords</Field.FieldLabel>
					<Input
						bind:value={form.keywords}
						placeholder="Comma separated: halal, indonesia, certification"
						maxlength={500}
						disabled={saving}
						aria-invalid={!!fieldErrors.keywords}
						oninput={() => { fieldErrors = { ...fieldErrors, keywords: '' }; }}
					/>
					{#if fieldErrors.keywords}<FieldError>{fieldErrors.keywords}</FieldError>{/if}
				</Field.Field>
			</CollapsibleSection>

			{#if formError}
				<p class="text-sm text-destructive">{formError}</p>
			{/if}
			<DialogFooter>
				<Button
					variant="outline"
					type="button"
					disabled={saving}
					onclick={() => (dialogOpen = false)}>Cancel</Button
				>
				<Button variant="default" type="submit" disabled={saving}>
					{saving ? 'Saving…' : editing ? 'Save changes' : 'Create guide'}
				</Button>
			</DialogFooter>
		</form>
	</DialogContent>
</Dialog>

<ConfirmDialog
	open={confirmSlug !== null}
	title="Delete market guide?"
	description={confirmSlug
		? `Delete market guide for ${confirmCountry}? This cannot be undone.`
		: undefined}
	confirmLabel={deleting ? 'Deleting…' : 'Delete'}
	onconfirm={confirmedRemove}
/>
