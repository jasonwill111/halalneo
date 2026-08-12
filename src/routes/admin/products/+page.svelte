<script lang="ts">
	import { adminData, upsertItem, deleteItem, resetCollection } from '$lib/stores/admin-data.svelte';
	import type { Sku } from '$lib/data/types';
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
	let editing = $state<Sku | null>(null);

	type SkuForm = {
		slug: string;
		name: string;
		merchantSlug: string;
		categorySlug: string;
		shortDescription: string;
		moq: string;
		priceRange: string;
		certStatus: Sku['certStatus'];
		units: string;
		originCountry: string;
		features: string;
	};
	let form = $state<SkuForm>({
		slug: '',
		name: '',
		merchantSlug: '',
		categorySlug: '',
		shortDescription: '',
		moq: '',
		priceRange: '',
		certStatus: 'pending',
		units: '',
		originCountry: '',
		features: ''
	});
	let formError = $state('');

	const filtered = $derived.by(() => {
		const list = [...adminData.skus];
		if (!search.trim()) return list;
		const q = search.toLowerCase();
		return list.filter(
			(s) => s.name.toLowerCase().includes(q) || s.merchantSlug.includes(q) || s.categorySlug.includes(q)
		);
	});

	const certLabels: Record<Sku['certStatus'], string> = {
		certified: 'Certified',
		pending: 'Pending',
		expired: 'Expired'
	};

	function slugify(s: string): string {
		return s
			.toLowerCase()
			.trim()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/(^-|-$)/g, '');
	}

	function merchantName(slug: string): string {
		return adminData.merchants.find((m) => m.slug === slug)?.name ?? slug;
	}
	function categoryName(slug: string): string {
		return adminData.categories.find((c) => c.slug === slug)?.name ?? slug;
	}

	function openCreate() {
		editing = null;
		form = {
			slug: '',
			name: '',
			merchantSlug: adminData.merchants[0]?.slug ?? '',
			categorySlug: adminData.categories[0]?.slug ?? '',
			shortDescription: '',
			moq: '',
			priceRange: '',
			certStatus: 'pending',
			units: '',
			originCountry: '',
			features: ''
		};
		formError = '';
		dialogOpen = true;
	}

	function openEdit(s: Sku) {
		editing = s;
		form = {
			slug: s.slug,
			name: s.name,
			merchantSlug: s.merchantSlug,
			categorySlug: s.categorySlug,
			shortDescription: s.shortDescription,
			moq: s.moq,
			priceRange: s.priceRange,
			certStatus: s.certStatus,
			units: s.units,
			originCountry: s.originCountry,
			features: s.features.join(', ')
		};
		formError = '';
		dialogOpen = true;
	}

	function save() {
		if (!form.name.trim()) {
			formError = 'Product name is required.';
			return;
		}
		const base: Sku = editing ?? ({
			slug: '',
			name: '',
			merchantSlug: '',
			categorySlug: '',
			shortDescription: '',
			image: '',
			moq: '',
			priceRange: '',
			certStatus: 'pending',
			units: '',
			originCountry: '',
			features: []
		} as Sku);
		const updated: Sku = {
			...base,
			slug: form.slug || slugify(form.name),
			name: form.name.trim(),
			merchantSlug: form.merchantSlug,
			categorySlug: form.categorySlug,
			shortDescription: form.shortDescription.trim(),
			moq: form.moq.trim(),
			priceRange: form.priceRange.trim(),
			certStatus: form.certStatus,
			units: form.units.trim(),
			originCountry: form.originCountry.trim(),
			features: form.features
				.split(',')
				.map((f) => f.trim())
				.filter(Boolean)
		};
		upsertItem<Sku>('skus', updated, editing ?? undefined);
		dialogOpen = false;
	}

	function remove(s: Sku) {
		if (window.confirm(`Delete product ${s.name}?`)) {
			deleteItem('skus', s.slug);
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
			<Button variant="outline" size="sm" onclick={() => resetCollection('skus')}>
				Reset to seed
			</Button>
			<Button variant="default" onclick={openCreate}>
				<Plus class="size-4"></Plus>
				New product
			</Button>
		</div>
	</div>

	<div class="relative max-w-sm">
		<Search class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"></Search>
		<Input bind:value={search} placeholder="Search products…" class="pl-9" />
	</div>

	<div class="rounded-xl ring-1 ring-foreground/10">
		<Table>
			<TableHeader>
				<TableRow class="hover:bg-transparent">
					<TableHead>Product</TableHead>
					<TableHead>Supplier</TableHead>
					<TableHead>Category</TableHead>
					<TableHead>MOQ · Price</TableHead>
					<TableHead>Certification</TableHead>
					<TableHead class="text-right">Actions</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{#each filtered as s}
					<TableRow>
						<TableCell>
							<div class="min-w-0">
								<p class="truncate font-medium">{s.name}</p>
								<p class="truncate text-xs text-muted-foreground">{s.slug}</p>
							</div>
						</TableCell>
						<TableCell class="text-sm text-muted-foreground">{merchantName(s.merchantSlug)}</TableCell>
						<TableCell class="text-sm text-muted-foreground">{categoryName(s.categorySlug)}</TableCell>
						<TableCell class="text-sm">
							<div class="flex flex-col">
								<span>{s.moq}</span>
								<span class="text-xs text-muted-foreground">{s.priceRange}</span>
							</div>
						</TableCell>
						<TableCell>
							<Badge
								variant={
									s.certStatus === 'certified' ? 'default' : s.certStatus === 'pending' ? 'secondary' : 'destructive'
								}
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
			<DialogDescription>
				Create or update a product SKU in the marketplace.
			</DialogDescription>
		</DialogHeader>
		<div class="space-y-4">
			<Field>
				<FieldLabel>Name</FieldLabel>
				<Input bind:value={form.name} placeholder="Product name" />
			</Field>
			<Field>
				<FieldLabel>Slug</FieldLabel>
				<Input bind:value={form.slug} placeholder="product-name" disabled={!!editing} />
			</Field>
			<div class="grid grid-cols-2 gap-4">
				<Field>
					<FieldLabel>Supplier</FieldLabel>
					<Select bind:value={form.merchantSlug} type="single">
						<SelectTrigger class="w-full">{merchantName(form.merchantSlug)}</SelectTrigger>
						<SelectContent>
							{#each adminData.merchants as m}
								<SelectItem value={m.slug}>{m.name}</SelectItem>
							{/each}
						</SelectContent>
					</Select>
				</Field>
				<Field>
					<FieldLabel>Category</FieldLabel>
					<Select bind:value={form.categorySlug} type="single">
						<SelectTrigger class="w-full">{categoryName(form.categorySlug)}</SelectTrigger>
						<SelectContent>
							{#each adminData.categories as c}
								<SelectItem value={c.slug}>{c.name}</SelectItem>
							{/each}
						</SelectContent>
					</Select>
				</Field>
			</div>
			<Field>
				<FieldLabel>Short description</FieldLabel>
				<Textarea bind:value={form.shortDescription} rows={2} placeholder="Brief product description…" />
			</Field>
			<div class="grid grid-cols-2 gap-4">
				<Field>
					<FieldLabel>MOQ</FieldLabel>
					<Input bind:value={form.moq} placeholder="1,000 units" />
				</Field>
				<Field>
					<FieldLabel>Price range</FieldLabel>
					<Input bind:value={form.priceRange} placeholder="$0.80 – $1.20" />
				</Field>
			</div>
			<div class="grid grid-cols-2 gap-4">
				<Field>
					<FieldLabel>Units</FieldLabel>
					<Input bind:value={form.units} placeholder="units per carton" />
				</Field>
				<Field>
					<FieldLabel>Origin country</FieldLabel>
					<Input bind:value={form.originCountry} placeholder="Indonesia" />
				</Field>
			</div>
			<Field>
				<FieldLabel>Certification</FieldLabel>
				<Select bind:value={form.certStatus} type="single">
					<SelectTrigger class="w-full">{certLabels[form.certStatus]}</SelectTrigger>
					<SelectContent>
						{#each Object.entries(certLabels) as [value, label]}
							<SelectItem value={value}>{label}</SelectItem>
						{/each}
					</SelectContent>
				</Select>
			</Field>
			<Field>
				<FieldLabel>Features</FieldLabel>
				<Input bind:value={form.features} placeholder="Comma separated: halal-certified, gluten-free" />
			</Field>
			{#if formError}
				<p class="text-sm text-destructive">{formError}</p>
			{/if}
		</div>
		<DialogFooter>
			<Button variant="outline" onclick={() => (dialogOpen = false)}>Cancel</Button>
			<Button variant="default" onclick={save}>{editing ? 'Save changes' : 'Create product'}</Button>
		</DialogFooter>
	</DialogContent>
</Dialog>