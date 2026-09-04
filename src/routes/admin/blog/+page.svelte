<script lang="ts">
	import {
		adminData,
		upsertItem,
		deleteItem,
		resetCollection
	} from '#lib/stores/admin-data.svelte.js';
	import type { Page } from '#lib/data/types.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Textarea } from '#lib/components/ui/textarea/index.js';
	import * as Field from '#lib/components/ui/field/index.js';
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

	let search = $state('');
	let dialogOpen = $state(false);
	let editing = $state<Page | null>(null);
	let formError = $state('');
	let aiLoading = $state(false);

	type BlogForm = {
		slug: string;
		title: string;
		excerpt: string;
		body: string;
		author: string;
		featuredImage: string;
		tags: string;
		status: 'published' | 'draft' | 'archived';
	};

	let form = $state<BlogForm>({
		slug: '',
		title: '',
		excerpt: '',
		body: '',
		author: '',
		featuredImage: '',
		tags: '',
		status: 'draft'
	});

	const blogPosts = $derived(
		(adminData.pages ?? []).filter((p) => p.type === 'blog')
	);
	const published = $derived(
		blogPosts.filter((p) => p.status === 'published').length
	);

	const filtered = $derived.by(() => {
		if (!search.trim()) return blogPosts;
		const q = search.toLowerCase();
		return blogPosts.filter(
			(p) =>
				p.title.toLowerCase().includes(q) ||
				p.slug.includes(q) ||
				(p.excerpt ?? '').toLowerCase().includes(q)
		);
	});

	function slugify(s: string): string {
		return s
			.toLowerCase()
			.trim()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/(^-|-$)/g, '');
	}

	function openCreate() {
		editing = null;
		form = {
			slug: '',
			title: '',
			excerpt: '',
			body: '',
			author: '',
			featuredImage: '',
			tags: '',
			status: 'draft'
		};
		formError = '';
		dialogOpen = true;
	}

	function openEdit(page: Page) {
		editing = page;
		form = {
			slug: page.slug,
			title: page.title,
			excerpt: page.excerpt ?? '',
			body: page.body ?? '',
			author: page.author ?? '',
			featuredImage: page.featuredImage ?? '',
			tags: (page.tags ?? []).join(', '),
			status: page.status
		};
		formError = '';
		dialogOpen = true;
	}

	function save() {
		if (!form.title.trim()) {
			formError = 'Title is required.';
			return;
		}
		if (form.slug && !/^[a-z0-9-]+$/.test(form.slug)) {
			formError = 'Slug may only contain lowercase letters, numbers and dashes.';
			return;
		}
		const updated: Page = {
			slug: form.slug || slugify(form.title),
			title: form.title.trim(),
			type: 'blog',
			excerpt: form.excerpt.trim() || undefined,
			body: form.body.trim(),
			author: form.author.trim() || undefined,
			featuredImage: form.featuredImage.trim() || undefined,
			tags: form.tags
				.split(',')
				.map((t) => t.trim())
				.filter(Boolean),
			status: form.status,
			views: editing?.views ?? 0
		};
		upsertItem<Page>('pages', updated, editing ?? undefined);
		dialogOpen = false;
	}

	function remove(page: Page) {
		if (window.confirm(`Delete blog post "${page.title}"?`)) {
			deleteItem('pages', page.slug);
		}
	}

	async function generateBlogBody() {
		aiLoading = true;
		await new Promise((r) => setTimeout(r, 800));
		const tags = form.tags || 'halal industry, trade, certification';
		const author = form.author || 'HalalNeo Editorial';
		form.body = `## ${form.title}\n\n*By ${author}*\n\n${form.excerpt || 'An in-depth look at the latest developments in the halal industry.'}\n\n---\n\n### Introduction\n\nThe halal market continues to evolve rapidly. This article explores the key trends, challenges, and opportunities shaping the industry today.\n\n### Key Trends\n\n- **Market Growth** — The global halal market is projected to reach new milestones\n- **Certification Standards** — Evolving regulatory frameworks across regions\n- **Digital Transformation** — How technology is reshaping halal supply chains\n\n### Deep Dive\n\n[Expand on the main topic with data, examples, and expert insights]\n\n### Practical Implications\n\n1. **For Buyers** — What these changes mean for sourcing decisions\n2. **For Suppliers** — How to stay competitive and compliant\n3. **For Regulators** — Balancing growth with consumer protection\n\n### Expert Perspectives\n\n> "[Insert relevant industry quote]"\n> — Industry Expert\n\n### Looking Ahead\n\nThe halal industry is poised for continued growth. Stakeholders who adapt to these trends will be best positioned for success.\n\n---\n\n*Tags: ${tags}*\n*Category: Blog*`;
		aiLoading = false;
	}
</script>

<svelte:head><title>Blog — HalalNeo Admin</title></svelte:head>

