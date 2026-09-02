<script lang="ts">
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '#lib/components/ui/card/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Checkbox } from '#lib/components/ui/checkbox/index.js';
	import { Select, SelectContent, SelectItem, SelectTrigger } from '#lib/components/ui/select/index.js';
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
	import TrustBadges from '#lib/components/site/trust-badges.svelte';

	let { data } = $props();

	let selectedCategories = $state<string[]>([]);
	let selectedCertifications = $state<string[]>([]);
	let selectedMarkets = $state<string[]>([]);
	let sortOption = $state('relevance');

	const categoryOptions = [
		'Food & Beverages',
		'Meat & Poultry',
		'Dairy & Eggs',
		'Grains & Cereals',
		'Beverages',
		'Confectionery'
	];

	const certificationOptions = ['Halal (MUI)', 'Halal (JAKIM)', 'Halal (BPJPH)', 'FDA Approved'];

	const marketOptions = ['ASEAN', 'GCC', 'EU', 'North America', 'Global'];

	function toggleFilter(list: string[], value: string): string[] {
		return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
	}

	function clearAll() {
		selectedCategories = [];
		selectedCertifications = [];
		selectedMarkets = [];
	}

	const hasActiveFilters = $derived(
		selectedCategories.length > 0 || selectedCertifications.length > 0 || selectedMarkets.length > 0
	);

	const filtered = $derived.by(() => {
		let results = data.products ?? [];

		if (selectedCategories.length > 0) {
			results = results.filter((p: any) => selectedCategories.includes(p.categorySlug));
		}

		if (selectedCertifications.length > 0) {
			results = results.filter((p: any) => {
				const supplier = (data.suppliers ?? []).find((s: any) => s.slug === p.supplierSlug);
				if (!supplier) return false;
				return selectedCertifications.some((cert) => supplier.certifications?.includes(cert));
			});
		}

		if (selectedMarkets.length > 0) {
			results = results.filter((p: any) => {
				const supplier = (data.suppliers ?? []).find((s: any) => s.slug === p.supplierSlug);
				if (!supplier) return false;
				return selectedMarkets.some((m) => supplier.mainMarkets?.includes(m));
			});
		}

		if (sortOption === 'price-asc') {
			results = [...results].sort((a: any, b: any) => (a.priceMin ?? 0) - (b.priceMin ?? 0));
		} else if (sortOption === 'price-desc') {
			results = [...results].sort((a: any, b: any) => (b.priceMin ?? 0) - (a.priceMin ?? 0));
		} else if (sortOption === 'newest') {
			results = [...results].sort(
				(a: any, b: any) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
			);
		}

		return results;
	});

	function removeFilter(type: 'category' | 'certification' | 'market', value: string) {
		if (type === 'category') selectedCategories = selectedCategories.filter((v) => v !== value);
		else if (type === 'certification') selectedCertifications = selectedCertifications.filter((v) => v !== value);
		else selectedMarkets = selectedMarkets.filter((v) => v !== value);
	}
</script>

