<script lang="ts">
	// Real API data flow (development-rules.md §6.1 / §6.4): reads and writes go through
	// /api/suppliers* and are validated by the SAME Zod schema on both sides
	// (#lib/schemas/suppliers.ts). No localStorage demo store is involved.
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Textarea } from '#lib/components/ui/textarea/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
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
	import { Switch } from '#lib/components/ui/switch/index.js';
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
	import Sparkles from '@lucide/svelte/icons/sparkles';
	import Loader2 from '@lucide/svelte/icons/loader-2';
	import Building2 from '@lucide/svelte/icons/building-2';
	import CollapsibleSection from '#lib/components/site/collapsible-section.svelte';
	import ConfirmDialog from '#lib/components/site/confirm-dialog.svelte';
	import ErrorRetry from '#lib/components/site/error-retry.svelte';
	import Paginator from '#lib/components/site/paginator.svelte';
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
		SUPPLIER_BUSINESS_TYPES,
		SUPPLIER_STATUSES,
		SupplierCreateSchema,
		initialsFromName,
		parseSupplierJson,
		toSupplierPayload,
		type SupplierBusinessType,
		type SupplierFormState,
		type SupplierListItem,
		type SupplierListResponse,
		type SupplierRow,
		type SupplierStatus
	} from '#lib/schemas/suppliers.js';

	const PAGE_SIZE = 20;
	/** Placeholder rows while the list is in flight (§3.1 loading state). */
	const SKELETON_ROWS = [0, 1, 2, 3, 4];

	const CONTACT_KEYS = ['website', 'email', 'phone', 'whatsapp', 'line'];
	const BUSINESS_KEYS = [
		'description',
		'employeeCount',
		'productionCapacity',
		'mainMarkets',
		'certifications'
	];
	const SEO_KEYS = ['metaTitle', 'metaDescription', 'keywords'];

	const emptyForm = (): SupplierFormState => ({
		slug: '',
		name: '',
		country: '',
		businessType: 'manufacturer',
		isBrand: true,
		status: 'active',
		logoInitials: '',
		description: '',
		coverImage: '',
		yearEstablished: '2000',
		website: '',
		email: '',
		phone: '',
		whatsapp: '',
		line: '',
		employeeCount: '',
		productionCapacity: '',
		mainMarkets: '',
		metaTitle: '',
		metaDescription: '',
		keywords: ''
	});

	// ---------- list state ----------
	let items = $state<SupplierListItem[]>([]);
	let total = $state(0);
	let page = $state(1);
	let search = $state('');
	let loading = $state(true);
	let loadFailure = $state<LoadFailure | null>(null);
	let requestId = 0;

	const totalPages = $derived(Math.max(1, Math.ceil(total / PAGE_SIZE)));

	// ---------- dialog state ----------
	let dialogOpen = $state(false);
	let editingSlug = $state('');
	let detailLoading = $state(false);
	let detailFailure = $state<LoadFailure | null>(null);
	let submitting = $state(false);
	let form = $state<SupplierFormState>(emptyForm());
	let formError = $state('');
	let fieldErrors = $state<Record<string, string>>({});
	let formEl = $state<HTMLFormElement | undefined>(undefined);

	// Collapsible section state
	let basicExpanded = $state(true);
	let contactExpanded = $state(false);
	let businessExpanded = $state(false);
	let seoExpanded = $state(false);

	// AI generation mock state
	let aiLoading = $state(false);

	// ---------- delete state ----------
	let confirmOpen = $state(false);
	let confirmSlug = $state('');
	let confirmName = $state('');
	let deleting = $state(false);

	const businessTypeLabels: Record<SupplierBusinessType, string> = {
		manufacturer: 'Manufacturer',
		wholesaler: 'Wholesaler',
		trader: 'Trader'
	};

	function inputValue(event: Event): string {
		const target = event.currentTarget;
		return target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement
			? target.value
			: '';
	}

	function slugify(s: string): string {
		return s
			.toLowerCase()
			.trim()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/(^-|-$)/g, '');
	}

	/** Server rows may hold nulls/legacy values — fall back to a schema-legal enum. */
	function asBusinessType(value: string | null | undefined): SupplierBusinessType {
		const allowed: readonly string[] = SUPPLIER_BUSINESS_TYPES;
		return value && allowed.includes(value) ? (value as SupplierBusinessType) : 'manufacturer';
	}
	function asStatus(value: string | null | undefined): SupplierStatus {
		const allowed: readonly string[] = SUPPLIER_STATUSES;
		return value && allowed.includes(value) ? (value as SupplierStatus) : 'pending';
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

	async function failureFromResponse(res: Response): Promise<LoadFailure> {
		const fallback = describeFetchFailure(res);
		const body = await readErrorBody(res);
		return { kind: 'server', status: res.status, message: body.error ?? fallback.message };
	}

	/** Debounced list fetch — `status=all` is the admin overview of every status. */
	async function loadList() {
		const id = ++requestId;
		loading = true;
		try {
			const params = new SvelteURLSearchParams({
				limit: String(PAGE_SIZE),
				offset: String((page - 1) * PAGE_SIZE),
				status: 'all'
			});
			const term = search.trim();
			if (term) params.set('search', term);
			const res = await fetch(`/api/suppliers?${params.toString()}`);
			if (!res.ok) {
				if (id !== requestId) return;
				loadFailure = await failureFromResponse(res);
				items = [];
				total = 0;
				return;
			}
			const data = (await res.json()) as Partial<SupplierListResponse>;
			if (id !== requestId) return;
			items = Array.isArray(data.items) ? data.items : [];
			total = typeof data.total === 'number' ? data.total : 0;
			loadFailure = null;
		} catch (error) {
			if (id !== requestId) return;
			loadFailure = describeThrownFailure(error);
			items = [];
			total = 0;
		} finally {
			if (id === requestId) loading = false;
		}
	}

	$effect(() => {
		void search;
		void page;
		const timer = setTimeout(() => {
			void loadList();
		}, 250);
		return () => clearTimeout(timer);
	});

	function expandFor(keys: string[]) {
		if (!keys.length) return;
		const hit = (list: string[]) => keys.some((k) => list.includes(k));
		if (hit(CONTACT_KEYS)) contactExpanded = true;
		if (hit(BUSINESS_KEYS)) businessExpanded = true;
		if (hit(SEO_KEYS)) seoExpanded = true;
	}

	function applyFieldErrors(flat: Record<string, string[] | undefined>) {
		const next: Record<string, string> = {};
		for (const [key, messages] of Object.entries(flat)) {
			const first = messages?.[0];
			if (first) next[key] = first;
		}
		fieldErrors = next;
		expandFor(Object.keys(next));
	}

	function resetSections() {
		basicExpanded = true;
		contactExpanded = false;
		businessExpanded = false;
		seoExpanded = false;
	}

	function openCreate() {
		editingSlug = '';
		form = emptyForm();
		formError = '';
		fieldErrors = {};
		detailFailure = null;
		detailLoading = false;
		resetSections();
		dialogOpen = true;
	}

	function applyRowToForm(row: SupplierRow) {
		form = {
			slug: row.slug,
			name: row.name ?? '',
			country: row.country ?? '',
			businessType: asBusinessType(row.businessType),
			isBrand: row.isBrand ?? false,
			status: asStatus(row.status),
			logoInitials: row.logoInitials ?? '',
			description: row.description ?? '',
			coverImage: row.coverImage ?? '',
			yearEstablished: row.yearEstablished != null ? String(row.yearEstablished) : '',
			website: row.website ?? '',
			email: row.email ?? '',
			phone: row.phone ?? '',
			whatsapp: row.whatsapp ?? '',
			line: row.line ?? '',
			employeeCount: row.employeeCount ?? '',
			productionCapacity: row.productionCapacity ?? '',
			mainMarkets: parseSupplierJson<string[]>(row.mainMarkets, []).join(', '),
			metaTitle: row.metaTitle ?? '',
			metaDescription: row.metaDescription ?? '',
			keywords: row.keywords ?? ''
		};
	}

	/** The list projection only carries the table columns, so the contact/business
	 *  columns are fetched on demand for the single row being edited. */
	async function loadDetail(slug: string) {
		if (!slug) return;
		detailLoading = true;
		detailFailure = null;
		try {
			const res = await fetch(`/api/suppliers/${encodeURIComponent(slug)}`);
			if (!res.ok) {
				if (editingSlug === slug) detailFailure = await failureFromResponse(res);
				return;
			}
			const row = (await res.json()) as Partial<SupplierRow>;
			if (editingSlug !== slug || typeof row.slug !== 'string' || typeof row.name !== 'string') {
				return;
			}
			applyRowToForm(row as SupplierRow);
		} catch (error) {
			if (editingSlug === slug) detailFailure = describeThrownFailure(error);
		} finally {
			if (editingSlug === slug) detailLoading = false;
		}
	}

	function openEdit(item: SupplierListItem) {
		editingSlug = item.slug;
		form = {
			...emptyForm(),
			slug: item.slug,
			name: item.name,
			country: item.country ?? '',
			businessType: asBusinessType(item.businessType),
			isBrand: item.isBrand ?? false,
			status: asStatus(item.status),
			logoInitials: item.logoInitials ?? '',
			description: item.description ?? ''
		};
		formError = '';
		fieldErrors = {};
		resetSections();
		dialogOpen = true;
		void loadDetail(item.slug);
	}

	function onNameInput(value: string) {
		form.name = value;
		if (!editingSlug) {
			form.slug = slugify(value);
			form.logoInitials = initialsFromName(value);
		}
		if (fieldErrors.name) fieldErrors = { ...fieldErrors, name: '' };
		if (!editingSlug && fieldErrors.slug) fieldErrors = { ...fieldErrors, slug: '' };
	}

	function generateDescription() {
		aiLoading = true;
		// Mock AI generation — simulates a network delay (real generator lives in
		// #lib/server/ai and is wired through the AI tools endpoint, not here).
		setTimeout(() => {
			const name = form.name || 'This company';
			const type = businessTypeLabels[form.businessType]?.toLowerCase() ?? 'supplier';
			const country = form.country || 'their region';
			const year = form.yearEstablished || 'recently';
			form.description =
				`${name} is a halal-certified ${type} based in ${country}, established in ${year}. ` +
				`They specialize in sourcing and supplying high-quality halal products to international markets. ` +
				`With a commitment to compliance and quality assurance, they serve buyers across Southeast Asia, ` +
				`the Middle East, and beyond.`;
			aiLoading = false;
		}, 800);
	}

	function clearField(key: string) {
		if (fieldErrors[key]) fieldErrors = { ...fieldErrors, [key]: '' };
	}

	async function save() {
		// §3.4: one in-flight submit. A failed detail load means columns we cannot
		// see would be overwritten, so writing is blocked until it succeeds.
		if (submitting || detailLoading || detailFailure) return;

		const body = toSupplierPayload(form);

		// Client-side pass with the server's own schema (identical rules).
		const local = SupplierCreateSchema.safeParse(body);
		if (!local.success) {
			applyFieldErrors(local.error.flatten().fieldErrors);
			formError = '';
			focusFirstInvalid(formEl);
			return;
		}

		fieldErrors = {};
		formError = '';
		submitting = true;

		const isEdit = Boolean(editingSlug);
		try {
			const res = await fetch(
				isEdit ? `/api/suppliers/${encodeURIComponent(editingSlug)}` : '/api/suppliers',
				{
					method: isEdit ? 'PUT' : 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(body)
				}
			);

			if (!res.ok) {
				// Typed values stay in the form: a failed save never clears input.
				const server = await readErrorBody(res);
				fieldErrors = mergeServerDetails(fieldErrors, server.details);
				expandFor(Object.keys(fieldErrors));
				const message =
					server.error && server.error !== 'Validation failed'
						? server.error
						: 'Please fix the highlighted fields.';
				formError = message;
				toast.error(message);
				focusFirstInvalid(formEl);
				return;
			}

			toast.success(isEdit ? 'Supplier updated' : 'Supplier created');
			dialogOpen = false;
			await loadList();
		} catch {
			formError = 'Network error — check your connection and try again.';
			toast.error('Network error — nothing was saved.');
		} finally {
			submitting = false;
		}
	}

	function requestDelete(item: SupplierListItem) {
		confirmSlug = item.slug;
		confirmName = item.name;
		confirmOpen = true;
	}

	async function confirmedRemove() {
		const slug = confirmSlug;
		if (!slug || deleting) return;
		deleting = true;
		try {
			const res = await fetch(`/api/suppliers/${encodeURIComponent(slug)}`, {
				method: 'DELETE'
			});
			if (res.ok) {
				toast.success('Supplier deleted');
				await loadList();
			} else {
				const body = await readErrorBody(res);
				toast.error(body.error ?? 'Delete failed');
			}
		} catch {
			toast.error('Network error');
		} finally {
			deleting = false;
			confirmSlug = '';
			confirmName = '';
		}
	}
</script>

<svelte:head><title>Suppliers — HalalNeo Admin</title></svelte:head>

<div class="space-y-4 sm:space-y-6">
	<div class="flex flex-wrap items-end justify-between gap-4">
		<div class="flex flex-col gap-1">
			<h1 class="text-2xl font-semibold tracking-tight sm:text-3xl">Suppliers</h1>
			<p class="max-w-2xl text-sm text-muted-foreground">
				Seller accounts and supplier company profiles listed in the marketplace.
			</p>
		</div>
		<div class="flex items-center gap-2">
			<Button variant="default" onclick={openCreate} disabled={submitting}>
				<Plus class="size-4" />
				New supplier
			</Button>
		</div>
	</div>

	<div class="relative max-w-sm">
		<Search
			class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
		/>
		<Input
			bind:value={search}
			oninput={() => {
				page = 1;
			}}
			placeholder="Search suppliers..."
			class="pl-9"
		/>
	</div>

	{#if loadFailure}
		<ErrorRetry failure={loadFailure} subject="suppliers" onretry={loadList} />
	{:else}
		<div class="overflow-x-auto rounded-xl ring-1 ring-foreground/10">
			<Table>
				<TableHeader>
					<TableRow class="hover:bg-transparent">
						<TableHead>Supplier</TableHead>
						<TableHead>Type</TableHead>
						<TableHead>Country</TableHead>
						<TableHead>Profile</TableHead>
						<TableHead>Status</TableHead>
						<TableHead class="text-right">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{#if loading}
						{#each SKELETON_ROWS as row (row)}
							<TableRow>
								<TableCell>
									<div class="flex items-center gap-3">
										<Skeleton class="size-8 rounded-lg"></Skeleton>
										<div>
											<Skeleton class="h-4 w-36"></Skeleton>
											<Skeleton class="mt-2 h-3 w-24"></Skeleton>
										</div>
									</div>
								</TableCell>
								<TableCell><Skeleton class="h-4 w-24"></Skeleton></TableCell>
								<TableCell><Skeleton class="h-4 w-20"></Skeleton></TableCell>
								<TableCell><Skeleton class="h-4 w-40"></Skeleton></TableCell>
								<TableCell><Skeleton class="h-5 w-20 rounded-full"></Skeleton></TableCell>
								<TableCell class="text-right"
									><Skeleton class="ml-auto h-4 w-12"></Skeleton></TableCell
								>
							</TableRow>
						{/each}
					{:else if items.length === 0}
						<TableRow>
							<TableCell colspan={6} class="py-8">
								<Empty>
									<EmptyHeader>
										<BrandedEmptyMedia variant="icon">
											<Building2 />
										</BrandedEmptyMedia>
										<EmptyTitle>
											{search.trim() ? 'No suppliers match your search' : 'No suppliers yet'}
										</EmptyTitle>
										<EmptyDescription>
											{search.trim()
												? 'Try a different keyword, or clear the search to see every supplier.'
												: 'Add the first company profile so approved suppliers can be listed.'}
										</EmptyDescription>
									</EmptyHeader>
									<EmptyContent>
										{#if search.trim()}
											<Button
												variant="outline"
												size="sm"
												onclick={() => {
													search = '';
												}}>Clear search</Button
											>
										{:else}
											<Button variant="default" size="sm" onclick={openCreate}>
												<Plus class="size-4" />
												New supplier
											</Button>
										{/if}
									</EmptyContent>
								</Empty>
							</TableCell>
						</TableRow>
					{:else}
						{#each items as m (m.slug)}
							<TableRow>
								<TableCell>
									<div class="flex items-center gap-3">
										<div
											class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-xs font-semibold text-primary"
										>
											{m.logoInitials || initialsFromName(m.name)}
										</div>
										<div class="min-w-0">
											<p class="truncate font-medium">{m.name}</p>
											<p class="truncate text-xs text-muted-foreground">{m.slug}</p>
										</div>
									</div>
								</TableCell>
								<TableCell
									>{businessTypeLabels[asBusinessType(m.businessType)]}{m.isBrand
										? ' · brand'
										: ''}</TableCell
								>
								<TableCell>{m.country}</TableCell>
								<TableCell class="max-w-[16rem]">
									<span class="line-clamp-2 text-sm text-muted-foreground"
										>{m.description || '—'}</span
									>
								</TableCell>
								<TableCell>
									<Badge variant={m.status === 'active' ? 'default' : 'secondary'}
										>{m.status ?? '—'}</Badge
									>
								</TableCell>
								<TableCell class="text-right">
									<div class="flex items-center justify-end gap-1">
										<Button
											variant="ghost"
											size="icon"
											aria-label="Edit"
											disabled={deleting}
											onclick={() => openEdit(m)}
										>
											<Pencil />
										</Button>
										<Button
											variant="ghost"
											size="icon"
											aria-label="Delete"
											class="hover:bg-destructive/10 hover:text-destructive"
											disabled={deleting}
											onclick={() => requestDelete(m)}
										>
											{#if deleting && confirmSlug === m.slug}
												<Loader2 class="animate-spin" />
											{:else}
												<Trash2 />
											{/if}
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
	{/if}
</div>

<Dialog bind:open={dialogOpen}>
	<DialogContent class="max-h-[85dvh] overflow-y-auto sm:max-w-lg">
		<DialogHeader>
			<DialogTitle>{editingSlug ? 'Edit supplier' : 'New supplier'}</DialogTitle>
			<DialogDescription>
				Create or update a supplier company profile in the marketplace.
			</DialogDescription>
		</DialogHeader>

		{#if detailFailure}
			<ErrorRetry
				failure={detailFailure}
				subject="this supplier"
				onretry={() => loadDetail(editingSlug)}
			/>
		{:else if detailLoading}
			<div class="flex flex-col gap-3">
				<Skeleton class="h-9 w-full"></Skeleton>
				<Skeleton class="h-9 w-full"></Skeleton>
				<Skeleton class="h-9 w-2/3"></Skeleton>
			</div>
		{:else}
			<form
				bind:this={formEl}
				onsubmit={(e) => {
					e.preventDefault();
					void save();
				}}
				class="flex flex-col gap-4"
			>
				<!-- ===================== BASIC INFO (always expanded) ===================== -->
				<CollapsibleSection title="Basic Info" bind:open={basicExpanded}>
					<Field.Field>
						<Field.FieldLabel>Name *</Field.FieldLabel>
						<Input
							value={form.name}
							oninput={(e) => onNameInput(inputValue(e))}
							placeholder="Company name"
							aria-invalid={!!fieldErrors.name || undefined}
						/>
						{#if fieldErrors.name}<FieldError>{fieldErrors.name}</FieldError>{/if}
					</Field.Field>

					<div class="grid grid-cols-2 gap-4">
						<Field.Field>
							<Field.FieldLabel>Slug</Field.FieldLabel>
							<Input
								bind:value={form.slug}
								placeholder="company-name"
								disabled={!!editingSlug}
								aria-invalid={!!fieldErrors.slug || undefined}
								oninput={() => clearField('slug')}
							/>
							{#if fieldErrors.slug}<FieldError>{fieldErrors.slug}</FieldError>{/if}
						</Field.Field>
						<Field.Field>
							<Field.FieldLabel>Country *</Field.FieldLabel>
							<Input
								bind:value={form.country}
								placeholder="Indonesia"
								aria-invalid={!!fieldErrors.country || undefined}
								oninput={() => clearField('country')}
							/>
							{#if fieldErrors.country}<FieldError>{fieldErrors.country}</FieldError>{/if}
						</Field.Field>
					</div>

					<div class="grid grid-cols-2 gap-4">
						<Field.Field>
							<Field.FieldLabel>Business type</Field.FieldLabel>
							<Select bind:value={form.businessType} type="single">
								<SelectTrigger class="w-full">
									{businessTypeLabels[form.businessType]}
								</SelectTrigger>
								<SelectContent>
									<SelectGroup>
										{#each Object.entries(businessTypeLabels) as [value, label] (value)}
											<SelectItem {value}>{label}</SelectItem>
										{/each}
									</SelectGroup>
								</SelectContent>
							</Select>
							{#if fieldErrors.businessType}
								<FieldError>{fieldErrors.businessType}</FieldError>
							{/if}
						</Field.Field>
						<Field.Field>
							<Field.FieldLabel>Status</Field.FieldLabel>
							<Select bind:value={form.status} type="single">
								<SelectTrigger class="w-full">{form.status}</SelectTrigger>
								<SelectContent>
									<SelectGroup>
										{#each SUPPLIER_STATUSES as value (value)}
											<SelectItem {value}>{value}</SelectItem>
										{/each}
									</SelectGroup>
								</SelectContent>
							</Select>
							{#if fieldErrors.status}<FieldError>{fieldErrors.status}</FieldError>{/if}
						</Field.Field>
					</div>

					<div class="grid grid-cols-2 gap-4">
						<Field.Field>
							<Field.FieldLabel>Year established</Field.FieldLabel>
							<Input
								value={form.yearEstablished}
								oninput={(e) => {
									form.yearEstablished = inputValue(e);
									clearField('yearEstablished');
								}}
								type="number"
								min="1900"
								max={new Date().getFullYear() + 1}
								aria-invalid={!!fieldErrors.yearEstablished || undefined}
							/>
							{#if fieldErrors.yearEstablished}
								<FieldError>{fieldErrors.yearEstablished}</FieldError>
							{/if}
						</Field.Field>
						<Field.Field>
							<Field.FieldLabel>Logo initials</Field.FieldLabel>
							<Input
								bind:value={form.logoInitials}
								placeholder="NF"
								aria-invalid={!!fieldErrors.logoInitials || undefined}
								oninput={() => clearField('logoInitials')}
							/>
							{#if fieldErrors.logoInitials}
								<FieldError>{fieldErrors.logoInitials}</FieldError>
							{/if}
						</Field.Field>
					</div>

					<Field.Field orientation="horizontal" class="flex-row items-center gap-3">
						<Switch bind:checked={form.isBrand} disabled={submitting} />
						<Field.FieldLabel class="font-normal">Brand (sells under own label)</Field.FieldLabel>
					</Field.Field>

					<Field.Field>
						<Field.FieldLabel>Cover Image URL</Field.FieldLabel>
						<Input
							bind:value={form.coverImage}
							placeholder="https://..."
							aria-invalid={!!fieldErrors.coverImage || undefined}
							oninput={() => clearField('coverImage')}
						/>
						{#if fieldErrors.coverImage}<FieldError>{fieldErrors.coverImage}</FieldError>{/if}
					</Field.Field>
				</CollapsibleSection>

				<!-- ===================== CONTACT DETAILS (collapsed) ===================== -->
				<CollapsibleSection title="Contact Details" bind:open={contactExpanded}>
					<Field.Field>
						<Field.FieldLabel>Website</Field.FieldLabel>
						<Input
							bind:value={form.website}
							placeholder="https://example.com"
							aria-invalid={!!fieldErrors.website || undefined}
							oninput={() => clearField('website')}
						/>
						{#if fieldErrors.website}<FieldError>{fieldErrors.website}</FieldError>{/if}
					</Field.Field>

					<div class="grid grid-cols-2 gap-4">
						<Field.Field>
							<Field.FieldLabel>Email</Field.FieldLabel>
							<Input
								bind:value={form.email}
								type="email"
								placeholder="info@company.com"
								aria-invalid={!!fieldErrors.email || undefined}
								oninput={() => clearField('email')}
							/>
							{#if fieldErrors.email}<FieldError>{fieldErrors.email}</FieldError>{/if}
						</Field.Field>
						<Field.Field>
							<Field.FieldLabel>Phone</Field.FieldLabel>
							<Input
								bind:value={form.phone}
								placeholder="+62 21 1234 5678"
								aria-invalid={!!fieldErrors.phone || undefined}
								oninput={() => clearField('phone')}
							/>
							{#if fieldErrors.phone}<FieldError>{fieldErrors.phone}</FieldError>{/if}
						</Field.Field>
					</div>

					<div class="grid grid-cols-2 gap-4">
						<Field.Field>
							<Field.FieldLabel>WhatsApp</Field.FieldLabel>
							<Input
								bind:value={form.whatsapp}
								placeholder="+62 812 3456 7890"
								aria-invalid={!!fieldErrors.whatsapp || undefined}
								oninput={() => clearField('whatsapp')}
							/>
							{#if fieldErrors.whatsapp}<FieldError>{fieldErrors.whatsapp}</FieldError>{/if}
						</Field.Field>
						<Field.Field>
							<Field.FieldLabel>LINE</Field.FieldLabel>
							<Input
								bind:value={form.line}
								placeholder="@company_id"
								aria-invalid={!!fieldErrors.line || undefined}
								oninput={() => clearField('line')}
							/>
							{#if fieldErrors.line}<FieldError>{fieldErrors.line}</FieldError>{/if}
						</Field.Field>
					</div>
				</CollapsibleSection>

				<!-- ===================== BUSINESS DETAILS (collapsed) ===================== -->
				<CollapsibleSection title="Business Details" bind:open={businessExpanded}>
					<div class="grid grid-cols-2 gap-4">
						<Field.Field>
							<Field.FieldLabel>Employee count</Field.FieldLabel>
							<Input
								bind:value={form.employeeCount}
								placeholder="50-100"
								aria-invalid={!!fieldErrors.employeeCount || undefined}
								oninput={() => clearField('employeeCount')}
							/>
							{#if fieldErrors.employeeCount}
								<FieldError>{fieldErrors.employeeCount}</FieldError>
							{/if}
						</Field.Field>
						<Field.Field>
							<Field.FieldLabel>Production capacity</Field.FieldLabel>
							<Input
								bind:value={form.productionCapacity}
								placeholder="10,000 units/month"
								aria-invalid={!!fieldErrors.productionCapacity || undefined}
								oninput={() => clearField('productionCapacity')}
							/>
							{#if fieldErrors.productionCapacity}
								<FieldError>{fieldErrors.productionCapacity}</FieldError>
							{/if}
						</Field.Field>
					</div>

					<Field.Field>
						<Field.FieldLabel>Main markets</Field.FieldLabel>
						<Input
							bind:value={form.mainMarkets}
							placeholder="Indonesia, Malaysia, UAE"
							aria-invalid={!!fieldErrors.mainMarkets || undefined}
							oninput={() => clearField('mainMarkets')}
						/>
						<Field.FieldDescription>Comma-separated list of countries.</Field.FieldDescription>
						{#if fieldErrors.mainMarkets}<FieldError>{fieldErrors.mainMarkets}</FieldError>{/if}
					</Field.Field>

					{#if editingSlug}
						<p class="text-xs text-muted-foreground">
							Halal certifications are managed by the supplier in their own portal, so this form
							never rewrites them.
						</p>
					{/if}

					<Field.Field>
						<div class="flex items-center justify-between">
							<Field.FieldLabel>Description</Field.FieldLabel>
							<Button
								variant="outline"
								size="sm"
								type="button"
								onclick={generateDescription}
								disabled={aiLoading || submitting}
							>
								{#if aiLoading}
									<Loader2 class="size-3 animate-spin" />
								{:else}
									<Sparkles class="size-3" />
								{/if}
								Generate
							</Button>
						</div>
						<Textarea
							bind:value={form.description}
							rows={4}
							placeholder="Company description..."
							aria-invalid={!!fieldErrors.description || undefined}
						/>
						{#if fieldErrors.description}<FieldError>{fieldErrors.description}</FieldError>{/if}
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
							aria-invalid={!!fieldErrors.metaTitle || undefined}
							oninput={() => clearField('metaTitle')}
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
							aria-invalid={!!fieldErrors.metaDescription || undefined}
						/>
						{#if fieldErrors.metaDescription}
							<FieldError>{fieldErrors.metaDescription}</FieldError>
						{/if}
					</Field.Field>
					<Field.Field>
						<Field.FieldLabel>Keywords</Field.FieldLabel>
						<Input
							bind:value={form.keywords}
							placeholder="Comma separated: halal, supplier, indonesia"
							aria-invalid={!!fieldErrors.keywords || undefined}
							oninput={() => clearField('keywords')}
						/>
						{#if fieldErrors.keywords}<FieldError>{fieldErrors.keywords}</FieldError>{/if}
					</Field.Field>
				</CollapsibleSection>

				{#if formError}
					<p class="text-sm text-destructive">{formError}</p>
				{/if}
			</form>
		{/if}

		<DialogFooter>
			<Button
				variant="outline"
				type="button"
				onclick={() => {
					dialogOpen = false;
					detailFailure = null;
				}}>Cancel</Button
			>
			<Button
				variant="default"
				type="button"
				disabled={submitting || detailLoading || !!detailFailure}
				onclick={() => void save()}
			>
				{#if submitting}
					<Loader2 class="size-4 animate-spin" />
					Saving…
				{:else}
					{editingSlug ? 'Save changes' : 'Create supplier'}
				{/if}
			</Button>
		</DialogFooter>
	</DialogContent>
</Dialog>

<ConfirmDialog
	bind:open={confirmOpen}
	title="Delete supplier?"
	description={confirmSlug
		? `Delete supplier ${confirmName}? Their catalogue must be empty first — otherwise set them to "suspended".`
		: undefined}
	confirmLabel={deleting ? 'Deleting…' : 'Delete'}
	onconfirm={confirmedRemove}
/>
