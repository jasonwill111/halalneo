<script lang="ts">
	import { tick } from 'svelte';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
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
	import Search from '@lucide/svelte/icons/search';
	import Plus from '@lucide/svelte/icons/plus';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import RefreshCw from '@lucide/svelte/icons/refresh-cw';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import WifiOff from '@lucide/svelte/icons/wifi-off';
	import { Empty, EmptyContent } from '#lib/components/ui/empty/index.js';
	import BrandedEmptyMedia from '#lib/components/site/branded-empty-media.svelte';
	import CollapsibleSection from '#lib/components/site/collapsible-section.svelte';
	import StatTile from '#lib/components/site/stat-tile.svelte';
	import ConfirmDialog from '#lib/components/site/confirm-dialog.svelte';
	import FilterPills from '#lib/components/site/filter-pills.svelte';
	import { toast } from 'svelte-sonner';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import {
		focusFirstInvalid,
		mergeServerDetails,
		type ServerFieldDetails
	} from '#lib/utils/forms.js';
	import {
		SERVICE_PROVIDER_STATUSES,
		SERVICE_PROVIDER_TYPE_LABELS,
		serviceProviderCreateSchema,
		serviceProviderUpdateSchema,
		type ServiceProviderCreateInput,
		type ServiceProviderListResponse,
		type ServiceProviderRecord,
		type ServiceProviderStatus,
		type ServiceProviderType
	} from '#lib/schemas/service-providers.js';

	let search = $state('');
	let items = $state<ServiceProviderRecord[]>([]);
	let total = $state(0);
	let loading = $state(true);
	let loadError = $state('');
	/** Network failures and server errors must look different (§3.1). */
	let offline = $state(false);
	// Plain string so it binds to <FilterPills>; the API validates it against
	// the service-provider status enum ('active' | 'pending' | 'suspended').
	let statusFilter = $state('active');

	let dialogOpen = $state(false);
	let editing = $state<ServiceProviderRecord | null>(null);
	let saving = $state(false);
	let deleting = $state(false);
	let confirmSlug = $state<string | null>(null);
	let confirmName = $state('');

	type ProviderForm = {
		slug: string;
		name: string;
		type: ServiceProviderType;
		country: string;
		description: string;
		rating: string;
		status: ServiceProviderStatus;
		website: string;
		email: string;
		phone: string;
		whatsapp: string;
		line: string;
		metaTitle: string;
		metaDescription: string;
		keywords: string;
	};
	const emptyForm = (): ProviderForm => ({
		slug: '',
		name: '',
		type: 'certification',
		country: '',
		description: '',
		rating: '',
		status: 'active',
		website: '',
		email: '',
		phone: '',
		whatsapp: '',
		line: '',
		metaTitle: '',
		metaDescription: '',
		keywords: ''
	});
	let form = $state<ProviderForm>(emptyForm());
	let formError = $state('');
	let fieldErrors = $state<Record<string, string>>({});
	let formEl = $state<HTMLFormElement | undefined>(undefined);

	// Collapsible section state
	let contactExpanded = $state(false);
	let seoExpanded = $state(false);

	const typeLabels = SERVICE_PROVIDER_TYPE_LABELS;
	const statusOptions = SERVICE_PROVIDER_STATUSES.map((s) => ({ value: s, label: s }));

	/** The API caps at 100 rows per request (§5.9); the table filters locally. */
	const filtered = $derived.by(() => {
		if (!search.trim()) return items;
		const q = search.toLowerCase();
		return items.filter(
			(sp) =>
				sp.name.toLowerCase().includes(q) ||
				(sp.country ?? '').toLowerCase().includes(q) ||
				sp.slug.includes(q)
		);
	});

	const ratedCount = $derived(items.filter((sp) => sp.rating != null).length);
	const avgRating = $derived(
		ratedCount > 0
			? (items.reduce((sum, sp) => sum + (sp.rating ?? 0), 0) / ratedCount).toFixed(1)
			: '—'
	);

	function slugify(s: string): string {
		return s
			.toLowerCase()
			.trim()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/(^-|-$)/g, '');
	}

	async function loadItems() {
		loading = true;
		loadError = '';
		offline = false;
		try {
			const params = new SvelteURLSearchParams({ limit: '100', status: statusFilter });
			const res = await fetch(`/api/service-providers?${params}`);
			if (!res.ok) {
				const body = (await res.json().catch(() => ({}))) as { error?: string };
				loadError = body.error || `Could not load service providers (HTTP ${res.status}).`;
				items = [];
				total = 0;
				return;
			}
			const data = (await res.json().catch(() => null)) as ServiceProviderListResponse | null;
			items = data?.items ?? [];
			total = data?.total ?? items.length;
		} catch {
			offline = true;
			loadError = 'Network error — the server could not be reached.';
			items = [];
			total = 0;
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		void statusFilter;
		void loadItems();
	});

	function openCreate() {
		editing = null;
		form = emptyForm();
		fieldErrors = {};
		formError = '';
		contactExpanded = false;
		seoExpanded = false;
		dialogOpen = true;
	}

	function openEdit(sp: ServiceProviderRecord) {
		editing = sp;
		form = {
			slug: sp.slug,
			name: sp.name,
			type: sp.type,
			country: sp.country,
			description: sp.description ?? '',
			rating: sp.rating != null ? String(sp.rating) : '',
			status: sp.status ?? 'pending',
			website: sp.website ?? '',
			email: sp.email ?? '',
			phone: sp.phone ?? '',
			whatsapp: sp.whatsapp ?? '',
			line: sp.line ?? '',
			metaTitle: sp.metaTitle ?? '',
			metaDescription: sp.metaDescription ?? '',
			keywords: sp.keywords ?? ''
		};
		fieldErrors = {};
		formError = '';
		contactExpanded = false;
		seoExpanded = false;
		dialogOpen = true;
	}

	function optional(value: string): string | null {
		const trimmed = value.trim();
		return trimmed.length ? trimmed : null;
	}

	/** One payload feeds both schemas; `slug` is stripped server-side on PUT (§6.4). */
	function buildPayload(): ServiceProviderCreateInput {
		const rating = form.rating.trim();
		return {
			slug: (form.slug || slugify(form.name)).trim(),
			name: form.name.trim(),
			type: form.type,
			country: form.country.trim(),
			description: optional(form.description),
			website: optional(form.website),
			email: optional(form.email),
			phone: optional(form.phone),
			whatsapp: optional(form.whatsapp),
			line: optional(form.line),
			rating: rating === '' ? null : Number(rating),
			status: form.status,
			metaTitle: optional(form.metaTitle),
			metaDescription: optional(form.metaDescription),
			keywords: optional(form.keywords)
		};
	}

	async function showFieldErrors(details: ServerFieldDetails) {
		fieldErrors = mergeServerDetails({}, details);
		await tick();
		focusFirstInvalid(formEl);
	}

	async function save(e: SubmitEvent) {
		e.preventDefault();
		fieldErrors = {};
		formError = '';

		const payload = buildPayload();
		const parsed = editing
			? serviceProviderUpdateSchema.safeParse(payload)
			: serviceProviderCreateSchema.safeParse(payload);
		if (!parsed.success) {
			await showFieldErrors(parsed.error.flatten().fieldErrors);
			return;
		}

		saving = true;
		try {
			const res = await fetch(
				editing
					? `/api/service-providers/${encodeURIComponent(editing.slug)}`
					: '/api/service-providers',
				{
					method: editing ? 'PUT' : 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(payload)
				}
			);
			if (res.ok) {
				dialogOpen = false;
				toast.success(editing ? 'Provider updated' : 'Provider created');
				// The saved row must stay visible: jump to its status tab, which
				// re-runs the load effect, or reload the current tab in place.
				if (form.status !== statusFilter) statusFilter = form.status;
				else await loadItems();
				return;
			}
			// Failed write: dialog stays open and every input keeps its value (§3.4).
			const body = (await res.json().catch(() => ({}))) as {
				error?: string;
				details?: ServerFieldDetails;
			};
			if (res.status === 400 && body.details) {
				await showFieldErrors(body.details);
			}
			formError = body.error || 'Could not save this provider.';
			toast.error(formError);
		} catch {
			formError = 'Network error — your changes were not saved.';
			toast.error(formError);
		} finally {
			saving = false;
		}
	}

	function remove(sp: ServiceProviderRecord) {
		confirmSlug = sp.slug;
		confirmName = sp.name;
	}

	async function confirmedRemove() {
		if (!confirmSlug) return;
		const slug = confirmSlug;
		deleting = true;
		try {
			const res = await fetch(`/api/service-providers/${encodeURIComponent(slug)}`, {
				method: 'DELETE'
			});
			if (res.ok) {
				toast.success('Provider deleted');
				await loadItems();
			} else {
				const body = (await res.json().catch(() => ({}))) as { error?: string };
				toast.error(body.error || 'Could not delete this provider.');
			}
		} catch {
			toast.error('Network error — the provider was not deleted.');
		} finally {
			deleting = false;
			confirmSlug = null;
			confirmName = '';
		}
	}

	function statusColor(s: ServiceProviderStatus | null): string {
		if (s === 'active') return 'bg-success/10 text-success';
		if (s === 'pending') return 'bg-warn/10 text-warn';
		if (s === 'suspended') return 'bg-destructive/10 text-destructive';
		return 'bg-muted text-muted-foreground';
	}
