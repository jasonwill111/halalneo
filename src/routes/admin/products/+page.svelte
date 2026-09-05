<script lang="ts">
	import {
		adminData,
		upsertItem,
		deleteItem,
		resetCollection
	} from '#lib/stores/admin-data.svelte.js';
	import type { Product } from '#lib/data/types.js';
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
		SelectContent,
		SelectItem,
		SelectTrigger
	} from '#lib/components/ui/select/index.js';
	import Search from '@lucide/svelte/icons/search';
	import Plus from '@lucide/svelte/icons/plus';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Sparkles from '@lucide/svelte/icons/sparkles';
	import Loader2 from '@lucide/svelte/icons/loader-2';
	import X from '@lucide/svelte/icons/x';
	import CollapsibleSection from '#lib/components/site/collapsible-section.svelte';

	let search = $state('');
	let dialogOpen = $state(false);
	let editing = $state<Product | null>(null);

	// Collapsible section state
	let basicExpanded = $state(true);
	let pricingExpanded = $state(false);
	let detailsExpanded = $state(false);
	let mediaExpanded = $state(false);
	let seoExpanded = $state(false);

	// AI generation mock state
	let aiLoading = $state(false);

	type SpecRow = { id: string; key: string; value: string };
	type FaqRow = { id: string; question: string; answer: string };
	type ResourceRow = { id: string; name: string; url: string };

	type ProductForm = {
		slug: string;
		name: string;
		supplierSlug: string;
		categorySlug: string;
		shortDescription: string;
		certStatus: Product['certStatus'];
		status: NonNullable<Product['status']>;
		originCountry: string;
		moq: string;
		priceMin: string;
		priceMax: string;
		priceUnit: string;
		units: string;
		features: string;
		description: string;
		specifications: SpecRow[];
		faqs: FaqRow[];
		imageUrl: string;
		images: string;
		videos: string;
		resources: ResourceRow[];
		metaTitle: string;
		metaDescription: string;
		keywords: string;
	};

	let form = $state<ProductForm>({
		slug: '',
		name: '',
		supplierSlug: '',
		categorySlug: '',
		shortDescription: '',
		certStatus: 'pending',
		status: 'active',
		originCountry: '',
		moq: '',
		priceMin: '',
		priceMax: '',
		priceUnit: '',
		units: '',
		features: '',
		description: '',
		specifications: [],
		faqs: [],
		imageUrl: '',
		images: '',
		videos: '',
		resources: [],
		metaTitle: '',
		metaDescription: '',
		keywords: ''
	});
	let formError = $state('');

	const filtered = $derived.by(() => {
		const list = [...adminData.products];
		if (!search.trim()) return list;
		const q = search.toLowerCase();
		return list.filter(
			(s) =>
				s.name.toLowerCase().includes(q) || s.supplierSlug.includes(q) || s.categorySlug.includes(q)
		);
	});

	const certLabels: Record<Product['certStatus'], string> = {
		certified: 'Certified',
		'not-certified': 'Not Certified',
		'not-applicable': 'Not Applicable',
		pending: 'Pending'
	};

	function slugify(s: string): string {
		return s
			.toLowerCase()
			.trim()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/(^-|-$)/g, '');
	}

	function supplierName(slug: string): string {
		return adminData.suppliers.find((s) => s.slug === slug)?.name ?? slug;
	}
	function categoryName(slug: string): string {
		return adminData.categories.find((c) => c.slug === slug)?.name ?? slug;
	}

	function openCreate() {
		editing = null;
		form = {
			slug: '',
			name: '',
			supplierSlug: adminData.suppliers[0]?.slug ?? '',
			categorySlug: adminData.categories[0]?.slug ?? '',
			shortDescription: '',
			certStatus: 'pending',
			status: 'active',
			originCountry: '',
			moq: '',
			priceMin: '',
			priceMax: '',
			priceUnit: '',
			units: '',
			features: '',
			description: '',
			specifications: [],
			faqs: [],
			imageUrl: '',
			images: '',
			videos: '',
			resources: [],
			metaTitle: '',
			metaDescription: '',
			keywords: ''
		};
		formError = '';
		basicExpanded = true;
		pricingExpanded = false;
		detailsExpanded = false;
		mediaExpanded = false;
		seoExpanded = false;
		dialogOpen = true;
	}

	function openEdit(s: Product) {
		editing = s;
		form = {
			slug: s.slug,
			name: s.name,
			supplierSlug: s.supplierSlug,
			categorySlug: s.categorySlug,
			shortDescription: s.shortDescription,
			certStatus: s.certStatus,
			status: s.status ?? 'active',
			originCountry: s.originCountry,
			moq: s.moq,
			priceMin: s.priceMin != null ? String(s.priceMin) : '',
			priceMax: s.priceMax != null ? String(s.priceMax) : '',
			priceUnit: s.priceUnit ?? '',
			units: s.units,
			features: s.features.join(', '),
			description: s.description ?? '',
			specifications: s.specifications
				? Object.entries(s.specifications).map(([key, value]) => ({
						id: crypto.randomUUID(),
						key,
						value
					}))
				: [],
			faqs: s.faqs ? s.faqs.map((f) => ({ id: crypto.randomUUID(), ...f })) : [],
			imageUrl: s.image ?? '',
			images: (s.images ?? []).join(', '),
			videos: (s.videos ?? []).join(', '),
			resources: s.resources ? s.resources.map((r) => ({ id: crypto.randomUUID(), ...r })) : [],
			metaTitle: s.metaTitle ?? '',
			metaDescription: s.metaDescription ?? '',
			keywords: s.keywords ?? ''
		};
		formError = '';
		basicExpanded = true;
		pricingExpanded = false;
		detailsExpanded = false;
		mediaExpanded = false;
		seoExpanded = false;
		dialogOpen = true;
	}

	function onNameInput(value: string) {
		form.name = value;
		if (!editing) {
			form.slug = slugify(value);
		}
	}

	function generateDescription() {
		aiLoading = true;
		setTimeout(() => {
			const name = form.name || 'This product';
			const cat = form.categorySlug ? categoryName(form.categorySlug) : 'product';
			const supplier = form.supplierSlug ? supplierName(form.supplierSlug) : 'a supplier';
			const country = form.originCountry || 'the region';
			const short = form.shortDescription || '';
			form.description =
				`${name} is a halal-certified ${cat} from ${supplier}, originating from ${country}. ` +
				`${short} ` +
				`This product meets rigorous halal compliance standards and is sourced through verified supply chains, ` +
				`making it ideal for international B2B buyers seeking quality-assured halal goods.`;
			aiLoading = false;
		}, 800);
	}

	function addSpec() {
		form.specifications = [...form.specifications, { id: crypto.randomUUID(), key: '', value: '' }];
	}
	function removeSpec(index: number) {
		form.specifications = form.specifications.filter((_, i) => i !== index);
	}
	function updateSpec(index: number, field: 'key' | 'value', val: string) {
		const updated = [...form.specifications];
		updated[index] = { ...updated[index], [field]: val };
		form.specifications = updated;
	}

	function addFaq() {
		form.faqs = [...form.faqs, { id: crypto.randomUUID(), question: '', answer: '' }];
	}
	function removeFaq(index: number) {
		form.faqs = form.faqs.filter((_, i) => i !== index);
	}
	function updateFaq(index: number, field: 'question' | 'answer', val: string) {
		const updated = [...form.faqs];
		updated[index] = { ...updated[index], [field]: val };
		form.faqs = updated;
	}

	function addResource() {
		form.resources = [...form.resources, { id: crypto.randomUUID(), name: '', url: '' }];
	}
	function removeResource(index: number) {
		form.resources = form.resources.filter((_, i) => i !== index);
	}
	function updateResource(index: number, field: 'name' | 'url', val: string) {
		const updated = [...form.resources];
		updated[index] = { ...updated[index], [field]: val };
		form.resources = updated;
	}

	function save() {
		if (!form.name.trim()) {
			formError = 'Product name is required.';
			return;
		}
		const base: Product =
			editing ??
			({
				slug: '',
				name: '',
				supplierSlug: '',
				categorySlug: '',
				shortDescription: '',
				image: '',
				moq: '',
				priceRange: '',
				certStatus: 'pending',
				status: 'active',
				units: '',
				originCountry: '',
				features: []
			} as Product);

		const priceMin = form.priceMin ? Number(form.priceMin) : undefined;
		const priceMax = form.priceMax ? Number(form.priceMax) : undefined;
		const priceRange =
			priceMin != null && priceMax != null
				? `$${priceMin} — $${priceMax}`
				: priceMin != null
					? `$${priceMin}`
					: priceMax != null
						? `up to $${priceMax}`
						: '';

		const specifications: Record<string, string> = {};
		for (const row of form.specifications) {
			const k = row.key.trim();
			const v = row.value.trim();
			if (k) specifications[k] = v;
		}

		const updated: Product = {
			...base,
			slug: form.slug || slugify(form.name),
			name: form.name.trim(),
			supplierSlug: form.supplierSlug,
			categorySlug: form.categorySlug,
			shortDescription: form.shortDescription.trim(),
			certStatus: form.certStatus,
			status: form.status,
			originCountry: form.originCountry.trim(),
			moq: form.moq.trim(),
			priceMin: priceMin,
			priceMax: priceMax,
			priceUnit: form.priceUnit.trim() || undefined,
			priceRange,
			units: form.units.trim(),
			features: form.features
				.split(',')
				.map((f) => f.trim())
				.filter(Boolean),
			description: form.description.trim() || undefined,
			specifications: Object.keys(specifications).length > 0 ? specifications : undefined,
			faqs:
				form.faqs.length > 0
					? form.faqs
							.filter((f) => f.question.trim())
							.map(({ question, answer }) => ({ question, answer }))
					: undefined,
			image: form.imageUrl.trim() || '',
			images: form.images
				? form.images
						.split(',')
						.map((s) => s.trim())
						.filter(Boolean)
				: undefined,
			videos: form.videos
				? form.videos
						.split(',')
						.map((s) => s.trim())
						.filter(Boolean)
				: undefined,
			resources:
				form.resources.length > 0
					? form.resources
							.filter((r) => r.name.trim() || r.url.trim())
							.map(({ name, url }) => ({ name, url }))
					: undefined,
			metaTitle: form.metaTitle.trim() || undefined,
			metaDescription: form.metaDescription.trim() || undefined,
			keywords: form.keywords.trim() || undefined
		};
		upsertItem<Product>('products', updated, editing ?? undefined);
		dialogOpen = false;
	}

	function remove(s: Product) {
		if (window.confirm(`Delete product ${s.name}?`)) {
			deleteItem('products', s.slug);
		}
	}
