<script lang="ts">
	import { tick } from 'svelte';
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
		EmptyTitle
	} from '#lib/components/ui/empty/index.js';
	import BrandedEmptyMedia from '#lib/components/site/branded-empty-media.svelte';
	import Search from '@lucide/svelte/icons/search';
	import Plus from '@lucide/svelte/icons/plus';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import CalendarDays from '@lucide/svelte/icons/calendar-days';
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
		TRADE_SHOW_SCALES,
		TRADE_SHOW_STATUSES,
		normaliseTradeShowScale,
		normaliseTradeShowStatus,
		tradeShowCreateSchema,
		tradeShowUpdateSchema,
		type TradeShowDto,
		type TradeShowInput,
		type TradeShowListResponse,
		type TradeShowScale,
		type TradeShowStatus
	} from '#lib/schemas/trade-shows.js';

	// ---------- list state (real API — never the demo store) ----------
	const PAGE_SIZE = 20;
	/** Placeholder rows while the list is in flight (§3.1 loading state). */
	const SKELETON_ROWS = [0, 1, 2, 3, 4];

	let shows = $state<TradeShowDto[]>([]);
	let total = $state(0);
	let loading = $state(true);
	let loadFailure = $state<LoadFailure | null>(null);
	let search = $state('');
	let page = $state(1);

	// ---------- dialog state ----------
	let dialogOpen = $state(false);
	/** Row being edited, or `null` when creating. `id` is the immutable key. */
	let editing = $state<TradeShowDto | null>(null);
	let saving = $state(false);
	let deleting = $state(false);
	let formError = $state('');
	let fieldErrors = $state<Record<string, string>>({});
	let formEl = $state<HTMLFormElement | undefined>(undefined);

	// ---------- delete state ----------
	let confirmId = $state<string | null>(null);
	let confirmName = $state('');

	// Collapsible section state
	let detailsExpanded = $state(false);
	let seoExpanded = $state(false);

	type ShowForm = {
		id: string;
		name: string;
		city: string;
		country: string;
		region: string;
		startDate: string;
		endDate: string;
		venue: string;
		website: string;
		scale: TradeShowScale;
		description: string;
		focus: string;
		exhibitors: string;
		visitors: string;
		metaTitle: string;
		metaDescription: string;
		keywords: string;
		status: TradeShowStatus;
	};

	const emptyForm = (): ShowForm => ({
		id: '',
		name: '',
		city: '',
		country: '',
		region: '',
		startDate: '',
		endDate: '',
		venue: '',
		website: '',
		scale: 'medium',
		description: '',
		focus: '',
		exhibitors: '',
		visitors: '',
		metaTitle: '',
		metaDescription: '',
		keywords: '',
		status: 'active'
	});

	let form = $state<ShowForm>(emptyForm());

	const regionOptions = ['Asia', 'Europe', 'Middle East', 'North America', 'Africa', 'Oceania'];
	const scaleOptions = TRADE_SHOW_SCALES;

	/** Which collapsed section owns each field, so errors are never hidden (§3.4). */
	const DETAILS_KEYS = ['venue', 'website', 'focus', 'exhibitors', 'visitors'];
	const SEO_KEYS = ['metaTitle', 'metaDescription', 'keywords'];

	/** `status=all` is the admin view (drafts/inactive included); limit=100 is the endpoint clamp (§5.9). */
	async function loadList(): Promise<void> {
		loading = true;
		loadFailure = null;
		try {
			const res = await fetch('/api/trade-shows?status=all&limit=100');
			if (!res.ok) {
				const body = await readErrorBody(res);
				const failure = describeFetchFailure(res);
				loadFailure = { ...failure, message: body.error || failure.message };
				shows = [];
				total = 0;
				return;
			}
			const data = (await res.json()) as Partial<TradeShowListResponse>;
			shows = Array.isArray(data.items) ? data.items : [];
			total = typeof data.total === 'number' ? data.total : shows.length;
		} catch (error) {
			loadFailure = describeThrownFailure(error);
			shows = [];
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
		if (!search.trim()) return shows;
		const q = search.toLowerCase();
		return shows.filter(
			(s) =>
				s.name.toLowerCase().includes(q) ||
				(s.country ?? '').toLowerCase().includes(q) ||
				(s.city ?? '').toLowerCase().includes(q) ||
				s.id.includes(q)
		);
	});

	const totalPages = $derived(Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)));
	const paged = $derived(filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE));

	$effect(() => {
		void search;
		page = 1;
	});

	const activeCount = $derived(shows.filter((s) => s.status === 'active').length);
	const megaCount = $derived(shows.filter((s) => s.scale === 'mega').length);

	function expandFor(keys: string[]): void {
		if (!keys.length) return;
		const hit = (list: string[]) => keys.some((k) => list.includes(k));
		if (hit(DETAILS_KEYS)) detailsExpanded = true;
		if (hit(SEO_KEYS)) seoExpanded = true;
	}

	function slugify(s: string): string {
		return s
			.toLowerCase()
			.trim()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/(^-|-$)/g, '');
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

	/** Integer columns are nullable: blank must send `null`, never `0`. */
	function optionalCount(value: string): number | null {
		const trimmed = value.trim();
		return trimmed === '' ? null : Number(trimmed);
	}

	async function showFieldErrors(details: ServerFieldDetails): Promise<void> {
		fieldErrors = mergeServerDetails({}, details);
		expandFor(Object.keys(fieldErrors));
		await tick();
		focusFirstInvalid(formEl);
	}

	function openCreate(): void {
		editing = null;
		form = emptyForm();
		formError = '';
		fieldErrors = {};
		detailsExpanded = false;
		seoExpanded = false;
		dialogOpen = true;
	}

	function openEdit(s: TradeShowDto): void {
		editing = s;
		form = {
			id: s.id,
			name: s.name,
			city: s.city ?? '',
			country: s.country ?? '',
			region: s.region ?? '',
			startDate: s.startDate ?? '',
			endDate: s.endDate ?? '',
			venue: s.venue ?? '',
			website: s.website ?? '',
			scale: normaliseTradeShowScale(s.scale),
			description: s.description ?? '',
			focus: (s.focus ?? []).join(', '),
			exhibitors: s.exhibitors != null ? String(s.exhibitors) : '',
			visitors: s.visitors != null ? String(s.visitors) : '',
			metaTitle: s.metaTitle ?? '',
			metaDescription: s.metaDescription ?? '',
			keywords: s.keywords ?? '',
			status: normaliseTradeShowStatus(s.status)
		};
		formError = '';
		fieldErrors = {};
		detailsExpanded = false;
		seoExpanded = false;
		dialogOpen = true;
	}

	function buildPayload(): TradeShowInput {
		return {
			id: fieldValue(form.id) || slugify(form.name),
			name: fieldValue(form.name),
			city: fieldValue(form.city),
			country: fieldValue(form.country),
			region: fieldValue(form.region),
			startDate: fieldValue(form.startDate),
			endDate: fieldValue(form.endDate),
			venue: fieldValue(form.venue),
			website: fieldValue(form.website),
			scale: form.scale,
			description: fieldValue(form.description),
			focus: parseCommaList(form.focus),
			exhibitors: optionalCount(form.exhibitors),
			visitors: optionalCount(form.visitors),
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

		const payload = buildPayload();
		const parsed = editing
			? tradeShowUpdateSchema.safeParse(payload)
			: tradeShowCreateSchema.safeParse(payload);
		if (!parsed.success) {
			await showFieldErrors(parsed.error.flatten().fieldErrors);
			return;
		}

		saving = true;
		try {
			const res = await fetch(
				editing ? `/api/trade-shows/${encodeURIComponent(editing.id)}` : '/api/trade-shows',
				{
					method: editing ? 'PUT' : 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(payload)
				}
			);
			if (res.ok) {
				dialogOpen = false;
				toast.success(editing ? 'Trade show updated' : 'Trade show created');
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
					: 'Could not save this trade show.';
			toast.error(formError);
		} catch {
			formError = 'Network error — your changes were not saved.';
			toast.error(formError);
		} finally {
			saving = false;
		}
	}

	function remove(s: TradeShowDto): void {
		confirmId = s.id;
		confirmName = s.name;
	}

	async function confirmedRemove(): Promise<void> {
		const id = confirmId;
		if (!id || deleting) return;
		deleting = true;
		try {
			const res = await fetch(`/api/trade-shows/${encodeURIComponent(id)}`, {
				method: 'DELETE'
			});
			if (res.ok) {
				toast.success('Trade show deleted');
				await loadList();
			} else {
				const body = await readErrorBody(res);
				toast.error(body.error || 'Could not delete this trade show.');
			}
		} catch {
			toast.error('Network error — the trade show was not deleted.');
		} finally {
			deleting = false;
			confirmId = null;
			confirmName = '';
		}
	}

	function statusColor(s: string): string {
		if (s === 'active') return 'bg-success/10 text-success';
		if (s === 'draft') return 'bg-warn/10 text-warn';
		// 'inactive' and legacy rows stay neutral — only token classes are used.
		return 'bg-muted text-muted-foreground';
	}

	function formatDate(d: string): string {
		if (!d) return '—';
		try {
			return new Date(d).toLocaleDateString('en-US', {
				month: 'short',
				day: 'numeric',
				year: 'numeric'
			});
		} catch {
			return d;
		}
	}
</script>

<svelte:head>
	<title>Trade Shows — HalalNeo Admin</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="space-y-4 sm:space-y-6">
	<div class="flex flex-wrap items-end justify-between gap-4">
		<div class="flex flex-col gap-1">
			<h1 class="text-2xl font-semibold tracking-tight sm:text-3xl">Trade Shows</h1>
			<p class="max-w-2xl text-sm text-muted-foreground">
				Manage halal trade shows, exhibitions, and industry events.
			</p>
		</div>
		<Button variant="default" size="sm" onclick={openCreate} disabled={saving}>
			<Plus class="size-4"></Plus>
			Add Show
		</Button>
	</div>

	<div class="relative max-w-sm">
		<Search
			class="pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
		></Search>
		<Input bind:value={search} placeholder="Search shows..." class="ps-9" />
	</div>

	<div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
		<StatTile value={shows.length} label="Total Shows" {loading} />
		<StatTile value={activeCount} label="Active" {loading} />
		<StatTile value={megaCount} label="Mega Shows" {loading} />
	</div>

	{#if loadFailure}
		<ErrorRetry failure={loadFailure} subject="trade shows" onretry={loadList} />
	{:else}
		<div class="overflow-x-auto rounded-xl ring-1 ring-foreground/10">
			<Table>
				<TableHeader>
					<TableRow class="hover:bg-transparent">
						<TableHead>Name</TableHead>
						<TableHead>Location</TableHead>
						<TableHead>Dates</TableHead>
						<TableHead>Scale</TableHead>
						<TableHead>Status</TableHead>
						<TableHead class="text-end">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{#if loading}
						{#each SKELETON_ROWS as row (row)}
							<TableRow>
								<TableCell>
									<Skeleton class="h-4 w-40"></Skeleton>
									<Skeleton class="mt-2 h-3 w-24"></Skeleton>
								</TableCell>
								<TableCell><Skeleton class="h-4 w-28"></Skeleton></TableCell>
								<TableCell><Skeleton class="h-4 w-32"></Skeleton></TableCell>
								<TableCell><Skeleton class="h-4 w-20"></Skeleton></TableCell>
								<TableCell><Skeleton class="h-5 w-16 rounded-full"></Skeleton></TableCell>
								<TableCell class="text-end">
									<Skeleton class="ms-auto h-8 w-16"></Skeleton>
								</TableCell>
							</TableRow>
						{/each}
					{:else if filtered.length === 0}
						<TableRow>
							<TableCell colspan={6} class="py-8">
								<Empty>
									<EmptyHeader>
										<BrandedEmptyMedia variant="icon"
											><CalendarDays class="size-6" /></BrandedEmptyMedia
										>
										<EmptyTitle>
											{search.trim() ? 'No matching shows' : 'No trade shows yet'}
										</EmptyTitle>
										<EmptyDescription>
											{search.trim()
												? `Nothing matches “${search.trim()}”. Try another name, city or country.`
												: 'Register the first halal exhibition so buyers can plan their season.'}
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
												Add Show
											</Button>
										{/if}
									</EmptyContent>
								</Empty>
							</TableCell>
						</TableRow>
					{:else}
						{#each paged as s (s.id)}
							<TableRow>
								<TableCell>
									<div class="min-w-0">
										<p class="truncate font-medium">{s.name}</p>
										<p class="truncate text-xs text-muted-foreground">{s.id}</p>
									</div>
								</TableCell>
								<TableCell>{s.city ? `${s.city}, ${s.country}` : (s.country ?? '—')}</TableCell>
								<TableCell class="text-xs"
									>{formatDate(s.startDate ?? '')} — {formatDate(s.endDate ?? '')}</TableCell
								>
								<TableCell class="capitalize">{s.scale ?? '—'}</TableCell>
								<TableCell>
									<Badge
										variant="secondary"
										class={`px-1.5 py-0.5 text-2xs capitalize ${statusColor(s.status ?? 'active')}`}
										>{s.status ?? 'active'}</Badge
									>
								</TableCell>
								<TableCell class="text-end">
									<div class="flex items-center justify-end gap-1">
										<Button
											variant="ghost"
											size="icon"
											aria-label="Edit"
											class="size-8"
											disabled={deleting}
											onclick={() => openEdit(s)}
										>
											<Pencil class="size-3.5"></Pencil>
										</Button>
										<Button
											variant="ghost"
											size="icon"
											aria-label="Delete"
											class="size-8 hover:bg-destructive/10 hover:text-destructive"
											disabled={deleting}
											onclick={() => remove(s)}
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

		{#if !loading && !loadFailure && total > shows.length}
			<p class="text-center text-xs text-muted-foreground">
				Showing {shows.length} of {total} shows (API caps at 100 per request).
			</p>
		{/if}
	{/if}
</div>

<Dialog bind:open={dialogOpen}>
	<DialogContent class="max-h-[85dvh] min-w-0 overflow-x-hidden overflow-y-auto sm:max-w-lg">
		<DialogHeader>
			<DialogTitle>{editing ? 'Edit show' : 'New show'}</DialogTitle>
			<DialogDescription>Register or update a halal trade show.</DialogDescription>
		</DialogHeader>
		<form bind:this={formEl} onsubmit={save} class="flex min-w-0 flex-col gap-4">
			<Field.Field>
				<Field.FieldLabel>Name *</Field.FieldLabel>
				<Input
					bind:value={form.name}
					placeholder="MIHAS 2026"
					maxlength={200}
					disabled={saving}
					aria-invalid={!!fieldErrors.name}
					oninput={() => {
						if (fieldErrors.name) fieldErrors = { ...fieldErrors, name: '' };
					}}
				/>
				{#if fieldErrors.name}<FieldError>{fieldErrors.name}</FieldError>{/if}
			</Field.Field>

			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<Field.Field>
					<Field.FieldLabel>ID</Field.FieldLabel>
					<Input
						bind:value={form.id}
						placeholder="mihas-2026"
						maxlength={160}
						disabled={!!editing || saving}
						aria-invalid={!!fieldErrors.id}
						oninput={() => {
							if (fieldErrors.id) fieldErrors = { ...fieldErrors, id: '' };
						}}
					/>
					{#if fieldErrors.id}<FieldError>{fieldErrors.id}</FieldError>{/if}
					{#if !editing}
						<p class="text-xs text-muted-foreground">
							URL segment — derived from the name when left blank.
						</p>
					{/if}
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel>Scale</Field.FieldLabel>
					<Select bind:value={form.scale} type="single">
						<SelectTrigger class="w-full" disabled={saving}>{form.scale}</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								{#each scaleOptions as sc (sc)}
									<SelectItem value={sc}>{sc}</SelectItem>
								{/each}
							</SelectGroup>
						</SelectContent>
					</Select>
					{#if fieldErrors.scale}<FieldError>{fieldErrors.scale}</FieldError>{/if}
				</Field.Field>
			</div>

			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<Field.Field>
					<Field.FieldLabel>City</Field.FieldLabel>
					<Input
						bind:value={form.city}
						placeholder="Kuala Lumpur"
						maxlength={120}
						disabled={saving}
					/>
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel>Country</Field.FieldLabel>
					<Input
						bind:value={form.country}
						placeholder="Malaysia"
						maxlength={120}
						disabled={saving}
					/>
				</Field.Field>
			</div>

			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
				<Field.Field>
					<Field.FieldLabel>Status</Field.FieldLabel>
					<Select bind:value={form.status} type="single">
						<SelectTrigger class="w-full" disabled={saving}>{form.status}</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								{#each TRADE_SHOW_STATUSES as s (s)}
									<SelectItem value={s}>{s}</SelectItem>
								{/each}
							</SelectGroup>
						</SelectContent>
					</Select>
					{#if fieldErrors.status}<FieldError>{fieldErrors.status}</FieldError>{/if}
				</Field.Field>
			</div>

			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<Field.Field>
					<Field.FieldLabel>Start Date *</Field.FieldLabel>
					<Input
						bind:value={form.startDate}
						type="date"
						disabled={saving}
						aria-invalid={!!fieldErrors.startDate}
						oninput={() => {
							if (fieldErrors.startDate) fieldErrors = { ...fieldErrors, startDate: '' };
						}}
					/>
					{#if fieldErrors.startDate}<FieldError>{fieldErrors.startDate}</FieldError>{/if}
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel>End Date *</Field.FieldLabel>
					<Input
						bind:value={form.endDate}
						type="date"
						disabled={saving}
						aria-invalid={!!fieldErrors.endDate}
						oninput={() => {
							if (fieldErrors.endDate) fieldErrors = { ...fieldErrors, endDate: '' };
						}}
					/>
					{#if fieldErrors.endDate}<FieldError>{fieldErrors.endDate}</FieldError>{/if}
				</Field.Field>
			</div>

			<Field.Field>
				<Field.FieldLabel>Description</Field.FieldLabel>
				<Textarea
					bind:value={form.description}
					rows={3}
					maxlength={4000}
					placeholder="Show description..."
					disabled={saving}
					aria-invalid={!!fieldErrors.description}
					oninput={() => {
						if (fieldErrors.description) fieldErrors = { ...fieldErrors, description: '' };
					}}
				/>
				{#if fieldErrors.description}<FieldError>{fieldErrors.description}</FieldError>{/if}
			</Field.Field>

			<!-- ===================== VENUE & DETAILS (collapsed) ===================== -->
			<CollapsibleSection title="Venue & Details" bind:open={detailsExpanded}>
				<Field.Field>
					<Field.FieldLabel>Venue</Field.FieldLabel>
					<Input
						bind:value={form.venue}
						placeholder="Malaysia International Trade and Exhibition Centre"
						maxlength={300}
						disabled={saving}
					/>
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel>Website</Field.FieldLabel>
					<Input
						bind:value={form.website}
						placeholder="https://example.com"
						maxlength={500}
						disabled={saving}
					/>
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel>Focus (comma-separated)</Field.FieldLabel>
					<Input
						bind:value={form.focus}
						placeholder="Food & Beverage, Pharmaceuticals, ..."
						disabled={saving}
						aria-invalid={!!fieldErrors.focus}
						oninput={() => {
							if (fieldErrors.focus) fieldErrors = { ...fieldErrors, focus: '' };
						}}
					/>
					{#if fieldErrors.focus}<FieldError>{fieldErrors.focus}</FieldError>{/if}
				</Field.Field>
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<Field.Field>
						<Field.FieldLabel>Exhibitors</Field.FieldLabel>
						<Input
							bind:value={form.exhibitors}
							type="number"
							min="0"
							placeholder="1200"
							disabled={saving}
							aria-invalid={!!fieldErrors.exhibitors}
							oninput={() => {
								if (fieldErrors.exhibitors) fieldErrors = { ...fieldErrors, exhibitors: '' };
							}}
						/>
						{#if fieldErrors.exhibitors}<FieldError>{fieldErrors.exhibitors}</FieldError>{/if}
					</Field.Field>
					<Field.Field>
						<Field.FieldLabel>Visitors</Field.FieldLabel>
						<Input
							bind:value={form.visitors}
							type="number"
							min="0"
							placeholder="50000"
							disabled={saving}
							aria-invalid={!!fieldErrors.visitors}
							oninput={() => {
								if (fieldErrors.visitors) fieldErrors = { ...fieldErrors, visitors: '' };
							}}
						/>
						{#if fieldErrors.visitors}<FieldError>{fieldErrors.visitors}</FieldError>{/if}
					</Field.Field>
				</div>
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
						oninput={() => {
							if (fieldErrors.metaTitle) fieldErrors = { ...fieldErrors, metaTitle: '' };
						}}
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
						oninput={() => {
							if (fieldErrors.metaDescription)
								fieldErrors = { ...fieldErrors, metaDescription: '' };
						}}
					/>
					{#if fieldErrors.metaDescription}
						<FieldError>{fieldErrors.metaDescription}</FieldError>
					{/if}
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel>Keywords</Field.FieldLabel>
					<Input
						bind:value={form.keywords}
						placeholder="Comma separated: halal, trade show, malaysia"
						maxlength={500}
						disabled={saving}
						aria-invalid={!!fieldErrors.keywords}
						oninput={() => {
							if (fieldErrors.keywords) fieldErrors = { ...fieldErrors, keywords: '' };
						}}
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
					{saving ? 'Saving…' : editing ? 'Save changes' : 'Create show'}
				</Button>
			</DialogFooter>
		</form>
	</DialogContent>
</Dialog>

<ConfirmDialog
	open={confirmId !== null}
	title="Delete trade show?"
	description={confirmId ? `Delete trade show ${confirmName}? This cannot be undone.` : undefined}
	confirmLabel={deleting ? 'Deleting…' : 'Delete'}
	onconfirm={confirmedRemove}
/>
