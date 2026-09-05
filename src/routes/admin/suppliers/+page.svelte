<script lang="ts">
	import {
		adminData,
		upsertItem,
		deleteItem,
		resetCollection
	} from '#lib/stores/admin-data.svelte.js';
	import type { Supplier } from '#lib/data/types.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Textarea } from '#lib/components/ui/textarea/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
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
	import { Switch } from '#lib/components/ui/switch/index.js';
	import Search from '@lucide/svelte/icons/search';
	import Plus from '@lucide/svelte/icons/plus';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Sparkles from '@lucide/svelte/icons/sparkles';
	import CollapsibleSection from '#lib/components/site/collapsible-section.svelte';

	let search = $state('');
	let dialogOpen = $state(false);
	let editing = $state<Supplier | null>(null);

	// Collapsible section state
	let basicExpanded = $state(true);
	let contactExpanded = $state(false);
	let businessExpanded = $state(false);
	let seoExpanded = $state(false);

	// AI generation mock state
	let aiLoading = $state(false);

	type SupplierForm = {
		slug: string;
		name: string;
		country: string;
		businessType: Supplier['businessType'];
		isBrand: boolean;
		status: Supplier['status'];
		logoInitials: string;
		description: string;
		coverImage: string;
		yearEstablished: string;
		website: string;
		email: string;
		phone: string;
		whatsapp: string;
		line: string;
		employeeCount: string;
		productionCapacity: string;
		mainMarkets: string;
		metaTitle: string;
		metaDescription: string;
		keywords: string;
	};

	let form = $state<SupplierForm>({
		slug: '',
		name: '',
		country: '',
		businessType: 'manufacturer',
		isBrand: true,
		status: 'active',
		logoInitials: '',
		description: '',
		coverImage: '',
		yearEstablished: '2000',
		website: '',
		email: '',
		phone: '',
		whatsapp: '',
		line: '',
		employeeCount: '',
		productionCapacity: '',
		mainMarkets: '',
		metaTitle: '',
		metaDescription: '',
		keywords: ''
	});
	let formError = $state('');

	const filtered = $derived.by(() => {
		const list = adminData.suppliers;
		if (!search.trim()) return [...list];
		const q = search.toLowerCase();
		return list.filter(
			(m) =>
				m.name.toLowerCase().includes(q) ||
				m.country.toLowerCase().includes(q) ||
				m.slug.includes(q)
		);
	});

	const businessTypeLabels: Record<Supplier['businessType'], string> = {
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
			coverImage: '',
			yearEstablished: '2000',
			website: '',
			email: '',
			phone: '',
			whatsapp: '',
			line: '',
			employeeCount: '',
			productionCapacity: '',
			mainMarkets: '',
			metaTitle: '',
			metaDescription: '',
			keywords: ''
		};
		formError = '';
		basicExpanded = true;
		contactExpanded = false;
		businessExpanded = false;
		seoExpanded = false;
		dialogOpen = true;
	}

	function openEdit(m: Supplier) {
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
			coverImage: m.coverImage ?? '',
			yearEstablished: String(m.yearEstablished),
			website: m.website ?? '',
			email: m.email ?? '',
			phone: m.phone ?? '',
			whatsapp: m.whatsapp ?? '',
			line: m.line ?? '',
			employeeCount: m.employeeCount ?? '',
			productionCapacity: m.productionCapacity ?? '',
			mainMarkets: (m.mainMarkets ?? []).join(', '),
			metaTitle: m.metaTitle ?? '',
			metaDescription: m.metaDescription ?? '',
			keywords: m.keywords ?? ''
		};
		formError = '';
		basicExpanded = true;
		contactExpanded = false;
		businessExpanded = false;
		seoExpanded = false;
		dialogOpen = true;
	}

	function onNameInput(value: string) {
		form.name = value;
		if (!editing) {
			form.slug = slugify(value);
			form.logoInitials = initialsFromName(value);
		}
	}

	function generateDescription() {
		aiLoading = true;
		// Mock AI generation — simulates a network delay
		setTimeout(() => {
			const name = form.name || 'This company';
			const type = businessTypeLabels[form.businessType]?.toLowerCase() ?? 'supplier';
			const country = form.country || 'their region';
			const year = form.yearEstablished || 'recently';
			form.description =
				`${name} is a halal-certified ${type} based in ${country}, established in ${year}. ` +
				`They specialize in sourcing and supplying high-quality halal products to international markets. ` +
				`With a commitment to compliance and quality assurance, they serve buyers across Southeast Asia, ` +
				`the Middle East, and beyond.`;
			aiLoading = false;
		}, 800);
	}

	function save() {
		if (!form.name.trim()) {
			formError = 'Supplier name is required.';
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
		const base: Supplier = editing
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
				} as Supplier);
		const updated: Supplier = {
			...base,
			slug: form.slug || slugify(form.name),
			name: form.name.trim(),
			country: form.country.trim(),
			businessType: form.businessType,
			isBrand: form.isBrand,
			status: form.status,
			logoInitials: form.logoInitials || initialsFromName(form.name),
			description: form.description.trim(),
			coverImage: form.coverImage.trim() || undefined,
			yearEstablished: Number(form.yearEstablished) || 2000,
			website: form.website.trim() || undefined,
			email: form.email.trim() || undefined,
			phone: form.phone.trim() || undefined,
			whatsapp: form.whatsapp.trim() || undefined,
			line: form.line.trim() || undefined,
			employeeCount: form.employeeCount.trim() || undefined,
			productionCapacity: form.productionCapacity.trim() || undefined,
			mainMarkets: form.mainMarkets
				? form.mainMarkets
						.split(',')
						.map((s) => s.trim())
						.filter(Boolean)
				: undefined,
			metaTitle: form.metaTitle.trim() || undefined,
			metaDescription: form.metaDescription.trim() || undefined,
			keywords: form.keywords.trim() || undefined
		};
		upsertItem<Supplier>('suppliers', updated, editing ?? undefined);
		dialogOpen = false;
	}

	function remove(m: Supplier) {
		if (window.confirm(`Delete supplier ${m.name}? This also hides their products.`)) {
			deleteItem('suppliers', m.slug);
			adminData.products = adminData.products.filter((s) => s.supplierSlug !== m.slug);
		}
	}
