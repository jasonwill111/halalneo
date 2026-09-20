<script lang="ts">
	import { tick } from 'svelte';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import { Button } from '#lib/components/ui/button/index.js';
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
		SelectContent,
		SelectItem,
		SelectTrigger
	} from '#lib/components/ui/select/index.js';
	import { Skeleton } from '#lib/components/ui/skeleton/index.js';
	import { Empty, EmptyContent } from '#lib/components/ui/empty/index.js';
	import BrandedEmptyMedia from '#lib/components/site/branded-empty-media.svelte';
	import Search from '@lucide/svelte/icons/search';
	import Plus from '@lucide/svelte/icons/plus';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import RefreshCw from '@lucide/svelte/icons/refresh-cw';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import WifiOff from '@lucide/svelte/icons/wifi-off';
	import CollapsibleSection from '#lib/components/site/collapsible-section.svelte';
	import ConfirmDialog from '#lib/components/site/confirm-dialog.svelte';
	import FilterPills from '#lib/components/site/filter-pills.svelte';
	import { toast } from 'svelte-sonner';
	import {
		focusFirstInvalid,
		mergeServerDetails,
		type ServerFieldDetails
	} from '#lib/utils/forms.js';
	import {
		CERTIFYING_BODY_STATUSES,
		certifyingBodyCreateSchema,
		certifyingBodyUpdateSchema,
		type CertifyingBodyCreateInput,
		type CertifyingBodyListResponse,
		type CertifyingBodyRecord,
		type CertifyingBodyStatus
	} from '#lib/schemas/certifying-bodies.js';

	let search = $state('');
	let items = $state<CertifyingBodyRecord[]>([]);
	let total = $state(0);
	let loading = $state(true);
	let loadError = $state('');
	/** Network failures and server errors must look different (§3.1). */
	let offline = $state(false);
	// Plain string so it binds to <FilterPills>; the API validates it against
	// the certifying-body status enum ('active' | 'pending' | 'inactive').
	let statusFilter = $state('active');

	let dialogOpen = $state(false);
	let editing = $state<CertifyingBodyRecord | null>(null);
	let seoExpanded = $state(false);
	let confirmId = $state<string | null>(null);
	let confirmName = $state('');
	let saving = $state(false);
	let deleting = $state(false);

	type BodyForm = {
		id: string;
		name: string;
		country: string;
		standard: string;
		website: string;
		description: string;
		status: CertifyingBodyStatus;
		metaTitle: string;
		metaDescription: string;
		keywords: string;
	};
	const emptyForm = (): BodyForm => ({
		id: '',
		name: '',
		country: '',
		standard: '',
		website: '',
		description: '',
		status: 'active',
		metaTitle: '',
		metaDescription: '',
		keywords: ''
	});
	let form = $state<BodyForm>(emptyForm());
	let formError = $state('');
	let fieldErrors = $state<Record<string, string>>({});
	let formEl = $state<HTMLFormElement | undefined>(undefined);

	const statusOptions = CERTIFYING_BODY_STATUSES.map((s) => ({ value: s, label: s }));

	/** The API caps at 100 rows per request (§5.9); the table filters locally. */
	const filtered = $derived.by(() => {
		if (!search.trim()) return items;
		const q = search.toLowerCase();
		return items.filter(
			(b) =>
				b.name.toLowerCase().includes(q) ||
				(b.country ?? '').toLowerCase().includes(q) ||
				(b.standard ?? '').toLowerCase().includes(q)
		);
	});

	function normalizeId(s: string): string {
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
			const res = await fetch(`/api/certifying-bodies?${params}`);
			if (!res.ok) {
				const body = (await res.json().catch(() => ({}))) as { error?: string };
				loadError = body.error || `Could not load certifying bodies (HTTP ${res.status}).`;
				items = [];
				total = 0;
				return;
			}
			const data = (await res.json().catch(() => null)) as CertifyingBodyListResponse | null;
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
		formError = '';
		fieldErrors = {};
		seoExpanded = false;
		dialogOpen = true;
	}

	function openEdit(b: CertifyingBodyRecord) {
		editing = b;
		form = {
			id: b.id,
			name: b.name,
			country: b.country,
			standard: b.standard ?? '',
			website: b.website ?? '',
			description: b.description ?? '',
			status: b.status ?? 'active',
			metaTitle: b.metaTitle ?? '',
			metaDescription: b.metaDescription ?? '',
			keywords: b.keywords ?? ''
		};
		formError = '';
		fieldErrors = {};
		seoExpanded = false;
		dialogOpen = true;
	}

	function optional(value: string): string | null {
		const trimmed = value.trim();
		return trimmed.length ? trimmed : null;
	}

	/** One payload feeds both schemas; `id` is stripped server-side on PUT (§6.4). */
	function buildPayload(): CertifyingBodyCreateInput {
		const id = normalizeId(form.id) || normalizeId(form.name);
		return {
			id: id || null,
			name: form.name.trim(),
			country: form.country.trim(),
			standard: optional(form.standard),
			website: optional(form.website),
			description: optional(form.description),
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
			? certifyingBodyUpdateSchema.safeParse(payload)
			: certifyingBodyCreateSchema.safeParse(payload);
		if (!parsed.success) {
			await showFieldErrors(parsed.error.flatten().fieldErrors);
			return;
		}

		saving = true;
		try {
			const res = await fetch(
				editing
					? `/api/certifying-bodies/${encodeURIComponent(editing.id)}`
					: '/api/certifying-bodies',
				{
					method: editing ? 'PUT' : 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(payload)
				}
			);
			if (res.ok) {
				dialogOpen = false;
				toast.success(editing ? 'Certifying body updated' : 'Certifying body created');
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
			formError = body.error || 'Could not save this certifying body.';
			toast.error(formError);
		} catch {
			formError = 'Network error — your changes were not saved.';
			toast.error(formError);
		} finally {
			saving = false;
		}
	}

	function remove(b: CertifyingBodyRecord) {
		confirmId = b.id;
		confirmName = b.name;
	}

	async function confirmedRemove() {
		if (!confirmId) return;
		const id = confirmId;
		deleting = true;
		try {
			const res = await fetch(`/api/certifying-bodies/${encodeURIComponent(id)}`, {
				method: 'DELETE'
			});
			if (res.ok) {
				toast.success('Certifying body deleted');
				await loadItems();
			} else {
				const body = (await res.json().catch(() => ({}))) as { error?: string };
				toast.error(body.error || 'Could not delete this certifying body.');
			}
		} catch {
			toast.error('Network error — the certifying body was not deleted.');
		} finally {
			deleting = false;
			confirmId = null;
			confirmName = '';
		}
	}
</script>

<svelte:head><title>Certifying Bodies — HalalNeo Admin</title></svelte:head>

<div class="space-y-4 sm:space-y-6">
	<div class="flex flex-wrap items-end justify-between gap-4">
		<div class="space-y-1">
			<h1 class="text-2xl font-semibold tracking-tight sm:text-3xl">Certifying Bodies</h1>
			<p class="max-w-2xl text-sm text-muted-foreground">
				Recognised halal certification bodies referenced by supplier certificates.
			</p>
		</div>
		<Button variant="default" onclick={openCreate}>
			<Plus class="size-4"></Plus>
			New body
		</Button>
	</div>

	<div class="flex flex-wrap items-center gap-2">
		<div class="relative w-full max-w-sm">
			<Search
				class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
			></Search>
			<Input bind:value={search} placeholder="Search bodies..." class="pl-9" />
		</div>
		<FilterPills
			options={statusOptions}
			bind:value={statusFilter}
			ariaLabel="Filter certifying bodies by status"
		/>
	</div>

	<div class="overflow-x-auto rounded-xl ring-1 ring-foreground/10">
		<Table>
			<TableHeader>
				<TableRow class="hover:bg-transparent">
					<TableHead>Name</TableHead>
					<TableHead>Country</TableHead>
					<TableHead>Standard</TableHead>
					<TableHead class="text-right">Actions</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{#if loading}
					{#each [0, 1, 2, 3] as row (row)}
						<TableRow>
							<TableCell><Skeleton class="h-4 w-40" /></TableCell>
							<TableCell><Skeleton class="h-4 w-24" /></TableCell>
							<TableCell><Skeleton class="h-4 w-32" /></TableCell>
							<TableCell class="text-right"><Skeleton class="ml-auto h-8 w-16" /></TableCell>
						</TableRow>
					{/each}
				{:else if loadError}
					<TableRow>
						<TableCell colspan={4} class="py-8">
							<Empty>
								<BrandedEmptyMedia>
									{#if offline}
										<WifiOff class="size-6 text-muted-foreground" />
									{:else}
										<TriangleAlert class="size-6 text-destructive" />
									{/if}
								</BrandedEmptyMedia>
								<div class="space-y-1">
									<p class="font-medium">{offline ? 'Connection failed' : 'Could not load certifying bodies'}</p>
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
						<TableCell colspan={4} class="py-8">
							<Empty>
								<BrandedEmptyMedia><ShieldCheck class="size-6 text-muted-foreground" /></BrandedEmptyMedia>
								<div class="space-y-1">
									<p class="font-medium">
										{search.trim() ? 'No matching bodies' : 'No certifying bodies yet'}
									</p>
									<p class="text-sm text-muted-foreground">
										{search.trim()
											? `Nothing matches “${search.trim()}” in ${statusFilter} bodies.`
											: 'Add the certification bodies your suppliers get accredited by.'}
									</p>
								</div>
								{#if !search.trim()}
									<EmptyContent>
										<Button variant="default" size="sm" onclick={openCreate}>
											<Plus class="size-4"></Plus>
											New body
										</Button>
									</EmptyContent>
								{/if}
							</Empty>
						</TableCell>
					</TableRow>
				{:else}
					{#each filtered as b (b.id)}
						<TableRow>
							<TableCell class="font-medium">{b.name}</TableCell>
							<TableCell>{b.country}</TableCell>
							<TableCell class="font-mono text-sm text-muted-foreground">{b.standard}</TableCell>
							<TableCell class="text-right">
								<div class="flex items-center justify-end gap-1">
									<Button variant="ghost" size="icon" aria-label="Edit" onclick={() => openEdit(b)}>
										<Pencil class="size-4"></Pencil>
									</Button>
									<Button
										variant="ghost"
										size="icon"
										aria-label="Delete"
										class="hover:bg-destructive/10 hover:text-destructive"
										onclick={() => remove(b)}
									>
										<Trash2 class="size-4"></Trash2>
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
			Showing {items.length} of {total} {statusFilter} bodies (API caps at 100).
		</p>
	{/if}
</div>

<Dialog bind:open={dialogOpen}>
	<DialogContent class="max-h-[85dvh] overflow-y-auto sm:max-w-lg">
		<DialogHeader>
			<DialogTitle>{editing ? 'Edit body' : 'New certifying body'}</DialogTitle>
			<DialogDescription>Register or update a halal certification body.</DialogDescription>
		</DialogHeader>
		<form bind:this={formEl} onsubmit={save} class="space-y-4">
			<Field.Field>
				<Field.FieldLabel>Name</Field.FieldLabel>
				<Input bind:value={form.name} placeholder="JAKIM" disabled={saving} aria-invalid={!!fieldErrors.name} oninput={() => { fieldErrors = { ...fieldErrors, name: '' }; }} />
				{#if fieldErrors.name}
					<FieldError>{fieldErrors.name}</FieldError>
				{/if}
			</Field.Field>
			<Field.Field>
				<Field.FieldLabel>Id</Field.FieldLabel>
				<Input
					bind:value={form.id}
					placeholder="jakim"
					disabled={!!editing || saving}
					aria-invalid={!!fieldErrors.id}
					oninput={() => { fieldErrors = { ...fieldErrors, id: '' }; }}
				/>
				<p class="text-xs text-muted-foreground">
					URL segment — derived from the name when left blank.
				</p>
				{#if fieldErrors.id}
					<FieldError>{fieldErrors.id}</FieldError>
				{/if}
			</Field.Field>
			<div class="grid grid-cols-2 gap-4">
				<Field.Field>
					<Field.FieldLabel>Country</Field.FieldLabel>
					<Input bind:value={form.country} placeholder="Malaysia" disabled={saving} aria-invalid={!!fieldErrors.country} oninput={() => { fieldErrors = { ...fieldErrors, country: '' }; }} />
					{#if fieldErrors.country}
						<FieldError>{fieldErrors.country}</FieldError>
					{/if}
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel>Standard</Field.FieldLabel>
					<Input bind:value={form.standard} placeholder="MS 1500:2019" disabled={saving} aria-invalid={!!fieldErrors.standard} />
					{#if fieldErrors.standard}
						<FieldError>{fieldErrors.standard}</FieldError>
					{/if}
				</Field.Field>
			</div>
			<Field.Field>
				<Field.FieldLabel>Website</Field.FieldLabel>
				<Input bind:value={form.website} placeholder="https://example.com" disabled={saving} aria-invalid={!!fieldErrors.website} />
				{#if fieldErrors.website}
					<FieldError>{fieldErrors.website}</FieldError>
				{/if}
			</Field.Field>
			<Field.Field>
				<Field.FieldLabel>Description</Field.FieldLabel>
				<Textarea
					bind:value={form.description}
					rows={3}
					placeholder="Certifying body description..."
					disabled={saving}
					aria-invalid={!!fieldErrors.description}
				/>
				{#if fieldErrors.description}
					<FieldError>{fieldErrors.description}</FieldError>
				{/if}
			</Field.Field>
			<Field.Field>
				<Field.FieldLabel>Status</Field.FieldLabel>
				<Select bind:value={form.status} type="single">
					<SelectTrigger class="w-full" disabled={saving}>{form.status}</SelectTrigger>
					<SelectContent>
						{#each CERTIFYING_BODY_STATUSES as s (s)}
							<SelectItem value={s}>{s}</SelectItem>
						{/each}
					</SelectContent>
				</Select>
			</Field.Field>

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
					/>
					{#if fieldErrors.metaDescription}<FieldError>{fieldErrors.metaDescription}</FieldError>{/if}
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel>Keywords</Field.FieldLabel>
					<Input
						bind:value={form.keywords}
						placeholder="Comma separated: halal, certification, malaysia"
						disabled={saving}
						aria-invalid={!!fieldErrors.keywords}
					/>
					{#if fieldErrors.keywords}<FieldError>{fieldErrors.keywords}</FieldError>{/if}
				</Field.Field>
			</CollapsibleSection>

			{#if formError}
				<p class="text-sm text-destructive">{formError}</p>
			{/if}
			<DialogFooter>
				<Button variant="outline" type="button" disabled={saving} onclick={() => (dialogOpen = false)}>Cancel</Button>
				<Button type="submit" variant="default" disabled={saving}
					>{saving ? 'Saving…' : editing ? 'Save changes' : 'Create body'}</Button
				>
			</DialogFooter>
		</form>
	</DialogContent>
</Dialog>

<ConfirmDialog
	open={confirmId !== null}
	title="Delete certifying body?"
	description={confirmId
		? `Delete certifying body ${confirmName}? This cannot be undone.`
		: undefined}
	confirmLabel={deleting ? 'Deleting…' : 'Delete'}
	onconfirm={confirmedRemove}
/>
