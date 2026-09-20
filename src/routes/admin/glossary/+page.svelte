<script lang="ts">
	import type { GlossaryRow } from '#lib/schemas/glossary.js';
	import { glossaryTermSchema, type GlossaryTermInput } from '#lib/schemas/glossary.js';
	import { Button } from '#lib/components/ui/button/index.js';
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
	import Search from '@lucide/svelte/icons/search';
	import Plus from '@lucide/svelte/icons/plus';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import RefreshCw from '@lucide/svelte/icons/refresh-cw';
	import AlertTriangle from '@lucide/svelte/icons/alert-triangle';
	import BookOpenText from '@lucide/svelte/icons/book-open-text';
	import Paginator from '#lib/components/site/paginator.svelte';
	import ConfirmDialog from '#lib/components/site/confirm-dialog.svelte';
	import { toast } from 'svelte-sonner';
	import { focusFirstInvalid, mergeServerDetails, type ServerFieldDetails } from '#lib/utils/forms.js';

	const PAGE_SIZE = 20;

	type LoadError = { kind: 'network' | 'auth' | 'server'; message: string };

	let items = $state<GlossaryRow[]>([]);
	let loading = $state(true);
	let loadError = $state<LoadError | null>(null);
	let search = $state('');
	let page = $state(1);

	let dialogOpen = $state(false);
	/** Row being edited, or `null` when creating. `slug` is the immutable key. */
	let editing = $state<GlossaryRow | null>(null);
	let saving = $state(false);
	let deleting = $state(false);
	let confirmSlug = $state<string | null>(null);
	let confirmTerm = $state('');

	let form = $state<GlossaryTermInput>({ term: '', definition: '' });
	let formError = $state('');
	let fieldErrors = $state<Record<string, string>>({});
	let formEl = $state<HTMLFormElement | undefined>(undefined);

	const filtered = $derived.by(() => {
		const list = items;
		if (!search.trim()) return list;
		const q = search.toLowerCase();
		return list.filter(
			(t) =>
				t.term.toLowerCase().includes(q) || (t.definition ?? '').toLowerCase().includes(q)
		);
	});

	const totalPages = $derived(Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)));
	const paged = $derived(filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE));

	$effect(() => {
		void search;
		page = 1;
	});

	async function loadItems() {
		loading = true;
		loadError = null;
		try {
			// status=all → admin overview (drafts included), never edge-cached.
			const res = await fetch('/api/glossary?status=all&limit=100');
			if (!res.ok) {
				const data = (await res.json().catch(() => ({}))) as { error?: string };
				loadError = {
					kind: res.status === 401 || res.status === 403 ? 'auth' : 'server',
					message: data.error ?? `Request failed (${res.status})`
				};
				items = [];
			} else {
				const data = (await res.json()) as { items?: GlossaryRow[] };
				items = data.items ?? [];
			}
		} catch {
			loadError = { kind: 'network', message: 'Could not reach the glossary API.' };
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
		form = { term: '', definition: '' };
		formError = '';
		fieldErrors = {};
		saving = false;
		dialogOpen = true;
	}

	function openEdit(t: GlossaryRow) {
		editing = t;
		form = { term: t.term, definition: t.definition ?? '' };
		formError = '';
		fieldErrors = {};
		saving = false;
		dialogOpen = true;
	}

	/** Same Zod schema as `POST/PUT /api/glossary` — client and server cannot drift (§6.4). */
	async function save(e: Event) {
		e.preventDefault();
		fieldErrors = {};
		formError = '';

		const payload: GlossaryTermInput = {
			term: form.term.trim(),
			definition: form.definition.trim()
		};
		const parsed = glossaryTermSchema.safeParse(payload);
		if (!parsed.success) {
			fieldErrors = mergeServerDetails({}, parsed.error.flatten().fieldErrors);
			toast.warning('Please fix the highlighted fields.');
			focusFirstInvalid(formEl);
			return;
		}

		saving = true;
		try {
			const res = await fetch(
				editing ? `/api/glossary/${encodeURIComponent(editing.slug)}` : '/api/glossary',
				{
					method: editing ? 'PUT' : 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(parsed.data)
				}
			);
			if (res.ok) {
				dialogOpen = false;
				toast.success(editing ? 'Term updated' : 'Term created');
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
			formError = 'Network error — the term was not saved.';
			toast.error('Network error — nothing was saved.');
		} finally {
			saving = false;
		}
	}

	function remove(t: GlossaryRow) {
		confirmSlug = t.slug;
		confirmTerm = t.term;
	}

	async function confirmedRemove() {
		if (!confirmSlug) return;
		deleting = true;
		try {
			const res = await fetch(`/api/glossary/${encodeURIComponent(confirmSlug)}`, {
				method: 'DELETE'
			});
			if (res.ok) {
				toast.success('Term deleted');
				await loadItems();
			} else {
				const data = (await res.json().catch(() => ({}))) as { error?: string };
				toast.error(data.error ?? 'Failed to delete term.');
			}
		} catch {
			toast.error('Network error — the term was not deleted.');
		} finally {
			deleting = false;
			confirmSlug = null;
			confirmTerm = '';
		}
	}
</script>

<svelte:head>
	<title>Glossary — HalalNeo Admin</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="space-y-4 sm:space-y-6">
	<div class="flex flex-wrap items-end justify-between gap-4">
		<div class="space-y-1">
			<h1 class="text-2xl font-semibold tracking-tight sm:text-3xl">Glossary</h1>
			<p class="max-w-2xl text-sm text-muted-foreground">
				Halal trade terminology shown on the public glossary page.
			</p>
		</div>
		<Button variant="default" onclick={openCreate}>
			<Plus class="size-4"></Plus>
			New term
		</Button>
	</div>

	<div class="relative max-w-sm">
		<Search
			class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
		></Search>
		<Input bind:value={search} placeholder="Search terms..." class="pl-9" />
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
								: 'Could not load terms'}
					</p>
					<p class="text-xs text-muted-foreground">
						{loadError.kind === 'auth'
							? 'Sign in again from /admin/login to manage the glossary.'
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
						<TableHead>Term</TableHead>
						<TableHead>Definition</TableHead>
						<TableHead class="text-right">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{#if loading}
						{#each Array(5) as _, i (i)}
							<TableRow>
								<TableCell><Skeleton class="h-4 w-32" /></TableCell>
								<TableCell><Skeleton class="h-4 w-full max-w-md" /></TableCell>
								<TableCell class="text-right"><Skeleton class="ml-auto h-8 w-16" /></TableCell>
							</TableRow>
						{/each}
					{:else if filtered.length === 0}
						<TableRow>
							<TableCell colspan={3} class="py-8">
								{#if items.length === 0}
									<Empty>
										<BrandedEmptyMedia variant="icon"><BookOpenText class="size-6" /></BrandedEmptyMedia>
										<div class="space-y-1">
											<p class="font-medium">No terms yet</p>
											<p class="text-sm text-muted-foreground">
												The public glossary is empty. Add the first halal trade term.
											</p>
										</div>
										<EmptyContent>
											<Button variant="default" size="sm" class="gap-1.5" onclick={openCreate}>
												<Plus class="size-4" />
												New term
											</Button>
										</EmptyContent>
									</Empty>
								{:else}
									<Empty>
										<BrandedEmptyMedia variant="icon"><Search class="size-6" /></BrandedEmptyMedia>
										<div class="space-y-1">
											<p class="font-medium">No matching terms</p>
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
						{#each paged as t (t.slug)}
							<TableRow>
								<TableCell class="font-medium">{t.term}</TableCell>
								<TableCell class="max-w-md text-sm text-muted-foreground">
									{t.definition ?? '—'}
								</TableCell>
								<TableCell class="text-right">
									<div class="flex items-center justify-end gap-1">
										<Button
											variant="ghost"
											size="icon"
											aria-label="Edit"
											onclick={() => openEdit(t)}
										>
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

		<div class="flex justify-center">
			<Paginator bind:page {totalPages} />
		</div>
	{/if}
</div>

<Dialog bind:open={dialogOpen}>
	<DialogContent class="sm:max-w-lg">
		<DialogHeader>
			<DialogTitle>{editing ? 'Edit term' : 'New term'}</DialogTitle>
			<DialogDescription>Add or update a glossary entry.</DialogDescription>
		</DialogHeader>
		<form
			bind:this={formEl}
			onsubmit={save}
			class="space-y-4"
		>
			<Field.Field>
				<Field.FieldLabel>Term</Field.FieldLabel>
				<Input
					bind:value={form.term}
					placeholder="Halal"
					disabled={saving}
					aria-invalid={!!fieldErrors.term}
					oninput={() => (fieldErrors = { ...fieldErrors, term: '' })}
				/>
				{#if fieldErrors.term}
					<FieldError>{fieldErrors.term}</FieldError>
				{/if}
			</Field.Field>
			<Field.Field>
				<Field.FieldLabel>Definition</Field.FieldLabel>
				<Textarea
					bind:value={form.definition}
					rows={4}
					placeholder="Definition..."
					disabled={saving}
					aria-invalid={!!fieldErrors.definition}
					oninput={() => (fieldErrors = { ...fieldErrors, definition: '' })}
				/>
				{#if fieldErrors.definition}
					<FieldError>{fieldErrors.definition}</FieldError>
				{/if}
			</Field.Field>
			{#if formError && !Object.keys(fieldErrors).length}
				<p class="text-sm text-destructive">{formError}</p>
			{/if}
			<DialogFooter>
				<Button variant="outline" type="button" disabled={saving} onclick={() => (dialogOpen = false)}
					>Cancel</Button
				>
				<Button variant="default" type="submit" disabled={saving}>
					{saving ? 'Saving...' : editing ? 'Save changes' : 'Create term'}
				</Button>
			</DialogFooter>
		</form>
	</DialogContent>
</Dialog>

<ConfirmDialog
	open={confirmSlug !== null}
	title="Delete term?"
	description={confirmSlug ? `Delete term "${confirmTerm}"? This cannot be undone.` : undefined}
	confirmLabel={deleting ? 'Deleting...' : 'Delete'}
	onconfirm={confirmedRemove}
/>
