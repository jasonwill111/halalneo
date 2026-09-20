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
	import FolderTree from '@lucide/svelte/icons/folder-tree';
	import RefreshCw from '@lucide/svelte/icons/refresh-cw';
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
		CATEGORY_STATUSES,
		categoryCreateSchema,
		categoryUpdateSchema,
		type CategoryCreateInput,
		type CategoryListResponse,
		type CategoryRecord,
		type CategoryStatus
	} from '#lib/schemas/categories.js';

	let search = $state('');
	let items = $state<CategoryRecord[]>([]);
	let total = $state(0);
	let loading = $state(true);
	let loadError = $state('');
	/** Network failures and server errors must look different (§3.1). */
	let offline = $state(false);
	// Kept as a plain string so it can bind to <FilterPills>; the API validates
	// it against the category status enum and answers 400 otherwise.
	let statusFilter = $state('active');

	let dialogOpen = $state(false);
	let editing = $state<CategoryRecord | null>(null);
	let seoExpanded = $state(false);
	let confirmSlug = $state<string | null>(null);
	let confirmName = $state('');
	let saving = $state(false);
	let deleting = $state(false);

	type CategoryForm = {
		slug: string;
		name: string;
		description: string;
		parentSlug: string;
		icon: string;
		status: CategoryStatus;
		sortOrder: string;
		metaTitle: string;
		metaDescription: string;
		keywords: string;
	};
	const emptyForm = (): CategoryForm => ({
		slug: '',
		name: '',
		description: '',
		parentSlug: '',
		icon: '',
		status: 'active',
		sortOrder: '',
		metaTitle: '',
		metaDescription: '',
		keywords: ''
	});
	let form = $state<CategoryForm>(emptyForm());
	let formError = $state('');
	let fieldErrors = $state<Record<string, string>>({});
	let formEl = $state<HTMLFormElement | undefined>(undefined);

	const statusOptions = CATEGORY_STATUSES.map((s) => ({ value: s, label: s }));

	/** The API always caps at 100 rows (§5.9); filtering the page keeps typing snappy. */
	const filtered = $derived.by(() => {
		if (!search.trim()) return items;
		const q = search.toLowerCase();
		return items.filter((c) => c.name.toLowerCase().includes(q) || c.slug.includes(q));
	});

	function slugify(s: string): string {
		return s
			.toLowerCase()
			.trim()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/(^-|-$)/g, '');
	}

	function parentName(slug?: string | null): string {
		if (!slug) return 'None (top level)';
		return items.find((c) => c.slug === slug)?.name ?? slug;
	}

	/**
	 * Parent choices come from the same collection endpoint (no demo store).
	 * The category being edited is excluded; an out-of-view parent (different
	 * status tab) is kept as its raw slug so the current value never vanishes.
	 */
	const parentOptions = $derived.by(() => {
		const list: { slug: string; name: string }[] = items
			.filter((c) => c.slug !== form.slug)
			.map((c) => ({ slug: c.slug, name: c.name }));
		if (form.parentSlug && !list.some((o) => o.slug === form.parentSlug)) {
			list.unshift({ slug: form.parentSlug, name: form.parentSlug });
		}
		return list;
	});

	async function loadItems() {
		loading = true;
		loadError = '';
		offline = false;
		try {
			const params = new SvelteURLSearchParams({ limit: '100', status: statusFilter });
			const res = await fetch(`/api/categories?${params}`);
			if (!res.ok) {
				const body = (await res.json().catch(() => ({}))) as { error?: string };
				loadError = body.error || `Could not load categories (HTTP ${res.status}).`;
				items = [];
				total = 0;
				return;
			}
			const data = (await res.json().catch(() => null)) as CategoryListResponse | null;
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

	function openEdit(c: CategoryRecord) {
		editing = c;
		form = {
			slug: c.slug,
			name: c.name,
			description: c.description ?? '',
			parentSlug: c.parentSlug ?? '',
			icon: c.icon ?? '',
			status: c.status ?? 'active',
			sortOrder: c.sortOrder != null ? String(c.sortOrder) : '',
			metaTitle: c.metaTitle ?? '',
			metaDescription: c.metaDescription ?? '',
			keywords: c.keywords ?? ''
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

	/** One payload feeds both schemas; `slug` is stripped server-side on PUT (§6.4). */
	function buildPayload(): CategoryCreateInput {
		const sortOrder = form.sortOrder.trim();
		return {
			slug: (form.slug || slugify(form.name)).trim(),
			name: form.name.trim(),
			description: optional(form.description),
			parentSlug: optional(form.parentSlug),
			icon: optional(form.icon),
			status: form.status,
			sortOrder: sortOrder === '' ? null : Number(sortOrder),
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
			? categoryUpdateSchema.safeParse(payload)
			: categoryCreateSchema.safeParse(payload);
		if (!parsed.success) {
			await showFieldErrors(parsed.error.flatten().fieldErrors);
			return;
		}
		if (payload.slug && payload.parentSlug && payload.slug === payload.parentSlug) {
			fieldErrors = { parentSlug: 'A category cannot be its own parent.' };
			await tick();
			focusFirstInvalid(formEl);
			return;
		}

		saving = true;
		try {
			const res = await fetch(
				editing ? `/api/categories/${encodeURIComponent(editing.slug)}` : '/api/categories',
				{
					method: editing ? 'PUT' : 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(payload)
				}
			);
			if (res.ok) {
				dialogOpen = false;
				toast.success(editing ? 'Category updated' : 'Category created');
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
			formError = body.error || 'Could not save this category.';
			toast.error(formError);
		} catch {
			formError = 'Network error — your changes were not saved.';
			toast.error(formError);
		} finally {
			saving = false;
		}
	}

	function remove(c: CategoryRecord) {
		confirmSlug = c.slug;
		confirmName = c.name;
	}

	async function confirmedRemove() {
		if (!confirmSlug) return;
		const slug = confirmSlug;
		deleting = true;
		try {
			const res = await fetch(`/api/categories/${encodeURIComponent(slug)}`, {
				method: 'DELETE'
			});
			if (res.ok) {
				toast.success('Category deleted');
				await loadItems();
			} else {
				const body = (await res.json().catch(() => ({}))) as { error?: string };
				toast.error(body.error || 'Could not delete this category.');
			}
		} catch {
			toast.error('Network error — the category was not deleted.');
		} finally {
			deleting = false;
			confirmSlug = null;
			confirmName = '';
		}
	}
</script>

<svelte:head><title>Categories — HalalNeo Admin</title></svelte:head>

<div class="space-y-4 sm:space-y-6">
	<div class="flex flex-wrap items-end justify-between gap-4">
		<div class="space-y-1">
			<h1 class="text-2xl font-semibold tracking-tight sm:text-3xl">Categories</h1>
			<p class="max-w-2xl text-sm text-muted-foreground">
				Product categories used across the marketplace and knowledge base.
			</p>
		</div>
		<Button variant="default" onclick={openCreate}>
			<Plus class="size-4"></Plus>
			New category
		</Button>
	</div>

	<div class="flex flex-wrap items-center gap-2">
		<div class="relative w-full max-w-sm">
			<Search
				class="pointer-events-none absolute top-1/2 start-3 size-4 -translate-y-1/2 text-muted-foreground"
			></Search>
			<Input bind:value={search} placeholder="Search categories..." class="ps-9" />
		</div>
		<FilterPills
			options={statusOptions}
			bind:value={statusFilter}
			ariaLabel="Filter categories by status"
		/>
	</div>

	<div class="overflow-x-auto rounded-xl ring-1 ring-foreground/10">
		<Table>
			<TableHeader>
				<TableRow class="hover:bg-transparent">
					<TableHead>Category</TableHead>
					<TableHead>Parent</TableHead>
					<TableHead>Description</TableHead>
					<TableHead class="text-end">Actions</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{#if loading}
					{#each [0, 1, 2, 3] as row (row)}
						<TableRow>
							<TableCell><Skeleton class="h-4 w-32" /></TableCell>
							<TableCell><Skeleton class="h-4 w-24" /></TableCell>
							<TableCell><Skeleton class="h-4 w-full max-w-xs" /></TableCell>
							<TableCell class="text-end"><Skeleton class="ms-auto h-8 w-16" /></TableCell>
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
									<p class="font-medium">{offline ? 'Connection failed' : 'Could not load categories'}</p>
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
								<BrandedEmptyMedia><FolderTree class="size-6 text-muted-foreground" /></BrandedEmptyMedia>
								<div class="space-y-1">
									<p class="font-medium">
										{search.trim() ? 'No matching categories' : 'No categories yet'}
									</p>
									<p class="text-sm text-muted-foreground">
										{search.trim()
											? `Nothing matches “${search.trim()}” in ${statusFilter} categories.`
											: 'Create your first category to organise the marketplace.'}
									</p>
								</div>
								{#if !search.trim()}
									<EmptyContent>
										<Button variant="default" size="sm" onclick={openCreate}>
											<Plus class="size-4"></Plus>
											New category
										</Button>
									</EmptyContent>
								{/if}
							</Empty>
						</TableCell>
					</TableRow>
				{:else}
					{#each filtered as c (c.slug)}
						<TableRow>
							<TableCell class="font-medium">{c.name}</TableCell>
							<TableCell class="text-sm text-muted-foreground">{parentName(c.parentSlug)}</TableCell>
							<TableCell class="max-w-xs truncate text-sm text-muted-foreground"
								>{c.description}</TableCell
							>
							<TableCell class="text-end">
								<div class="flex items-center justify-end gap-1">
									<Button variant="ghost" size="icon" aria-label="Edit" onclick={() => openEdit(c)}>
										<Pencil class="size-4"></Pencil>
									</Button>
									<Button
										variant="ghost"
										size="icon"
										aria-label="Delete"
										class="hover:bg-destructive/10 hover:text-destructive"
										onclick={() => remove(c)}
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
			Showing {items.length} of {total} {statusFilter} categories (API caps at 100).
		</p>
	{/if}
</div>

<Dialog bind:open={dialogOpen}>
	<DialogContent class="max-h-[85dvh] overflow-y-auto sm:max-w-lg">
		<DialogHeader>
			<DialogTitle>{editing ? 'Edit category' : 'New category'}</DialogTitle>
			<DialogDescription>Create or update a product category.</DialogDescription>
		</DialogHeader>
		<form bind:this={formEl} onsubmit={save} class="space-y-4">
			<Field.Field>
				<Field.FieldLabel>Name</Field.FieldLabel>
				<Input
					bind:value={form.name}
					placeholder="Category name"
					disabled={saving}
					aria-invalid={!!fieldErrors.name}
					oninput={() => { fieldErrors.name = ''; formError = ''; }}
				/>
				{#if fieldErrors.name}<FieldError>{fieldErrors.name}</FieldError>{/if}
			</Field.Field>
			<Field.Field>
				<Field.FieldLabel>Slug</Field.FieldLabel>
				<Input
					bind:value={form.slug}
					placeholder="category-slug"
					disabled={!!editing || saving}
					aria-invalid={!!fieldErrors.slug}
					oninput={() => { fieldErrors.slug = ''; formError = ''; }}
				/>
				{#if fieldErrors.slug}<FieldError>{fieldErrors.slug}</FieldError>{/if}
			</Field.Field>
			<Field.Field>
				<Field.FieldLabel>Parent</Field.FieldLabel>
				<Select bind:value={form.parentSlug} type="single">
					<SelectTrigger class="w-full" disabled={saving}>{parentName(form.parentSlug)}</SelectTrigger>
					<SelectContent>
						<SelectItem value="">None (top level)</SelectItem>
						{#each parentOptions as c (c.slug)}
							<SelectItem value={c.slug}>{c.name}</SelectItem>
						{/each}
					</SelectContent>
				</Select>
			</Field.Field>
			<div class="grid grid-cols-2 gap-4">
				<Field.Field>
					<Field.FieldLabel>Status</Field.FieldLabel>
					<Select bind:value={form.status} type="single">
						<SelectTrigger class="w-full" disabled={saving}>{form.status}</SelectTrigger>
						<SelectContent>
							{#each CATEGORY_STATUSES as s (s)}
								<SelectItem value={s}>{s}</SelectItem>
							{/each}
						</SelectContent>
					</Select>
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel>Sort Order</Field.FieldLabel>
					<Input
						bind:value={form.sortOrder}
						type="number"
						min="0"
						placeholder="0"
						disabled={saving}
						aria-invalid={!!fieldErrors.sortOrder}
						oninput={() => { fieldErrors.sortOrder = ''; }}
					/>
					{#if fieldErrors.sortOrder}<FieldError>{fieldErrors.sortOrder}</FieldError>{/if}
				</Field.Field>
			</div>
			<Field.Field>
				<Field.FieldLabel>Icon</Field.FieldLabel>
				<Input bind:value={form.icon} placeholder="UtensilsCrossed" disabled={saving} />
			</Field.Field>
			<Field.Field>
				<Field.FieldLabel>Description</Field.FieldLabel>
				<Textarea bind:value={form.description} rows={3} placeholder="Category description..." disabled={saving} />
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
						oninput={() => { fieldErrors.metaTitle = ''; }}
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
						placeholder="Comma separated: halal, food, certification"
						disabled={saving}
						aria-invalid={!!fieldErrors.keywords}
					/>
					{#if fieldErrors.keywords}<FieldError>{fieldErrors.keywords}</FieldError>{/if}
				</Field.Field>
			</CollapsibleSection>

			{#if formError}
				<p class="text-sm text-destructive">{formError}</p>
			{/if}
			<div class="flex justify-end gap-2 pt-2">
				<Button variant="outline" type="button" disabled={saving} onclick={() => (dialogOpen = false)}>Cancel</Button>
				<Button variant="default" type="submit" disabled={saving}
					>{saving ? 'Saving…' : editing ? 'Save changes' : 'Create category'}</Button
				>
			</div>
		</form>
	</DialogContent>
</Dialog>

<ConfirmDialog
	open={confirmSlug !== null}
	title="Delete category?"
	description={`Delete category "${confirmName}"? Children become top-level. This cannot be undone.`}
	confirmLabel={deleting ? 'Deleting…' : 'Delete'}
	onconfirm={confirmedRemove}
/>