<section class="space-y-5">
	<div>
		<h1 class="text-xl font-bold tracking-tight">Products</h1>
		<p class="mt-0.5 text-sm text-muted-foreground">
			Showing {filtered.length} of {data.products?.length ?? 0} products
		</p>
	</div>

	{#if hasActiveFilters}
		<div class="flex flex-wrap items-center gap-2">
			{#each selectedCategories as cat}
				<span class="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
					{cat}
					<Button
						variant="ghost"
						size="icon"
						aria-label="Remove {cat} filter"
						onclick={() => removeFilter('category', cat)}
						class="size-4 rounded-full p-0 hover:bg-primary/20"
					>
						<svg class="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
					</Button>
				</span>
			{/each}
			{#each selectedCertifications as cert}
				<span class="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
					{cert}
					<Button
						variant="ghost"
						size="icon"
						aria-label="Remove {cert} filter"
						onclick={() => removeFilter('certification', cert)}
						class="size-4 rounded-full p-0 hover:bg-primary/20"
					>
						<svg class="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
					</Button>
				</span>
			{/each}
			{#each selectedMarkets as market}
				<span class="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
					{market}
					<Button
						variant="ghost"
						size="icon"
						aria-label="Remove {market} filter"
						onclick={() => removeFilter('market', market)}
						class="size-4 rounded-full p-0 hover:bg-primary/20"
					>
						<svg class="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
					</Button>
				</span>
			{/each}
			<Button variant="ghost" size="sm" onclick={clearAll} class="text-xs text-muted-foreground hover:text-foreground">
				Clear all
			</Button>
		</div>
	{/if}

	<div class="flex gap-6">
		<aside class="hidden w-60 shrink-0 lg:block">
			<div class="sticky top-20 space-y-5 rounded-xl ring-1 ring-foreground/10 bg-card p-4">
				<div>
					<h3 class="mb-2.5 text-xs font-semibold text-foreground">Category</h3>
					<div class="space-y-2">
						{#each categoryOptions as option}
							<label class="flex items-center gap-2.5 text-sm text-foreground cursor-pointer">
								<Checkbox
									checked={selectedCategories.includes(option)}
									onCheckedChange={(v) => {
										selectedCategories = toggleFilter(selectedCategories, option);
									}}
								/>
								{option}
							</label>
						{/each}
					</div>
				</div>

				<div class="border-t border-border"></div>

				<div>
					<h3 class="mb-2.5 text-xs font-semibold text-foreground">Certification</h3>
					<div class="space-y-2">
						{#each certificationOptions as option}
							<label class="flex items-center gap-2.5 text-sm text-foreground cursor-pointer">
								<Checkbox
									checked={selectedCertifications.includes(option)}
									onCheckedChange={(v) => {
										selectedCertifications = toggleFilter(selectedCertifications, option);
									}}
								/>
								{option}
							</label>
						{/each}
					</div>
				</div>

				<div class="border-t border-border"></div>

				<div>
					<h3 class="mb-2.5 text-xs font-semibold text-foreground">Market</h3>
					<div class="space-y-2">
						{#each marketOptions as option}
							<label class="flex items-center gap-2.5 text-sm text-foreground cursor-pointer">
								<Checkbox
									checked={selectedMarkets.includes(option)}
									onCheckedChange={(v) => {
										selectedMarkets = toggleFilter(selectedMarkets, option);
									}}
								/>
								{option}
							</label>
						{/each}
					</div>
				</div>

				{#if hasActiveFilters}
					<Button
						variant="outline"
						onclick={clearAll}
						class="h-10 w-full"
					>
						Clear All
					</Button>
				{/if}
			</div>
		</aside>

		<div class="flex-1">
			<div class="mb-4 flex items-center justify-end">
				<Select type="single" bind:value={sortOption}>
					<SelectTrigger class="h-9 w-[180px] text-sm">
						Sort: Relevance
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="relevance">Sort: Relevance</SelectItem>
						<SelectItem value="price-asc">Price: Low to High</SelectItem>
						<SelectItem value="price-desc">Price: High to Low</SelectItem>
						<SelectItem value="newest">Newest</SelectItem>
					</SelectContent>
				</Select>
			</div>

		{#if !data.products}
			<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
				{#each Array(6) as _}
					<Card>
						<div class="h-48 w-full animate-pulse rounded-t-md bg-muted"></div>
						<CardHeader class="gap-3">
							<div class="flex items-center justify-between">
								<div class="h-5 w-16 animate-pulse rounded bg-muted"></div>
								<div class="h-5 w-20 animate-pulse rounded bg-muted"></div>
							</div>
							<div class="space-y-1">
								<div class="h-4 w-3/4 animate-pulse rounded bg-muted"></div>
								<div class="h-3 w-full animate-pulse rounded bg-muted"></div>
							</div>
						</CardHeader>
					</Card>
				{/each}
			</div>
		{:else}
			<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
				{#each filtered as product (product.slug)}
					{@const supplier = (data.suppliers ?? []).find((s: any) => s.slug === product.supplierSlug)}
					{@const category = (data.categories ?? []).find((c: any) => c.slug === product.categorySlug)}
					<Card hoverable>
						{#if product.image}
						<img 
							src={product.image} 
							alt={product.name} 
							class="h-48 w-full object-cover rounded-t-md"
							loading="lazy"
							decoding="async"
							width="400"
							height="300"
							onerror={(e) => { e.currentTarget.style.display='none'; }}
						/>
						{/if}
						<CardHeader class="gap-3">
							<div class="flex items-center justify-between">
								<Badge
									variant={product.certStatus === 'certified'
										? 'default'
										: product.certStatus === 'pending'
											? 'secondary'
											: 'destructive'}
								>
									{product.certStatus}
								</Badge>
								<Badge variant="outline">{category?.name ?? product.categorySlug}</Badge>
							</div>
							<div class="space-y-1">
								<CardTitle class="text-base">{product.name}</CardTitle>
								<CardDescription>{product.shortDescription}</CardDescription>
							</div>
						</CardHeader>
						<CardContent class="space-y-3">
							<div class="space-y-1.5 rounded-lg bg-muted p-3 text-sm">
								<div class="flex items-center justify-between">
									<span class="text-muted-foreground">MOQ</span>
									<span class="font-medium">{product.moq}</span>
								</div>
								<div class="flex items-center justify-between">
									<span class="text-muted-foreground">Price</span>
									<span class="font-medium">{product.priceRange}</span>
								</div>
								<div class="flex items-center justify-between">
									<span class="text-muted-foreground">Origin</span>
									<span class="font-medium">{product.originCountry}</span>
								</div>
							</div>
						{#if supplier}
							<p class="text-sm text-muted-foreground">
								by <span class="font-medium text-foreground">{supplier.name}</span>
							</p>
							<TrustBadges certifications={supplier.certifications} status={supplier.status} compact={true} />
						{/if}
							<Button
								href={localizeHref(`/products/${product.slug}`)}
								variant="outline"
								size="sm"
								class="w-full"
							>
								View product
								<ArrowUpRight class="size-4"></ArrowUpRight>
							</Button>
						</CardContent>
					</Card>
				{/each}
			</div>

			{#if filtered.length === 0}
				<div class="flex flex-col items-center justify-center py-12 text-center">
					<p class="text-lg font-medium text-muted-foreground">No products match the selected filters.</p>
					<p class="text-sm text-muted-foreground">Try adjusting your search or filters.</p>
				</div>
			{/if}
		{/if}
		</div>
	</div>
</section>
