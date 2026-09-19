<script lang="ts">
	// Real API data flow (development-rules.md §6.1 / §6.4): every read and write goes
	// through /api/products* and is validated by the SAME Zod schema on both sides
	// (#lib/schemas/products.ts). No localStorage demo store is involved.
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
	import Sparkles from '@lucide/svelte/icons/sparkles';
	import Loader2 from '@lucide/svelte/icons/loader-2';
	import X from '@lucide/svelte/icons/x';
	import PackageIcon from '@lucide/svelte/icons/package';
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
		PRODUCT_CERT_STATUSES,
		PRODUCT_STATUSES,
		ProductCreateSchema,
		formatPriceRange,
		parseJsonColumn,
		toProductPayload,
		type ProductCertStatus,
		type ProductListItem,
		type ProductListResponse,
		type ProductRow,
		type ProductStatus
	} from '#lib/schemas/products.js';
	import type { SupplierListItem, SupplierListResponse } from '#lib/schemas/suppliers.js';

	type SpecRow = { id: string; key: string; value: string };
	type FaqRow = { id: string; question: string; answer: string };
	type ResourceRow = { id: string; name: string; url: string };
	type Option = { slug: string; name: string };
	/** Minimal `{ items }` envelope of the option endpoints. */
	type OptionListResponse = { items?: Option[] };

	type ProductForm = {
		slug: string;
		name: string;
		supplierSlug: string;
		categorySlug: string;
		shortDescription: string;
		certStatus: ProductCertStatus;
		status: ProductStatus;
		originCountry: string;
		moq: string;
		priceMin: string;
		priceMax: string;
		priceUnit: string;
		units: string;
		features: string;
		description: string;
		specifications: SpecRow[];
		faqs: FaqRow[];
		imageUrl: string;
		images: string;
		videos: string;
		resources: ResourceRow[];
		metaTitle: string;
		metaDescription: string;
		keywords: string;
	};

	const PAGE_SIZE = 20;
	/** Placeholder rows while the list is in flight (§3.1 loading state). */
	const SKELETON_ROWS = [0, 1, 2, 3, 4];

	const emptyForm = (): ProductForm => ({
		slug: '',
		name: '',
		supplierSlug: '',
		categorySlug: '',
		shortDescription: '',
		certStatus: 'pending',
		status: 'active',
		originCountry: '',
		moq: '',
		priceMin: '',
		priceMax: '',
		priceUnit: '',
		units: '',
		features: '',
		description: '',
		specifications: [],
		faqs: [],
		imageUrl: '',
		images: '',
		videos: '',
		resources: [],
		metaTitle: '',
		metaDescription: '',
		keywords: ''
	});

	// ---------- list state ----------
	let items = $state<ProductListItem[]>([]);
	let total = $state(0);
	let page = $state(1);
	let search = $state('');
	let loading = $state(true);
	let loadFailure = $state<LoadFailure | null>(null);
	let requestId = 0;

	const totalPages = $derived(Math.max(1, Math.ceil(total / PAGE_SIZE)));

	// ---------- option sources (never the demo store) ----------
	let supplierOptions = $state<Option[]>([]);
	let categoryOptions = $state<Option[]>([]);
	let optionsLoading = $state(false);
	let optionsFailure = $state<LoadFailure | null>(null);

	// ---------- dialog state ----------
	let dialogOpen = $state(false);
	let editingSlug = $state('');
	let detailLoading = $state(false);
	let detailFailure = $state<LoadFailure | null>(null);
	let submitting = $state(false);
	let form = $state<ProductForm>(emptyForm());
	let formError = $state('');
	let fieldErrors = $state<Record<string, string>>({});
	let formEl = $state<HTMLFormElement | undefined>(undefined);

	// Collapsible section state
	let basicExpanded = $state(true);
	let pricingExpanded = $state(false);
	let detailsExpanded = $state(false);
	let mediaExpanded = $state(false);
	let seoExpanded = $state(false);

	// AI generation mock state
	let aiLoading = $state(false);

	// ---------- delete state ----------
	let confirmOpen = $state(false);
	let confirmSlug = $state('');
	let confirmName = $state('');
	let deleting = $state(false);

	const certLabels: Record<ProductCertStatus, string> = {
		certified: 'Certified',
		'not-certified': 'Not Certified',
		'not-applicable': 'Not Applicable',
		pending: 'Pending'
	};

	const PRICING_KEYS = ['moq', 'priceMin', 'priceMax', 'priceUnit', 'units'];
	const DETAIL_KEYS = ['features', 'description', 'specifications', 'faqs', 'resources'];
	const MEDIA_KEYS = ['image', 'images', 'videos'];
	const SEO_KEYS = ['metaTitle', 'metaDescription', 'keywords'];

	/** Collapse a `ProductForm` into the wire payload (see schema helper). */
	function payload() {
		return toProductPayload(form);
	}

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
	function asCertStatus(value: string | null | undefined): ProductCertStatus {
		const allowed: readonly string[] = PRODUCT_CERT_STATUSES;
		return value && allowed.includes(value) ? (value as ProductCertStatus) : 'pending';
	}
	function asStatus(value: string | null | undefined): ProductStatus {
		const allowed: readonly string[] = PRODUCT_STATUSES;
		return value && allowed.includes(value) ? (value as ProductStatus) : 'active';
	}

	function supplierName(slug: string): string {
		return supplierOptions.find((s) => s.slug === slug)?.name ?? slug;
	}
	function categoryName(slug: string): string {
		return categoryOptions.find((c) => c.slug === slug)?.name ?? slug;
	}

	/** Reused for both list fetch and retries — keeps `loading`/`loadFailure` honest. */
	async function loadList() {
		const id = ++requestId;
		loading = true;
		try {
			const params = new SvelteURLSearchParams({
				limit: String(PAGE_SIZE),
				offset: String((page - 1) * PAGE_SIZE),
				// admin overview: draft/archived rows must be manageable too
				status: 'all'
			});
			const term = search.trim();
			if (term) params.set('search', term);
			const res = await fetch(`/api/products?${params.toString()}`);
			if (!res.ok) {
				if (id !== requestId) return;
				loadFailure = await failureFromResponse(res);
				items = [];
				total = 0;
				return;
			}
			const data = (await res.json()) as Partial<ProductListResponse>;
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

	async function failureFromResponse(res: Response): Promise<LoadFailure> {
		const fallback = describeFetchFailure(res);
		const body = await readErrorBody(res);
		return { kind: 'server', status: res.status, message: body.error ?? fallback.message };
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

	async function loadOptions() {
		optionsLoading = true;
		optionsFailure = null;
		try {
			// status=all keeps pending/suspended suppliers pickable by the admin;
			// limit=100 is the endpoint's clamp (§5.9).
			const [supplierRes, categoryRes] = await Promise.all([
				fetch('/api/suppliers?limit=100&status=all'),
				fetch('/api/categories?limit=100')
			]);
			if (!supplierRes.ok) {
				optionsFailure = await failureFromResponse(supplierRes);
				return;
			}
			if (!categoryRes.ok) {
				optionsFailure = await failureFromResponse(categoryRes);
				return;
			}
			const supplierData = (await supplierRes.json()) as Partial<SupplierListResponse>;
			const categoryData = (await categoryRes.json()) as OptionListResponse;
			supplierOptions = (Array.isArray(supplierData.items) ? supplierData.items : []).map(
				(s: SupplierListItem) => ({ slug: s.slug, name: s.name })
			);
			categoryOptions = (Array.isArray(categoryData.items) ? categoryData.items : []).map((c) => ({
				slug: c.slug,
				name: c.name
			}));
		} catch (error) {
			optionsFailure = describeThrownFailure(error);
		} finally {
			optionsLoading = false;
		}
	}

	// Debounced list fetch: typing re-runs this effect, the timer collapses bursts.
	$effect(() => {
		void search;
		void page;
		const timer = setTimeout(() => {
			void loadList();
		}, 250);
		return () => clearTimeout(timer);
	});

	$effect(() => {
		void loadOptions();
	});

	function expandFor(keys: string[]) {
		if (!keys.length) return;
		const hit = (list: string[]) => keys.some((k) => list.includes(k));
		if (hit(PRICING_KEYS)) pricingExpanded = true;
		if (hit(DETAIL_KEYS)) detailsExpanded = true;
		if (hit(MEDIA_KEYS)) mediaExpanded = true;
		if (hit(SEO_KEYS)) seoExpanded = true;
	}

	/** Map `{ field: [message] }` (Zod `flatten()`) onto the per-field error map. */
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
		pricingExpanded = false;
		detailsExpanded = false;
		mediaExpanded = false;
		seoExpanded = false;
	}

	function openCreate() {
		editingSlug = '';
		form = {
			...emptyForm(),
			supplierSlug: supplierOptions[0]?.slug ?? '',
			categorySlug: categoryOptions[0]?.slug ?? ''
		};
		formError = '';
		fieldErrors = {};
		detailFailure = null;
		detailLoading = false;
		resetSections();
		dialogOpen = true;
	}

	function onNameInput(value: string) {
		form.name = value;
		if (!editingSlug) {
			form.slug = slugify(value);
		}
		if (fieldErrors.name) fieldErrors = { ...fieldErrors, name: '' };
		if (!editingSlug && fieldErrors.slug) fieldErrors = { ...fieldErrors, slug: '' };
	}

	/** Fill the form from a raw DB row, unparsing every JSON TEXT column. */
	function applyRowToForm(row: ProductRow) {
		form = {
			slug: row.slug,
			name: row.name ?? '',
			supplierSlug: row.supplierSlug ?? '',
			categorySlug: row.categorySlug ?? '',
			shortDescription: row.shortDescription ?? '',
			certStatus: asCertStatus(row.certStatus),
			status: asStatus(row.status),
			originCountry: row.originCountry ?? '',
			moq: row.moq ?? '',
			priceMin: row.priceMin != null ? String(row.priceMin) : '',
			priceMax: row.priceMax != null ? String(row.priceMax) : '',
			priceUnit: row.priceUnit ?? '',
			units: row.units ?? '',
			features: parseJsonColumn<string[]>(row.features, []).join(', '),
			description: row.description ?? '',
			specifications: Object.entries(
				parseJsonColumn<Record<string, string>>(row.specifications, {})
			).map(([key, value]) => ({ id: crypto.randomUUID(), key, value: String(value ?? '') })),
			faqs: parseJsonColumn<FaqRow[]>(row.faqs, []).map((f) => ({
				id: crypto.randomUUID(),
				question: f.question ?? '',
				answer: f.answer ?? ''
			})),
			imageUrl: row.image ?? '',
			images: parseJsonColumn<string[]>(row.images, []).join(', '),
			videos: parseJsonColumn<string[]>(row.videos, []).join(', '),
			resources: parseJsonColumn<ResourceRow[]>(row.resources, []).map((r) => ({
				id: crypto.randomUUID(),
				name: r.name ?? '',
				url: r.url ?? ''
			})),
			metaTitle: row.metaTitle ?? '',
			metaDescription: row.metaDescription ?? '',
			keywords: row.keywords ?? ''
		};
	}

	/** The list projection is deliberately light, so the heavy columns are fetched
	 *  on demand for the single row being edited (no N+1, no widened projection). */
	async function loadDetail(slug: string) {
		if (!slug) return;
		detailLoading = true;
		detailFailure = null;
		try {
			const res = await fetch(`/api/products/${encodeURIComponent(slug)}`);
			if (!res.ok) {
				if (editingSlug === slug) detailFailure = await failureFromResponse(res);
				return;
			}
			const row = (await res.json()) as Partial<ProductRow>;
			if (editingSlug !== slug || !row || typeof row.slug !== 'string') return;
			applyRowToForm(row as ProductRow);
		} catch (error) {
			if (editingSlug === slug) detailFailure = describeThrownFailure(error);
		} finally {
			if (editingSlug === slug) detailLoading = false;
		}
	}

	function openEdit(item: ProductListItem) {
		editingSlug = item.slug;
		form = {
			...emptyForm(),
			slug: item.slug,
			name: item.name,
			supplierSlug: item.supplierSlug ?? '',
			categorySlug: item.categorySlug ?? '',
			moq: item.moq ?? '',
			priceMin: item.priceMin != null ? String(item.priceMin) : '',
			priceMax: item.priceMax != null ? String(item.priceMax) : '',
			priceUnit: item.priceUnit ?? '',
			imageUrl: item.image ?? '',
			certStatus: asCertStatus(item.certStatus),
			status: asStatus(item.status)
		};
		formError = '';
		fieldErrors = {};
		resetSections();
		dialogOpen = true;
		void loadDetail(item.slug);
	}

	function generateDescription() {
		aiLoading = true;
		setTimeout(() => {
			const name = form.name || 'This product';
			const cat = form.categorySlug ? categoryName(form.categorySlug) : 'product';
			const supplier = form.supplierSlug ? supplierName(form.supplierSlug) : 'a supplier';
			const country = form.originCountry || 'the region';
			const short = form.shortDescription || '';
			form.description =
				`${name} is a halal-certified ${cat} from ${supplier}, originating from ${country}. ` +
				`${short} ` +
				`This product meets rigorous halal compliance standards and is sourced through verified supply chains, ` +
				`making it ideal for international B2B buyers seeking quality-assured halal goods.`;
			aiLoading = false;
		}, 800);
	}

	function addSpec() {
		form.specifications = [...form.specifications, { id: crypto.randomUUID(), key: '', value: '' }];
	}
	function removeSpec(index: number) {
		form.specifications = form.specifications.filter((_, i) => i !== index);
	}
	function updateSpec(index: number, field: 'key' | 'value', val: string) {
		const updated = [...form.specifications];
		updated[index] = { ...updated[index], [field]: val };
		form.specifications = updated;
	}

	function addFaq() {
		form.faqs = [...form.faqs, { id: crypto.randomUUID(), question: '', answer: '' }];
	}
	function removeFaq(index: number) {
		form.faqs = form.faqs.filter((_, i) => i !== index);
	}
	function updateFaq(index: number, field: 'question' | 'answer', val: string) {
		const updated = [...form.faqs];
		updated[index] = { ...updated[index], [field]: val };
		form.faqs = updated;
	}

	function addResource() {
		form.resources = [...form.resources, { id: crypto.randomUUID(), name: '', url: '' }];
	}
	function removeResource(index: number) {
		form.resources = form.resources.filter((_, i) => i !== index);
	}
	function updateResource(index: number, field: 'name' | 'url', val: string) {
		const updated = [...form.resources];
		updated[index] = { ...updated[index], [field]: val };
		form.resources = updated;
	}

	async function save() {
		// §3.4: one in-flight submit, no double writes. A failed detail load means
		// the heavy columns are unknown, so writing would wipe them.
		if (submitting || detailLoading || detailFailure) return;

		const body = payload();

		// Client-side pass with the server's own schema: instant field errors,
		// and the server re-validates identically.
		const local = ProductCreateSchema.safeParse(body);
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
				isEdit ? `/api/products/${encodeURIComponent(editingSlug)}` : '/api/products',
				{
					method: isEdit ? 'PUT' : 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(body)
				}
			);

			if (!res.ok) {
				// Keep every typed value: a failed save never clears the form.
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

			toast.success(isEdit ? 'Product updated' : 'Product created');
			dialogOpen = false;
			await loadList();
		} catch {
			formError = 'Network error — check your connection and try again.';
			toast.error('Network error — nothing was saved.');
		} finally {
			submitting = false;
		}
	}

	function requestDelete(item: ProductListItem) {
		confirmSlug = item.slug;
		confirmName = item.name;
		confirmOpen = true;
	}

	async function confirmedRemove() {
		const slug = confirmSlug;
		if (!slug || deleting) return;
		deleting = true;
		try {
			const res = await fetch(`/api/products/${encodeURIComponent(slug)}`, {
				method: 'DELETE'
			});
			if (res.ok) {
				toast.success('Product deleted');
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

<svelte:head><title>Products — HalalNeo Admin</title></svelte:head>

<div class="space-y-4 sm:space-y-6">
	<div class="flex flex-wrap items-end justify-between gap-4">
		<div class="space-y-1">
			<h1 class="text-2xl font-semibold tracking-tight sm:text-3xl">Products</h1>
			<p class="max-w-2xl text-sm text-muted-foreground">
				All product SKUs listed on the marketplace, with certification status.
			</p>
		</div>
		<div class="flex items-center gap-2">
			<Button variant="default" onclick={openCreate} disabled={submitting}>
				<Plus class="size-4"></Plus>
				New product
			</Button>
		</div>
	</div>

	<div class="relative max-w-sm">
		<Search
			class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
		></Search>
		<Input
			bind:value={search}
			oninput={() => {
				page = 1;
			}}
			placeholder="Search products..."
			class="pl-9"
		/>
	</div>

	{#if loadFailure}
		<ErrorRetry failure={loadFailure} subject="products" onretry={loadList} />
	{:else}
		<div class="overflow-x-auto rounded-xl ring-1 ring-foreground/10">
			<Table>
				<TableHeader>
					<TableRow class="hover:bg-transparent">
						<TableHead>Product</TableHead>
						<TableHead>Supplier</TableHead>
						<TableHead>Category</TableHead>
						<TableHead>MOQ / Price</TableHead>
						<TableHead>Certification</TableHead>
						<TableHead class="text-right">Actions</TableHead>
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
								<TableCell><Skeleton class="h-4 w-24"></Skeleton></TableCell>
								<TableCell><Skeleton class="h-4 w-24"></Skeleton></TableCell>
								<TableCell><Skeleton class="h-4 w-28"></Skeleton></TableCell>
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
										<EmptyMedia variant="icon">
											<PackageIcon />
										</EmptyMedia>
										<EmptyTitle>
											{search.trim() ? 'No products match your search' : 'No products yet'}
										</EmptyTitle>
										<EmptyDescription>
											{search.trim()
												? 'Try a different keyword, or clear the search to see every SKU.'
												: 'Create the first marketplace SKU to make it discoverable to buyers.'}
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
												New product
											</Button>
										{/if}
									</EmptyContent>
								</Empty>
							</TableCell>
						</TableRow>
					{:else}
						{#each items as s (s.slug)}
							<TableRow>
								<TableCell>
									<div class="min-w-0">
										<p class="truncate font-medium">{s.name}</p>
										<p class="truncate text-xs text-muted-foreground">{s.slug}</p>
									</div>
								</TableCell>
								<TableCell class="text-sm text-muted-foreground"
									>{supplierName(s.supplierSlug)}</TableCell
								>
								<TableCell class="text-sm text-muted-foreground"
									>{categoryName(s.categorySlug)}</TableCell
								>
								<TableCell class="text-sm">
									<div class="flex flex-col">
										<span>{s.moq || '—'}</span>
										<span class="text-xs text-muted-foreground"
											>{formatPriceRange(s.priceMin, s.priceMax, s.priceUnit) || '—'}</span
										>
									</div>
								</TableCell>
								<TableCell>
									<Badge
										variant={s.certStatus === 'certified'
											? 'default'
											: s.certStatus === 'pending'
												? 'secondary'
												: 'destructive'}
									>
										{certLabels[asCertStatus(s.certStatus)]}
									</Badge>
									{#if s.status && s.status !== 'active'}
										<span class="ml-1 text-2xs text-muted-foreground uppercase">{s.status}</span>
									{/if}
								</TableCell>
								<TableCell class="text-right">
									<div class="flex items-center justify-end gap-1">
										<Button
											variant="ghost"
											size="icon"
											aria-label="Edit"
											disabled={deleting}
											onclick={() => openEdit(s)}
										>
											<Pencil class="size-4"></Pencil>
										</Button>
										<Button
											variant="ghost"
											size="icon"
											aria-label="Delete"
											class="hover:bg-destructive/10 hover:text-destructive"
											disabled={deleting}
											onclick={() => requestDelete(s)}
										>
											{#if deleting && confirmSlug === s.slug}
												<Loader2 class="size-4 animate-spin"></Loader2>
											{:else}
												<Trash2 class="size-4"></Trash2>
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
			<DialogTitle>{editingSlug ? 'Edit product' : 'New product'}</DialogTitle>
			<DialogDescription>Create or update a product SKU in the marketplace.</DialogDescription>
		</DialogHeader>

		{#if optionsFailure}
			<ErrorRetry
				failure={optionsFailure}
				subject="supplier and category options"
				onretry={loadOptions}
			/>
		{/if}

		{#if detailFailure}
			<ErrorRetry
				failure={detailFailure}
				subject="this product"
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
							placeholder="Product name"
							aria-invalid={!!fieldErrors.name || undefined}
						/>
						{#if fieldErrors.name}<FieldError>{fieldErrors.name}</FieldError>{/if}
					</Field.Field>

					<Field.Field>
						<Field.FieldLabel>Slug</Field.FieldLabel>
						<Input
							bind:value={form.slug}
							placeholder="product-name"
							disabled={!!editingSlug}
							aria-invalid={!!fieldErrors.slug || undefined}
							oninput={() => {
								if (fieldErrors.slug) fieldErrors = { ...fieldErrors, slug: '' };
							}}
						/>
						{#if fieldErrors.slug}<FieldError>{fieldErrors.slug}</FieldError>{/if}
					</Field.Field>

					<div class="grid grid-cols-2 gap-4">
						<Field.Field>
							<Field.FieldLabel>Supplier</Field.FieldLabel>
							<Select
								bind:value={form.supplierSlug}
								type="single"
								onOpenChange={(open) => {
									if (!open && fieldErrors.supplierSlug)
										fieldErrors = { ...fieldErrors, supplierSlug: '' };
								}}
							>
								<SelectTrigger
									class="w-full"
									disabled={optionsLoading}
									aria-invalid={!!fieldErrors.supplierSlug || undefined}
									>{form.supplierSlug
										? supplierName(form.supplierSlug)
										: 'Select supplier'}</SelectTrigger
								>
								<SelectContent>
									{#each supplierOptions as m (m.slug)}
										<SelectItem value={m.slug}>{m.name}</SelectItem>
									{/each}
								</SelectContent>
							</Select>
							{#if fieldErrors.supplierSlug}<FieldError>{fieldErrors.supplierSlug}</FieldError>{/if}
						</Field.Field>
						<Field.Field>
							<Field.FieldLabel>Category</Field.FieldLabel>
							<Select
								bind:value={form.categorySlug}
								type="single"
								onOpenChange={(open) => {
									if (!open && fieldErrors.categorySlug)
										fieldErrors = { ...fieldErrors, categorySlug: '' };
								}}
							>
								<SelectTrigger
									class="w-full"
									disabled={optionsLoading}
									aria-invalid={!!fieldErrors.categorySlug || undefined}
									>{form.categorySlug
										? categoryName(form.categorySlug)
										: 'Select category'}</SelectTrigger
								>
								<SelectContent>
									{#each categoryOptions as c (c.slug)}
										<SelectItem value={c.slug}>{c.name}</SelectItem>
									{/each}
								</SelectContent>
							</Select>
							{#if fieldErrors.categorySlug}<FieldError>{fieldErrors.categorySlug}</FieldError>{/if}
						</Field.Field>
					</div>

					<Field.Field>
						<Field.FieldLabel>Short description</Field.FieldLabel>
						<Input
							bind:value={form.shortDescription}
							placeholder="Brief one-line product description"
							aria-invalid={!!fieldErrors.shortDescription || undefined}
						/>
						{#if fieldErrors.shortDescription}
							<FieldError>{fieldErrors.shortDescription}</FieldError>
						{/if}
					</Field.Field>

					<div class="grid grid-cols-2 gap-4">
						<Field.Field>
							<Field.FieldLabel>Certification Status</Field.FieldLabel>
							<Select bind:value={form.certStatus} type="single">
								<SelectTrigger class="w-full">{certLabels[form.certStatus]}</SelectTrigger>
								<SelectContent>
									{#each Object.entries(certLabels) as [value, label] (value)}
										<SelectItem {value}>{label}</SelectItem>
									{/each}
								</SelectContent>
							</Select>
							{#if fieldErrors.certStatus}<FieldError>{fieldErrors.certStatus}</FieldError>{/if}
						</Field.Field>
						<Field.Field>
							<Field.FieldLabel>Status</Field.FieldLabel>
							<Select bind:value={form.status} type="single">
								<SelectTrigger class="w-full">{form.status}</SelectTrigger>
								<SelectContent>
									{#each PRODUCT_STATUSES as value (value)}
										<SelectItem {value}>{value}</SelectItem>
									{/each}
								</SelectContent>
							</Select>
							{#if fieldErrors.status}<FieldError>{fieldErrors.status}</FieldError>{/if}
						</Field.Field>
					</div>

					<Field.Field>
						<Field.FieldLabel>Origin Country</Field.FieldLabel>
						<Input
							bind:value={form.originCountry}
							placeholder="Indonesia"
							aria-invalid={!!fieldErrors.originCountry || undefined}
						/>
						{#if fieldErrors.originCountry}
							<FieldError>{fieldErrors.originCountry}</FieldError>
						{/if}
					</Field.Field>
				</CollapsibleSection>

				<!-- ===================== PRICING & MOQ (collapsed) ===================== -->
				<CollapsibleSection title="Pricing & MOQ" bind:open={pricingExpanded}>
					<Field.Field>
						<Field.FieldLabel>MOQ</Field.FieldLabel>
						<Input
							bind:value={form.moq}
							placeholder="e.g. 100 units"
							aria-invalid={!!fieldErrors.moq || undefined}
						/>
						{#if fieldErrors.moq}<FieldError>{fieldErrors.moq}</FieldError>{/if}
					</Field.Field>

					<div class="grid grid-cols-2 gap-4">
						<Field.Field>
							<Field.FieldLabel>Price Min</Field.FieldLabel>
							<Input
								value={form.priceMin}
								oninput={(e) => {
									form.priceMin = inputValue(e);
									if (fieldErrors.priceMin) fieldErrors = { ...fieldErrors, priceMin: '' };
								}}
								type="number"
								min="0"
								step="0.01"
								placeholder="0.00"
								aria-invalid={!!fieldErrors.priceMin || undefined}
							/>
							{#if fieldErrors.priceMin}<FieldError>{fieldErrors.priceMin}</FieldError>{/if}
						</Field.Field>
						<Field.Field>
							<Field.FieldLabel>Price Max</Field.FieldLabel>
							<Input
								value={form.priceMax}
								oninput={(e) => {
									form.priceMax = inputValue(e);
									if (fieldErrors.priceMax) fieldErrors = { ...fieldErrors, priceMax: '' };
								}}
								type="number"
								min="0"
								step="0.01"
								placeholder="0.00"
								aria-invalid={!!fieldErrors.priceMax || undefined}
							/>
							{#if fieldErrors.priceMax}<FieldError>{fieldErrors.priceMax}</FieldError>{/if}
						</Field.Field>
					</div>

					<div class="grid grid-cols-2 gap-4">
						<Field.Field>
							<Field.FieldLabel>Price Unit</Field.FieldLabel>
							<Input
								bind:value={form.priceUnit}
								placeholder="e.g. per unit, per kg"
								aria-invalid={!!fieldErrors.priceUnit || undefined}
							/>
							{#if fieldErrors.priceUnit}<FieldError>{fieldErrors.priceUnit}</FieldError>{/if}
						</Field.Field>
						<Field.Field>
							<Field.FieldLabel>Units</Field.FieldLabel>
							<Input
								bind:value={form.units}
								placeholder="e.g. boxes, pallets"
								aria-invalid={!!fieldErrors.units || undefined}
							/>
							{#if fieldErrors.units}<FieldError>{fieldErrors.units}</FieldError>{/if}
						</Field.Field>
					</div>
				</CollapsibleSection>

				<!-- ===================== DETAILS (collapsed) ===================== -->
				<CollapsibleSection title="Details" bind:open={detailsExpanded}>
					<Field.Field>
						<Field.FieldLabel>Features</Field.FieldLabel>
						<Input
							bind:value={form.features}
							placeholder="Comma separated: halal-certified, gluten-free"
							aria-invalid={!!fieldErrors.features || undefined}
						/>
						{#if fieldErrors.features}<FieldError>{fieldErrors.features}</FieldError>{/if}
						{#if form.features.trim()}
							<div class="flex flex-wrap gap-1 pt-1">
								{#each form.features
									.split(',')
									.map((f) => f.trim())
									.filter(Boolean) as tag (tag)}
									<Badge variant="secondary" class="text-xs">{tag}</Badge>
								{/each}
							</div>
						{/if}
					</Field.Field>

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
							placeholder="Full product description..."
							aria-invalid={!!fieldErrors.description || undefined}
						/>
						{#if fieldErrors.description}<FieldError>{fieldErrors.description}</FieldError>{/if}
					</Field.Field>

					<!-- Specifications editor -->
					<Field.Field>
						<div class="flex items-center justify-between">
							<span class="text-sm font-medium">Specifications</span>
							<Button variant="outline" size="sm" type="button" onclick={addSpec}>
								<Plus class="size-3" /> Add
							</Button>
						</div>
						{#each form.specifications as spec, i (spec.id)}
							<div class="flex items-center gap-2">
								<Input
									value={spec.key}
									oninput={(e) => updateSpec(i, 'key', inputValue(e))}
									placeholder="Key"
									class="flex-1"
								/>
								<Input
									value={spec.value}
									oninput={(e) => updateSpec(i, 'value', inputValue(e))}
									placeholder="Value"
									class="flex-1"
								/>
								<Button
									variant="ghost"
									size="icon"
									type="button"
									aria-label="Remove"
									onclick={() => removeSpec(i)}
								>
									<X class="size-3" />
								</Button>
							</div>
						{/each}
						{#if fieldErrors.specifications}
							<FieldError>{fieldErrors.specifications}</FieldError>
						{/if}
					</Field.Field>

					<!-- FAQs editor -->
					<Field.Field>
						<div class="flex items-center justify-between">
							<span class="text-sm font-medium">FAQs</span>
							<Button variant="outline" size="sm" type="button" onclick={addFaq}>
								<Plus class="size-3" /> Add
							</Button>
						</div>
						{#each form.faqs as faq, i (faq.id)}
							<div class="flex flex-col gap-2 rounded-md border p-3">
								<div class="flex items-center gap-2">
									<Input
										value={faq.question}
										oninput={(e) => updateFaq(i, 'question', inputValue(e))}
										placeholder="Question"
										class="flex-1"
									/>
									<Button
										variant="ghost"
										size="icon"
										type="button"
										aria-label="Remove"
										onclick={() => removeFaq(i)}
									>
										<X class="size-3" />
									</Button>
								</div>
								<Textarea
									value={faq.answer}
									oninput={(e) => updateFaq(i, 'answer', inputValue(e))}
									placeholder="Answer"
									rows={2}
								/>
							</div>
						{/each}
						{#if fieldErrors.faqs}<FieldError>{fieldErrors.faqs}</FieldError>{/if}
					</Field.Field>
				</CollapsibleSection>

				<!-- ===================== MEDIA & RESOURCES (collapsed) ===================== -->
				<CollapsibleSection title="Media & Resources" bind:open={mediaExpanded}>
					<Field.Field>
						<Field.FieldLabel>Image URL</Field.FieldLabel>
						<Input
							bind:value={form.imageUrl}
							placeholder="https://..."
							aria-invalid={!!fieldErrors.image || undefined}
						/>
						{#if fieldErrors.image}<FieldError>{fieldErrors.image}</FieldError>{/if}
					</Field.Field>

					<Field.Field>
						<Field.FieldLabel>Additional Images</Field.FieldLabel>
						<Input
							bind:value={form.images}
							placeholder="Comma separated image URLs"
							aria-invalid={!!fieldErrors.images || undefined}
						/>
						<Field.FieldDescription
							>Comma-separated list of additional image URLs.</Field.FieldDescription
						>
						{#if fieldErrors.images}<FieldError>{fieldErrors.images}</FieldError>{/if}
					</Field.Field>

					<Field.Field>
						<Field.FieldLabel>Videos</Field.FieldLabel>
						<Input
							bind:value={form.videos}
							placeholder="Comma separated video URLs"
							aria-invalid={!!fieldErrors.videos || undefined}
						/>
						<Field.FieldDescription>Comma-separated list of video URLs.</Field.FieldDescription>
						{#if fieldErrors.videos}<FieldError>{fieldErrors.videos}</FieldError>{/if}
					</Field.Field>

					<!-- Resources editor -->
					<Field.Field>
						<div class="flex items-center justify-between">
							<span class="text-sm font-medium">Resources</span>
							<Button variant="outline" size="sm" type="button" onclick={addResource}>
								<Plus class="size-3" /> Add
							</Button>
						</div>
						{#each form.resources as resource, i (resource.id)}
							<div class="flex items-center gap-2">
								<Input
									value={resource.name}
									oninput={(e) => updateResource(i, 'name', inputValue(e))}
									placeholder="Title"
									class="flex-1"
								/>
								<Input
									value={resource.url}
									oninput={(e) => updateResource(i, 'url', inputValue(e))}
									placeholder="https://..."
									class="flex-1"
								/>
								<Button
									variant="ghost"
									size="icon"
									type="button"
									aria-label="Remove"
									onclick={() => removeResource(i)}
								>
									<X class="size-3" />
								</Button>
							</div>
						{/each}
						{#if fieldErrors.resources}<FieldError>{fieldErrors.resources}</FieldError>{/if}
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
							placeholder="Comma separated: halal, product, certification"
							aria-invalid={!!fieldErrors.keywords || undefined}
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
					{editingSlug ? 'Save changes' : 'Create product'}
				{/if}
			</Button>
		</DialogFooter>
	</DialogContent>
</Dialog>

<ConfirmDialog
	bind:open={confirmOpen}
	title="Delete product?"
	description={confirmSlug ? `Delete product ${confirmName}? This cannot be undone.` : undefined}
	confirmLabel={deleting ? 'Deleting…' : 'Delete'}
	onconfirm={confirmedRemove}
/>
