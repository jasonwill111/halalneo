<script lang="ts">
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Checkbox } from '#lib/components/ui/checkbox/index.js';
	import {
		Select,
		SelectContent,
		SelectItem,
		SelectTrigger
	} from '#lib/components/ui/select/index.js';
	import { Sheet, SheetContent, SheetHeader, SheetTitle } from '#lib/components/ui/sheet/index.js';
	import {
		Empty,
		EmptyHeader,
		EmptyTitle,
		EmptyDescription,
		EmptyContent
	} from '#lib/components/ui/empty/index.js';
	import BrandedEmptyMedia from '#lib/components/site/branded-empty-media.svelte';
	import { SvelteSet } from 'svelte/reactivity';
	import SearchIcon from '@lucide/svelte/icons/search';
	import FileText from '@lucide/svelte/icons/file-text';
	import BookText from '@lucide/svelte/icons/book-text';
	import Store from '@lucide/svelte/icons/store';
	import Star from '@lucide/svelte/icons/star';
	import SlidersHorizontal from '@lucide/svelte/icons/sliders-horizontal';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import Paginator from '#lib/components/site/paginator.svelte';
	import { page } from '$app/state';

	let { data } = $props();
	// Deep links like /search?q=halal must prefill the box (initial value only,
	// so SSR and hydration read the same URL).
	let query = $state(page.url.searchParams.get('q') ?? '');

	// One glossary/cert entry as stored: either a bare label or an object with a name.
	type SearchCertEntry = string | { name?: string | null; bodyName?: string | null };

	interface RawSearchArticle {
		slug: string;
		title: string;
		summary: string;
		section: string;
		tags?: string[] | string;
	}
	interface RawSearchSupplier {
		slug: string;
		name: string;
		country: string;
		description?: string;
		certStatus?: string;
		certifications?: SearchCertEntry[] | string;
	}
	interface RawSearchProduct {
		slug: string;
		name: string;
		shortDescription: string;
		categorySlug?: string;
		originCountry: string;
		priceMin?: number | string | null;
		certStatus?: string;
		features?: string[] | string;
		certifications?: SearchCertEntry[] | string;
	}
	interface SearchApiResponse {
		articles?: RawSearchArticle[];
		suppliers?: RawSearchSupplier[];
		products?: RawSearchProduct[];
		terms?: SearchTerm[];
	}

	interface SearchArticle {
		slug: string;
		title: string;
		summary: string;
		section: string;
		tags?: string[];
	}
	interface SearchSupplier {
		slug: string;
		name: string;
		country: string;
		description?: string;
		certStatus?: string;
		certifications?: SearchCertEntry[];
		mainMarkets?: string[];
	}
	interface SearchProduct {
		slug: string;
		name: string;
		shortDescription: string;
		categorySlug?: string;
		originCountry: string;
		priceMin?: number | string | null;
		certStatus?: string;
		features?: string[];
		certifications?: SearchCertEntry[];
	}
	interface SearchTerm {
		term: string;
		definition: string;
	}

	let articles = $state.raw<SearchArticle[]>([]);
	let suppliers = $state.raw<SearchSupplier[]>([]);
	let products = $state.raw<SearchProduct[]>([]);
	let terms = $state.raw<SearchTerm[]>([]);
	let loaded = $state(false);
	let loading = $state(false);

	// Server-side federated search (debounced). Replaces the old pattern of
	// fetching 250 full rows once and filtering in-browser. The server returns
	// projected columns only (≤55 rows); facet filters below still apply.
	async function searchServer() {
		const needle = query.trim();
		if (!needle || loading) return;
		loading = true;
		try {
			const res = await fetch(`/api/search?q=${encodeURIComponent(needle)}`);
			if (!res.ok) return;
			const data = (await res.json()) as SearchApiResponse;
			articles = (data.articles ?? []).map((a) => ({
				...a,
				tags: typeof a.tags === 'string' ? JSON.parse(a.tags || '[]') : (a.tags ?? [])
			}));
			suppliers = (data.suppliers ?? []).map((s) => ({
				...s,
				certifications:
					typeof s.certifications === 'string'
						? JSON.parse(s.certifications || '[]')
						: (s.certifications ?? []),
				mainMarkets: []
			}));
			products = (data.products ?? []).map((p) => ({
				...p,
				certifications:
					typeof p.certifications === 'string'
						? JSON.parse(p.certifications || '[]')
						: (p.certifications ?? []),
				features:
					typeof p.features === 'string' ? JSON.parse(p.features || '[]') : (p.features ?? [])
			}));
			terms = data.terms ?? [];
			loaded = true;
		} catch {
			// network failure — `loaded` was already cleared by the debounce effect
		} finally {
			loading = false;
		}
	}

	type Result =
		| { kind: 'article'; section: string; slug: string; title: string; summary: string }
		| { kind: 'term'; term: string; definition: string }
		| { kind: 'supplier'; slug: string; name: string; country: string }
		| { kind: 'sku'; slug: string; name: string; description: string };

	const allResults = $derived.by(() => {
		const q = query.trim().toLowerCase();
		if (!q || !loaded) return [];

		// Helper: check if a product matches price range filters
		interface PriceRangeFields {
			priceMin?: number | string | null;
		}
		function matchesPriceRange(p: PriceRangeFields, ranges: Set<string>): boolean {
			if (ranges.size === 0) return true;
			const price = p.priceMin ? Number(p.priceMin) : null;
			if (price === null) return ranges.has('Under $20'); // no price = treat as low
			for (const r of ranges) {
				if (r === 'Under $20' && price < 20) return true;
				if (r === '$20 – $50' && price >= 20 && price <= 50) return true;
				if (r === '$50 – $100' && price >= 50 && price <= 100) return true;
				if (r === '$100+' && price >= 100) return true;
			}
			return false;
		}

		// Helper: check if a product/supplier matches cert filters
		interface CertFilterFields {
			certStatus?: string;
			certifications?: SearchCertEntry[];
		}
		function matchesCert(item: CertFilterFields, certs: Set<string>): boolean {
			if (certs.size === 0) return true;
			const status = item.certStatus ?? '';
			const itemCerts = Array.isArray(item.certifications) ? item.certifications : [];
			for (const c of certs) {
				const cLower = c.toLowerCase();
				if (status.toLowerCase().includes(cLower)) return true;
				if (
					itemCerts.some((ic) => {
						const name = typeof ic === 'string' ? ic : (ic.name ?? ic.bodyName ?? '');
						return name.toLowerCase().includes(cLower);
					})
				)
					return true;
			}
			return false;
		}

		const results: Result[] = [];

		// Category mapping: UI label → possible categorySlug values
		const categoryMap: Record<string, string[]> = {
			'Food & Beverage': ['food-beverage', 'food', 'beverage'],
			Cosmetics: ['cosmetics', 'cosmetic'],
			Pharmaceuticals: ['pharmaceuticals', 'pharmaceutical'],
			Ingredients: ['ingredients', 'ingredient']
		};

		for (const a of articles) {
			if (
				a.title.toLowerCase().includes(q) ||
				a.summary.toLowerCase().includes(q) ||
				a.tags?.some((t: string) => t.toLowerCase().includes(q))
			) {
				results.push({
					kind: 'article',
					section: a.section,
					slug: a.slug,
					title: a.title,
					summary: a.summary
				});
			}
		}
		for (const t of terms) {
			if (t.term.toLowerCase().includes(q) || t.definition.toLowerCase().includes(q)) {
				results.push({ kind: 'term', term: t.term, definition: t.definition });
			}
		}
		for (const s of suppliers) {
			if (
				s.name.toLowerCase().includes(q) ||
				s.country.toLowerCase().includes(q) ||
				s.description?.toLowerCase().includes(q)
			) {
				// Apply location filter
				if (selectedLocations.size > 0 && !selectedLocations.has(s.country)) continue;
				// Apply cert filter
				if (selectedCerts.size > 0 && !matchesCert(s, selectedCerts)) continue;
				results.push({ kind: 'supplier', slug: s.slug, name: s.name, country: s.country });
			}
		}
		for (const s of products) {
			if (
				s.name.toLowerCase().includes(q) ||
				s.shortDescription?.toLowerCase().includes(q) ||
				s.features?.some((f: string) => f.toLowerCase().includes(q))
			) {
				// Apply category filter
				if (selectedCategories.size > 0) {
					const catSlug = s.categorySlug?.toLowerCase() ?? '';
					const matched = [...selectedCategories].some((cat) => {
						const slugs = categoryMap[cat] ?? [];
						return slugs.some((sl) => catSlug.includes(sl));
					});
					if (!matched) continue;
				}
				// Apply price filter
				if (selectedPrices.size > 0 && !matchesPriceRange(s, selectedPrices)) continue;
				// Apply location filter
				if (selectedLocations.size > 0 && !selectedLocations.has(s.originCountry)) continue;
				// Apply cert filter
				if (selectedCerts.size > 0 && !matchesCert(s, selectedCerts)) continue;
				results.push({ kind: 'sku', slug: s.slug, name: s.name, description: s.shortDescription });
			}
		}
		return results;
	});

	const resultCount = $derived(allResults.length);

	const categories = ['Food & Beverage', 'Cosmetics', 'Pharmaceuticals', 'Ingredients'];
	const priceRanges = ['Under $20', '$20 – $50', '$50 – $100', '$100+'];
	const supplierLocations = ['Malaysia', 'Indonesia', 'Philippines', 'Sri Lanka', 'India'];
	const certifications = ['JAKIM', 'MUI', 'ESMA', 'HFA', 'IFANCA'];

	let selectedCategories = $state<Set<string>>(new Set(['Food & Beverage']));
	let selectedPrices = $state<Set<string>>(new Set(['Under $20']));
	let selectedLocations = $state<Set<string>>(new Set(['Malaysia', 'Indonesia']));
	let selectedCerts = $state<Set<string>>(new Set(['JAKIM']));
	let sortBy = $state('Relevance');
	let showMobileFilters = $state(false);

	const filtersActive = $derived(
		selectedCategories.size + selectedPrices.size + selectedLocations.size + selectedCerts.size > 0
	);

	function clearFilters() {
		selectedCategories = new Set();
		selectedPrices = new Set();
		selectedLocations = new Set();
		selectedCerts = new Set();
	}

	const PAGE_SIZE = 9;
	let currentPage = $state(1);

	const totalPages = $derived(Math.max(1, Math.ceil(resultCount / PAGE_SIZE)));

	const paginatedResults = $derived(
		allResults.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
	);

	// Debounced server search — deriveds stay pure (no fetching inside).
	// Clearing `loaded` on each keystroke hides stale results while typing.
	let searchTimer: ReturnType<typeof setTimeout> | undefined;
	$effect(() => {
		const needle = query.trim();
		clearTimeout(searchTimer);
		if (!needle) {
			loaded = false;
			return;
		}
		loaded = false;
		searchTimer = setTimeout(() => {
			searchServer();
		}, 300);
		return () => clearTimeout(searchTimer);
	});

	function toggleSet<T>(set: Set<T>, val: T): Set<T> {
		const next = new SvelteSet(set);
		if (next.has(val)) next.delete(val);
		else next.add(val);
		return next;
	}
