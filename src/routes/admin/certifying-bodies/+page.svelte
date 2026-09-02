<script lang="ts">
	import {
		adminData,
		upsertItem,
		deleteItem,
		resetCollection
	} from '#lib/stores/admin-data.svelte.js';
	import type { CertifyingBody } from '#lib/data/types.js';
	import { Button } from '#lib/components/ui/button/index.js';
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
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';

	let search = $state('');
	let dialogOpen = $state(false);
	let editing = $state<CertifyingBody | null>(null);
	let seoExpanded = $state(false);

	type BodyForm = {
		id: string;
		name: string;
		country: string;
		standard: string;
		website: string;
		description: string;
		status: 'active' | 'inactive';
		metaTitle: string;
		metaDescription: string;
		keywords: string;
	};
	let form = $state<BodyForm>({ id: '', name: '', country: '', standard: '', website: '', description: '', status: 'active', metaTitle: '', metaDescription: '', keywords: '' });
	let formError = $state('');

	const filtered = $derived.by(() => {
		const list = [...adminData.certifyingBodies];
		if (!search.trim()) return list;
		const q = search.toLowerCase();
		return list.filter(
			(b) =>
				b.name.toLowerCase().includes(q) ||
				b.country.toLowerCase().includes(q) ||
				b.standard.includes(q)
		);
	});

	function openCreate() {
		editing = null;
		form = { id: '', name: '', country: '', standard: '', website: '', description: '', status: 'active', metaTitle: '', metaDescription: '', keywords: '' };
		formError = '';
		seoExpanded = false;
		dialogOpen = true;
	}

	function openEdit(b: CertifyingBody) {
		editing = b;
		form = {
			id: b.id,
			name: b.name,
			country: b.country,
			standard: b.standard,
			website: b.website ?? '',
			description: b.description ?? '',
			status: b.status ?? 'active',
			metaTitle: b.metaTitle ?? '',
			metaDescription: b.metaDescription ?? '',
			keywords: b.keywords ?? ''
		};
		formError = '';
		seoExpanded = false;
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
		const base: CertifyingBody =
			editing ??
			({
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
			{
				...base,
				id,
				name: form.name.trim(),
				country: form.country.trim(),
				standard: form.standard.trim(),
				website: form.website.trim() || undefined,
				description: form.description.trim() || undefined,
				status: form.status,
				metaTitle: form.metaTitle.trim() || undefined,
				metaDescription: form.metaDescription.trim() || undefined,
				keywords: form.keywords.trim() || undefined
			},
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
		<Search
			class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
		></Search>
		<Input bind:value={search} placeholder="Search bodies..." class="pl-9" />
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
	<DialogContent class="sm:max-w-lg">
		<DialogHeader>
			<DialogTitle>{editing ? 'Edit body' : 'New certifying body'}</DialogTitle>
			<DialogDescription>Register or update a halal certification body.</DialogDescription>
		</DialogHeader>
		<div class="space-y-4">
			<Field.Field>
				<Field.FieldLabel>Name</Field.FieldLabel>
				<Input bind:value={form.name} placeholder="JAKIM" />
			</Field.Field>
			<Field.Field>
				<Field.FieldLabel>Id</Field.FieldLabel>
				<Input bind:value={form.id} placeholder="jakim" disabled={!!editing} />
			</Field.Field>
			<div class="grid grid-cols-2 gap-4">
				<Field.Field>
					<Field.FieldLabel>Country</Field.FieldLabel>
					<Input bind:value={form.country} placeholder="Malaysia" />
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel>Standard</Field.FieldLabel>
					<Input bind:value={form.standard} placeholder="MS 1500:2019" />
				</Field.Field>
			</div>
			<Field.Field>
				<Field.FieldLabel>Website</Field.FieldLabel>
				<Input bind:value={form.website} placeholder="https://example.com" />
			</Field.Field>
			<Field.Field>
				<Field.FieldLabel>Description</Field.FieldLabel>
				<Textarea bind:value={form.description} rows={3} placeholder="Certifying body description..." />
			</Field.Field>
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

			<!-- ===================== SEO & METADATA (collapsed) ===================== -->
			<button
				type="button"
				class="flex items-center gap-2 rounded-md px-1 py-1.5 text-sm font-medium select-none hover:bg-muted"
				onclick={() => (seoExpanded = !seoExpanded)}
			>
				{#if seoExpanded}
					<ChevronDown class="size-4" />
				{:else}
					<ChevronRight class="size-4" />
				{/if}
				SEO & Metadata
			</button>

			{#if seoExpanded}
				<div class="flex flex-col gap-4 pl-6">
					<Field.Field>
						<Field.FieldLabel>Meta Title</Field.FieldLabel>
						<Input bind:value={form.metaTitle} maxlength={60} placeholder="SEO page title (max 60 chars)" />
					</Field.Field>
					<Field.Field>
						<Field.FieldLabel>Meta Description</Field.FieldLabel>
						<Textarea bind:value={form.metaDescription} maxlength={160} rows={2} placeholder="SEO description (max 160 chars)" />
					</Field.Field>
					<Field.Field>
						<Field.FieldLabel>Keywords</Field.FieldLabel>
						<Input bind:value={form.keywords} placeholder="Comma separated: halal, certification, malaysia" />
					</Field.Field>
				</div>
			{/if}

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
