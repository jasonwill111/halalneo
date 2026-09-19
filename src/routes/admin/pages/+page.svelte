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
	import { Empty, EmptyContent, EmptyMedia } from '#lib/components/ui/empty/index.js';
	import Search from '@lucide/svelte/icons/search';
	import Plus from '@lucide/svelte/icons/plus';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Sparkles from '@lucide/svelte/icons/sparkles';
	import RefreshCw from '@lucide/svelte/icons/refresh-cw';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import WifiOff from '@lucide/svelte/icons/wifi-off';
	import FileText from '@lucide/svelte/icons/file-text';
	import StatTile from '#lib/components/site/stat-tile.svelte';
	import ConfirmDialog from '#lib/components/site/confirm-dialog.svelte';
	import { toast } from 'svelte-sonner';
	import {
		focusFirstInvalid,
		mergeServerDetails,
		type ServerFieldDetails
	} from '#lib/utils/forms.js';
	import {
		PAGE_STATUSES,
		PAGE_TYPES,
		pageCreateSchema,
		pageUpdateSchema,
		normalisePageStatus,
		normalisePageType,
		slugifyPage,
		type PageDto,
		type PageListResponse,
		type PageStatus,
		type PageType
	} from '#lib/schemas/pages.js';

	let search = $state('');
	let items = $state<PageDto[]>([]);
	let total = $state(0);
	let loading = $state(true);
	let loadError = $state('');
	/** Network failures and server errors must look different (§3.1). */
	let offline = $state(false);

	let dialogOpen = $state(false);
	let editing = $state<PageDto | null>(null);
	let saving = $state(false);
	let deleting = $state(false);
	let formError = $state('');
	let fieldErrors = $state<Record<string, string>>({});
	let formEl = $state<HTMLFormElement | undefined>(undefined);
	let aiLoading = $state(false);
	let confirmSlug = $state<string | null>(null);
	let confirmTitle = $state('');

	type PageForm = {
		slug: string;
		title: string;
		type: PageType;
		excerpt: string;
		body: string;
		status: PageStatus;
		/** Landing-page copy inputs: they only feed the body generator, they are
		 *  not columns on `pages`, so they are never sent to the API. */
		targetAudience: string;
		keyPoints: string;
		cta: string;
		targetRegion: string;
	};

	const emptyForm = (): PageForm => ({
		slug: '',
		title: '',
		type: 'landing',
		excerpt: '',
		body: '',
		status: 'draft',
		targetAudience: '',
		keyPoints: '',
		cta: '',
		targetRegion: ''
	});

	let form = $state<PageForm>(emptyForm());

	const typeLabels: Record<PageType, string> = {
		landing: 'Marketing',
		blog: 'Blog'
	};

	const published = $derived(items.filter((p) => p.status === 'published').length);

	const filtered = $derived.by(() => {
		if (!search.trim()) return items;
		const q = search.toLowerCase();
		return items.filter((p) => p.title.toLowerCase().includes(q) || p.slug.includes(q));
	});

	async function loadItems() {
		loading = true;
		loadError = '';
		offline = false;
		try {
			// `status=all` is the admin view (draft + archived); the endpoint
			// requires an admin session and answers `no-store`.
			const res = await fetch('/api/pages?status=all&limit=100');
			if (!res.ok) {
				const body = (await res.json().catch(() => ({}))) as { error?: string };
				loadError = body.error || `Could not load pages (HTTP ${res.status}).`;
				items = [];
				total = 0;
				return;
			}
			const data = (await res.json().catch(() => null)) as PageListResponse | null;
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
		formError = '';
		fieldErrors = {};
		dialogOpen = true;
	}

	function openEdit(page: PageDto) {
		editing = page;
		form = {
			slug: page.slug,
			title: page.title,
			type: normalisePageType(page.type),
			excerpt: page.excerpt ?? '',
			body: page.body ?? '',
			status: normalisePageStatus(page.status),
			targetAudience: '',
			keyPoints: '',
			cta: '',
			targetRegion: ''
		};
		formError = '';
		fieldErrors = {};
		dialogOpen = true;
	}

	function optional(value: string): string | null {
		const trimmed = value.trim();
		return trimmed.length ? trimmed : null;
	}

	function buildPayload() {
		return {
			slug: (form.slug || slugifyPage(form.title)).trim(),
			title: form.title.trim(),
			type: form.type,
			excerpt: optional(form.excerpt) ?? '',
			body: form.body.trim(),
			status: form.status
		};
	}

	async function showFieldErrors(details: ServerFieldDetails) {
		fieldErrors = mergeServerDetails({}, details);
		await tick();
		focusFirstInvalid(formEl);
	}

	async function save(e: SubmitEvent) {
		e.preventDefault();
		if (saving) return;
		fieldErrors = {};
		formError = '';

		const payload = buildPayload();
		const parsed = editing
			? pageUpdateSchema.safeParse(payload)
			: pageCreateSchema.safeParse(payload);
		if (!parsed.success) {
			await showFieldErrors(parsed.error.flatten().fieldErrors);
			return;
		}

		saving = true;
		try {
			const res = await fetch(
				editing ? `/api/pages/${encodeURIComponent(editing.slug)}` : '/api/pages',
				{
					method: editing ? 'PUT' : 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(payload)
				}
			);
			if (res.ok) {
				dialogOpen = false;
				toast.success(editing ? 'Page updated' : 'Page created');
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
			formError = body.error || 'Could not save this page.';
			toast.error(formError);
		} catch {
			formError = 'Network error — your changes were not saved.';
			toast.error(formError);
		} finally {
			saving = false;
		}
	}

	function remove(page: PageDto) {
		confirmSlug = page.slug;
		confirmTitle = page.title;
	}

	async function confirmedRemove() {
		if (!confirmSlug) return;
		const slug = confirmSlug;
		deleting = true;
		try {
			const res = await fetch(`/api/pages/${encodeURIComponent(slug)}`, { method: 'DELETE' });
			if (res.ok) {
				toast.success('Page deleted');
				await loadItems();
			} else {
				const body = (await res.json().catch(() => ({}))) as { error?: string };
				toast.error(body.error || 'Could not delete this page.');
			}
		} catch {
			toast.error('Network error — the page was not deleted.');
		} finally {
			deleting = false;
			confirmSlug = null;
			confirmTitle = '';
		}
	}

	function typeLabel(t: string): string {
		return t === 'blog' ? 'Blog' : t === 'landing' ? 'Marketing' : t;
	}

	function statusColor(s: string): string {
		if (s === 'published') return 'bg-success/10 text-success';
		if (s === 'draft') return 'bg-warn/10 text-warn';
		return 'bg-muted text-muted-foreground';
	}

	async function generateLandingPage() {
		aiLoading = true;
		await new Promise((r) => setTimeout(r, 1000));
		const audience = form.targetAudience || 'businesses and professionals';
		const points = form.keyPoints || 'quality products, competitive pricing, reliable delivery';
		const cta = form.cta || 'Get Started Today';
		const region = form.targetRegion || 'global';
		form.excerpt =
			form.excerpt || `${form.title} — tailored for ${audience} in the ${region} market.`;
		form.body = `## ${form.title}\n\n### Hero Section\n\n**Headline:** ${form.title}\n**Subheadline:** ${form.excerpt}\n**CTA:** ${cta}\n\n---\n\n### Key Benefits\n\n${points
			.split(',')
			.map((p: string) => `- **${p.trim()}** — Why this matters for ${audience}`)
			.join(
				'\n'
			)}\n\n---\n\n### Why Choose Us\n\n[Expand on unique value proposition for ${region} market]\n\n---\n\n### How It Works\n\n1. **Step One** — [Describe first step]\n2. **Step Two** — [Describe second step]\n3. **Step Three** — [Describe third step]\n\n---\n\n### Testimonials\n\n> "[Add customer quote for ${region} market]"\n> — Customer Name, Company\n\n---\n\n### FAQ\n\n**Q: [Common question for ${audience}?]**\nA: [Answer addressing the concern]\n\n**Q: [Another question?]**\nA: [Answer]\n\n---\n\n### ${cta}\n\n[Final CTA section with contact/registration link]\n\n---\n\n*Target Region: ${region} | Audience: ${audience}*`;
		aiLoading = false;
	}
</script>

<svelte:head>
	<title>Pages — HalalNeo Admin</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="space-y-4 sm:space-y-6">
	<div class="flex flex-wrap items-end justify-between gap-4">
		<div class="flex flex-col gap-1">
			<h1 class="text-2xl font-semibold tracking-tight sm:text-3xl">Pages</h1>
			<p class="max-w-2xl text-sm text-muted-foreground">Manage landing pages and blog content.</p>
		</div>
		<Button variant="default" size="sm" onclick={openCreate}>
			<Plus class="size-4"></Plus>
			Generate New Page
		</Button>
	</div>

	<div class="relative max-w-sm">
		<Search
			class="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
		></Search>
		<Input bind:value={search} placeholder="Search pages..." class="pl-9" />
	</div>

	<div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
		<StatTile value={total} label="Total Pages" />
		<StatTile
			value={`${items.length > 0 ? Math.round((published / items.length) * 100) : 0}%`}
			label="Published"
		/>
		<StatTile
			value={items.reduce((sum, p) => sum + (p.views ?? 0), 0).toLocaleString()}
			label="Total Views"
		/>
	</div>

	<div class="overflow-x-auto rounded-xl ring-1 ring-foreground/10">
		<Table>
			<TableHeader>
				<TableRow class="hover:bg-transparent">
					<TableHead>Title</TableHead>
					<TableHead>Type</TableHead>
					<TableHead>Status</TableHead>
					<TableHead>Views</TableHead>
					<TableHead class="text-right">Actions</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{#if loading}
					{#each [0, 1, 2, 3] as row (row)}
						<TableRow>
							<TableCell><Skeleton class="h-4 w-40" /></TableCell>
							<TableCell><Skeleton class="h-4 w-20" /></TableCell>
							<TableCell><Skeleton class="h-4 w-16" /></TableCell>
							<TableCell><Skeleton class="h-4 w-12" /></TableCell>
							<TableCell class="text-right"><Skeleton class="ml-auto h-8 w-16" /></TableCell>
						</TableRow>
					{/each}
				{:else if loadError}
					<TableRow>
						<TableCell colspan={5} class="py-8">
							<Empty>
								<EmptyMedia>
									{#if offline}
										<WifiOff class="size-6 text-muted-foreground" />
									{:else}
										<TriangleAlert class="size-6 text-destructive" />
									{/if}
								</EmptyMedia>
								<div class="space-y-1">
									<p class="font-medium">{offline ? 'Connection failed' : 'Could not load pages'}</p>
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
						<TableCell colspan={5} class="py-8">
							<Empty>
								<EmptyMedia><FileText class="size-6 text-muted-foreground" /></EmptyMedia>
								<div class="space-y-1">
									<p class="font-medium">
										{search.trim() ? 'No matching pages' : 'No pages yet'}
									</p>
									<p class="text-sm text-muted-foreground">
										{search.trim()
											? `Nothing matches “${search.trim()}” in the loaded pages.`
											: 'Create a landing or blog page to publish content.'}
									</p>
								</div>
								{#if !search.trim()}
									<EmptyContent>
										<Button variant="default" size="sm" onclick={openCreate}>
											<Plus class="size-4"></Plus>
											Generate New Page
										</Button>
									</EmptyContent>
								{/if}
							</Empty>
						</TableCell>
					</TableRow>
				{:else}
					{#each filtered as p (p.slug)}
						<TableRow>
							<TableCell>
								<div class="min-w-0">
									<p class="truncate font-medium">{p.title}</p>
									<p class="truncate text-xs text-muted-foreground">{p.slug}</p>
								</div>
							</TableCell>
							<TableCell>{typeLabel(p.type)}</TableCell>
							<TableCell>
								<Badge
									variant={p.status === 'published' ? 'default' : 'secondary'}
									class={`text-2xs capitalize ${statusColor(p.status)}`}>{p.status}</Badge
								>
							</TableCell>
							<TableCell class="text-muted-foreground">{(p.views ?? 0).toLocaleString()}</TableCell>
							<TableCell class="text-right">
								<div class="flex items-center justify-end gap-1">
									<Button
										variant="ghost"
										size="icon"
										aria-label="Edit"
										class="size-8"
										onclick={() => openEdit(p)}
									>
										<Pencil class="size-3.5"></Pencil>
									</Button>
									<Button
										variant="ghost"
										size="icon"
										aria-label="Delete"
										class="size-8 hover:bg-destructive/10 hover:text-destructive"
										onclick={() => remove(p)}
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
			Showing {items.length} of {total} pages (API caps at 100).
		</p>
	{/if}
</div>

<Dialog bind:open={dialogOpen}>
	<DialogContent class="max-h-[85dvh] overflow-y-auto sm:max-w-lg">
		<DialogHeader>
			<DialogTitle>{editing ? 'Edit page' : 'New page'}</DialogTitle>
			<DialogDescription>Create or update a page in the site.</DialogDescription>
		</DialogHeader>

		<form bind:this={formEl} onsubmit={save} class="contents">
			<div class="flex flex-col gap-4">
				<Field.Field>
					<Field.FieldLabel>Title *</Field.FieldLabel>
					<Input
						bind:value={form.title}
						placeholder="Page title"
						disabled={saving}
						aria-invalid={!!fieldErrors.title}
						oninput={() => { fieldErrors.title = ''; formError = ''; }}
					/>
					{#if fieldErrors.title}<FieldError>{fieldErrors.title}</FieldError>{/if}
				</Field.Field>

				<div class="grid grid-cols-2 gap-4">
					<Field.Field>
						<Field.FieldLabel>Slug</Field.FieldLabel>
						<Input
							bind:value={form.slug}
							placeholder="page-slug"
							disabled={!!editing || saving}
							aria-invalid={!!fieldErrors.slug}
							oninput={() => { fieldErrors.slug = ''; formError = ''; }}
						/>
						{#if fieldErrors.slug}<FieldError>{fieldErrors.slug}</FieldError>{/if}
					</Field.Field>
					<Field.Field>
						<Field.FieldLabel>Type</Field.FieldLabel>
						<Select bind:value={form.type} type="single">
							<SelectTrigger class="w-full" disabled={saving}>
								{typeLabels[form.type]}
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									{#each PAGE_TYPES as value (value)}
										<SelectItem {value}>{typeLabels[value]}</SelectItem>
									{/each}
								</SelectGroup>
							</SelectContent>
						</Select>
					</Field.Field>
				</div>

				<Field.Field>
					<Field.FieldLabel>Status</Field.FieldLabel>
					<Select bind:value={form.status} type="single">
						<SelectTrigger class="w-full" disabled={saving}>{form.status}</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								{#each PAGE_STATUSES as s (s)}
									<SelectItem value={s}>{s}</SelectItem>
								{/each}
							</SelectGroup>
						</SelectContent>
					</Select>
				</Field.Field>

				<Field.Field>
					<Field.FieldLabel>Excerpt</Field.FieldLabel>
					<Input bind:value={form.excerpt} placeholder="Short description..." disabled={saving} />
				</Field.Field>

				{#if form.type === 'landing'}
					<div class="space-y-3 rounded-xl border border-dashed border-border p-4">
						<p class="text-xs font-medium tracking-wide text-muted-foreground uppercase">
							Landing Page Settings
						</p>
						<div class="grid grid-cols-2 gap-3">
							<Field.Field>
								<Field.FieldLabel>Target Audience</Field.FieldLabel>
								<Input
									bind:value={form.targetAudience}
									placeholder="e.g. food importers in UAE"
									disabled={saving}
								/>
							</Field.Field>
							<Field.Field>
								<Field.FieldLabel>Target Region</Field.FieldLabel>
								<Input
									bind:value={form.targetRegion}
									placeholder="e.g. Middle East, Southeast Asia"
									disabled={saving}
								/>
							</Field.Field>
						</div>
						<Field.Field>
							<Field.FieldLabel>Key Selling Points</Field.FieldLabel>
							<Input
								bind:value={form.keyPoints}
								placeholder="Comma separated: quality, certification, delivery"
								disabled={saving}
							/>
						</Field.Field>
						<Field.Field>
							<Field.FieldLabel>Call to Action</Field.FieldLabel>
							<Input
								bind:value={form.cta}
								placeholder="e.g. Get a Free Quote, Contact Us"
								disabled={saving}
							/>
						</Field.Field>
					</div>
				{/if}

				<Field.Field>
					<div class="flex items-center justify-between">
						<Field.FieldLabel>Body</Field.FieldLabel>
						{#if form.type === 'landing'}
							<Button
								variant="outline"
								size="sm"
								type="button"
								onclick={generateLandingPage}
								disabled={aiLoading || saving || !form.title.trim()}
							>
								<Sparkles class="size-3.5" />
								{aiLoading ? 'Generating...' : 'Generate Landing Page'}
							</Button>
						{/if}
					</div>
					<Textarea
						bind:value={form.body}
						rows={6}
						placeholder="Page content..."
						disabled={saving}
						aria-invalid={!!fieldErrors.body}
						oninput={() => { fieldErrors.body = ''; }}
					/>
					{#if fieldErrors.body}<FieldError>{fieldErrors.body}</FieldError>{/if}
				</Field.Field>
			</div>

			{#if formError}
				<p class="text-sm text-destructive">{formError}</p>
			{/if}

			<DialogFooter>
				<Button variant="outline" type="button" disabled={saving} onclick={() => (dialogOpen = false)}>Cancel</Button>
				<Button variant="default" type="submit" disabled={saving}>
					{saving ? 'Saving…' : editing ? 'Save changes' : 'Create page'}
				</Button>
			</DialogFooter>
		</form>
	</DialogContent>
</Dialog>

<ConfirmDialog
	open={confirmSlug !== null}
	title="Delete page?"
	description={`Delete page "${confirmTitle}"? This cannot be undone.`}
	confirmLabel={deleting ? 'Deleting…' : 'Delete'}
	onconfirm={confirmedRemove}
/>
