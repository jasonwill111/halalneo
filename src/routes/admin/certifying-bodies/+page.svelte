<script lang="ts">
	import { adminData, upsertItem, deleteItem, resetCollection } from '$lib/stores/admin-data.svelte';
	import type { CertifyingBody } from '$lib/data/types';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
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
	let editing = $state<CertifyingBody | null>(null);

	type BodyForm = { id: string; name: string; country: string; standard: string };
	let form = $state<BodyForm>({ id: '', name: '', country: '', standard: '' });
	let formError = $state('');

	const filtered = $derived.by(() => {
		const list = [...adminData.certifyingBodies];
		if (!search.trim()) return list;
		const q = search.toLowerCase();
		return list.filter(
			(b) => b.name.toLowerCase().includes(q) || b.country.toLowerCase().includes(q) || b.standard.includes(q)
		);
	});

	function openCreate() {
		editing = null;
		form = { id: '', name: '', country: '', standard: '' };
		formError = '';
		dialogOpen = true;
	}

	function openEdit(b: CertifyingBody) {
		editing = b;
		form = { id: b.id, name: b.name, country: b.country, standard: b.standard };
		formError = '';
		dialogOpen = true;
	}

	function normalizeId(s: string): string {
		return s
			.toLowerCase()
			.trim()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/(^-|-$)/g, '');
	}

	function save() {
		if (!form.name.trim() || !form.country.trim()) {
			formError = 'Name and country are required.';
			return;
		}
		const base: CertifyingBody = editing ?? ({
			id: '',
			name: '',
			country: '',
			standard: ''
		} as CertifyingBody);
		const id = form.id || normalizeId(form.name);
		const existsElsewhere = adminData.certifyingBodies.some(
			(b) => b.id === id && b.id !== editing?.id
		);
		if (existsElsewhere) {
			formError = 'A body with that id already exists.';
			return;
		}
		upsertItem<CertifyingBody>(
			'certifyingBodies',
			{ ...base, id, name: form.name.trim(), country: form.country.trim(), standard: form.standard.trim() },
			editing ?? undefined
		);
		dialogOpen = false;
	}

	function remove(b: CertifyingBody) {
		if (window.confirm(`Delete certifying body ${b.name}?`)) {
			deleteItem('certifyingBodies', b.id);
		}
	}
</script>

<svelte:head><title>Certifying Bodies — HalalNeo Admin</title></svelte:head>

<div class="space-y-6">
	<div class="flex flex-wrap items-end justify-between gap-4">
		<div class="space-y-1">
			<h1 class="text-3xl font-semibold tracking-tight">Certifying Bodies</h1>
			<p class="max-w-2xl text-sm text-muted-foreground">
				Recognised halal certification bodies referenced by supplier certificates.
			</p>
		</div>
		<div class="flex items-center gap-2">
			<Button variant="outline" size="sm" onclick={() => resetCollection('certifyingBodies')}>
				Reset to seed
			</Button>
			<Button variant="default" onclick={openCreate}>
				<Plus class="size-4"></Plus>
				New body
			</Button>
		</div>
	</div>

	<div class="relative max-w-sm">
		<Search class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"></Search>
		<Input bind:value={search} placeholder="Search bodies…" class="pl-9" />
	</div>

	<div class="rounded-xl ring-1 ring-foreground/10">
		<Table>
			<TableHeader>
				<TableRow class="hover:bg-transparent">
					<TableHead>Name</TableHead>
					<TableHead>Country</TableHead>
					<TableHead>Standard</TableHead>
					<TableHead class="text-right">Actions</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{#each filtered as b}
					<TableRow>
						<TableCell class="font-medium">{b.name}</TableCell>
						<TableCell>{b.country}</TableCell>
						<TableCell class="font-mono text-sm text-muted-foreground">{b.standard}</TableCell>
						<TableCell class="text-right">
							<div class="flex items-center justify-end gap-1">
								<Button variant="ghost" size="icon" aria-label="Edit" onclick={() => openEdit(b)}>
									<Pencil class="size-4"></Pencil>
								</Button>
								<Button
									variant="ghost"
									size="icon"
									aria-label="Delete"
									class="hover:bg-destructive/10 hover:text-destructive"
									onclick={() => remove(b)}
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
			<DialogTitle>{editing ? 'Edit body' : 'New certifying body'}</DialogTitle>
			<DialogDescription>
				Register or update a halal certification body.
			</DialogDescription>
		</DialogHeader>
		<div class="space-y-4">
			<Field>
				<FieldLabel>Name</FieldLabel>
				<Input bind:value={form.name} placeholder="JAKIM" />
			</Field>
			<Field>
				<FieldLabel>Id</FieldLabel>
				<Input bind:value={form.id} placeholder="jakim" disabled={!!editing} />
			</Field>
			<Field>
				<FieldLabel>Country</FieldLabel>
				<Input bind:value={form.country} placeholder="Malaysia" />
			</Field>
			<Field>
				<FieldLabel>Standard</FieldLabel>
				<Input bind:value={form.standard} placeholder="MS 1500:2019" />
			</Field>
			{#if formError}
				<p class="text-sm text-destructive">{formError}</p>
			{/if}
		</div>
		<DialogFooter>
			<Button variant="outline" onclick={() => (dialogOpen = false)}>Cancel</Button>
			<Button variant="default" onclick={save}>{editing ? 'Save changes' : 'Create body'}</Button>
		</DialogFooter>
	</DialogContent>
</Dialog>