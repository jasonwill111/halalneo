<script lang="ts">
	import { adminData, upsertItem, deleteItem, resetCollection } from '$lib/stores/admin-data.svelte';
	import type { Merchant, Certification } from '$lib/data/types';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Badge } from '$lib/components/ui/badge';
	import { Field, FieldLabel, FieldDescription } from '$lib/components/ui/field';
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
	import Store from '@lucide/svelte/icons/store';

	let search = $state('');
	let dialogOpen = $state(false);
	let editing = $state<Merchant | null>(null);

	type MerchantForm = {
		slug: string;
		name: string;
		country: string;
		businessType: Merchant['businessType'];
		isBrand: boolean;
		status: Merchant['status'];
		logoInitials: string;
		description: string;
		yearEstablished: string;
	};
	let form = $state<MerchantForm>({
		slug: '',
		name: '',
		country: '',
		businessType: 'manufacturer',
		isBrand: true,
		status: 'active',
		logoInitials: '',
		description: '',
		yearEstablished: '2000'
	});
	let formError = $state('');

	const filtered = $derived.by(() => {
		const list = adminData.merchants;
		if (!search.trim()) return [...list];
		const q = search.toLowerCase();
		return list.filter(
			(m) => m.name.toLowerCase().includes(q) || m.country.toLowerCase().includes(q) || m.slug.includes(q)
		);
	});

	const businessTypeLabels: Record<Merchant['businessType'], string> = {
		manufacturer: 'Manufacturer',
		wholesaler: 'Wholesaler',
		trader: 'Trader'
	};

	function slugify(s: string): string {
		return s
			.toLowerCase()
			.trim()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/(^-|-$)/g, '');
	}

	function initialsFromName(name: string): string {
		return name
			.split(' ')
			.map((p) => p[0])
			.filter(Boolean)
			.slice(0, 2)
			.join('')
			.toUpperCase();
	}

	function openCreate() {
		editing = null;
		form = {
			slug: '',
			name: '',
			country: '',
			businessType: 'manufacturer',
			isBrand: true,
			status: 'active',
			logoInitials: '',
			description: '',
			yearEstablished: '2000'
		};
		formError = '';
		dialogOpen = true;
	}

	function openEdit(m: Merchant) {
		editing = m;
		form = {
			slug: m.slug,
			name: m.name,
			country: m.country,
			businessType: m.businessType,
			isBrand: m.isBrand,
			status: m.status,
			logoInitials: m.logoInitials,
			description: m.description,
			yearEstablished: String(m.yearEstablished)
		};
		formError = '';
		dialogOpen = true;
	}

	function onNameInput(value: string) {
		form.name = value;
		if (!editing) {
			form.slug = slugify(value);
			form.logoInitials = initialsFromName(value);
		}
	}

	function save() {
		if (!form.name.trim()) {
			formError = 'Supplier name is required.';
			return;
		}
		if (form.slug && !/^[a-z0-9-]+$/.test(form.slug)) {
			formError = 'Slug may only contain lowercase letters, numbers and dashes.';
			return;
		}
		const base: Merchant = editing
			? editing
			: ({
					slug: '',
					name: '',
					country: '',
					businessType: 'manufacturer',
					isBrand: true,
					status: 'active',
					logoInitials: '',
					description: '',
					yearEstablished: 2000,
					certifications: []
				} as Merchant);
		const updated: Merchant = {
			...base,
			slug: form.slug || slugify(form.name),
			name: form.name.trim(),
			country: form.country.trim(),
			businessType: form.businessType,
			isBrand: form.isBrand,
			status: form.status,
			logoInitials: form.logoInitials || initialsFromName(form.name),
			description: form.description.trim(),
			yearEstablished: Number(form.yearEstablished) || 2000
		};
		upsertItem<Merchant>('merchants', updated, editing ?? undefined);
		dialogOpen = false;
	}

	function remove(m: Merchant) {
		if (window.confirm(`Delete supplier ${m.name}? This also hides their products.`)) {
			deleteItem('merchants', m.slug);
			adminData.skus = adminData.skus.filter((s) => s.merchantSlug !== m.slug);
		}
	}
</script>

<svelte:head><title>Suppliers — HalalNeo Admin</title></svelte:head>