</script>

<svelte:head>
	<title>Service Providers — HalalNeo Admin</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="space-y-4 sm:space-y-6">
	<div class="flex flex-wrap items-end justify-between gap-4">
		<div class="flex flex-col gap-1">
			<h1 class="text-2xl font-semibold tracking-tight sm:text-3xl">Service Providers</h1>
			<p class="max-w-2xl text-sm text-muted-foreground">
				Manage certification, logistics, and consulting service providers.
			</p>
		</div>
		<Button variant="default" size="sm" onclick={openCreate}>
			<Plus class="size-4"></Plus>
			Add Provider
		</Button>
	</div>

	<div class="flex flex-wrap items-center gap-2">
		<div class="relative w-full max-w-sm">
			<Search
				class="pointer-events-none absolute top-1/2 start-2.5 size-4 -translate-y-1/2 text-muted-foreground"
			></Search>
			<Input bind:value={search} placeholder="Search providers..." class="ps-9" />
		</div>
		<FilterPills
			options={statusOptions}
			bind:value={statusFilter}
			ariaLabel="Filter service providers by status"
		/>
	</div>

	<div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
		<StatTile value={total} label={`Providers (${statusFilter})`} {loading} />
		<StatTile value={ratedCount} label="With Rating" {loading} />
		<StatTile value={avgRating} label="Avg. Rating" {loading} />
	</div>

	<div class="overflow-x-auto rounded-xl ring-1 ring-foreground/10">
		<Table>
			<TableHeader>
				<TableRow class="hover:bg-transparent">
					<TableHead>Name</TableHead>
					<TableHead>Type</TableHead>
					<TableHead>Country</TableHead>
					<TableHead>Rating</TableHead>
					<TableHead>Status</TableHead>
					<TableHead class="text-end">Actions</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{#if loading}
					{#each [0, 1, 2, 3] as row (row)}
						<TableRow>
							<TableCell><Skeleton class="h-4 w-40" /></TableCell>
							<TableCell><Skeleton class="h-4 w-24" /></TableCell>
							<TableCell><Skeleton class="h-4 w-20" /></TableCell>
							<TableCell><Skeleton class="h-4 w-10" /></TableCell>
							<TableCell><Skeleton class="h-4 w-16" /></TableCell>
							<TableCell class="text-end"><Skeleton class="ms-auto h-8 w-16" /></TableCell>
						</TableRow>
					{/each}
				{:else if loadError}
					<TableRow>
						<TableCell colspan={6} class="py-8">
							<Empty>
								<BrandedEmptyMedia>
									{#if offline}
										<WifiOff class="size-6 text-muted-foreground" />
									{:else}
										<TriangleAlert class="size-6 text-destructive" />
									{/if}
								</BrandedEmptyMedia>
								<div class="space-y-1">
									<p class="font-medium">{offline ? 'Connection failed' : 'Could not load providers'}</p>
									<p class="text-sm text-muted-foreground">{loadError}</p>
								</div>
								<EmptyContent>
									<Button variant="outline" size="sm" onclick={() => loadItems()}>
										<RefreshCw class="size-4"></RefreshCw>
										Try again
									</Button>
								</EmptyContent>
							</Empty>
						</TableCell>
					</TableRow>
				{:else if filtered.length === 0}
					<TableRow>
						<TableCell colspan={6} class="py-8">
							<Empty>
								<BrandedEmptyMedia><ShieldCheck class="size-6 text-muted-foreground" /></BrandedEmptyMedia>
								<div class="space-y-1">
									<p class="font-medium">
										{search.trim() ? 'No matching providers' : 'No providers found'}
									</p>
									<p class="text-sm text-muted-foreground">
										{search.trim()
											? `Nothing matches “${search.trim()}” in ${statusFilter} providers.`
											: `No ${statusFilter} service providers yet — add one to get started.`}
									</p>
								</div>
								{#if !search.trim()}
									<EmptyContent>
										<Button variant="default" size="sm" onclick={openCreate}>
											<Plus class="size-4"></Plus>
											Add Provider
										</Button>
									</EmptyContent>
								{/if}
							</Empty>
						</TableCell>
					</TableRow>
				{:else}
					{#each filtered as sp (sp.slug)}
						<TableRow>
							<TableCell>
								<div class="min-w-0">
									<p class="truncate font-medium">{sp.name}</p>
									<p class="truncate text-xs text-muted-foreground">{sp.slug}</p>
								</div>
							</TableCell>
							<TableCell class="capitalize">{typeLabels[sp.type]}</TableCell>
							<TableCell>{sp.country}</TableCell>
							<TableCell>{sp.rating ?? '—'}</TableCell>
							<TableCell>
								<Badge
									variant="secondary"
									class={`px-1.5 py-0.5 text-2xs capitalize ${statusColor(sp.status)}`}
									>{sp.status}</Badge
								>
							</TableCell>
							<TableCell class="text-end">
								<div class="flex items-center justify-end gap-1">
									<Button
										variant="ghost"
										size="icon"
										aria-label="Edit"
										class="size-8"
										onclick={() => openEdit(sp)}
									>
										<Pencil class="size-3.5"></Pencil>
									</Button>
									<Button
										variant="ghost"
										size="icon"
										aria-label="Delete"
										class="size-8 hover:bg-destructive/10 hover:text-destructive"
										onclick={() => remove(sp)}
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

	{#if !loading && !loadError && total > items.length}
		<p class="text-xs text-muted-foreground">
			Showing {items.length} of {total} {statusFilter} providers (API caps at 100).
		</p>
	{/if}
</div>

<Dialog bind:open={dialogOpen}>
	<DialogContent class="max-h-[85dvh] overflow-y-auto sm:max-w-lg">
		<DialogHeader>
			<DialogTitle>{editing ? 'Edit provider' : 'New provider'}</DialogTitle>
			<DialogDescription>Create or update a service provider profile.</DialogDescription>
		</DialogHeader>

		<form id="provider-form" bind:this={formEl} onsubmit={save} class="flex flex-col gap-4">
			<Field.Field>
				<Field.FieldLabel>Name *</Field.FieldLabel>
				<Input
					bind:value={form.name}
					placeholder="Provider name"
					disabled={saving}
					aria-invalid={!!fieldErrors.name}
					oninput={() => {
						if (fieldErrors.name) fieldErrors = { ...fieldErrors, name: '' };
					}}
				/>
				{#if fieldErrors.name}
					<FieldError errors={[{ message: fieldErrors.name }]} />
				{/if}
			</Field.Field>

			<div class="grid grid-cols-2 gap-4">
				<Field.Field>
					<Field.FieldLabel>Slug</Field.FieldLabel>
					<Input
						bind:value={form.slug}
						placeholder="provider-name"
						disabled={!!editing || saving}
						aria-invalid={!!fieldErrors.slug}
						oninput={() => {
							if (fieldErrors.slug) fieldErrors = { ...fieldErrors, slug: '' };
						}}
					/>
					{#if fieldErrors.slug}
						<FieldError errors={[{ message: fieldErrors.slug }]} />
					{/if}
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel>Country *</Field.FieldLabel>
					<Input
						bind:value={form.country}
						placeholder="Malaysia"
						disabled={saving}
						aria-invalid={!!fieldErrors.country}
						oninput={() => {
							if (fieldErrors.country) fieldErrors = { ...fieldErrors, country: '' };
						}}
					/>
					{#if fieldErrors.country}
						<FieldError errors={[{ message: fieldErrors.country }]} />
					{/if}
				</Field.Field>
			</div>

			<div class="grid grid-cols-2 gap-4">
				<Field.Field>
					<Field.FieldLabel>Type</Field.FieldLabel>
					<Select bind:value={form.type} type="single">
						<SelectTrigger class="w-full" disabled={saving}>
							{typeLabels[form.type]}
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								{#each Object.entries(typeLabels) as [value, label] (value)}
									<SelectItem {value}>{label}</SelectItem>
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
								{#each SERVICE_PROVIDER_STATUSES as s (s)}
									<SelectItem value={s}>{s}</SelectItem>
								{/each}
							</SelectGroup>
						</SelectContent>
					</Select>
				</Field.Field>
			</div>

			<Field.Field>
				<Field.FieldLabel>Rating</Field.FieldLabel>
				<Input
					bind:value={form.rating}
					type="number"
					min="0"
					max="5"
					step="0.1"
					placeholder="4.5"
					disabled={saving}
					aria-invalid={!!fieldErrors.rating}
					oninput={() => {
						if (fieldErrors.rating) fieldErrors = { ...fieldErrors, rating: '' };
					}}
				/>
				{#if fieldErrors.rating}
					<FieldError errors={[{ message: fieldErrors.rating }]} />
				{/if}
			</Field.Field>

			<Field.Field>
				<Field.FieldLabel>Description</Field.FieldLabel>
				<Textarea
					bind:value={form.description}
					rows={3}
					placeholder="Provider description..."
					disabled={saving}
					aria-invalid={!!fieldErrors.description}
				/>
				{#if fieldErrors.description}
					<FieldError errors={[{ message: fieldErrors.description }]} />
				{/if}
			</Field.Field>

			<!-- ===================== CONTACT DETAILS (collapsed) ===================== -->
			<CollapsibleSection title="Contact Details" bind:open={contactExpanded}>
				<Field.Field>
					<Field.FieldLabel>Website</Field.FieldLabel>
					<Input
						bind:value={form.website}
						placeholder="https://example.com"
						disabled={saving}
						aria-invalid={!!fieldErrors.website}
					/>
					{#if fieldErrors.website}
						<FieldError errors={[{ message: fieldErrors.website }]} />
					{/if}
				</Field.Field>

				<div class="grid grid-cols-2 gap-4">
					<Field.Field>
						<Field.FieldLabel>Email</Field.FieldLabel>
						<Input
							bind:value={form.email}
							type="email"
							placeholder="info@company.com"
							disabled={saving}
							aria-invalid={!!fieldErrors.email}
							oninput={() => {
								if (fieldErrors.email) fieldErrors = { ...fieldErrors, email: '' };
							}}
						/>
						{#if fieldErrors.email}
							<FieldError errors={[{ message: fieldErrors.email }]} />
						{/if}
					</Field.Field>
					<Field.Field>
						<Field.FieldLabel>Phone</Field.FieldLabel>
						<Input bind:value={form.phone} placeholder="+60 3 1234 5678" disabled={saving} />
					</Field.Field>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<Field.Field>
						<Field.FieldLabel>WhatsApp</Field.FieldLabel>
						<Input bind:value={form.whatsapp} placeholder="+60 12 345 6789" disabled={saving} />
					</Field.Field>
					<Field.Field>
						<Field.FieldLabel>LINE</Field.FieldLabel>
						<Input bind:value={form.line} placeholder="@provider_id" disabled={saving} />
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
					/>
					{#if fieldErrors.metaTitle}
						<FieldError errors={[{ message: fieldErrors.metaTitle }]} />
					{/if}
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
					/>
					{#if fieldErrors.metaDescription}
						<FieldError errors={[{ message: fieldErrors.metaDescription }]} />
					{/if}
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel>Keywords</Field.FieldLabel>
					<Input
						bind:value={form.keywords}
						placeholder="Comma separated: halal, certification, malaysia"
						disabled={saving}
						aria-invalid={!!fieldErrors.keywords}
					/>
					{#if fieldErrors.keywords}
						<FieldError errors={[{ message: fieldErrors.keywords }]} />
					{/if}
				</Field.Field>
			</CollapsibleSection>
		</form>

		{#if formError}
			<p class="text-sm text-destructive">{formError}</p>
		{/if}

		<DialogFooter>
			<Button variant="outline" disabled={saving} onclick={() => (dialogOpen = false)}>Cancel</Button>
			<Button variant="default" type="submit" form="provider-form" disabled={saving}>
				{saving ? 'Saving…' : editing ? 'Save changes' : 'Create provider'}
			</Button>
		</DialogFooter>
	</DialogContent>
</Dialog>

<ConfirmDialog
	open={confirmSlug !== null}
	title="Delete provider?"
	description={confirmSlug
		? `Delete provider ${confirmName}? This cannot be undone.`
		: undefined}
	confirmLabel={deleting ? 'Deleting…' : 'Delete'}
	onconfirm={confirmedRemove}
/>
