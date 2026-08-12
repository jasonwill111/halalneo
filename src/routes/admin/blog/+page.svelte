<script lang="ts">
	import { adminData, upsertItem, deleteItem, resetCollection } from '$lib/stores/admin-data.svelte';
	import type { BlogPost } from '$lib/data/types';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Badge } from '$lib/components/ui/badge';
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
	let editing = $state<BlogPost | null>(null);

	type PostForm = {
		slug: string;
		title: string;
		excerpt: string;
		author: string;
		date: string;
		tags: string;
		status: BlogPost['status'];
		body: string;
	};
	let form = $state<PostForm>({
		slug: '',
		title: '',
		excerpt: '',
		author: '',
		date: '',
		tags: '',
		status: 'draft',
		body: ''
	});
	let formError = $state('');

	const filtered = $derived.by(() => {
		const list = [...adminData.blogPosts];
		if (!search.trim()) return list;
		const q = search.toLowerCase();
		return list.filter(
			(p) => p.title.toLowerCase().includes(q) || p.slug.includes(q) || p.author.toLowerCase().includes(q)
		);
	});

	function slugify(s: string): string {
		return s
			.toLowerCase()
			.trim()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/(^-|-$)/g, '');
	}

	function formatDate(d: string): string {
		if (!d) return '—';
		return d;
	}

	function openCreate() {
		editing = null;
		form = {
			slug: '',
			title: '',
			excerpt: '',
			author: '',
			date: new Date().toISOString().slice(0, 10),
			tags: '',
			status: 'draft',
			body: ''
		};
		formError = '';
		dialogOpen = true;
	}

	function openEdit(p: BlogPost) {
		editing = p;
		form = {
			slug: p.slug,
			title: p.title,
			excerpt: p.excerpt,
			author: p.author,
			date: p.date,
			tags: p.tags.join(', '),
			status: p.status,
			body: p.body
		};
		formError = '';
		dialogOpen = true;
	}

	function save() {
		if (!form.title.trim()) {
			formError = 'Title is required.';
			return;
		}
		const base: BlogPost = editing ?? ({
			slug: '',
			title: '',
			excerpt: '',
			author: '',
			date: '',
			tags: [],
			status: 'draft',
			body: ''
		} as BlogPost);
		const updated: BlogPost = {
			...base,
			slug: form.slug || slugify(form.title),
			title: form.title.trim(),
			excerpt: form.excerpt.trim(),
			author: form.author.trim() || 'HalalNeo Editorial',
			date: form.date || new Date().toISOString().slice(0, 10),
			tags: form.tags
				.split(',')
				.map((t) => t.trim())
				.filter(Boolean),
			status: form.status,
			body: form.body
		};
		upsertItem<BlogPost>('blogPosts', updated, editing ?? undefined);
		dialogOpen = false;
	}

	function remove(p: BlogPost) {
		if (window.confirm(`Delete post "${p.title}"?`)) {
			deleteItem('blogPosts', p.slug);
		}
	}
</script>

<svelte:head><title>Blog — HalalNeo Admin</title></svelte:head>

<div class="space-y-6">
	<div class="flex flex-wrap items-end justify-between gap-4">
		<div class="space-y-1">
			<h1 class="text-3xl font-semibold tracking-tight">Blog</h1>
			<p class="max-w-2xl text-sm text-muted-foreground">
				Editorial posts for the public blog. Draft posts are hidden from visitors.
			</p>
		</div>
		<div class="flex items-center gap-2">
			<Button variant="outline" size="sm" onclick={() => resetCollection('blogPosts')}>
				Reset to seed
			</Button>
			<Button variant="default" onclick={openCreate}>
				<Plus class="size-4"></Plus>
				New post
			</Button>
		</div>
	</div>

	<div class="relative max-w-sm">
		<Search class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"></Search>
		<Input bind:value={search} placeholder="Search posts…" class="pl-9" />
	</div>

	<div class="rounded-xl ring-1 ring-foreground/10">
		<Table>
			<TableHeader>
				<TableRow class="hover:bg-transparent">
					<TableHead>Post</TableHead>
					<TableHead>Author</TableHead>
					<TableHead>Date</TableHead>
					<TableHead>Status</TableHead>
					<TableHead class="text-right">Actions</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{#each filtered as p}
					<TableRow>
						<TableCell>
							<div class="min-w-0">
								<p class="truncate font-medium">{p.title}</p>
								<p class="truncate text-xs text-muted-foreground">{p.slug}</p>
							</div>
						</TableCell>
						<TableCell class="text-sm text-muted-foreground">{p.author}</TableCell>
						<TableCell class="text-sm text-muted-foreground">{formatDate(p.date)}</TableCell>
						<TableCell>
							<Badge variant={p.status === 'published' ? 'default' : 'secondary'}>{p.status}</Badge>
						</TableCell>
						<TableCell class="text-right">
							<div class="flex items-center justify-end gap-1">
								<Button variant="ghost" size="icon" aria-label="Edit" onclick={() => openEdit(p)}>
									<Pencil class="size-4"></Pencil>
								</Button>
								<Button
									variant="ghost"
									size="icon"
									aria-label="Delete"
									class="hover:bg-destructive/10 hover:text-destructive"
									onclick={() => remove(p)}
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
			<DialogTitle>{editing ? 'Edit post' : 'New post'}</DialogTitle>
			<DialogDescription>
				Create or update a blog post.
			</DialogDescription>
		</DialogHeader>
		<div class="space-y-4">
			<Field>
				<FieldLabel>Title</FieldLabel>
				<Input bind:value={form.title} placeholder="Post title" />
			</Field>
			<Field>
				<FieldLabel>Slug</FieldLabel>
				<Input bind:value={form.slug} placeholder="post-slug" disabled={!!editing} />
			</Field>
			<div class="grid grid-cols-2 gap-4">
				<Field>
					<FieldLabel>Author</FieldLabel>
					<Input bind:value={form.author} placeholder="HalalNeo Editorial" />
				</Field>
				<Field>
					<FieldLabel>Date</FieldLabel>
					<Input bind:value={form.date} type="date" />
				</Field>
			</div>
			<Field>
				<FieldLabel>Status</FieldLabel>
				<Select bind:value={form.status} type="single">
					<SelectTrigger class="w-full">{form.status}</SelectTrigger>
					<SelectContent>
						<SelectItem value="published">published</SelectItem>
						<SelectItem value="draft">draft</SelectItem>
					</SelectContent>
				</Select>
			</Field>
			<Field>
				<FieldLabel>Excerpt</FieldLabel>
				<Textarea bind:value={form.excerpt} rows={2} placeholder="One-line summary…" />
			</Field>
			<Field>
				<FieldLabel>Tags</FieldLabel>
				<Input bind:value={form.tags} placeholder="Comma separated: certification, sourcing" />
			</Field>
			<Field>
				<FieldLabel>Body</FieldLabel>
				<Textarea bind:value={form.body} rows={8} placeholder="Post content…" />
			</Field>
			{#if formError}
				<p class="text-sm text-destructive">{formError}</p>
			{/if}
		</div>
		<DialogFooter>
			<Button variant="outline" onclick={() => (dialogOpen = false)}>Cancel</Button>
			<Button variant="default" onclick={save}>{editing ? 'Save changes' : 'Create post'}</Button>
		</DialogFooter>
	</DialogContent>
</Dialog>