<div class="space-y-6">
	<div class="flex flex-wrap items-end justify-between gap-4">
		<div class="space-y-1">
			<h1 class="text-3xl font-semibold tracking-tight">Suppliers</h1>
			<p class="max-w-2xl text-sm text-muted-foreground">
				Seller accounts and supplier company profiles listed in the marketplace.
			</p>
		</div>
		<div class="flex items-center gap-2">
			<Button variant="outline" size="sm" onclick={() => resetCollection('merchants')}>
				Reset to seed
			</Button>
			<Button variant="default" onclick={openCreate}>
				<Plus class="size-4"></Plus>
				New supplier
			</Button>
		</div>
	</div>

	<div class="relative max-w-sm">
		<Search class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"></Search>
		<Input bind:value={search} placeholder="Search suppliers…" class="pl-9" />
	</div>

	<div class="rounded-xl ring-1 ring-foreground/10">
		<Table>
			<TableHeader>
				<TableRow class="hover:bg-transparent">
					<TableHead>Supplier</TableHead>
					<TableHead>Type</TableHead>
					<TableHead>Country</TableHead>
					<TableHead>Certifications</TableHead>
					<TableHead>Status</TableHead>
					<TableHead class="text-right">Actions</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{#each filtered as m}
					<TableRow>
						<TableCell>
							<div class="flex items-center gap-3">
								<div class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-xs font-semibold text-primary">
									{m.logoInitials}
								</div>
								<div class="min-w-0">
									<p class="truncate font-medium">{m.name}</p>
									<p class="truncate text-xs text-muted-foreground">{m.slug}</p>
								</div>
							</div>
						</TableCell>
						<TableCell>{businessTypeLabels[m.businessType]}{m.isBrand ? ' · brand' : ''}</TableCell>
						<TableCell>{m.country}</TableCell>
						<TableCell>
							<span class="text-sm text-muted-foreground">{m.certifications.length} certs</span>
						</TableCell>
						<TableCell>
							<Badge variant={m.status === 'active' ? 'default' : 'secondary'}>{m.status}</Badge>
						</TableCell>
						<TableCell class="text-right">
							<div class="flex items-center justify-end gap-1">
								<Button variant="ghost" size="icon" aria-label="Edit" onclick={() => openEdit(m)}>
									<Pencil class="size-4"></Pencil>
								</Button>
								<Button
									variant="ghost"
									size="icon"
									aria-label="Delete"
									class="hover:bg-destructive/10 hover:text-destructive"
									onclick={() => remove(m)}
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
	<DialogContent class="sm:max-w-lg max-h-[85dvh] overflow-y-auto">
		<DialogHeader>
			<DialogTitle>{editing ? 'Edit supplier' : 'New supplier'}</DialogTitle>
			<DialogDescription>
				Create or update a supplier company profile in the marketplace.
			</DialogDescription>
		</DialogHeader>
		<div class="space-y-4">
			<Field>
				<FieldLabel>Name</FieldLabel>
				<Input
					value={form.name}
					oninput={(e) => onNameInput((e.currentTarget as HTMLInputElement).value)}
					placeholder="Company name"
				/>
			</Field>
			<div class="grid grid-cols-2 gap-4">
				<Field>
					<FieldLabel>Slug</FieldLabel>
					<Input bind:value={form.slug} placeholder="company-name" disabled={!!editing} />
				</Field>
				<Field>
					<FieldLabel>Country</FieldLabel>
					<Input bind:value={form.country} placeholder="Indonesia" />
				</Field>
			</div>
			<div class="grid grid-cols-2 gap-4">
				<Field>
					<FieldLabel>Business type</FieldLabel>
					<Select bind:value={form.businessType} type="single">
						<SelectTrigger class="w-full">
							{businessTypeLabels[form.businessType]}
						</SelectTrigger>
						<SelectContent>
							{#each Object.entries(businessTypeLabels) as [value, label]}
								<SelectItem value={value}>{label}</SelectItem>
							{/each}
						</SelectContent>
					</Select>
				</Field>
				<Field>
					<FieldLabel>Status</FieldLabel>
					<Select bind:value={form.status} type="single">
						<SelectTrigger class="w-full">{form.status}</SelectTrigger>
						<SelectContent>
							<SelectItem value="active">active</SelectItem>
							<SelectItem value="pending">pending</SelectItem>
						</SelectContent>
					</Select>
				</Field>
			</div>
			<div class="grid grid-cols-2 gap-4">
				<Field>
					<FieldLabel>Year established</FieldLabel>
					<Input bind:value={form.yearEstablished} type="number" min="1900" max="2030" />
				</Field>
				<Field>
					<FieldLabel>Logo initials</FieldLabel>
					<Input bind:value={form.logoInitials} placeholder="NF" />
				</Field>
			</div>
			<Field>
				<FieldLabel>Description</FieldLabel>
				<Textarea bind:value={form.description} rows={3} placeholder="Company description…" />
			</Field>
			<label class="flex items-center gap-2 text-sm">
				<input type="checkbox" bind:checked={form.isBrand} class="size-4 rounded-sm border-border" />
				Brand (sells under own label)
			</label>
			{#if formError}
				<p class="text-sm text-destructive">{formError}</p>
			{/if}
		</div>
		<DialogFooter>
			<Button variant="outline" onclick={() => (dialogOpen = false)}>Cancel</Button>
			<Button variant="default" onclick={save}>{editing ? 'Save changes' : 'Create supplier'}</Button>
		</DialogFooter>
	</DialogContent>
</Dialog>