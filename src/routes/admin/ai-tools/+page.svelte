<script lang="ts">
	import { tick } from 'svelte';
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
	import { Empty, EmptyContent } from '#lib/components/ui/empty/index.js';
	import BrandedEmptyMedia from '#lib/components/site/branded-empty-media.svelte';
	import Plus from '@lucide/svelte/icons/plus';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import Bot from '@lucide/svelte/icons/bot';
	import RefreshCw from '@lucide/svelte/icons/refresh-cw';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import WifiOff from '@lucide/svelte/icons/wifi-off';
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import ConfirmDialog from '#lib/components/site/confirm-dialog.svelte';
	import { toast } from 'svelte-sonner';
	import {
		focusFirstInvalid,
		mergeServerDetails,
		type ServerFieldDetails
	} from '#lib/utils/forms.js';
	import {
		AI_TOOL_CATEGORIES,
		AI_TOOL_STATUSES,
		CATEGORY_LABELS,
		aiToolCreateSchema,
		aiToolUpdateSchema,
		normaliseAiToolCategory,
		normaliseAiToolStatus,
		type AiToolCategory,
		type AiToolDto,
		type AiToolListResponse,
		type AiToolStatus
	} from '#lib/schemas/ai-tools.js';

	let items = $state<AiToolDto[]>([]);
	let total = $state(0);
	let loading = $state(true);
	let loadError = $state('');
	/** Network failures and server errors must look different (§3.1). */
	let offline = $state(false);

	let dialogOpen = $state(false);
	let editing = $state<AiToolDto | null>(null);
	let saving = $state(false);
	let deleting = $state(false);
	let confirmSlug = $state<string | null>(null);
	let confirmName = $state('');

	type ToolForm = {
		slug: string;
		name: string;
		description: string;
		longDescription: string;
		features: string;
		category: AiToolCategory;
		status: AiToolStatus;
	};

	const emptyForm = (): ToolForm => ({
		slug: '',
		name: '',
		description: '',
		longDescription: '',
		features: '',
		category: 'assistant',
		status: 'disabled'
	});

	let form = $state<ToolForm>(emptyForm());
	let errors = $state<Record<string, string>>({});
	let formError = $state('');
	let formEl = $state<HTMLFormElement | undefined>(undefined);

	const categoryOptions = AI_TOOL_CATEGORIES.map((value) => ({
		value,
		label: CATEGORY_LABELS[value]
	}));

	function slugify(value: string): string {
		return value
			.toLowerCase()
			.trim()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/(^-|-$)/g, '');
	}

	const reservedSlugs = [
		'about',
		'account',
		'admin',
		'blog',
		'categories',
		'contact',
		'faq',
		'glossary',
		'knowledge-base',
		'login',
		'products',
		'register',
		'search',
		'suppliers',
		'tools'
	];

	async function loadItems() {
		loading = true;
		loadError = '';
		offline = false;
		try {
			// `status=all` is the admin view (disabled tools included); the
			// endpoint requires an admin session and answers `no-store`.
			const res = await fetch('/api/ai-tools?status=all&limit=100');
			if (!res.ok) {
				const body = (await res.json().catch(() => ({}))) as { error?: string };
				loadError = body.error || `Could not load AI tools (HTTP ${res.status}).`;
				items = [];
				total = 0;
				return;
			}
			const data = (await res.json().catch(() => null)) as AiToolListResponse | null;
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
		void loadItems();
	});

	function openCreate() {
		editing = null;
		form = emptyForm();
		errors = {};
		formError = '';
		dialogOpen = true;
	}

	function openEdit(t: AiToolDto) {
		editing = t;
		form = {
			slug: t.slug,
			name: t.name,
			description: t.description ?? '',
			longDescription: t.longDescription ?? '',
			features: (t.features ?? []).join(', '),
			category: normaliseAiToolCategory(t.category),
			status: normaliseAiToolStatus(t.status)
		};
		errors = {};
		formError = '';
		dialogOpen = true;
	}

	function buildPayload() {
		const slug = (form.slug || slugify(form.name)).trim();
		return {
			slug,
			name: form.name.trim(),
			description: form.description.trim(),
			longDescription: form.longDescription.trim(),
			features: form.features
				.split(',')
				.map((f) => f.trim())
				.filter(Boolean),
			category: form.category,
			status: form.status
		};
	}

	async function showFieldErrors(details: ServerFieldDetails) {
		errors = mergeServerDetails({}, details);
		await tick();
		focusFirstInvalid(formEl);
	}

	async function save(e: SubmitEvent) {
		e.preventDefault();
		if (saving) return;
		errors = {};
		formError = '';

		const payload = buildPayload();
		const parsed = editing
			? aiToolUpdateSchema.safeParse(payload)
			: aiToolCreateSchema.safeParse(payload);
		if (!parsed.success) {
			await showFieldErrors(parsed.error.flatten().fieldErrors);
			return;
		}

		if (reservedSlugs.includes(payload.slug)) {
			errors = { slug: `"${payload.slug}" is a reserved route and cannot be used as a tool slug.` };
			await tick();
			focusFirstInvalid(formEl);
			return;
		}
		if (!editing && items.some((t) => t.slug === payload.slug)) {
			errors = { slug: 'A tool with that slug already exists.' };
			await tick();
			focusFirstInvalid(formEl);
			return;
		}

		saving = true;
		try {
			const res = await fetch(
				editing ? `/api/ai-tools/${encodeURIComponent(editing.slug)}` : '/api/ai-tools',
				{
					method: editing ? 'PUT' : 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(payload)
				}
			);
			if (res.ok) {
				dialogOpen = false;
				toast.success(editing ? 'Tool updated' : 'Tool created');
				await loadItems();
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
			formError = body.error || 'Could not save this tool.';
			toast.error(formError);
		} catch {
			formError = 'Network error — your changes were not saved.';
			toast.error(formError);
		} finally {
			saving = false;
		}
	}

	function remove(t: AiToolDto) {
		confirmSlug = t.slug;
		confirmName = t.name;
	}

	async function confirmedRemove() {
		if (!confirmSlug) return;
		const slug = confirmSlug;
		deleting = true;
		try {
			const res = await fetch(`/api/ai-tools/${encodeURIComponent(slug)}`, { method: 'DELETE' });
			if (res.ok) {
				toast.success('Tool deleted');
				await loadItems();
			} else {
				const body = (await res.json().catch(() => ({}))) as { error?: string };
				toast.error(body.error || 'Could not delete this tool.');
			}
		} catch {
			toast.error('Network error — the tool was not deleted.');
		} finally {
			deleting = false;
			confirmSlug = null;
			confirmName = '';
		}
	}
</script>

<svelte:head><title>AI Tools — HalalNeo Admin</title></svelte:head>

<div class="space-y-4 sm:space-y-6">
	<div class="flex flex-wrap items-end justify-between gap-4">
		<div class="space-y-1">
			<h1 class="text-2xl font-semibold tracking-tight sm:text-3xl">AI Tools</h1>
			<p class="max-w-2xl text-sm text-muted-foreground">
				AI-powered tools offered to platform users. Enable or disable tool availability.
			</p>
		</div>
		<Button variant="default" onclick={openCreate}>
			<Plus class="size-4"></Plus>
			New tool
		</Button>
	</div>

	<div class="overflow-x-auto rounded-xl ring-1 ring-foreground/10">
		<Table>
			<TableHeader>
				<TableRow class="hover:bg-transparent">
					<TableHead>Tool</TableHead>
					<TableHead>Slug</TableHead>
					<TableHead>Category</TableHead>
					<TableHead>Status</TableHead>
					<TableHead class="text-end">Actions</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{#if loading}
					{#each [0, 1, 2] as row (row)}
						<TableRow>
							<TableCell><Skeleton class="h-8 w-48" /></TableCell>
							<TableCell><Skeleton class="h-4 w-28" /></TableCell>
							<TableCell><Skeleton class="h-4 w-20" /></TableCell>
							<TableCell><Skeleton class="h-4 w-16" /></TableCell>
							<TableCell class="text-end"><Skeleton class="ms-auto h-8 w-20" /></TableCell>
						</TableRow>
					{/each}
				{:else if loadError}
					<TableRow>
						<TableCell colspan={5} class="py-8">
							<Empty>
								<BrandedEmptyMedia>
									{#if offline}
										<WifiOff class="size-6 text-muted-foreground" />
									{:else}
										<TriangleAlert class="size-6 text-destructive" />
									{/if}
								</BrandedEmptyMedia>
								<div class="space-y-1">
									<p class="font-medium">
										{offline ? 'Connection failed' : 'Could not load AI tools'}
									</p>
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
				{:else if items.length === 0}
					<TableRow>
						<TableCell colspan={5} class="py-8">
							<Empty>
								<BrandedEmptyMedia><Bot class="size-6 text-muted-foreground" /></BrandedEmptyMedia>
								<div class="space-y-1">
									<p class="font-medium">No AI tools yet</p>
									<p class="text-sm text-muted-foreground">
										Register a tool to make it available in the tools directory.
									</p>
								</div>
								<EmptyContent>
									<Button variant="default" size="sm" onclick={openCreate}>
										<Plus class="size-4"></Plus>
										New tool
									</Button>
								</EmptyContent>
							</Empty>
						</TableCell>
					</TableRow>
				{:else}
					{#each items as t (t.slug)}
						<TableRow>
							<TableCell>
								<div class="flex items-center gap-3">
									<div
										class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/15"
									>
										<Bot class="size-4 text-primary"></Bot>
									</div>
									<div class="min-w-0">
										<p class="truncate font-medium">{t.name}</p>
										<p class="truncate text-xs text-muted-foreground">{t.description}</p>
									</div>
								</div>
							</TableCell>
							<TableCell class="text-sm text-muted-foreground">{t.slug}</TableCell>
							<TableCell class="text-sm text-muted-foreground"
								>{CATEGORY_LABELS[normaliseAiToolCategory(t.category)]}</TableCell
							>
							<TableCell>
								<Badge variant={t.status === 'active' ? 'default' : 'secondary'}>{t.status}</Badge>
							</TableCell>
							<TableCell class="text-end">
								<div class="flex items-center justify-end gap-1">
									{#if t.status === 'active'}
										<Button
											href={localizeHref(`/${t.slug}`)}
											variant="ghost"
											size="icon"
											aria-label="View tool page"
										>
											<ExternalLink class="size-4"></ExternalLink>
										</Button>
									{/if}
									<Button variant="ghost" size="icon" aria-label="Edit" onclick={() => openEdit(t)}>
										<Pencil class="size-4"></Pencil>
									</Button>
									<Button
										variant="ghost"
										size="icon"
										aria-label="Delete"
										class="hover:bg-destructive/10 hover:text-destructive"
										onclick={() => remove(t)}
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
			Showing {items.length} of {total} tools (API caps at 100).
		</p>
	{/if}
</div>

<Dialog bind:open={dialogOpen}>
	<DialogContent class="sm:max-w-lg">
		<DialogHeader>
			<DialogTitle>{editing ? 'Edit tool' : 'New tool'}</DialogTitle>
			<DialogDescription>Register or update an AI tool offered on the platform.</DialogDescription>
		</DialogHeader>
		<form bind:this={formEl} onsubmit={save} class="space-y-4">
			<div class="space-y-4">
				<Field.Field>
					<Field.FieldLabel>Name</Field.FieldLabel>
					<Input
						bind:value={form.name}
						placeholder="Certification Checker"
						disabled={saving}
						aria-invalid={!!errors.name}
						oninput={() => {
							errors.name = '';
							formError = '';
						}}
					/>
					{#if errors.name}<FieldError>{errors.name}</FieldError>{/if}
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel>Slug</Field.FieldLabel>
					<Input
						bind:value={form.slug}
						placeholder="certification-checker"
						disabled={!!editing || saving}
						aria-invalid={!!errors.slug}
						oninput={() => {
							errors.slug = '';
							formError = '';
						}}
					/>
					<p class="text-xs text-muted-foreground">
						Unique URL segment — auto-derived from the name when left blank.
					</p>
					{#if errors.slug}<FieldError>{errors.slug}</FieldError>{/if}
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel>Category</Field.FieldLabel>
					<Select bind:value={form.category} type="single">
						<SelectTrigger class="w-full" disabled={saving}>
							{CATEGORY_LABELS[form.category]}
						</SelectTrigger>
						<SelectContent>
							{#each categoryOptions as opt (opt.value)}
								<SelectItem value={opt.value}>{opt.label}</SelectItem>
							{/each}
						</SelectContent>
					</Select>
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel>Status</Field.FieldLabel>
					<Select bind:value={form.status} type="single">
						<SelectTrigger class="w-full" disabled={saving}>{form.status}</SelectTrigger>
						<SelectContent>
							{#each AI_TOOL_STATUSES as s (s)}
								<SelectItem value={s}>{s}</SelectItem>
							{/each}
						</SelectContent>
					</Select>
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel>Short description</Field.FieldLabel>
					<Textarea
						bind:value={form.description}
						rows={2}
						placeholder="What the tool does..."
						disabled={saving}
						aria-invalid={!!errors.description}
					/>
					{#if errors.description}<FieldError>{errors.description}</FieldError>{/if}
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel>Long description</Field.FieldLabel>
					<Textarea
						bind:value={form.longDescription}
						rows={3}
						placeholder="Page-level description shown on the tool's dedicated page"
						disabled={saving}
						aria-invalid={!!errors.longDescription}
					/>
					{#if errors.longDescription}<FieldError>{errors.longDescription}</FieldError>{/if}
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel>Features</Field.FieldLabel>
					<Textarea
						bind:value={form.features}
						rows={3}
						placeholder="Comma-separated features shown on the tool page..."
						disabled={saving}
						aria-invalid={!!errors.features}
					/>
					<p class="text-xs text-muted-foreground">Keep each feature under 300 characters.</p>
					{#if errors.features}<FieldError>{errors.features}</FieldError>{/if}
				</Field.Field>
			</div>

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
				<Button variant="default" type="submit" disabled={saving}
					>{saving ? 'Saving…' : editing ? 'Save changes' : 'Create tool'}</Button
				>
			</DialogFooter>
		</form>
	</DialogContent>
</Dialog>

<ConfirmDialog
	open={confirmSlug !== null}
	title="Delete AI tool?"
	description={`Delete tool "${confirmName}"? This cannot be undone.`}
	confirmLabel={deleting ? 'Deleting…' : 'Delete'}
	onconfirm={confirmedRemove}
/>