</script>

<svelte:head>
	<!-- Title + description render once via root layout from loader `seo`. -->
</svelte:head>

<div class="-mx-4 border-b border-border bg-card/50 px-4 sm:-mx-6 sm:px-6">
	<div class="mx-auto flex h-12 w-full max-w-7xl items-center gap-2">
		<SearchIcon class="size-4 shrink-0 text-muted-foreground" />
		<Input
			value={query}
			oninput={(e) => {
				query = e.currentTarget.value;
				currentPage = 1;
			}}
			type="text"
			placeholder="Search products, suppliers, articles..."
			class="h-8 flex-1 border-transparent bg-transparent text-sm shadow-none focus-visible:border-transparent focus-visible:ring-0"
		/>
		<Button size="sm" class="h-8 text-xs">Search</Button>
	</div>
</div>

<div class="mx-auto max-w-7xl">
	<div class="mb-3 flex flex-col gap-1.5 pt-4 sm:flex-row sm:items-center sm:justify-between">
		<div class="flex items-center gap-1 text-2xs text-muted-foreground">
			<a href={localizeHref('/')} class="transition-colors hover:text-foreground">Home</a>
			<ChevronRight class="size-3 rtl:rotate-180" />
			<h1 class="sr-only">Search — HalalNeo</h1>
			<span class="font-medium text-foreground">Search results</span>
		</div>
		<p class="text-xs text-muted-foreground">
			Showing <span class="font-medium text-foreground">{resultCount}</span>
			results{#if query.trim()}
				for "<span class="font-medium text-foreground">{query.trim()}</span>"{/if}
		</p>
	</div>

	<div class="flex gap-3 sm:gap-4 lg:gap-5">
		{#snippet filterPanel()}
			<div>
				<h3 class="mb-1.5 text-xs font-semibold">Categories</h3>
				<div class="space-y-1">
					{#each categories as cat (cat)}
						<label class="flex cursor-pointer items-center gap-1.5 text-xs">
							<Checkbox
								checked={selectedCategories.has(cat)}
								onCheckedChange={() => (selectedCategories = toggleSet(selectedCategories, cat))}
							/>
							{cat}
						</label>
					{/each}
				</div>
				<Button
					variant="ghost"
					size="sm"
					class="mt-1 h-auto p-0 text-2xs text-primary hover:underline">Show more</Button
				>
			</div>

			<hr class="border-border" />

			<div>
				<h3 class="mb-1.5 text-xs font-semibold">Price Range</h3>
				<div class="space-y-1">
					{#each priceRanges as pr (pr)}
						<label class="flex cursor-pointer items-center gap-1.5 text-xs">
							<Checkbox
								checked={selectedPrices.has(pr)}
								onCheckedChange={() => (selectedPrices = toggleSet(selectedPrices, pr))}
							/>
							{pr}
						</label>
					{/each}
				</div>
			</div>

			<hr class="border-border" />

			<div>
				<h3 class="mb-1.5 text-xs font-semibold">Supplier Location</h3>
				<div class="space-y-1">
					{#each supplierLocations as loc (loc)}
						<label class="flex cursor-pointer items-center gap-1.5 text-xs">
							<Checkbox
								checked={selectedLocations.has(loc)}
								onCheckedChange={() => (selectedLocations = toggleSet(selectedLocations, loc))}
							/>
							{loc}
						</label>
					{/each}
				</div>
			</div>

			<hr class="border-border" />

			<div>
				<h3 class="mb-1.5 text-xs font-semibold">Halal Certification</h3>
				<div class="space-y-1">
					{#each certifications as cert (cert)}
						<label class="flex cursor-pointer items-center gap-1.5 text-xs">
							<Checkbox
								checked={selectedCerts.has(cert)}
								onCheckedChange={() => (selectedCerts = toggleSet(selectedCerts, cert))}
							/>
							{cert}
						</label>
					{/each}
				</div>
			</div>

			<Button variant="outline" class="w-full text-xs" onclick={clearFilters}
				>Clear all filters</Button
			>
		{/snippet}
		<aside class="hidden w-52 shrink-0 lg:block">
			<div class="sticky top-20 z-10 space-y-4">
				{@render filterPanel()}
			</div>
		</aside>
		<Sheet bind:open={showMobileFilters}>
			<SheetContent side="left" class="w-[85vw] overflow-y-auto sm:max-w-xs">
				<SheetHeader>
					<SheetTitle>Filters</SheetTitle>
				</SheetHeader>
				<div class="space-y-4">
					{@render filterPanel()}
				</div>
			</SheetContent>
		</Sheet>

		<div class="min-w-0 flex-1">
			<div class="mb-3 flex items-center justify-between gap-2">
				<Button
					variant="outline"
					size="sm"
					class="gap-1.5 text-xs lg:hidden"
					onclick={() => (showMobileFilters = !showMobileFilters)}
				>
					<SlidersHorizontal class="size-3.5" />
					Filters
				</Button>
				<div class="flex items-center gap-2">
					<span class="hidden text-2xs text-muted-foreground sm:inline">Sort by:</span>
					<Select type="single" bind:value={sortBy}>
						<SelectTrigger class="h-7 w-[140px] text-2xs">Relevance</SelectTrigger>
						<SelectContent>
							<SelectItem value="relevance">Relevance</SelectItem>
							<SelectItem value="price-asc">Price: Low to High</SelectItem>
							<SelectItem value="price-desc">Price: High to Low</SelectItem>
							<SelectItem value="newest">Newest</SelectItem>
							<SelectItem value="rating">Rating</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			{#if query.trim() === ''}
				<Empty>
					<EmptyHeader>
						<BrandedEmptyMedia><SearchIcon class="size-6 text-muted-foreground"></SearchIcon></BrandedEmptyMedia>
						<EmptyTitle>Start typing to search</EmptyTitle>
						<EmptyDescription
							>Search across {(data.glossary ?? []).length} glossary terms, plus live supplier, product
							and article indexes.</EmptyDescription
						>
					</EmptyHeader>
					<EmptyContent>
						<Button size="sm" href={localizeHref('/products')}>Browse products</Button>
						<Button variant="link" size="sm" href={localizeHref('/suppliers')}
							>Search suppliers</Button
						>
					</EmptyContent>
				</Empty>
			{:else if resultCount === 0}
				<Empty>
					<EmptyHeader>
						<BrandedEmptyMedia><SearchIcon class="size-6 text-muted-foreground"></SearchIcon></BrandedEmptyMedia>
						<EmptyTitle>No results</EmptyTitle>
						<EmptyDescription>
							Nothing matched “{query.trim()}”{#if filtersActive}
								with the selected filters{/if}.
							{#if filtersActive}
								Widen the category, price, location or certification filters, or try a shorter term.
							{:else}
								Try a different term or a shorter keyword.
							{/if}
						</EmptyDescription>
					</EmptyHeader>
					<EmptyContent>
						{#if filtersActive}
							<Button variant="outline" size="sm" onclick={clearFilters}>Clear all filters</Button>
						{/if}
						<Button size="sm" href={localizeHref('/rfqs/new')}>Post a buying request</Button>
						<Button variant="link" size="sm" href={localizeHref('/products')}
							>Browse products</Button
						>
					</EmptyContent>
				</Empty>
			{:else}
				<div class="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3">
					{#each paginatedResults as result (result.kind + ':' + (result.kind === 'term' ? result.term : result.slug))}
						{#if result.kind === 'sku'}
							<a
								href={localizeHref(`/product/${result.slug}`)}
								class="block rounded-xl border border-border bg-card p-2.5 transition-[transform,box-shadow] duration-base ease-spring hover:-translate-y-0.5 hover:shadow-md"
							>
								<div class="relative mb-2 aspect-square rounded-md bg-muted">
									<span
										class="absolute top-1.5 start-1.5 inline-flex items-center rounded-full bg-secondary px-1.5 py-0.5 text-2xs font-medium text-secondary-foreground"
										>JAKIM</span
									>
								</div>
								<h3 class="line-clamp-2 text-xs leading-snug font-medium">{result.name}</h3>
								<p class="mt-0.5 text-2xs text-muted-foreground">
									{result.description ?? 'Halal product'}
								</p>
								<div class="mt-1 flex items-center gap-1">
									<Star class="size-3 fill-warn text-warn" />
									<span class="text-2xs font-medium">4.8</span>
								</div>
								<span
									class="mt-2 inline-flex h-7 w-full items-center justify-center rounded-md border border-border text-2xs font-medium transition-colors hover:bg-accent"
									>View details</span
								>
							</a>
						{:else if result.kind === 'supplier'}
							<a
								href={localizeHref(`/supplier/${result.slug}`)}
								class="block rounded-xl border border-border bg-card p-2.5 transition-[transform,box-shadow] duration-base ease-spring hover:-translate-y-0.5 hover:shadow-md"
							>
								<div
									class="relative mb-2 flex aspect-square items-center justify-center rounded-md bg-muted"
								>
									<Store class="size-8 text-muted-foreground/40" />
								</div>
								<h3 class="line-clamp-2 text-xs leading-snug font-medium">{result.name}</h3>
								<p class="mt-0.5 text-2xs text-muted-foreground">Supplier · {result.country}</p>
								<span
									class="mt-2 inline-flex h-7 w-full items-center justify-center rounded-md border border-border text-2xs font-medium transition-colors hover:bg-accent"
									>View details</span
								>
							</a>
						{:else if result.kind === 'article'}
							<a
								href={localizeHref(`/knowledge-base/${result.section}/${result.slug}`)}
								class="block rounded-xl border border-border bg-card p-2.5 transition-[transform,box-shadow] duration-base ease-spring hover:-translate-y-0.5 hover:shadow-md"
							>
								<div
									class="relative mb-2 flex aspect-square items-center justify-center rounded-md bg-muted"
								>
									<FileText class="size-8 text-muted-foreground/40" />
								</div>
								<h3 class="line-clamp-2 text-xs leading-snug font-medium">{result.title}</h3>
								<p class="mt-0.5 line-clamp-2 text-2xs text-muted-foreground">
									{result.summary}
								</p>
								<span
									class="mt-2 inline-flex h-7 w-full items-center justify-center rounded-md border border-border text-2xs font-medium transition-colors hover:bg-accent"
									>Read article</span
								>
							</a>
						{:else}
							<a
								href={localizeHref(`/glossary#term-${result.term[0].toUpperCase()}`)}
								class="block rounded-xl border border-border bg-card p-2.5 transition-[transform,box-shadow] duration-base ease-spring hover:-translate-y-0.5 hover:shadow-md"
							>
								<div
									class="relative mb-2 flex aspect-square items-center justify-center rounded-md bg-muted"
								>
									<BookText class="size-8 text-muted-foreground/40" />
								</div>
								<h3 class="line-clamp-2 text-xs leading-snug font-medium">{result.term}</h3>
								<p class="mt-0.5 line-clamp-2 text-2xs text-muted-foreground">
									{result.definition}
								</p>
								<span
									class="mt-2 inline-flex h-7 w-full items-center justify-center rounded-md border border-border text-2xs font-medium transition-colors hover:bg-accent"
									>View term</span
								>
							</a>
						{/if}
					{/each}
				</div>

				<Paginator bind:page={currentPage} {totalPages} />
			{/if}
		</div>
	</div>
</div>