<div class="space-y-6">
	<div class="flex flex-wrap items-end justify-between gap-4">
		<div class="space-y-1">
			<h1 class="text-3xl font-semibold tracking-tight">Blog</h1>
			<p class="max-w-2xl text-sm text-muted-foreground">
				Manage blog posts and articles ({blogPosts.length} total).
			</p>
		</div>
		<div class="flex items-center gap-2">
			<Button variant="outline" size="sm" onclick={() => resetCollection('pages')}>
				Reset to seed
			</Button>
			<Button variant="default" size="sm" onclick={openCreate}>
				<Plus class="size-4"></Plus>
				New blog post
			</Button>
		</div>
	</div>

	<div class="mb-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
		<div class="rounded-xl bg-card p-3 shadow-sm">
			<p class="text-[10px] text-muted-foreground">Total Posts</p>
			<p class="text-xl font-bold">{blogPosts.length}</p>
		</div>
		<div class="rounded-xl bg-card p-3 shadow-sm">
			<p class="text-[10px] text-muted-foreground">Published</p>
			<p class="text-xl font-bold">
				{blogPosts.length > 0
					? Math.round((published / blogPosts.length) * 100)
					: 0}%
			</p>
		</div>
		<div class="rounded-xl bg-card p-3 shadow-sm">
			<p class="text-[10px] text-muted-foreground">Total Views</p>
			<p class="text-xl font-bold">
				{blogPosts.reduce((sum, p) => sum + (p.views ?? 0), 0).toLocaleString()}
			</p>
		</div>
	</div>

	<div class="relative max-w-sm">
		<Search
			class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
		></Search>
		<Input bind:value={search} placeholder="Search blog posts..." class="pl-9" />
	</div>

	<div class="overflow-x-auto rounded-xl ring-1 ring-foreground/10">
		<Table>
			<TableHeader>
				<TableRow class="hover:bg-transparent">
					<TableHead>Title</TableHead>
					<TableHead>Author</TableHead>
					<TableHead>Tags</TableHead>
					<TableHead>Status</TableHead>
					<TableHead>Views</TableHead>
					<TableHead class="text-right">Actions</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{#each filtered as p (p.slug)}
					<TableRow>
						<TableCell>
							<div class="min-w-0">
								<p class="truncate font-medium">{p.title}</p>
								<p class="truncate text-xs text-muted-foreground">{p.slug}</p>
							</div>
						</TableCell>
						<TableCell class="text-sm text-muted-foreground"
							>{p.author ?? '—'}</TableCell
						>
						<TableCell>
							<div class="flex flex-wrap gap-1">
								{#each (p.tags ?? []).slice(0, 3) as tag (tag)}
									<Badge variant="secondary">{tag}</Badge>
								{/each}
							</div>
						</TableCell>
						<TableCell>
							<Badge variant={p.status === 'published' ? 'default' : 'secondary'} class="capitalize text-[9px]">{p.status}</Badge>
						</TableCell>
						<TableCell class="text-muted-foreground"
							>{(p.views ?? 0).toLocaleString()}</TableCell
						>
						<TableCell class="text-right">
							<div class="flex items-center justify-end gap-1">
								<Button variant="ghost" size="icon" aria-label="Edit" class="size-8" onclick={() => openEdit(p)}>
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
				{:else}
					<TableRow>
						<TableCell colspan={6} class="py-8 text-center text-sm text-muted-foreground">
							No blog posts found.
						</TableCell>
					</TableRow>
				{/each}
			</TableBody>
		</Table>
	</div>
</div>

<Dialog bind:open={dialogOpen}>
	<DialogContent class="max-h-[85dvh] overflow-y-auto sm:max-w-lg">
		<DialogHeader>
			<DialogTitle>{editing ? 'Edit blog post' : 'New blog post'}</DialogTitle>
			<DialogDescription>Create or update a blog article.</DialogDescription>
		</DialogHeader>
		<div class="space-y-4">
			<Field.Field>
				<Field.FieldLabel>Title *</Field.FieldLabel>
				<Input bind:value={form.title} placeholder="Blog post title" />
			</Field.Field>
			<Field.Field>
				<Field.FieldLabel>Slug</Field.FieldLabel>
				<Input bind:value={form.slug} placeholder="blog-post-slug" disabled={!!editing} />
			</Field.Field>
			<div class="grid grid-cols-2 gap-4">
				<Field.Field>
					<Field.FieldLabel>Author</Field.FieldLabel>
					<Input bind:value={form.author} placeholder="Author name" />
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel>Status</Field.FieldLabel>
					<Select bind:value={form.status} type="single">
						<SelectTrigger class="w-full">{form.status}</SelectTrigger>
						<SelectContent>
							<SelectItem value="published">published</SelectItem>
							<SelectItem value="draft">draft</SelectItem>
							<SelectItem value="archived">archived</SelectItem>
						</SelectContent>
					</Select>
				</Field.Field>
			</div>
			<Field.Field>
				<Field.FieldLabel>Excerpt</Field.FieldLabel>
				<Textarea bind:value={form.excerpt} rows={2} placeholder="Short description..." />
			</Field.Field>
			<Field.Field>
				<Field.FieldLabel>Featured Image URL</Field.FieldLabel>
				<Input bind:value={form.featuredImage} placeholder="https://..." />
			</Field.Field>
			<Field.Field>
				<Field.FieldLabel>Tags</Field.FieldLabel>
				<Input bind:value={form.tags} placeholder="Comma separated: halal, trade, certification" />
			</Field.Field>
			<Field.Field>
				<div class="flex items-center justify-between">
					<Field.FieldLabel>Body</Field.FieldLabel>
					<Button variant="outline" size="sm" type="button" onclick={generateBlogBody} disabled={aiLoading || !form.title.trim()}>
						<Sparkles class="size-3.5" />
						{aiLoading ? 'Generating...' : 'Generate with AI'}
					</Button>
				</div>
				<Textarea bind:value={form.body} rows={8} placeholder="Blog content..." />
			</Field.Field>

			{#if formError}
				<p class="text-sm text-destructive">{formError}</p>
			{/if}
		</div>
		<DialogFooter>
			<Button variant="outline" onclick={() => (dialogOpen = false)}>Cancel</Button>
			<Button variant="default" onclick={save}>{editing ? 'Save changes' : 'Create blog post'}</Button>
		</DialogFooter>
	</DialogContent>
</Dialog>
