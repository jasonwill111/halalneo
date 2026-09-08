<script lang="ts">
	import {
		adminData,
		upsertItem,
		deleteItem,
		resetCollection
	} from '#lib/stores/admin-data.svelte.js';
	import type { KbArticle, KnowledgeSection } from '#lib/data/types.js';
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
	import CollapsibleSection from '#lib/components/site/collapsible-section.svelte';

	let search = $state('');
	let dialogOpen = $state(false);
	let editing = $state<KbArticle | null>(null);
	let aiLoading = $state(false);
	let seoExpanded = $state(false);

	type ArticleForm = {
		section: KnowledgeSection;
		slug: string;
		title: string;
		summary: string;
		tags: string;
		body: string;
		metaTitle: string;
		metaDescription: string;
		keywords: string;
	};
	let form = $state<ArticleForm>({
		section: 'halal-certification',
		slug: '',
		title: '',
		summary: '',
		tags: '',
		body: '',
		metaTitle: '',
		metaDescription: '',
		keywords: ''
	});
	let formError = $state('');

	const filtered = $derived.by(() => {
		const list = [...adminData.kbArticles];
		if (!search.trim()) return list;
		const q = search.toLowerCase();
		return list.filter(
			(a) =>
				a.title.toLowerCase().includes(q) ||
				a.slug.includes(q) ||
				a.summary.toLowerCase().includes(q)
		);
	});

	function sectionName(s: KnowledgeSection): string {
		return adminData.kbSections.find((sec) => sec.slug === s)?.title ?? s;
	}

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
			section: 'halal-certification',
			slug: '',
			title: '',
			summary: '',
			tags: '',
			body: '',
			metaTitle: '',
			metaDescription: '',
			keywords: ''
		};
		formError = '';
		seoExpanded = false;
		dialogOpen = true;
	}

	function openEdit(a: KbArticle) {
		editing = a;
		form = {
			section: a.section,
			slug: a.slug,
			title: a.title,
			summary: a.summary,
			tags: a.tags.join(', '),
			body: a.body,
			metaTitle: a.metaTitle ?? '',
			metaDescription: a.metaDescription ?? '',
			keywords: a.keywords ?? ''
		};
		formError = '';
		seoExpanded = false;
		dialogOpen = true;
	}

	function save() {
		if (!form.title.trim()) {
			formError = 'Title is required.';
			return;
		}
		const base: KbArticle =
			editing ??
			({
				section: 'halal-certification',
				slug: '',
				title: '',
				summary: '',
				tags: [],
				body: ''
			} as KbArticle);
		const updated: KbArticle = {
			...base,
			section: form.section,
			slug: form.slug || slugify(form.title),
			title: form.title.trim(),
			summary: form.summary.trim(),
			tags: form.tags
				.split(',')
				.map((t) => t.trim())
				.filter(Boolean),
			body: form.body,
			metaTitle: form.metaTitle.trim() || undefined,
			metaDescription: form.metaDescription.trim() || undefined,
			keywords: form.keywords.trim() || undefined
		};
		upsertItem<KbArticle>('kbArticles', updated, editing ?? undefined);
		dialogOpen = false;
	}

	function remove(a: KbArticle) {
		if (window.confirm(`Delete article ${a.title}?`)) {
			deleteItem('kbArticles', a.slug);
		}
	}

	async function generateBody() {
		aiLoading = true;
		await new Promise((r) => setTimeout(r, 800));
		const section = adminData.kbSections.find((s) => s.slug === form.section);
		const sectionName = section?.title ?? form.section;
		form.body = `## ${form.title}\n\nThis article covers ${form.title.toLowerCase()} in the context of ${sectionName}.\n\n### Overview\n\n${form.summary || 'A comprehensive guide to help buyers and suppliers navigate halal compliance.'}\n\n### Key Points\n\n- Understanding the fundamentals of ${form.title.toLowerCase()}\n- Practical steps for compliance\n- Common challenges and how to overcome them\n\n### Detailed Guide\n\n[Write detailed content here]\n\n### Best Practices\n\n1. Always verify certification status\n2. Keep documentation up to date\n3. Work with recognized certifying bodies\n\n### References\n\n- HalalNeo Knowledge Base\n- Relevant certification body guidelines`;
		aiLoading = false;
	}
</script>

<svelte:head><title>Knowledge Base — HalalNeo Admin</title></svelte:head>

