<script lang="ts">
	import { adminData, upsertItem, deleteItem, resetCollection } from '$lib/stores/admin-data.svelte';
	import type { KbArticle, SectionSlug } from '$lib/data/types';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Field, FieldLabel } from '$lib/components/ui/field';
	import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table';
	import {
		Dialog,
		DialogContent,
		DialogDescription,
		DialogFooter,
		DialogHeader,
		DialogTitle
	} from '$lib/components/ui/dialog';
	import { Select, SelectContent, SelectItem, SelectTrigger } from '$lib/components/ui/select';
	import Search from '@lucide/svelte/icons/search';
	import Plus from '@lucide/svelte/icons/plus';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Trash2 from '@lucide/svelte/icons/trash-2';

	let search = $state('');
	let dialogOpen = $state(false);
	let editing = $state<KbArticle | null>(null);

	type ArticleForm = {
		section: SectionSlug;
		slug: string;
		title: string;
		summary: string;
		tags: string;
		body: string;
	};
	let form = $state<ArticleForm>({
		section: 'halal-certification',
		slug: '',
		title: '',
		summary: '',
		tags: '',
		body: ''
	});
	let formError = $state('');

	const filtered = $derived.by(() => {
		const list = [...adminData.kbArticles];
		if (!search.trim()) return list;
		const q = search.toLowerCase();
		return list.filter(
			(a) => a.title.toLowerCase().includes(q) || a.slug.includes(q) || a.summary.toLowerCase().includes(q)
		);
	});

	function sectionName(s: SectionSlug): string {
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
		form = { section: 'halal-certification', slug: '', title: '', summary: '', tags: '', body: '' };
		formError = '';
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
			body: a.body
		};
		formError = '';
		dialogOpen = true;
	}

	function save() {
		if (!form.title.trim()) {
			formError = 'Title is required.';
			return;
		}
		const base: KbArticle = editing ?? ({
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
			body: form.body
		};
		upsertItem<KbArticle>('kbArticles', updated, editing ?? undefined);
		dialogOpen = false;
	}

	function remove(a: KbArticle) {
		if (window.confirm(`Delete article ${a.title}?`)) {
			deleteItem('kbArticles', a.slug);
		}
	}
</script>

<svelte:head><title>Knowledge Base — HalalNeo Admin</title></svelte:head>

<div class="space-y-6">
	<div class="flex flex-wrap items-end justify-between gap-4">
		<div class="space-y-1">
			<h1 class="text-3xl font-semibold tracking-tight">Knowledge Base</h1>
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
		<Search class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"></Search>
		<Input bind:value={search} placeholder="Search articles…" class="pl-9" />
	</div>

	<div class="rounded-xl ring-1 ring-foreground/10">
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
									<span class="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{tag}</span>
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
			<DialogDescription>
				Create or update a knowledge base article.
			</DialogDescription>
		</DialogHeader>
		<div class="space-y-4">
			<Field>
				<FieldLabel>Section</FieldLabel>
				<Select bind:value={form.section} type="single">
					<SelectTrigger class="w-full">{sectionName(form.section)}</SelectTrigger>
					<SelectContent>
						{#each adminData.kbSections as sec}
							<SelectItem value={sec.slug}>{sec.title}</SelectItem>
						{/each}
					</SelectContent>
				</Select>
			</Field>
			<Field>
				<FieldLabel>Title</FieldLabel>
				<Input bind:value={form.title} placeholder="Article title" />
			</Field>
			<Field>
				<FieldLabel>Slug</FieldLabel>
				<Input bind:value={form.slug} placeholder="article-slug" disabled={!!editing} />
			</Field>
			<Field>
				<FieldLabel>Summary</FieldLabel>
				<Textarea bind:value={form.summary} rows={2} placeholder="One-line summary…" />
			</Field>
			<Field>
				<FieldLabel>Tags</FieldLabel>
				<Input bind:value={form.tags} placeholder="Comma separated: certification, export" />
			</Field>
			<Field>
				<FieldLabel>Body</FieldLabel>
				<Textarea bind:value={form.body} rows={8} placeholder="Article content…" />
			</Field>
			{#if formError}
				<p class="text-sm text-destructive">{formError}</p>
			{/if}
		</div>
		<DialogFooter>
			<Button variant="outline" onclick={() => (dialogOpen = false)}>Cancel</Button>
			<Button variant="default" onclick={save}>{editing ? 'Save changes' : 'Create article'}</Button>
		</DialogFooter>
	</DialogContent>
</Dialog>