<script lang="ts">
	import {
		BLOG_STATUSES,
		blogPostCreateSchema,
		blogStatusSchema,
		type BlogAdminRow,
		type BlogStatus
	} from '#lib/schemas/blog.js';
	import { parseTagList, slugify, splitTags } from '#lib/schemas/content.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Textarea } from '#lib/components/ui/textarea/index.js';
	import * as Field from '#lib/components/ui/field/index.js';
	import { FieldError } from '#lib/components/ui/field/index.js';
	import { Skeleton } from '#lib/components/ui/skeleton/index.js';
	import { Empty, EmptyContent, EmptyMedia } from '#lib/components/ui/empty/index.js';
	import { focusFirstInvalid, mergeServerDetails, type ServerFieldDetails } from '#lib/utils/forms.js';
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
	import RefreshCw from '@lucide/svelte/icons/refresh-cw';
	import AlertTriangle from '@lucide/svelte/icons/alert-triangle';
	import Sparkles from '@lucide/svelte/icons/sparkles';
	import Newspaper from '@lucide/svelte/icons/newspaper';
	import StatTile from '#lib/components/site/stat-tile.svelte';
	import CollapsibleSection from '#lib/components/site/collapsible-section.svelte';
	import Paginator from '#lib/components/site/paginator.svelte';
	import ConfirmDialog from '#lib/components/site/confirm-dialog.svelte';
	import { toast } from 'svelte-sonner';

	const PAGE_SIZE = 20;
	const STATUS_OPTIONS: BlogStatus[] = [...BLOG_STATUSES];

	type LoadError = { kind: 'network' | 'auth' | 'server'; message: string };

	let items = $state<BlogAdminRow[]>([]);
	let loading = $state(true);
	let loadError = $state<LoadError | null>(null);
	let search = $state('');
	let page = $state(1);

	let dialogOpen = $state(false);
	/** Row being edited, or `null` when creating. `slug` is the immutable key. */
	let editing = $state<BlogAdminRow | null>(null);
	let saving = $state(false);
	let deleting = $state(false);
	let seoExpanded = $state(false);
	let confirmSlug = $state<string | null>(null);
	let confirmTitle = $state('');

	type BlogForm = {
		slug: string;
		title: string;
		excerpt: string;
		body: string;
		author: string;
		featuredImage: string;
		tags: string;
		status: BlogStatus;
		publishedAt: string;
		metaTitle: string;
		metaDescription: string;
		keywords: string;
	};

	function emptyForm(): BlogForm {
		return {
			slug: '',
			title: '',
			excerpt: '',
			body: '',
			author: '',
			featuredImage: '',
			tags: '',
			status: 'draft',
			publishedAt: '',
			metaTitle: '',
			metaDescription: '',
			keywords: ''
		};
	}

	let form = $state<BlogForm>(emptyForm());
	let formError = $state('');
	let fieldErrors = $state<Record<string, string>>({});
	let formEl = $state<HTMLFormElement | undefined>(undefined);

	const filtered = $derived.by(() => {
		if (!search.trim()) return items;
		const q = search.toLowerCase();
		return items.filter(
			(p) =>
				p.title.toLowerCase().includes(q) ||
				p.slug.includes(q) ||
				(p.excerpt ?? '').toLowerCase().includes(q)
		);
	});

	const totalPages = $derived(Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)));
	const paged = $derived(filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE));

	const published = $derived(items.filter((p) => p.status === 'published').length);
	const totalViews = $derived(items.reduce((sum, p) => sum + (p.views ?? 0), 0));

	$effect(() => {
		void search;
		page = 1;
	});

	async function loadItems() {
		loading = true;
		loadError = null;
		try {
			// status=all → admin overview (drafts included), never edge-cached.
			const res = await fetch('/api/blog?status=all&limit=100');
			if (!res.ok) {
				const data = (await res.json().catch(() => ({}))) as { error?: string };
				loadError = {
					kind: res.status === 401 || res.status === 403 ? 'auth' : 'server',
					message: data.error ?? `Request failed (${res.status})`
				};
				items = [];
			} else {
				const data = (await res.json()) as { items?: BlogAdminRow[] };
				items = data.items ?? [];
			}
		} catch {
			loadError = { kind: 'network', message: 'Could not reach the blog API.' };
			items = [];
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		void loadItems();
	});

	/** `pages.published_at` is a timestamp column → ISO string over JSON. */
	function toDateInput(value: Date | string | null): string {
		return typeof value === 'string' && value.length >= 10 ? value.slice(0, 10) : '';
	}

	function openCreate() {
		editing = null;
		form = emptyForm();
		formError = '';
		fieldErrors = {};
		saving = false;
		seoExpanded = false;
		dialogOpen = true;
	}

	function openEdit(p: BlogAdminRow) {
		editing = p;
		const status = blogStatusSchema.safeParse(p.status);
		form = {
			slug: p.slug,
			title: p.title,
			excerpt: p.excerpt ?? '',
			body: p.body ?? '',
			author: p.author ?? '',
			featuredImage: p.featuredImage ?? '',
			tags: parseTagList(p.tags).join(', '),
			status: status.success ? status.data : 'draft',
			publishedAt: toDateInput(p.publishedAt),
			metaTitle: p.metaTitle ?? '',
			metaDescription: p.metaDescription ?? '',
			keywords: p.keywords ?? ''
		};
		formError = '';
		fieldErrors = {};
		saving = false;
		seoExpanded = false;
		dialogOpen = true;
	}

	/** Payload builder — trimmed values only; Zod owns the rest (§6.4). */
	function buildPayload() {
		return {
			slug: form.slug.trim() || slugify(form.title),
			title: form.title.trim(),
			excerpt: form.excerpt.trim(),
			body: form.body,
			author: form.author.trim(),
			featuredImage: form.featuredImage.trim(),
			tags: splitTags(form.tags),
			status: form.status,
			// Empty means "leave the stored publish date alone" — the patch schema
			// only touches keys that are present.
			publishedAt: form.publishedAt || undefined,
			metaTitle: form.metaTitle.trim(),
			metaDescription: form.metaDescription.trim(),
			keywords: form.keywords.trim()
		};
	}

	async function save(e: Event) {
		e.preventDefault();
		fieldErrors = {};
		formError = '';

		const parsed = blogPostCreateSchema.safeParse(buildPayload());
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
				editing ? `/api/blog/${encodeURIComponent(editing.slug)}` : '/api/blog',
				{
					method: editing ? 'PUT' : 'POST',
					headers: { 'Content-Type': 'application/json' },
					// PUT takes the patch schema (no slug — it is the URL key).
					body: JSON.stringify(editing ? rest : { slug, ...rest })
				}
			);
			if (res.ok) {
				dialogOpen = false;
				toast.success(editing ? 'Blog post updated' : 'Blog post created');
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
			formError = 'Network error — the post was not saved.';
			toast.error('Network error — nothing was saved.');
		} finally {
			saving = false;
		}
	}

	function remove(p: BlogAdminRow) {
		confirmSlug = p.slug;
		confirmTitle = p.title;
	}

	async function confirmedRemove() {
		if (!confirmSlug) return;
		deleting = true;
		try {
			const res = await fetch(`/api/blog/${encodeURIComponent(confirmSlug)}`, {
				method: 'DELETE'
			});
			if (res.ok) {
				toast.success('Blog post deleted');
				await loadItems();
			} else {
				const data = (await res.json().catch(() => ({}))) as { error?: string };
				toast.error(data.error ?? 'Failed to delete blog post.');
			}
		} catch {
			toast.error('Network error — the post was not deleted.');
		} finally {
			deleting = false;
			confirmSlug = null;
			confirmTitle = '';
		}
	}

	/** Local Markdown scaffold — a template, not a model call (no AI API exists yet). */
	function generateBody() {
		const title = form.title.trim() || 'Untitled post';
		form.body = `## ${title}

*By ${form.author.trim() || 'HalalNeo Editorial'}*

${form.excerpt.trim() || 'An in-depth look at the latest developments in the halal industry.'}

### Introduction

The halal market continues to evolve rapidly. This article explores the key trends, challenges, and opportunities shaping the industry today.

### Key Trends

- **Market Growth** — The global halal market is projected to reach new milestones
- **Certification Standards** — Evolving regulatory frameworks across regions
- **Digital Transformation** — How technology is reshaping halal supply chains

### Deep Dive

[Expand on the main topic with data, examples, and expert insights]

### Practical Implications

1. **For Buyers** — What these changes mean for sourcing decisions
2. **For Suppliers** — How to stay competitive and compliant
3. **For Regulators** — Balancing growth with consumer protection

### Looking Ahead

The halal industry is poised for continued growth. Stakeholders who adapt to these trends will be best positioned for success.`;
		fieldErrors = { ...fieldErrors, body: '' };
	}
