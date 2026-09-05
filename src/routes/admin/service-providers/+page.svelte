<script lang="ts">
	import { adminData, upsertItem, deleteItem } from '#lib/stores/admin-data.svelte.js';
	import type { ServiceProvider } from '#lib/data/types.js';
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
		SelectGroup,
		SelectContent,
		SelectItem,
		SelectTrigger
	} from '#lib/components/ui/select/index.js';
	import Search from '@lucide/svelte/icons/search';
	import Plus from '@lucide/svelte/icons/plus';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import CollapsibleSection from '#lib/components/site/collapsible-section.svelte';
	import StatTile from '#lib/components/site/stat-tile.svelte';

	let search = $state('');
	let dialogOpen = $state(false);
	let editing = $state<ServiceProvider | null>(null);
	let formError = $state('');

	// Collapsible section state
	let contactExpanded = $state(false);
	let seoExpanded = $state(false);

	type ProviderForm = {
		slug: string;
		name: string;
		type: ServiceProvider['type'];
		country: string;
		description: string;
		rating: string;
		status: ServiceProvider['status'];
		website: string;
		email: string;
		phone: string;
		whatsapp: string;
		line: string;
		metaTitle: string;
		metaDescription: string;
		keywords: string;
	};

	let form = $state<ProviderForm>({
		slug: '',
		name: '',
		type: 'certification',
		country: '',
		description: '',
		rating: '',
		status: 'active',
		website: '',
		email: '',
		phone: '',
		whatsapp: '',
		line: '',
		metaTitle: '',
		metaDescription: '',
		keywords: ''
	});

	const typeLabels: Record<ServiceProvider['type'], string> = {
		certification: 'Certification',
		logistics: 'Logistics',
		finance: 'Finance',
		payment: 'Payment',
		insurance: 'Insurance',
		consulting: 'Consulting'
	};

	const providers = $derived(adminData.serviceProviders ?? []);

	const filtered = $derived.by(() => {
		if (!search.trim()) return providers;
		const q = search.toLowerCase();
		return providers.filter(
			(sp) =>
				sp.name.toLowerCase().includes(q) ||
				sp.country.toLowerCase().includes(q) ||
				sp.slug.includes(q)
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
			name: '',
			type: 'certification',
			country: '',
			description: '',
			rating: '',
			status: 'active',
			website: '',
			email: '',
			phone: '',
			whatsapp: '',
			line: '',
			metaTitle: '',
			metaDescription: '',
			keywords: ''
		};
		formError = '';
		contactExpanded = false;
		seoExpanded = false;
		dialogOpen = true;
	}

	function openEdit(sp: ServiceProvider) {
		editing = sp;
		form = {
			slug: sp.slug,
			name: sp.name,
			type: sp.type,
			country: sp.country,
			description: sp.description ?? '',
			rating: sp.rating != null ? String(sp.rating) : '',
			status: sp.status,
			website: sp.website ?? '',
			email: sp.email ?? '',
			phone: sp.phone ?? '',
			whatsapp: sp.whatsapp ?? '',
			line: sp.line ?? '',
			metaTitle: sp.metaTitle ?? '',
			metaDescription: sp.metaDescription ?? '',
			keywords: sp.keywords ?? ''
		};
		formError = '';
		contactExpanded = false;
		seoExpanded = false;
		dialogOpen = true;
	}

	function save() {
		if (!form.name.trim()) {
			formError = 'Provider name is required.';
			return;
		}
		if (!form.country.trim()) {
			formError = 'Country is required.';
			return;
		}
		if (form.slug && !/^[a-z0-9-]+$/.test(form.slug)) {
			formError = 'Slug may only contain lowercase letters, numbers and dashes.';
			return;
		}
		const updated: ServiceProvider = {
			slug: form.slug || slugify(form.name),
			name: form.name.trim(),
			type: form.type,
			country: form.country.trim(),
			description: form.description.trim() || undefined,
			rating: form.rating ? Number(form.rating) : undefined,
			status: form.status,
			website: form.website.trim() || undefined,
			email: form.email.trim() || undefined,
			phone: form.phone.trim() || undefined,
			whatsapp: form.whatsapp.trim() || undefined,
			line: form.line.trim() || undefined,
			metaTitle: form.metaTitle.trim() || undefined,
			metaDescription: form.metaDescription.trim() || undefined,
			keywords: form.keywords.trim() || undefined
		};
		upsertItem<ServiceProvider>('serviceProviders', updated, editing ?? undefined);
		dialogOpen = false;
	}

	function remove(sp: ServiceProvider) {
		if (window.confirm(`Delete provider ${sp.name}?`)) {
			deleteItem('serviceProviders', sp.slug);
		}
	}

	function statusColor(s: string): string {
		if (s === 'active') return 'bg-success/10 text-success';
		if (s === 'pending') return 'bg-warn/10 text-warn';
		if (s === 'suspended') return 'bg-destructive/10 text-destructive';
		return 'bg-muted text-muted-foreground';
	}
</script>

<svelte:head>
	<title>Service Providers — HalalNeo Admin</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="flex flex-col gap-6">
	<div class="flex flex-wrap items-end justify-between gap-4">
		<div class="flex flex-col gap-1">
			<h1 class="text-3xl font-semibold tracking-tight">Service Providers</h1>
			<p class="max-w-2xl text-sm text-muted-foreground">
				Manage certification, logistics, and consulting service providers.
			</p>
		</div>
		<Button variant="default" size="sm" onclick={openCreate}>
			<Plus class="size-4"></Plus>
			Add Provider
		</Button>
	</div>

	<div class="relative max-w-sm">
		<Search
			class="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
		></Search>
		<Input bind:value={search} placeholder="Search providers..." class="pl-9" />
	</div>

	<div class="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
		<StatTile value={providers.length} label="Total Providers" />
		<StatTile value={providers.filter((s) => s.status === 'active').length} label="Active" />
		<StatTile
			value={providers.filter((s) => s.rating != null).length > 0
				? (
						providers.reduce((sum, s) => sum + (s.rating ?? 0), 0) /
						providers.filter((s) => s.rating != null).length
					).toFixed(1)
				: '—'}
			label="Avg. Rating"
		/>
	</div>

	<div class="overflow-x-auto rounded-xl ring-1 ring-foreground/10">
		<Table>
			<TableHeader>
				<TableRow class="hover:bg-transparent">
					<TableHead>Name</TableHead>
					<TableHead>Type</TableHead>
					<TableHead>Country</TableHead>
					<TableHead>Rating</TableHead>
					<TableHead>Status</TableHead>
					<TableHead class="text-right">Actions</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{#each filtered as sp (sp.slug)}
					<TableRow>
						<TableCell>
							<div class="min-w-0">
								<p class="truncate font-medium">{sp.name}</p>
								<p class="truncate text-xs text-muted-foreground">{sp.slug}</p>
							</div>
						</TableCell>
						<TableCell class="capitalize">{typeLabels[sp.type]}</TableCell>
						<TableCell>{sp.country}</TableCell>
						<TableCell>{sp.rating ?? '—'}</TableCell>
						<TableCell>
							<Badge
								variant="secondary"
								class={`px-1.5 py-0.5 text-[10px] capitalize ${statusColor(sp.status)}`}
								>{sp.status}</Badge
							>
						</TableCell>
						<TableCell class="text-right">
							<div class="flex items-center justify-end gap-1">
								<Button
									variant="ghost"
									size="icon"
									aria-label="Edit"
									class="size-8"
									onclick={() => openEdit(sp)}
								>
									<Pencil class="size-3.5"></Pencil>
								</Button>
								<Button
									variant="ghost"
									size="icon"
									aria-label="Delete"
									class="size-8 hover:bg-destructive/10 hover:text-destructive"
									onclick={() => remove(sp)}
								>
									<Trash2 class="size-3.5"></Trash2>
								</Button>
							</div>
						</TableCell>
					</TableRow>
				{:else}
					<TableRow>
						<TableCell colspan={6} class="py-8 text-center text-sm text-muted-foreground">
							No providers found.
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
			<DialogTitle>{editing ? 'Edit provider' : 'New provider'}</DialogTitle>
			<DialogDescription>Create or update a service provider profile.</DialogDescription>
		</DialogHeader>

		<div class="flex flex-col gap-4">
			<Field.Field>
				<Field.FieldLabel>Name *</Field.FieldLabel>
				<Input bind:value={form.name} placeholder="Provider name" />
			</Field.Field>

			<div class="grid grid-cols-2 gap-4">
				<Field.Field>
					<Field.FieldLabel>Slug</Field.FieldLabel>
					<Input bind:value={form.slug} placeholder="provider-name" disabled={!!editing} />
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel>Country *</Field.FieldLabel>
					<Input bind:value={form.country} placeholder="Malaysia" />
				</Field.Field>
			</div>

			<div class="grid grid-cols-2 gap-4">
				<Field.Field>
					<Field.FieldLabel>Type</Field.FieldLabel>
					<Select bind:value={form.type} type="single">
						<SelectTrigger class="w-full">
							{typeLabels[form.type]}
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								{#each Object.entries(typeLabels) as [value, label] (value)}
									<SelectItem {value}>{label}</SelectItem>
								{/each}
							</SelectGroup>
						</SelectContent>
					</Select>
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel>Status</Field.FieldLabel>
					<Select bind:value={form.status} type="single">
						<SelectTrigger class="w-full">{form.status}</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								<SelectItem value="active">active</SelectItem>
								<SelectItem value="pending">pending</SelectItem>
								<SelectItem value="suspended">suspended</SelectItem>
							</SelectGroup>
						</SelectContent>
					</Select>
				</Field.Field>
			</div>

			<Field.Field>
				<Field.FieldLabel>Rating</Field.FieldLabel>
				<Input
					bind:value={form.rating}
					type="number"
					min="0"
					max="5"
					step="0.1"
					placeholder="4.5"
				/>
			</Field.Field>

			<Field.Field>
				<Field.FieldLabel>Description</Field.FieldLabel>
				<Textarea bind:value={form.description} rows={3} placeholder="Provider description..." />
			</Field.Field>

			<!-- ===================== CONTACT DETAILS (collapsed) ===================== -->
			<CollapsibleSection title="Contact Details" bind:open={contactExpanded}>
				<Field.Field>
					<Field.FieldLabel>Website</Field.FieldLabel>
					<Input bind:value={form.website} placeholder="https://example.com" />
				</Field.Field>

				<div class="grid grid-cols-2 gap-4">
					<Field.Field>
						<Field.FieldLabel>Email</Field.FieldLabel>
						<Input bind:value={form.email} type="email" placeholder="info@company.com" />
					</Field.Field>
					<Field.Field>
						<Field.FieldLabel>Phone</Field.FieldLabel>
						<Input bind:value={form.phone} placeholder="+60 3 1234 5678" />
					</Field.Field>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<Field.Field>
						<Field.FieldLabel>WhatsApp</Field.FieldLabel>
						<Input bind:value={form.whatsapp} placeholder="+60 12 345 6789" />
					</Field.Field>
					<Field.Field>
						<Field.FieldLabel>LINE</Field.FieldLabel>
						<Input bind:value={form.line} placeholder="@provider_id" />
					</Field.Field>
				</div>
			</CollapsibleSection>

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
						placeholder="Comma separated: halal, certification, malaysia"
					/>
				</Field.Field>
			</CollapsibleSection>
		</div>

		{#if formError}
			<p class="text-sm text-destructive">{formError}</p>
		{/if}

		<DialogFooter>
			<Button variant="outline" onclick={() => (dialogOpen = false)}>Cancel</Button>
			<Button variant="default" onclick={save}>
				{editing ? 'Save changes' : 'Create provider'}
			</Button>
		</DialogFooter>
	</DialogContent>
</Dialog>
