<script lang="ts">
	import { adminData, upsertItem, deleteItem, resetCollection } from '$lib/stores/admin-data.svelte';
	import type { GlossaryTerm } from '$lib/data/types';
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
	import Search from '@lucide/svelte/icons/search';
	import Plus from '@lucide/svelte/icons/plus';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Trash2 from '@lucide/svelte/icons/trash-2';

	let search = $state('');
	let dialogOpen = $state(false);
	let editing = $state<GlossaryTerm | null>(null);

	type TermForm = { term: string; definition: string };
	let form = $state<TermForm>({ term: '', definition: '' });
	let formError = $state('');

	const filtered = $derived.by(() => {
		const list = [...adminData.glossary];
		if (!search.trim()) return list;
		const q = search.toLowerCase();
		return list.filter(
			(t) => t.term.toLowerCase().includes(q) || t.definition.toLowerCase().includes(q)
		);
	});

	function openCreate() {
		editing = null;
		form = { term: '', definition: '' };
		formError = '';
		dialogOpen = true;
	}

	function openEdit(t: GlossaryTerm) {
		editing = t;
		form = { term: t.term, definition: t.definition };
		formError = '';
		dialogOpen = true;
	}

	function save() {
		if (!form.term.trim() || !form.definition.trim()) {
			formError = 'Term and definition are required.';
			return;
		}
		const existing = editing ?? ({ term: '', definition: '' } as GlossaryTerm);
		const duplicate = adminData.glossary.some(
			(t) => t.term.toLowerCase() === form.term.trim().toLowerCase() && t.term !== editing?.term
		);
		if (duplicate) {
			formError = 'That term already exists.';
			return;
		}
		upsertItem<GlossaryTerm>(
			'glossary',
			{ ...existing, term: form.term.trim(), definition: form.definition.trim() },
			editing ?? undefined
		);
		dialogOpen = false;
	}

	function remove(t: GlossaryTerm) {
		if (window.confirm(`Delete term "${t.term}"?`)) {
			deleteItem('glossary', t.term);
		}
	}
</script>

<svelte:head><title>Glossary — HalalNeo Admin</title></svelte:head>

<div class="space-y-6">
	<div class="flex flex-wrap items-end justify-between gap-4">
		<div class="space-y-1">
			<h1 class="text-3xl font-semibold tracking-tight">Glossary</h1>
			<p class="max-w-2xl text-sm text-muted-foreground">
				Halal trade terminology shown on the public glossary page.
			</p>
		</div>
		<div class="flex items-center gap-2">
			<Button variant="outline" size="sm" onclick={() => resetCollection('glossary')}>
				Reset to seed
			</Button>
			<Button variant="default" onclick={openCreate}>
				<Plus class="size-4"></Plus>
				New term
			</Button>
		</div>
	</div>

	<div class="relative max-w-sm">
		<Search class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"></Search>
		<Input bind:value={search} placeholder="Search terms…" class="pl-9" />
	</div>

	<div class="rounded-xl ring-1 ring-foreground/10">
		<Table>
			<TableHeader>
				<TableRow class="hover:bg-transparent">
					<TableHead>Term</TableHead>
					<TableHead>Definition</TableHead>
					<TableHead class="text-right">Actions</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{#each filtered as t}
					<TableRow>
						<TableCell class="font-medium">{t.term}</TableCell>
						<TableCell class="max-w-md text-sm text-muted-foreground">{t.definition}</TableCell>
						<TableCell class="text-right">
							<div class="flex items-center justify-end gap-1">
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
			</TableBody>
		</Table>
	</div>
</div>

<Dialog bind:open={dialogOpen}>
	<DialogContent class="sm:max-w-md">
		<DialogHeader>
			<DialogTitle>{editing ? 'Edit term' : 'New term'}</DialogTitle>
			<DialogDescription>
				Add or update a glossary entry.
			</DialogDescription>
		</DialogHeader>
		<div class="space-y-4">
			<Field>
				<FieldLabel>Term</FieldLabel>
				<Input bind:value={form.term} placeholder="Halal" />
			</Field>
			<Field>
				<FieldLabel>Definition</FieldLabel>
				<Textarea bind:value={form.definition} rows={4} placeholder="Definition…" />
			</Field>
			{#if formError}
				<p class="text-sm text-destructive">{formError}</p>
			{/if}
		</div>
		<DialogFooter>
			<Button variant="outline" onclick={() => (dialogOpen = false)}>Cancel</Button>
			<Button variant="default" onclick={save}>{editing ? 'Save changes' : 'Create term'}</Button>
		</DialogFooter>
	</DialogContent>
</Dialog>