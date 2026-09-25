<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import {
		KB_SECTIONS,
		kbSectionLabel,
		kbSectionSchema,
		kbStatusSchema,
		knowledgeArticleCreateSchema,
		type KbAdminRow,
		type KbSection,
		type KbStatus
	} from '#lib/schemas/knowledge.js';
	import { parseTagList, slugify, splitTags } from '#lib/schemas/content.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Textarea } from '#lib/components/ui/textarea/index.js';
	import * as Field from '#lib/components/ui/field/index.js';
	import { FieldError } from '#lib/components/ui/field/index.js';
	import { Skeleton } from '#lib/components/ui/skeleton/index.js';
	import { Empty, EmptyContent } from '#lib/components/ui/empty/index.js';
	import BrandedEmptyMedia from '#lib/components/site/branded-empty-media.svelte';
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
	import Search from '@lucide/svelte/icons/search';
	import Plus from '@lucide/svelte/icons/plus';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Sparkles from '@lucide/svelte/icons/sparkles';
	import RefreshCw from '@lucide/svelte/icons/refresh-cw';
	import AlertTriangle from '@lucide/svelte/icons/alert-triangle';
	import FileText from '@lucide/svelte/icons/file-text';
	import CollapsibleSection from '#lib/components/site/collapsible-section.svelte';
	import Paginator from '#lib/components/site/paginator.svelte';
	import ConfirmDialog from '#lib/components/site/confirm-dialog.svelte';
	import { toast } from 'svelte-sonner';
	import {
		focusFirstInvalid,
		mergeServerDetails,
		type ServerFieldDetails
	} from '#lib/utils/forms.js';

	const PAGE_SIZE = 20;
	const SECTION_OPTIONS = KB_SECTIONS.map((slug) => ({ slug, label: kbSectionLabel(slug) }));
	const STATUS_OPTIONS: KbStatus[] = ['published', 'draft', 'archived'];

	type LoadError = { kind: 'network' | 'auth' | 'server'; message: string };

	/** `GET /api/knowledge-base/<slug>` returns the full row (the list projection omits `body`). */
	type KbDetailRow = KbAdminRow & {
		body: string | null;
		metaTitle: string | null;
		metaDescription: string | null;
		keywords: string | null;
	};

	let items = $state<KbAdminRow[]>([]);
	let loading = $state(true);
	let loadError = $state<LoadError | null>(null);
	let search = $state('');
	let page_ = $state(1);

	let dialogOpen = $state(false);
	/** Row being edited, or `null` when creating. `slug` is the immutable key. */
	let editing = $state<KbAdminRow | null>(null);
	let saving = $state(false);
	let deleting = $state(false);
	/** `true` while the Markdown body is fetched for an edit (list omits `body`). */
	let bodyLoading = $state(false);
	let seoExpanded = $state(false);
	let confirmSlug = $state<string | null>(null);
	let confirmTitle = $state('');

	type ArticleForm = {
		section: KbSection;
		slug: string;
		title: string;
		summary: string;
		tags: string;
		body: string;
		author: string;
		status: KbStatus;
		metaTitle: string;
		metaDescription: string;
		keywords: string;
	};

	function emptyForm(): ArticleForm {
		return {
			section: 'halal-certification',
			slug: '',
			title: '',
			summary: '',
			tags: '',
			body: '',
			author: '',
			status: 'draft',
			metaTitle: '',
			metaDescription: '',
			keywords: ''
		};
	}

	let form = $state<ArticleForm>(emptyForm());
	let formError = $state('');
	let fieldErrors = $state<Record<string, string>>({});
	let formEl = $state<HTMLFormElement | undefined>(undefined);

	const filtered = $derived.by(() => {
		if (!search.trim()) return items;
		const q = search.toLowerCase();
		return items.filter(
			(a) =>
				a.title.toLowerCase().includes(q) ||
				a.slug.includes(q) ||
				(a.summary ?? '').toLowerCase().includes(q) ||
				kbSectionLabel(a.section).toLowerCase().includes(q)
		);
	});

	const totalPages = $derived(Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)));
	const paged = $derived(filtered.slice((page_ - 1) * PAGE_SIZE, page_ * PAGE_SIZE));

	$effect(() => {
		void search;
		page_ = 1;
	});

	async function loadItems() {
		loading = true;
		loadError = null;
		try {
			// status=all → admin overview (drafts included), never edge-cached.
			const res = await fetch('/api/knowledge-base?status=all&limit=100');
			if (!res.ok) {
				const data = (await res.json().catch(() => ({}))) as { error?: string };
				loadError = {
					kind: res.status === 401 || res.status === 403 ? 'auth' : 'server',
					message: data.error ?? `Request failed (${res.status})`
				};
				items = [];
			} else {
				const data = (await res.json()) as { items?: KbAdminRow[] };
				items = data.items ?? [];
			}
		} catch {
			loadError = { kind: 'network', message: 'Could not reach the knowledge base API.' };
			items = [];
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
		saving = false;
		bodyLoading = false;
		seoExpanded = false;
		dialogOpen = true;
	}

	function fillForm(row: KbDetailRow) {
		const status = kbStatusSchema.safeParse(row.status);
		form = {
			section: sectionOf(row.section),
			slug: row.slug,
			title: row.title,
			summary: row.summary ?? '',
			tags: parseTagList(row.tags).join(', '),
			body: row.body ?? '',
			author: row.author ?? '',
			status: status.success ? status.data : 'draft',
			metaTitle: row.metaTitle ?? '',
			metaDescription: row.metaDescription ?? '',
			keywords: row.keywords ?? ''
		};
	}

	/** Rows are enum-typed, but a hand-edited DB value must not break the Select. */
	function sectionOf(value: string): KbSection {
		const parsed = kbSectionSchema.safeParse(value);
		return parsed.success ? parsed.data : 'halal-certification';
	}

	async function openEdit(row: KbAdminRow) {
		editing = row;
		fillForm({ ...row, body: null, metaTitle: null, metaDescription: null, keywords: null });
		formError = '';
		fieldErrors = {};
		saving = false;
		seoExpanded = false;
		bodyLoading = true;
		dialogOpen = true;
		try {
			const res = await fetch(`/api/knowledge-base/${encodeURIComponent(row.slug)}`);
			if (!res.ok) {
				const data = (await res.json().catch(() => ({}))) as { error?: string };
				toast.error(data.error ?? 'Could not load the article body.');
				dialogOpen = false;
				return;
			}
			const detail = (await res.json()) as KbDetailRow;
			fillForm(detail);
		} catch {
			toast.error('Network error — the article body could not be loaded.');
			dialogOpen = false;
		} finally {
			bodyLoading = false;
		}
	}

	/** Deep link from /admin/content/knowledge ("edit this article"). */
	const editParam = $derived(page.url.searchParams.get('edit'));
	$effect(() => {
		if (!editParam || loading || loadError || dialogOpen) return;
		const row = items.find((i) => i.slug === editParam);
		if (row) void openEdit(row);
		else toast.error('That article is not in the loaded set (newest 100).');
		void goto('/admin/content/knowledge/editor', { replace: true, reset: false });
	});

	/** Payload builder — trimmed values only; Zod owns the rest (§6.4). */
	function buildPayload() {
		return {
			slug: form.slug.trim() || slugify(form.title),
			section: form.section,
			title: form.title.trim(),
			summary: form.summary.trim(),
			body: form.body,
			tags: splitTags(form.tags),
			author: form.author.trim(),
			status: form.status,
			metaTitle: form.metaTitle.trim(),
			metaDescription: form.metaDescription.trim(),
			keywords: form.keywords.trim()
		};
	}

	async function save(e: Event) {
		e.preventDefault();
		fieldErrors = {};
		formError = '';

		const payload = buildPayload();
		const parsed = knowledgeArticleCreateSchema.safeParse(payload);
		if (!parsed.success) {
			fieldErrors = mergeServerDetails({}, parsed.error.flatten().fieldErrors);
			toast.warning('Please fix the highlighted fields.');
			focusFirstInvalid(formEl);
			return;
		}

		saving = true;
		try {
			const { slug, ...rest } = parsed.data;
			const res = await fetch(
				editing ? `/api/knowledge-base/${encodeURIComponent(editing.slug)}` : '/api/knowledge-base',
				{
					method: editing ? 'PUT' : 'POST',
					headers: { 'Content-Type': 'application/json' },
					// PUT takes the patch schema (no slug — it is the URL key).
					body: JSON.stringify(editing ? rest : { slug, ...rest })
				}
			);
			if (res.ok) {
				dialogOpen = false;
				toast.success(editing ? 'Article updated' : 'Article created');
				await loadItems();
			} else {
				// Keep what the admin typed — surface the server's field errors instead.
				const data = (await res.json().catch(() => ({}))) as {
					error?: string;
					details?: ServerFieldDetails;
				};
				fieldErrors = mergeServerDetails(fieldErrors, data.details);
				formError = data.error ?? 'Save failed.';
				toast.error(formError);
				focusFirstInvalid(formEl);
			}
		} catch {
			formError = 'Network error — the article was not saved.';
			toast.error('Network error — nothing was saved.');
		} finally {
			saving = false;
		}
	}

	function remove(a: KbAdminRow) {
		confirmSlug = a.slug;
		confirmTitle = a.title;
	}

	async function confirmedRemove() {
		if (!confirmSlug) return;
		deleting = true;
		try {
			const res = await fetch(`/api/knowledge-base/${encodeURIComponent(confirmSlug)}`, {
				method: 'DELETE'
			});
			if (res.ok) {
				toast.success('Article deleted');
				await loadItems();
			} else {
				const data = (await res.json().catch(() => ({}))) as { error?: string };
				toast.error(data.error ?? 'Failed to delete article.');
			}
		} catch {
			toast.error('Network error — the article was not deleted.');
		} finally {
			deleting = false;
			confirmSlug = null;
			confirmTitle = '';
		}
	}

	/** Local Markdown scaffold — a template, not a model call (no AI API exists yet). */
	function generateBody() {
		const section = kbSectionLabel(form.section);
		const title = form.title.trim() || 'Untitled article';
		form.body = `## ${title}

This article covers ${title.toLowerCase()} in the context of ${section}.

### Overview

${form.summary.trim() || 'A comprehensive guide to help buyers and suppliers navigate halal compliance.'}

### Key Points

- Understanding the fundamentals of ${title.toLowerCase()}
- Practical steps for compliance
- Common challenges and how to overcome them

### Detailed Guide

[Write detailed content here]

### Best Practices

1. Always verify certification status
2. Keep documentation up to date
3. Work with recognized certifying bodies

### References

- HalalNeo Knowledge Base
- Relevant certification body guidelines`;
		fieldErrors = { ...fieldErrors, body: '' };
	}
</script>

<svelte:head><title>Knowledge Base — HalalNeo Admin</title></svelte:head>

<div class="space-y-4 sm:space-y-6">
	<div class="flex flex-wrap items-end justify-between gap-4">
		<div class="space-y-1">
			<h1 class="text-2xl font-semibold tracking-tight sm:text-3xl">Knowledge Base</h1>
			<p class="max-w-2xl text-sm text-muted-foreground">
				Articles across {KB_SECTIONS.length} sections{#if !loading && !loadError}
					· {items.length} loaded{/if}.
			</p>
		</div>
		<Button variant="default" onclick={openCreate}>
			<Plus class="size-4"></Plus>
			New article
		</Button>
	</div>

	<div class="relative max-w-sm">
		<Search
			class="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
		></Search>
		<Input bind:value={search} placeholder="Search articles..." class="ps-9" />
	</div>

	{#if loadError}
		<div
			class="flex flex-col items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between"
		>
			<div class="flex min-w-0 items-start gap-2">
				<AlertTriangle class="mt-0.5 size-4 shrink-0 text-destructive" />
				<div class="min-w-0">
					<p class="text-sm font-medium text-destructive">
						{loadError.kind === 'network'
							? 'Connection failed'
							: loadError.kind === 'auth'
								? 'Admin session expired'
								: 'Could not load articles'}
					</p>
					<p class="text-xs text-muted-foreground">
						{loadError.kind === 'auth'
							? 'Sign in again from /admin/login to manage the knowledge base.'
							: loadError.message}
					</p>
				</div>
			</div>
			<Button variant="outline" size="sm" class="gap-1.5" onclick={() => void loadItems()}>
				<RefreshCw class="size-3.5" />
				Retry
			</Button>
		</div>
	{:else}
		<div class="overflow-x-auto rounded-xl ring-1 ring-foreground/10">
			<Table>
				<TableHeader>
					<TableRow class="hover:bg-transparent">
						<TableHead>Article</TableHead>
						<TableHead>Section</TableHead>
						<TableHead>Status</TableHead>
						<TableHead>Tags</TableHead>
						<TableHead class="text-end">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{#if loading}
						{#each Array(5) as _, i (i)}
							<TableRow>
								<TableCell><Skeleton class="h-4 w-40" /></TableCell>
								<TableCell><Skeleton class="h-4 w-28" /></TableCell>
								<TableCell><Skeleton class="h-4 w-16" /></TableCell>
								<TableCell><Skeleton class="h-4 w-24" /></TableCell>
								<TableCell class="text-end"><Skeleton class="ms-auto h-8 w-16" /></TableCell>
							</TableRow>
						{/each}
					{:else if filtered.length === 0}
						<TableRow>
							<TableCell colspan={5} class="py-8">
								{#if items.length === 0}
									<Empty>
										<BrandedEmptyMedia variant="icon"><FileText class="size-6" /></BrandedEmptyMedia
										>
										<div class="space-y-1">
											<p class="font-medium">No articles yet</p>
											<p class="text-sm text-muted-foreground">
												The knowledge base is empty. Publish the first guide.
											</p>
										</div>
										<EmptyContent>
											<Button variant="default" size="sm" class="gap-1.5" onclick={openCreate}>
												<Plus class="size-4" />
												New article
											</Button>
										</EmptyContent>
									</Empty>
								{:else}
									<Empty>
										<BrandedEmptyMedia variant="icon"><Search class="size-6" /></BrandedEmptyMedia>
										<div class="space-y-1">
											<p class="font-medium">No matching articles</p>
											<p class="text-sm text-muted-foreground">
												Nothing matches “{search}”. Try another word.
											</p>
										</div>
										<EmptyContent>
											<Button variant="outline" size="sm" onclick={() => (search = '')}
												>Clear search</Button
											>
										</EmptyContent>
									</Empty>
								{/if}
							</TableCell>
						</TableRow>
					{:else}
						{#each paged as a (a.slug)}
							<TableRow>
								<TableCell>
									<div class="min-w-0">
										<p class="truncate font-medium">{a.title}</p>
										<p class="truncate text-xs text-muted-foreground">{a.slug}</p>
									</div>
								</TableCell>
								<TableCell class="text-sm text-muted-foreground">
									{kbSectionLabel(a.section)}
								</TableCell>
								<TableCell>
									<Badge
										variant={a.status === 'published' ? 'default' : 'secondary'}
										class="text-2xs capitalize">{a.status ?? 'unknown'}</Badge
									>
								</TableCell>
								<TableCell>
									<div class="flex flex-wrap gap-1">
										{#each parseTagList(a.tags).slice(0, 3) as tag (tag)}
											<Badge variant="secondary">{tag}</Badge>
										{/each}
									</div>
								</TableCell>
								<TableCell class="text-end">
									<div class="flex items-center justify-end gap-1">
										<Button
											variant="ghost"
											size="icon"
											aria-label="Edit"
											onclick={() => openEdit(a)}
										>
											<Pencil class="size-4"></Pencil>
										</Button>
										<Button
											variant="ghost"
											size="icon"
											aria-label="Delete"
											class="hover:bg-destructive/10 hover:text-destructive"
											onclick={() => remove(a)}
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

		<div class="flex justify-center">
			<Paginator bind:page={page_} {totalPages} />
		</div>
	{/if}
</div>

<Dialog bind:open={dialogOpen}>
	<DialogContent class="max-h-[85dvh] overflow-y-auto sm:max-w-lg">
		<DialogHeader>
			<DialogTitle>{editing ? 'Edit article' : 'New article'}</DialogTitle>
			<DialogDescription>Create or update a knowledge base article.</DialogDescription>
		</DialogHeader>
		<form bind:this={formEl} onsubmit={save} class="space-y-4">
			<Field.Field>
				<Field.FieldLabel>Section</Field.FieldLabel>
				<Select bind:value={form.section} type="single">
					<SelectTrigger
						class="w-full"
						aria-invalid={!!fieldErrors.section}
						disabled={saving || bodyLoading}>{kbSectionLabel(form.section)}</SelectTrigger
					>
					<SelectContent>
						{#each SECTION_OPTIONS as sec (sec.slug)}
							<SelectItem value={sec.slug}>{sec.label}</SelectItem>
						{/each}
					</SelectContent>
				</Select>
				{#if fieldErrors.section}
					<FieldError>{fieldErrors.section}</FieldError>
				{/if}
			</Field.Field>
			<Field.Field>
				<Field.FieldLabel>Title</Field.FieldLabel>
				<Input
					bind:value={form.title}
					placeholder="Article title"
					disabled={saving}
					aria-invalid={!!fieldErrors.title}
					oninput={() => (fieldErrors = { ...fieldErrors, title: '' })}
				/>
				{#if fieldErrors.title}
					<FieldError>{fieldErrors.title}</FieldError>
				{/if}
			</Field.Field>
			<Field.Field>
				<Field.FieldLabel>Slug</Field.FieldLabel>
				<Input
					bind:value={form.slug}
					placeholder="article-slug"
					disabled={!!editing || saving}
					aria-invalid={!!fieldErrors.slug}
					oninput={() => (fieldErrors = { ...fieldErrors, slug: '' })}
				/>
				{#if !editing && form.title.trim()}
					<p class="text-xs text-muted-foreground">
						Leave blank to use “{slugify(form.title)}”.
					</p>
				{/if}
				{#if fieldErrors.slug}
					<FieldError>{fieldErrors.slug}</FieldError>
				{/if}
			</Field.Field>
			<Field.Field>
				<Field.FieldLabel>Summary</Field.FieldLabel>
				<Textarea
					bind:value={form.summary}
					rows={2}
					maxlength={500}
					placeholder="One-line summary..."
					disabled={saving}
					aria-invalid={!!fieldErrors.summary}
					oninput={() => (fieldErrors = { ...fieldErrors, summary: '' })}
				/>
				{#if fieldErrors.summary}
					<FieldError>{fieldErrors.summary}</FieldError>
				{/if}
			</Field.Field>
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<Field.Field>
					<Field.FieldLabel>Author</Field.FieldLabel>
					<Input
						bind:value={form.author}
						placeholder="Author name"
						disabled={saving}
						aria-invalid={!!fieldErrors.author}
						oninput={() => (fieldErrors = { ...fieldErrors, author: '' })}
					/>
					{#if fieldErrors.author}
						<FieldError>{fieldErrors.author}</FieldError>
					{/if}
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel>Status</Field.FieldLabel>
					<Select bind:value={form.status} type="single">
						<SelectTrigger class="w-full" disabled={saving}
							><span class="capitalize">{form.status}</span></SelectTrigger
						>
						<SelectContent>
							{#each STATUS_OPTIONS as value (value)}
								<SelectItem {value}>{value}</SelectItem>
							{/each}
						</SelectContent>
					</Select>
				</Field.Field>
			</div>
			<Field.Field>
				<Field.FieldLabel>Tags</Field.FieldLabel>
				<Input
					bind:value={form.tags}
					placeholder="Comma separated: certification, export"
					disabled={saving}
					aria-invalid={!!fieldErrors.tags}
					oninput={() => (fieldErrors = { ...fieldErrors, tags: '' })}
				/>
				{#if fieldErrors.tags}
					<FieldError>{fieldErrors.tags}</FieldError>
				{/if}
			</Field.Field>
			<Field.Field>
				<div class="flex items-center justify-between">
					<Field.FieldLabel>Body (Markdown)</Field.FieldLabel>
					<Button
						variant="outline"
						size="sm"
						type="button"
						onclick={generateBody}
						disabled={bodyLoading || !form.title.trim() || saving}
					>
						<Sparkles class="size-3.5" />
						Generate draft outline
					</Button>
				</div>
				{#if bodyLoading}
					<Skeleton class="h-40 w-full" />
					<p class="text-xs text-muted-foreground">Loading the saved Markdown…</p>
				{:else}
					<Textarea
						bind:value={form.body}
						rows={8}
						placeholder="Article content in Markdown..."
						disabled={saving}
						aria-invalid={!!fieldErrors.body}
						oninput={() => (fieldErrors = { ...fieldErrors, body: '' })}
					/>
				{/if}
				{#if fieldErrors.body}
					<FieldError>{fieldErrors.body}</FieldError>
				{/if}
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
						oninput={() => (fieldErrors = { ...fieldErrors, metaTitle: '' })}
					/>
					{#if fieldErrors.metaTitle}
						<FieldError>{fieldErrors.metaTitle}</FieldError>
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
						oninput={() => (fieldErrors = { ...fieldErrors, metaDescription: '' })}
					/>
					{#if fieldErrors.metaDescription}
						<FieldError>{fieldErrors.metaDescription}</FieldError>
					{/if}
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel>Keywords</Field.FieldLabel>
					<Input
						bind:value={form.keywords}
						placeholder="Comma separated: halal, certification, knowledge"
						disabled={saving}
						aria-invalid={!!fieldErrors.keywords}
						oninput={() => (fieldErrors = { ...fieldErrors, keywords: '' })}
					/>
					{#if fieldErrors.keywords}
						<FieldError>{fieldErrors.keywords}</FieldError>
					{/if}
				</Field.Field>
			</CollapsibleSection>

			{#if formError && !Object.keys(fieldErrors).length}
				<p class="text-sm text-destructive">{formError}</p>
			{/if}
			<DialogFooter>
				<Button
					variant="outline"
					type="button"
					disabled={saving}
					onclick={() => (dialogOpen = false)}>Cancel</Button
				>
				<Button variant="default" type="submit" disabled={saving || bodyLoading}>
					{saving ? 'Saving...' : editing ? 'Save changes' : 'Create article'}
				</Button>
			</DialogFooter>
		</form>
	</DialogContent>
</Dialog>

<ConfirmDialog
	open={confirmSlug !== null}
	title="Delete article?"
	description={confirmSlug ? `Delete article "${confirmTitle}"? This cannot be undone.` : undefined}
	confirmLabel={deleting ? 'Deleting...' : 'Delete'}
	onconfirm={confirmedRemove}
/>
