<script lang="ts">
	import {
		adminData,
		upsertItem,
		deleteItem,
		resetCollection
	} from '#lib/stores/admin-data.svelte.js';
	import type { Category } from '#lib/data/types.js';
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
	import Search from '@lucide/svelte/icons/search';
	import Plus from '@lucide/svelte/icons/plus';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import CollapsibleSection from '#lib/components/site/collapsible-section.svelte';
	import ConfirmDialog from '#lib/components/site/confirm-dialog.svelte';
	import { toast } from 'svelte-sonner';
	import { z } from 'zod';
	import { focusFirstInvalid } from '#lib/utils/forms.js';

	let search = $state('');
	let dialogOpen = $state(false);
	let editing = $state<Category | null>(null);
	let seoExpanded = $state(false);
	let confirmSlug = $state<string | null>(null);
	let confirmName = $state('');

	type CategoryForm = {
		slug: string;
		name: string;
		description: string;
		parentSlug: string;
		icon: string;
		status: 'active' | 'inactive';
		sortOrder: string;
		metaTitle: string;
		metaDescription: string;
		keywords: string;
	};
	let form = $state<CategoryForm>({
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
	let formError = $state('');
	let fieldErrors = $state<Record<string, string>>({});
	let formEl = $state<HTMLFormElement | undefined>(undefined);

	const categorySchema = z.object({
		name: z.string().trim().min(1, 'Name is required.'),
		slug: z
			.string()
			.trim()
			.optional()
			.refine((s) => !s || /^[a-z0-9-]+$/.test(s), 'Slug may only contain lowercase letters, numbers and dashes.')
	});

	const filtered = $derived.by(() => {
		const list = [...adminData.categories];
		if (!search.trim()) return list;
		const q = search.toLowerCase();
		return list.filter((c) => c.name.toLowerCase().includes(q) || c.slug.includes(q));
	});

	function slugify(s: string): string {
		return s
			.toLowerCase()
			.trim()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/(^-|-$)/g, '');
	}

	function parentName(slug?: string): string {
		if (!slug) return 'None (top level)';
		return adminData.categories.find((c) => c.slug === slug)?.name ?? slug;
	}

	function openCreate() {
		editing = null;
		form = {
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
		};
		formError = '';
		fieldErrors = {};
		seoExpanded = false;
		dialogOpen = true;
	}

	function openEdit(c: Category) {
		editing = c;
		form = {
			slug: c.slug,
			name: c.name,
			description: c.description,
			parentSlug: c.parentSlug ?? '',
			icon: c.icon,
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

	function save(e?: Event) {
		e?.preventDefault();
		fieldErrors = {};

		const result = categorySchema.safeParse(form);
		if (!result.success) {
			const flat = result.error.flatten().fieldErrors;
			for (const [k, msgs] of Object.entries(flat)) {
				if (msgs?.length) fieldErrors[k] = msgs[0];
			}
			focusFirstInvalid(formEl);
			return;
		}

		if (form.slug && form.parentSlug && form.slug === form.parentSlug) {
			formError = 'A category cannot be its own parent.';
			return;
		}
		const base: Category =
			editing ??
			({
				slug: '',
				name: '',
				description: '',
				icon: ''
			} as Category);
		const updated: Category = {
			...base,
			slug: form.slug || slugify(form.name),
			name: form.name.trim(),
			description: form.description.trim(),
			parentSlug: form.parentSlug || undefined,
			icon: form.icon.trim() || base.icon,
			status: form.status,
			sortOrder: form.sortOrder ? Number(form.sortOrder) : undefined,
			metaTitle: form.metaTitle.trim() || undefined,
			metaDescription: form.metaDescription.trim() || undefined,
			keywords: form.keywords.trim() || undefined
		};
		upsertItem<Category>('categories', updated, editing ?? undefined);
		dialogOpen = false;
		toast.success(editing ? 'Category updated' : 'Category created');
	}

	function remove(c: Category) {
		confirmSlug = c.slug;
		confirmName = c.name;
	}

	function confirmedRemove() {
		if (!confirmSlug) return;
		deleteItem('categories', confirmSlug);
		adminData.categories = adminData.categories.map((cat) =>
			cat.parentSlug === confirmSlug ? { ...cat, parentSlug: undefined } : cat
		);
		toast.success('Category deleted');
		confirmSlug = null;
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
		<div class="flex items-center gap-2">
			<Button variant="outline" size="sm" onclick={() => resetCollection('categories')}>
				Reset to seed
			</Button>
			<Button variant="default" onclick={openCreate}>
				<Plus class="size-4"></Plus>
				New category
			</Button>
		</div>
	</div>

	<div class="relative max-w-sm">
		<Search
			class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
		></Search>
		<Input bind:value={search} placeholder="Search categories..." class="pl-9" />
	</div>

	<div class="overflow-x-auto rounded-xl ring-1 ring-foreground/10">
		<Table>
			<TableHeader>
				<TableRow class="hover:bg-transparent">
					<TableHead>Category</TableHead>
					<TableHead>Parent</TableHead>
					<TableHead>Description</TableHead>
					<TableHead class="text-right">Actions</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{#each filtered as c (c.slug)}
					<TableRow>
						<TableCell class="font-medium">{c.name}</TableCell>
						<TableCell class="text-sm text-muted-foreground">{parentName(c.parentSlug)}</TableCell>
						<TableCell class="max-w-xs truncate text-sm text-muted-foreground"
							>{c.description}</TableCell
						>
						<TableCell class="text-right">
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
			</TableBody>
		</Table>
	</div>
</div>

<Dialog bind:open={dialogOpen}>
	<DialogContent class="sm:max-w-lg">
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
					disabled={!!editing}
					aria-invalid={!!fieldErrors.slug}
					oninput={() => { fieldErrors.slug = ''; formError = ''; }}
				/>
				{#if fieldErrors.slug}<FieldError>{fieldErrors.slug}</FieldError>{/if}
			</Field.Field>
			<Field.Field>
				<Field.FieldLabel>Parent</Field.FieldLabel>
				<Select bind:value={form.parentSlug} type="single">
					<SelectTrigger class="w-full">{parentName(form.parentSlug)}</SelectTrigger>
					<SelectContent>
						<SelectItem value="">None (top level)</SelectItem>
						{#each adminData.categories.filter((c) => c.slug !== form.slug) as c}
							<SelectItem value={c.slug}>{c.name}</SelectItem>
						{/each}
					</SelectContent>
				</Select>
			</Field.Field>
			<div class="grid grid-cols-2 gap-4">
				<Field.Field>
					<Field.FieldLabel>Status</Field.FieldLabel>
					<Select bind:value={form.status} type="single">
						<SelectTrigger class="w-full">{form.status}</SelectTrigger>
						<SelectContent>
							<SelectItem value="active">Active</SelectItem>
							<SelectItem value="inactive">Inactive</SelectItem>
						</SelectContent>
					</Select>
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel>Sort Order</Field.FieldLabel>
					<Input bind:value={form.sortOrder} type="number" min="0" placeholder="0" />
				</Field.Field>
			</div>
			<Field.Field>
				<Field.FieldLabel>Icon</Field.FieldLabel>
				<Input bind:value={form.icon} placeholder="UtensilsCrossed" />
			</Field.Field>
			<Field.Field>
				<Field.FieldLabel>Description</Field.FieldLabel>
				<Textarea bind:value={form.description} rows={3} placeholder="Category description..." />
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
						placeholder="Comma separated: halal, food, certification"
					/>
				</Field.Field>
			</CollapsibleSection>

			{#if formError}
				<p class="text-sm text-destructive">{formError}</p>
			{/if}
			<div class="flex justify-end gap-2 pt-2">
				<Button variant="outline" type="button" onclick={() => (dialogOpen = false)}>Cancel</Button>
				<Button variant="default" type="submit"
					>{editing ? 'Save changes' : 'Create category'}</Button
				>
			</div>
		</form>
	</DialogContent>
</Dialog>

<ConfirmDialog
	open={confirmSlug !== null}
	title="Delete category?"
	description={`Delete category "${confirmName}"? Children become top-level. This cannot be undone.`}
	confirmLabel="Delete"
	onconfirm={confirmedRemove}
/>