</script>

<svelte:head><title>Blog — HalalNeo Admin</title></svelte:head>

<div class="space-y-4 sm:space-y-6">
	<div class="flex flex-wrap items-end justify-between gap-4">
		<div class="space-y-1">
			<h1 class="text-2xl font-semibold tracking-tight sm:text-3xl">Blog</h1>
			<p class="max-w-2xl text-sm text-muted-foreground">
				Manage blog posts and articles{#if !loading && !loadError} ({items.length} total){/if}.
			</p>
		</div>
		<Button variant="default" size="sm" onclick={openCreate}>
			<Plus class="size-4"></Plus>
			New blog post
		</Button>
	</div>

	<div class="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
		<StatTile value={items.length} label="Total Posts" loading={loading} />
		<StatTile
			value={`${items.length > 0 ? Math.round((published / items.length) * 100) : 0}%`}
			label="Published"
			loading={loading}
		/>
		<StatTile value={totalViews.toLocaleString()} label="Total Views" loading={loading} />
	</div>

	<div class="relative max-w-sm">
		<Search
			class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
		></Search>
		<Input bind:value={search} placeholder="Search blog posts..." class="pl-9" />
	</div>

	{#if loadError}
		<!-- Real failure: a retry action, never the "empty" copy (§3.1). -->
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
								: 'Could not load posts'}
					</p>
					<p class="text-xs text-muted-foreground">
						{loadError.kind === 'auth'
							? 'Sign in again from /admin/login to manage the blog.'
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
						<TableHead>Title</TableHead>
						<TableHead>Author</TableHead>
						<TableHead>Tags</TableHead>
						<TableHead>Status</TableHead>
						<TableHead>Published</TableHead>
						<TableHead class="text-right">Views</TableHead>
						<TableHead class="text-right">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{#if loading}
						{#each Array(5) as _, i (i)}
							<TableRow>
								<TableCell><Skeleton class="h-4 w-40" /></TableCell>
								<TableCell><Skeleton class="h-4 w-24" /></TableCell>
								<TableCell><Skeleton class="h-4 w-28" /></TableCell>
								<TableCell><Skeleton class="h-4 w-16" /></TableCell>
								<TableCell><Skeleton class="h-4 w-20" /></TableCell>
								<TableCell class="text-right"><Skeleton class="ml-auto h-4 w-12" /></TableCell>
								<TableCell class="text-right"><Skeleton class="ml-auto h-8 w-16" /></TableCell>
							</TableRow>
						{/each}
					{:else if filtered.length === 0}
						<TableRow>
							<TableCell colspan={7} class="py-8">
								{#if items.length === 0}
									<Empty>
										<EmptyMedia variant="icon"><Newspaper class="size-6" /></EmptyMedia>
										<div class="space-y-1">
											<p class="font-medium">No blog posts yet</p>
											<p class="text-sm text-muted-foreground">
												Publish the first post to fill /blog.
											</p>
										</div>
										<EmptyContent>
											<Button variant="default" size="sm" class="gap-1.5" onclick={openCreate}>
												<Plus class="size-4" />
												New blog post
											</Button>
										</EmptyContent>
									</Empty>
								{:else}
									<Empty>
										<EmptyMedia variant="icon"><Search class="size-6" /></EmptyMedia>
										<div class="space-y-1">
											<p class="font-medium">No matching posts</p>
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
						{#each paged as p (p.slug)}
							<TableRow>
								<TableCell>
									<div class="min-w-0">
										<p class="truncate font-medium">{p.title}</p>
										<p class="truncate text-xs text-muted-foreground">{p.slug}</p>
									</div>
								</TableCell>
								<TableCell class="text-sm text-muted-foreground">{p.author ?? '—'}</TableCell>
								<TableCell>
									<div class="flex flex-wrap gap-1">
										{#each parseTagList(p.tags).slice(0, 3) as tag (tag)}
											<Badge variant="secondary">{tag}</Badge>
										{/each}
									</div>
								</TableCell>
								<TableCell>
									<Badge
										variant={p.status === 'published' ? 'default' : 'secondary'}
										class="text-2xs capitalize">{p.status}</Badge
									>
								</TableCell>
								<TableCell class="text-sm text-muted-foreground">
									{toDateInput(p.publishedAt) || '—'}
								</TableCell>
								<TableCell class="text-right text-muted-foreground"
									>{(p.views ?? 0).toLocaleString()}</TableCell
								>
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

		<div class="flex justify-center">
			<Paginator bind:page {totalPages} />
		</div>
	{/if}
</div>

<Dialog bind:open={dialogOpen}>
	<DialogContent class="max-h-[85dvh] overflow-y-auto sm:max-w-lg">
		<DialogHeader>
			<DialogTitle>{editing ? 'Edit blog post' : 'New blog post'}</DialogTitle>
			<DialogDescription>Create or update a blog article.</DialogDescription>
		</DialogHeader>
		<!-- DialogFooter lives INSIDE the form so the submit button actually submits. -->
		<form bind:this={formEl} onsubmit={save} class="space-y-4">
			<Field.Field>
				<Field.FieldLabel>Title *</Field.FieldLabel>
				<Input
					bind:value={form.title}
					placeholder="Blog post title"
					disabled={saving}
					aria-invalid={!!fieldErrors.title}
					oninput={() => (fieldErrors = { ...fieldErrors, title: '' })}
				/>
				{#if fieldErrors.title}<FieldError>{fieldErrors.title}</FieldError>{/if}
			</Field.Field>
			<Field.Field>
				<Field.FieldLabel>Slug</Field.FieldLabel>
				<Input
					bind:value={form.slug}
					placeholder="blog-post-slug"
					disabled={!!editing || saving}
					aria-invalid={!!fieldErrors.slug}
					oninput={() => (fieldErrors = { ...fieldErrors, slug: '' })}
				/>
				{#if !editing && form.title.trim()}
					<p class="text-xs text-muted-foreground">Leave blank to use “{slugify(form.title)}”.</p>
				{/if}
				{#if fieldErrors.slug}<FieldError>{fieldErrors.slug}</FieldError>{/if}
			</Field.Field>
			<div class="grid grid-cols-2 gap-4">
				<Field.Field>
					<Field.FieldLabel>Author</Field.FieldLabel>
					<Input
						bind:value={form.author}
						placeholder="Author name"
						disabled={saving}
						aria-invalid={!!fieldErrors.author}
						oninput={() => (fieldErrors = { ...fieldErrors, author: '' })}
					/>
					{#if fieldErrors.author}<FieldError>{fieldErrors.author}</FieldError>{/if}
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel>Status</Field.FieldLabel>
					<Select bind:value={form.status} type="single">
						<SelectTrigger class="w-full" disabled={saving}
							><span class="capitalize">{form.status}</span></SelectTrigger
						>
						<SelectContent>
							{#each STATUS_OPTIONS as value (value)}
								<SelectItem value={value}>{value}</SelectItem>
							{/each}
						</SelectContent>
					</Select>
					{#if fieldErrors.status}<FieldError>{fieldErrors.status}</FieldError>{/if}
				</Field.Field>
			</div>
			<Field.Field>
				<Field.FieldLabel>Publish date</Field.FieldLabel>
				<Input
					type="date"
					bind:value={form.publishedAt}
					disabled={saving}
					aria-invalid={!!fieldErrors.publishedAt}
					onchange={() => (fieldErrors = { ...fieldErrors, publishedAt: '' })}
				/>
				<p class="text-xs text-muted-foreground">
					Leave empty to keep the stored publish date.
				</p>
				{#if fieldErrors.publishedAt}
					<FieldError>{fieldErrors.publishedAt}</FieldError>
				{/if}
			</Field.Field>
			<Field.Field>
				<Field.FieldLabel>Excerpt</Field.FieldLabel>
				<Textarea
					bind:value={form.excerpt}
					rows={2}
					maxlength={500}
					placeholder="Short description..."
					disabled={saving}
					aria-invalid={!!fieldErrors.excerpt}
					oninput={() => (fieldErrors = { ...fieldErrors, excerpt: '' })}
				/>
				{#if fieldErrors.excerpt}<FieldError>{fieldErrors.excerpt}</FieldError>{/if}
			</Field.Field>
			<Field.Field>
				<Field.FieldLabel>Featured Image URL</Field.FieldLabel>
				<Input
					bind:value={form.featuredImage}
					placeholder="https://..."
					disabled={saving}
					aria-invalid={!!fieldErrors.featuredImage}
					oninput={() => (fieldErrors = { ...fieldErrors, featuredImage: '' })}
				/>
				{#if fieldErrors.featuredImage}
					<FieldError>{fieldErrors.featuredImage}</FieldError>
				{/if}
			</Field.Field>
			<Field.Field>
				<Field.FieldLabel>Tags</Field.FieldLabel>
				<Input
					bind:value={form.tags}
					placeholder="Comma separated: halal, trade, certification"
					disabled={saving}
					aria-invalid={!!fieldErrors.tags}
					oninput={() => (fieldErrors = { ...fieldErrors, tags: '' })}
				/>
				{#if fieldErrors.tags}<FieldError>{fieldErrors.tags}</FieldError>{/if}
			</Field.Field>
			<Field.Field>
				<div class="flex items-center justify-between">
					<Field.FieldLabel>Body (Markdown)</Field.FieldLabel>
					<Button
						variant="outline"
						size="sm"
						type="button"
						onclick={generateBody}
						disabled={saving || !form.title.trim()}
					>
						<Sparkles class="size-3.5" />
						Generate draft outline
					</Button>
				</div>
				<Textarea
					bind:value={form.body}
					rows={8}
					placeholder="Blog content in Markdown..."
					disabled={saving}
					aria-invalid={!!fieldErrors.body}
					oninput={() => (fieldErrors = { ...fieldErrors, body: '' })}
				/>
				{#if fieldErrors.body}<FieldError>{fieldErrors.body}</FieldError>{/if}
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
						placeholder="Comma separated: halal, market, trends"
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
				<Button variant="default" type="submit" disabled={saving}>
					{saving ? 'Saving...' : editing ? 'Save changes' : 'Create blog post'}
				</Button>
			</DialogFooter>
		</form>
	</DialogContent>
</Dialog>

<ConfirmDialog
	open={confirmSlug !== null}
	title="Delete blog post?"
	description={confirmSlug ? `Delete blog post "${confirmTitle}"? This cannot be undone.` : undefined}
	confirmLabel={deleting ? 'Deleting...' : 'Delete'}
	onconfirm={confirmedRemove}
/>