</script>

<svelte:head><title>Products — HalalNeo Admin</title></svelte:head>

<div class="space-y-6">
	<div class="flex flex-wrap items-end justify-between gap-4">
		<div class="space-y-1">
			<h1 class="text-3xl font-semibold tracking-tight">Products</h1>
			<p class="max-w-2xl text-sm text-muted-foreground">
				All product SKUs listed on the marketplace, with certification status.
			</p>
		</div>
		<div class="flex items-center gap-2">
			<Button variant="outline" size="sm" onclick={() => resetCollection('products')}>
				Reset to seed
			</Button>
			<Button variant="default" onclick={openCreate}>
				<Plus class="size-4"></Plus>
				New product
			</Button>
		</div>
	</div>

	<div class="relative max-w-sm">
		<Search
			class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
		></Search>
		<Input bind:value={search} placeholder="Search products..." class="pl-9" />
	</div>

	<div class="overflow-x-auto rounded-xl ring-1 ring-foreground/10">
		<Table>
			<TableHeader>
				<TableRow class="hover:bg-transparent">
					<TableHead>Product</TableHead>
					<TableHead>Supplier</TableHead>
					<TableHead>Category</TableHead>
					<TableHead>MOQ / Price</TableHead>
					<TableHead>Certification</TableHead>
					<TableHead class="text-right">Actions</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{#each filtered as s (s.slug)}
					<TableRow>
						<TableCell>
							<div class="min-w-0">
								<p class="truncate font-medium">{s.name}</p>
								<p class="truncate text-xs text-muted-foreground">{s.slug}</p>
							</div>
						</TableCell>
						<TableCell class="text-sm text-muted-foreground"
							>{supplierName(s.supplierSlug)}</TableCell
						>
						<TableCell class="text-sm text-muted-foreground"
							>{categoryName(s.categorySlug)}</TableCell
						>
						<TableCell class="text-sm">
							<div class="flex flex-col">
								<span>{s.moq}</span>
								<span class="text-xs text-muted-foreground">{s.priceRange}</span>
							</div>
						</TableCell>
						<TableCell>
							<Badge
								variant={s.certStatus === 'certified'
									? 'default'
									: s.certStatus === 'pending'
										? 'secondary'
										: 'destructive'}
							>
								{certLabels[s.certStatus]}
							</Badge>
						</TableCell>
						<TableCell class="text-right">
							<div class="flex items-center justify-end gap-1">
								<Button variant="ghost" size="icon" aria-label="Edit" onclick={() => openEdit(s)}>
									<Pencil class="size-4"></Pencil>
								</Button>
								<Button
									variant="ghost"
									size="icon"
									aria-label="Delete"
									class="hover:bg-destructive/10 hover:text-destructive"
									onclick={() => remove(s)}
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
			<DialogTitle>{editing ? 'Edit product' : 'New product'}</DialogTitle>
			<DialogDescription>Create or update a product SKU in the marketplace.</DialogDescription>
		</DialogHeader>

		<div class="flex flex-col gap-4">
			<!-- ===================== BASIC INFO (always expanded) ===================== -->
			<CollapsibleSection title="Basic Info" bind:open={basicExpanded}>
				<Field.Field>
					<Field.FieldLabel>Name *</Field.FieldLabel>
					<Input
						value={form.name}
						oninput={(e) => onNameInput((e.currentTarget as HTMLInputElement).value)}
						placeholder="Product name"
					/>
				</Field.Field>

				<Field.Field>
					<Field.FieldLabel>Slug</Field.FieldLabel>
					<Input bind:value={form.slug} placeholder="product-name" disabled={!!editing} />
				</Field.Field>

				<div class="grid grid-cols-2 gap-4">
					<Field.Field>
						<Field.FieldLabel>Supplier</Field.FieldLabel>
						<Select bind:value={form.supplierSlug} type="single">
							<SelectTrigger class="w-full">{supplierName(form.supplierSlug)}</SelectTrigger>
							<SelectContent>
								{#each adminData.suppliers as m (m.slug)}
									<SelectItem value={m.slug}>{m.name}</SelectItem>
								{/each}
							</SelectContent>
						</Select>
					</Field.Field>
					<Field.Field>
						<Field.FieldLabel>Category</Field.FieldLabel>
						<Select bind:value={form.categorySlug} type="single">
							<SelectTrigger class="w-full">{categoryName(form.categorySlug)}</SelectTrigger>
							<SelectContent>
								{#each adminData.categories as c (c.slug)}
									<SelectItem value={c.slug}>{c.name}</SelectItem>
								{/each}
							</SelectContent>
						</Select>
					</Field.Field>
				</div>

				<Field.Field>
					<Field.FieldLabel>Short description</Field.FieldLabel>
					<Input
						bind:value={form.shortDescription}
						placeholder="Brief one-line product description"
					/>
				</Field.Field>

				<div class="grid grid-cols-2 gap-4">
					<Field.Field>
						<Field.FieldLabel>Certification Status</Field.FieldLabel>
						<Select bind:value={form.certStatus} type="single">
							<SelectTrigger class="w-full">{certLabels[form.certStatus]}</SelectTrigger>
							<SelectContent>
								{#each Object.entries(certLabels) as [value, label] (value)}
									<SelectItem {value}>{label}</SelectItem>
								{/each}
							</SelectContent>
						</Select>
					</Field.Field>
					<Field.Field>
						<Field.FieldLabel>Status</Field.FieldLabel>
						<Select bind:value={form.status} type="single">
							<SelectTrigger class="w-full">{form.status}</SelectTrigger>
							<SelectContent>
								<SelectItem value="active">Active</SelectItem>
								<SelectItem value="draft">Draft</SelectItem>
								<SelectItem value="archived">Archived</SelectItem>
							</SelectContent>
						</Select>
					</Field.Field>
				</div>

				<Field.Field>
					<Field.FieldLabel>Origin Country</Field.FieldLabel>
					<Input bind:value={form.originCountry} placeholder="Indonesia" />
				</Field.Field>
			</CollapsibleSection>

			<!-- ===================== PRICING & MOQ (collapsed) ===================== -->
			<CollapsibleSection title="Pricing & MOQ" bind:open={pricingExpanded}>
				<Field.Field>
					<Field.FieldLabel>MOQ</Field.FieldLabel>
					<Input bind:value={form.moq} placeholder="e.g. 100 units" />
				</Field.Field>

				<div class="grid grid-cols-2 gap-4">
					<Field.Field>
						<Field.FieldLabel>Price Min</Field.FieldLabel>
						<Input
							bind:value={form.priceMin}
							type="number"
							min="0"
							step="0.01"
							placeholder="0.00"
						/>
					</Field.Field>
					<Field.Field>
						<Field.FieldLabel>Price Max</Field.FieldLabel>
						<Input
							bind:value={form.priceMax}
							type="number"
							min="0"
							step="0.01"
							placeholder="0.00"
						/>
					</Field.Field>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<Field.Field>
						<Field.FieldLabel>Price Unit</Field.FieldLabel>
						<Input bind:value={form.priceUnit} placeholder="e.g. per unit, per kg" />
					</Field.Field>
					<Field.Field>
						<Field.FieldLabel>Units</Field.FieldLabel>
						<Input bind:value={form.units} placeholder="e.g. boxes, pallets" />
					</Field.Field>
				</div>
			</CollapsibleSection>

			<!-- ===================== DETAILS (collapsed) ===================== -->
			<CollapsibleSection title="Details" bind:open={detailsExpanded}>
				<Field.Field>
					<Field.FieldLabel>Features</Field.FieldLabel>
					<Input
						bind:value={form.features}
						placeholder="Comma separated: halal-certified, gluten-free"
					/>
					{#if form.features.trim()}
						<div class="flex flex-wrap gap-1 pt-1">
							{#each form.features
								.split(',')
								.map((f) => f.trim())
								.filter(Boolean) as tag (tag)}
								<Badge variant="secondary" class="text-xs">{tag}</Badge>
							{/each}
						</div>
					{/if}
				</Field.Field>

				<Field.Field>
					<div class="flex items-center justify-between">
						<Field.FieldLabel>Description</Field.FieldLabel>
						<Button
							variant="outline"
							size="sm"
							type="button"
							onclick={generateDescription}
							disabled={aiLoading}
						>
							{#if aiLoading}
								<Loader2 class="size-3 animate-spin" />
							{:else}
								<Sparkles class="size-3" />
							{/if}
							Generate
						</Button>
					</div>
					<Textarea
						bind:value={form.description}
						rows={4}
						placeholder="Full product description..."
					/>
				</Field.Field>

				<!-- Specifications editor -->
				<div class="flex flex-col gap-2">
					<div class="flex items-center justify-between">
						<span class="text-sm font-medium">Specifications</span>
						<Button variant="outline" size="sm" type="button" onclick={addSpec}>
							<Plus class="size-3" /> Add
						</Button>
					</div>
					{#each form.specifications as spec, i (spec.id)}
						<div class="flex items-center gap-2">
							<Input
								value={spec.key}
								oninput={(e) => updateSpec(i, 'key', (e.currentTarget as HTMLInputElement).value)}
								placeholder="Key"
								class="flex-1"
							/>
							<Input
								value={spec.value}
								oninput={(e) => updateSpec(i, 'value', (e.currentTarget as HTMLInputElement).value)}
								placeholder="Value"
								class="flex-1"
							/>
							<Button
								variant="ghost"
								size="icon"
								type="button"
								aria-label="Remove"
								onclick={() => removeSpec(i)}
							>
								<X class="size-3" />
							</Button>
						</div>
					{/each}
				</div>

				<!-- FAQs editor -->
				<div class="flex flex-col gap-2">
					<div class="flex items-center justify-between">
						<span class="text-sm font-medium">FAQs</span>
						<Button variant="outline" size="sm" type="button" onclick={addFaq}>
							<Plus class="size-3" /> Add
						</Button>
					</div>
					{#each form.faqs as faq, i (faq.id)}
						<div class="flex flex-col gap-2 rounded-md border p-3">
							<div class="flex items-center gap-2">
								<Input
									value={faq.question}
									oninput={(e) =>
										updateFaq(i, 'question', (e.currentTarget as HTMLInputElement).value)}
									placeholder="Question"
									class="flex-1"
								/>
								<Button
									variant="ghost"
									size="icon"
									type="button"
									aria-label="Remove"
									onclick={() => removeFaq(i)}
								>
									<X class="size-3" />
								</Button>
							</div>
							<Textarea
								value={faq.answer}
								oninput={(e) =>
									updateFaq(i, 'answer', (e.currentTarget as HTMLTextAreaElement).value)}
								placeholder="Answer"
								rows={2}
							/>
						</div>
					{/each}
				</div>
			</CollapsibleSection>

			<!-- ===================== MEDIA & RESOURCES (collapsed) ===================== -->
			<CollapsibleSection title="Media & Resources" bind:open={mediaExpanded}>
				<Field.Field>
					<Field.FieldLabel>Image URL</Field.FieldLabel>
					<Input bind:value={form.imageUrl} placeholder="https://..." />
				</Field.Field>

				<Field.Field>
					<Field.FieldLabel>Additional Images</Field.FieldLabel>
					<Input bind:value={form.images} placeholder="Comma separated image URLs" />
					<Field.FieldDescription
						>Comma-separated list of additional image URLs.</Field.FieldDescription
					>
				</Field.Field>

				<Field.Field>
					<Field.FieldLabel>Videos</Field.FieldLabel>
					<Input bind:value={form.videos} placeholder="Comma separated video URLs" />
					<Field.FieldDescription>Comma-separated list of video URLs.</Field.FieldDescription>
				</Field.Field>

				<!-- Resources editor -->
				<div class="flex flex-col gap-2">
					<div class="flex items-center justify-between">
						<span class="text-sm font-medium">Resources</span>
						<Button variant="outline" size="sm" type="button" onclick={addResource}>
							<Plus class="size-3" /> Add
						</Button>
					</div>
					{#each form.resources as resource, i (resource.id)}
						<div class="flex items-center gap-2">
							<Input
								value={resource.name}
								oninput={(e) =>
									updateResource(i, 'name', (e.currentTarget as HTMLInputElement).value)}
								placeholder="Title"
								class="flex-1"
							/>
							<Input
								value={resource.url}
								oninput={(e) =>
									updateResource(i, 'url', (e.currentTarget as HTMLInputElement).value)}
								placeholder="https://..."
								class="flex-1"
							/>
							<Button
								variant="ghost"
								size="icon"
								type="button"
								aria-label="Remove"
								onclick={() => removeResource(i)}
							>
								<X class="size-3" />
							</Button>
						</div>
					{/each}
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
						placeholder="Comma separated: halal, product, certification"
					/>
				</Field.Field>
			</CollapsibleSection>

			{#if formError}
				<p class="text-sm text-destructive">{formError}</p>
			{/if}
		</div>

		<DialogFooter>
			<Button variant="outline" onclick={() => (dialogOpen = false)}>Cancel</Button>
			<Button variant="default" onclick={save}>{editing ? 'Save changes' : 'Create product'}</Button
			>
		</DialogFooter>
	</DialogContent>
</Dialog>