</script>

<svelte:head><title>Suppliers — HalalNeo Admin</title></svelte:head>

<div class="space-y-6">
	<div class="flex flex-wrap items-end justify-between gap-4">
		<div class="flex flex-col gap-1">
			<h1 class="text-3xl font-semibold tracking-tight">Suppliers</h1>
			<p class="max-w-2xl text-sm text-muted-foreground">
				Seller accounts and supplier company profiles listed in the marketplace.
			</p>
		</div>
		<div class="flex items-center gap-2">
			<Button variant="outline" size="sm" onclick={() => resetCollection('suppliers')}>
				Reset to seed
			</Button>
			<Button variant="default" onclick={openCreate}>
				<Plus class="size-4" />
				New supplier
			</Button>
		</div>
	</div>

	<div class="relative max-w-sm">
		<Search
			class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
		/>
		<Input bind:value={search} placeholder="Search suppliers..." class="pl-9" />
	</div>

	<div class="overflow-x-auto rounded-xl ring-1 ring-foreground/10">
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
				{#each filtered as m (m.slug)}
					<TableRow>
						<TableCell>
							<div class="flex items-center gap-3">
								<div
									class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-xs font-semibold text-primary"
								>
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
									<Pencil />
								</Button>
								<Button
									variant="ghost"
									size="icon"
									aria-label="Delete"
									class="hover:bg-destructive/10 hover:text-destructive"
									onclick={() => remove(m)}
								>
									<Trash2 />
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
			<DialogTitle>{editing ? 'Edit supplier' : 'New supplier'}</DialogTitle>
			<DialogDescription>
				Create or update a supplier company profile in the marketplace.
			</DialogDescription>
		</DialogHeader>

		<div class="flex flex-col gap-4">
			<!-- ===================== BASIC INFO (always expanded) ===================== -->
			<CollapsibleSection title="Basic Info" bind:open={basicExpanded}>
				<Field.Field>
					<Field.FieldLabel>Name *</Field.FieldLabel>
					<Input
						value={form.name}
						oninput={(e) => onNameInput((e.currentTarget as HTMLInputElement).value)}
						placeholder="Company name"
					/>
				</Field.Field>

				<div class="grid grid-cols-2 gap-4">
					<Field.Field>
						<Field.FieldLabel>Slug</Field.FieldLabel>
						<Input bind:value={form.slug} placeholder="company-name" disabled={!!editing} />
					</Field.Field>
					<Field.Field>
						<Field.FieldLabel>Country *</Field.FieldLabel>
						<Input bind:value={form.country} placeholder="Indonesia" />
					</Field.Field>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<Field.Field>
						<Field.FieldLabel>Business type</Field.FieldLabel>
						<Select bind:value={form.businessType} type="single">
							<SelectTrigger class="w-full">
								{businessTypeLabels[form.businessType]}
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									{#each Object.entries(businessTypeLabels) as [value, label] (value)}
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

				<div class="grid grid-cols-2 gap-4">
					<Field.Field>
						<Field.FieldLabel>Year established</Field.FieldLabel>
						<Input bind:value={form.yearEstablished} type="number" min="1900" max="2030" />
					</Field.Field>
					<Field.Field>
						<Field.FieldLabel>Logo initials</Field.FieldLabel>
						<Input bind:value={form.logoInitials} placeholder="NF" />
					</Field.Field>
				</div>

				<Field.Field orientation="horizontal" class="flex-row items-center gap-3">
					<Switch bind:checked={form.isBrand} />
					<Field.FieldLabel class="font-normal">Brand (sells under own label)</Field.FieldLabel>
				</Field.Field>

				<Field.Field>
					<Field.FieldLabel>Cover Image URL</Field.FieldLabel>
					<Input bind:value={form.coverImage} placeholder="https://..." />
				</Field.Field>
			</CollapsibleSection>

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
						<Input bind:value={form.phone} placeholder="+62 21 1234 5678" />
					</Field.Field>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<Field.Field>
						<Field.FieldLabel>WhatsApp</Field.FieldLabel>
						<Input bind:value={form.whatsapp} placeholder="+62 812 3456 7890" />
					</Field.Field>
					<Field.Field>
						<Field.FieldLabel>LINE</Field.FieldLabel>
						<Input bind:value={form.line} placeholder="@company_id" />
					</Field.Field>
				</div>
			</CollapsibleSection>

			<!-- ===================== BUSINESS DETAILS (collapsed) ===================== -->
			<CollapsibleSection title="Business Details" bind:open={businessExpanded}>
				<div class="grid grid-cols-2 gap-4">
					<Field.Field>
						<Field.FieldLabel>Employee count</Field.FieldLabel>
						<Input bind:value={form.employeeCount} placeholder="50-100" />
					</Field.Field>
					<Field.Field>
						<Field.FieldLabel>Production capacity</Field.FieldLabel>
						<Input bind:value={form.productionCapacity} placeholder="10,000 units/month" />
					</Field.Field>
				</div>

				<Field.Field>
					<Field.FieldLabel>Main markets</Field.FieldLabel>
					<Input bind:value={form.mainMarkets} placeholder="Indonesia, Malaysia, UAE" />
					<Field.FieldDescription>Comma-separated list of countries.</Field.FieldDescription>
				</Field.Field>

				<Field.Field>
					<div class="flex items-center justify-between">
						<Field.FieldLabel>Description</Field.FieldLabel>
						<Button variant="outline" size="sm" onclick={generateDescription} disabled={aiLoading}>
							<Sparkles class="size-3.5" />
							{aiLoading ? 'Generating...' : 'Generate'}
						</Button>
					</div>
					<Textarea bind:value={form.description} rows={4} placeholder="Company description..." />
				</Field.Field>
			</CollapsibleSection>

			{#if formError}
				<p class="text-sm text-destructive">{formError}</p>
			{/if}

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
						placeholder="Comma separated: halal, supplier, indonesia"
					/>
				</Field.Field>
			</CollapsibleSection>
		</div>

		<DialogFooter>
			<Button variant="outline" onclick={() => (dialogOpen = false)}>Cancel</Button>
			<Button variant="default" onclick={save}>
				{editing ? 'Save changes' : 'Create supplier'}
			</Button>
		</DialogFooter>
	</DialogContent>
</Dialog>