<div class="space-y-4 sm:space-y-6">
	<div class="flex flex-wrap items-end justify-between gap-4">
		<div class="space-y-1">
			<h1 class="text-2xl font-semibold tracking-tight sm:text-3xl">Knowledge Base</h1>
			<p class="max-w-2xl text-sm text-muted-foreground">
				Articles across {adminData.kbSections.length} sections.
			</p>
		</div>
		<div class="flex items-center gap-2">
			<Button variant="outline" size="sm" onclick={() => resetCollection('kbArticles')}>
				Reset to seed
			</Button>
			<Button variant="default" onclick={openCreate}>
				<Plus class="size-4"></Plus>
				New article
			</Button>
		</div>
	</div>

	<div class="relative max-w-sm">
		<Search
			class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
		></Search>
		<Input bind:value={search} placeholder="Search articles..." class="pl-9" />
	</div>

	<div class="overflow-x-auto rounded-xl ring-1 ring-foreground/10">
		<Table>
			<TableHeader>
				<TableRow class="hover:bg-transparent">
					<TableHead>Article</TableHead>
					<TableHead>Section</TableHead>
					<TableHead>Tags</TableHead>
					<TableHead class="text-right">Actions</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{#each filtered as a}
					<TableRow>
						<TableCell>
							<div class="min-w-0">
								<p class="truncate font-medium">{a.title}</p>
								<p class="truncate text-xs text-muted-foreground">{a.slug}</p>
							</div>
						</TableCell>
						<TableCell class="text-sm text-muted-foreground">{sectionName(a.section)}</TableCell>
						<TableCell>
							<div class="flex flex-wrap gap-1">
								{#each a.tags.slice(0, 3) as tag}
									<Badge variant="secondary">{tag}</Badge>
								{/each}
							</div>
						</TableCell>
						<TableCell class="text-right">
							<div class="flex items-center justify-end gap-1">
								<Button variant="ghost" size="icon" aria-label="Edit" onclick={() => openEdit(a)}>
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
			</TableBody>
		</Table>
	</div>
</div>

<Dialog bind:open={dialogOpen}>
	<DialogContent class="max-h-[85dvh] overflow-y-auto sm:max-w-lg">
		<DialogHeader>
			<DialogTitle>{editing ? 'Edit article' : 'New article'}</DialogTitle>
			<DialogDescription>Create or update a knowledge base article.</DialogDescription>
		</DialogHeader>
		<div class="space-y-4">
			<Field.Field>
				<Field.FieldLabel>Section</Field.FieldLabel>
				<Select bind:value={form.section} type="single">
					<SelectTrigger class="w-full">{sectionName(form.section)}</SelectTrigger>
					<SelectContent>
						{#each adminData.kbSections as sec}
							<SelectItem value={sec.slug}>{sec.title}</SelectItem>
						{/each}
					</SelectContent>
				</Select>
			</Field.Field>
			<Field.Field>
				<Field.FieldLabel>Title</Field.FieldLabel>
				<Input bind:value={form.title} placeholder="Article title" />
			</Field.Field>
			<Field.Field>
				<Field.FieldLabel>Slug</Field.FieldLabel>
				<Input bind:value={form.slug} placeholder="article-slug" disabled={!!editing} />
			</Field.Field>
			<Field.Field>
				<Field.FieldLabel>Summary</Field.FieldLabel>
				<Textarea bind:value={form.summary} rows={2} placeholder="One-line summary..." />
			</Field.Field>
			<Field.Field>
				<Field.FieldLabel>Tags</Field.FieldLabel>
				<Input bind:value={form.tags} placeholder="Comma separated: certification, export" />
			</Field.Field>
			<Field.Field>
				<div class="flex items-center justify-between">
					<Field.FieldLabel>Body</Field.FieldLabel>
					<Button
						variant="outline"
						size="sm"
						type="button"
						onclick={generateBody}
						disabled={aiLoading || !form.title.trim()}
					>
						<Sparkles class="size-3.5" />
						{aiLoading ? 'Generating...' : 'Generate with AI'}
					</Button>
				</div>
				<Textarea bind:value={form.body} rows={8} placeholder="Article content..." />
			</Field.Field>

			<!-- ===================== SEO & METADATA (collapsed) ===================== -->
			<CollapsibleSection title="SEO & Metadata" bind:open={seoExpanded}>
				<Field.Field>
					<Field.FieldLabel>Meta Title</Field.FieldLabel>
					<Input
						bind:value={form.metaTitle}
						maxlength={60}
						placeholder="SEO page title (max 60 chars)"
					/>
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel>Meta Description</Field.FieldLabel>
					<Textarea
						bind:value={form.metaDescription}
						maxlength={160}
						rows={2}
						placeholder="SEO description (max 160 chars)"
					/>
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel>Keywords</Field.FieldLabel>
					<Input
						bind:value={form.keywords}
						placeholder="Comma separated: halal, certification, knowledge"
					/>
				</Field.Field>
			</CollapsibleSection>

			{#if formError}
				<p class="text-sm text-destructive">{formError}</p>
			{/if}
		</div>
		<DialogFooter>
			<Button variant="outline" onclick={() => (dialogOpen = false)}>Cancel</Button>
			<Button variant="default" onclick={save}>{editing ? 'Save changes' : 'Create article'}</Button
			>
		</DialogFooter>
	</DialogContent>
</Dialog>
