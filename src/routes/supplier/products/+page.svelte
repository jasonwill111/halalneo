<script lang="ts">
	import { goto } from '$app/navigation';
	import type { PageProps } from './$types';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Alert } from '#lib/components/ui/alert/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Tabs, TabsList, TabsTrigger } from '#lib/components/ui/tabs/index.js';
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '#lib/components/ui/table/index.js';
	import { Skeleton } from '#lib/components/ui/skeleton/index.js';
	import {
		Empty,
		EmptyContent,
		EmptyDescription,
		EmptyHeader,
		EmptyTitle
	} from '#lib/components/ui/empty/index.js';
	import BrandedEmptyMedia from '#lib/components/site/branded-empty-media.svelte';
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuLabel,
		DropdownMenuSeparator,
		DropdownMenuTrigger
	} from '#lib/components/ui/dropdown-menu/index.js';
	import MoreHorizontal from '@lucide/svelte/icons/more-horizontal';
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import Link2 from '@lucide/svelte/icons/link-2';
	import Lock from '@lucide/svelte/icons/lock';
	import Search from '@lucide/svelte/icons/search';
	import PackageX from '@lucide/svelte/icons/package-x';
	import ShieldQuestion from '@lucide/svelte/icons/shield-question';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import { toast } from 'svelte-sonner';
	import Paginator from '#lib/components/site/paginator.svelte';
	import ErrorRetry from '#lib/components/site/error-retry.svelte';
	import {
		describeFetchFailure,
		describeThrownFailure,
		type LoadFailure
	} from '#lib/utils/load-error.js';
	import {
		formatPriceRange,
		type ProductListItem,
		type ProductListResponse
	} from '#lib/schemas/products.js';

	let { data }: PageProps = $props();

	/** `parseQuery` in every list API caps `limit` at 100 (§5.9). */
	const PAGE_SIZE = 20;

	/** `products.status` enum — mirrors `PRODUCT_STATUSES` in #lib/schemas/products.js. */
	const STATUS_TABS = [
		{ value: 'active', label: 'Active' },
		{ value: 'draft', label: 'Draft' },
		{ value: 'archived', label: 'Archived' }
	] as const;

	const CERT_LABELS: Record<NonNullable<ProductListItem['certStatus']>, string> = {
		certified: 'Certified',
		pending: 'Pending',
		'not-certified': 'Not certified',
		'not-applicable': 'N/A'
	};

	// Session-derived by src/routes/supplier/+layout.server.ts — never hardcoded.
	const supplierSlug = $derived(data.supplierSlug);

	let statusTab = $state<string>('active');
	let search = $state('');
	let searchTerm = $state('');
	let page = $state(1);

	let items = $state<ProductListItem[]>([]);
	let total = $state(0);
	let loading = $state(true);
	let loadFailure = $state<LoadFailure | null>(null);
	let categoryNames = $state<Record<string, string>>({});

	/** Guards against an older response overwriting a newer page/filter result. */
	let requestId = 0;

	const activeTab = $derived(STATUS_TABS.find((t) => t.value === statusTab) ?? STATUS_TABS[0]);
	const totalPages = $derived(Math.max(1, Math.ceil(total / PAGE_SIZE)));

	function certLabel(cert: ProductListItem['certStatus']): string {
		return cert ? CERT_LABELS[cert] : 'N/A';
	}

	function categoryLabel(slug: string): string {
		return categoryNames[slug] ?? slug;
	}

	function publicHref(slug: string): string {
		return localizeHref(`/product/${slug}`);
	}

	async function loadProducts(slug: string, status: string, pageIndex: number, term: string) {
		const id = ++requestId;
		loading = true;
		loadFailure = null;
		const params = new SvelteURLSearchParams({
			supplierSlug: slug,
			status,
			limit: String(PAGE_SIZE),
			offset: String((pageIndex - 1) * PAGE_SIZE)
		});
		if (term.trim()) params.set('search', term.trim());
		try {
			const res = await fetch(`/api/products?${params}`);
			if (id !== requestId) return;
			if (!res.ok) {
				items = [];
				total = 0;
				loadFailure = describeFetchFailure(res);
				return;
			}
			const payload = (await res.json().catch(() => null)) as ProductListResponse | null;
			if (id !== requestId) return;
			items = payload?.items ?? [];
			total = payload?.total ?? 0;
		} catch (e) {
			if (id !== requestId) return;
			items = [];
			total = 0;
			loadFailure = describeThrownFailure(e);
		} finally {
			if (id === requestId) loading = false;
		}
	}

	/** Category display names come from the live taxonomy, not the demo store. */
	async function loadCategoryNames() {
		try {
			const res = await fetch('/api/categories?limit=100');
			if (!res.ok) return;
			const payload = (await res.json().catch(() => null)) as {
				items?: { slug: string; name: string }[];
			} | null;
			const map: Record<string, string> = {};
			for (const c of payload?.items ?? []) map[c.slug] = c.name;
			categoryNames = map;
		} catch {
			// Non-blocking: the table falls back to the raw slug.
		}
	}

	$effect(() => {
		void loadCategoryNames();
	});

	$effect(() => {
		const slug = supplierSlug;
		const status = activeTab.value;
		const pageIndex = page;
		const term = search;
		if (!slug) {
			loading = false;
			return;
		}
		void loadProducts(slug, status, pageIndex, term);
	});

	function applySearch() {
		search = searchTerm.trim();
		page = 1;
	}

	async function copyPublicLink(slug: string) {
		const href = new URL(publicHref(slug), window.location.origin).href;
		try {
			await navigator.clipboard.writeText(href);
			toast.success('Public listing link copied.');
		} catch {
			toast.error('Your browser blocked clipboard access — copy the listing URL directly.');
		}
	}
</script>

<svelte:head>
	<title>My Products — HalalNeo</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="flex flex-wrap items-center justify-between gap-3">
	<div>
		<h1 class="text-xl font-semibold tracking-tight sm:text-2xl">My Products</h1>
		<p class="text-xs text-muted-foreground sm:text-sm">
			{loading
				? 'Loading your catalogue…'
				: `${total} ${activeTab.label.toLowerCase()} listing${total === 1 ? '' : 's'}`}
		</p>
	</div>
	<form
		class="flex w-full items-center gap-2 sm:w-auto"
		onsubmit={(e) => {
			e.preventDefault();
			applySearch();
		}}
	>
		<div class="relative min-w-0 flex-1 sm:w-56">
			<Search
				class="pointer-events-none absolute start-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
			/>
			<Input
				type="search"
				bind:value={searchTerm}
				placeholder="Search listings"
				aria-label="Search your listings"
				class="h-9 ps-8 text-sm"
				maxlength={100}
			/>
		</div>
		<Button type="submit" variant="outline" size="sm" class="h-9">Search</Button>
	</form>
</div>

{#if !supplierSlug}
	<div class="mt-4 rounded-xl bg-card p-6 ring-1 ring-foreground/10">
		<Empty>
			<BrandedEmptyMedia><ShieldQuestion class="size-6 text-muted-foreground" /></BrandedEmptyMedia>
			<div class="space-y-1">
				<p class="font-medium">No supplier account linked</p>
				<p class="text-sm text-muted-foreground">
					Your login isn't connected to a supplier company yet, so there is no catalogue to show.
					Apply for access and an administrator will link this account to your profile.
				</p>
			</div>
			<Button class="mt-2" size="sm" href={localizeHref('/supplier/onboarding')}>
				Apply to become a supplier
			</Button>
		</Empty>
	</div>
{:else}
	<Tabs
		value={activeTab.value}
		onValueChange={(v: string) => {
			statusTab = String(v);
			page = 1;
		}}
	>
		<TabsList variant="line" class="mb-2 w-full justify-start overflow-x-auto">
			{#each STATUS_TABS as tab (tab.value)}
				<TabsTrigger value={tab.value}>{tab.label}</TabsTrigger>
			{/each}
		</TabsList>
	</Tabs>

	<ErrorRetry
		failure={loadFailure}
		subject="your products"
		onretry={() => loadProducts(supplierSlug ?? '', activeTab.value, page, search)}
	/>

	<div class="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
		{#if loading}
			<div class="space-y-2 p-3" aria-label="Loading products">
				{#each [0, 1, 2, 3, 4] as i (i)}
					<Skeleton class="h-10 w-full" />
				{/each}
			</div>
		{:else if loadFailure}
			<Alert variant="destructive" class="m-3 border-destructive/20 bg-destructive/5">
				<TriangleAlert class="size-4" />
				<div>
					<p class="text-xs font-medium">Product list unavailable</p>
					<p class="text-2xs text-muted-foreground">
						Use “Try again” above to reload your listings.
					</p>
				</div>
			</Alert>
		{:else if items.length === 0}
			<Empty class="border-0 p-6">
				<BrandedEmptyMedia><PackageX class="size-6 text-muted-foreground" /></BrandedEmptyMedia>
				<EmptyHeader>
					<EmptyTitle>No {activeTab.label.toLowerCase()} listings</EmptyTitle>
					<EmptyDescription>
						{activeTab.value === 'active'
							? 'Approved listings appear here as soon as the HalalNeo catalogue team publishes them.'
							: 'Listings held in this state by the catalogue team appear here.'}
					</EmptyDescription>
				</EmptyHeader>
				<EmptyContent>
					<Button size="sm" variant="outline" href={localizeHref('/contact')}>
						Contact support
					</Button>
				</EmptyContent>
			</Empty>
		{:else}
			<div class="divide-y sm:hidden">
				{#each items as p (p.slug)}
					{@const price = formatPriceRange(p.priceMin, p.priceMax, p.priceUnit)}
					<article class="min-w-0 p-3">
						<div class="flex min-w-0 items-start justify-between gap-2">
							<div class="min-w-0">
								<p class="truncate text-xs font-medium" title={p.name}>{p.name}</p>
								<p class="truncate text-2xs text-muted-foreground">{p.slug}</p>
							</div>
							<Badge
								variant={p.status === 'active' ? 'default' : 'secondary'}
								class="shrink-0 text-2xs capitalize"
							>
								{p.status ?? 'unknown'}
							</Badge>
						</div>
						<dl class="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-2xs">
							<div class="min-w-0">
								<dt class="text-muted-foreground">Category</dt>
								<dd class="truncate">{categoryLabel(p.categorySlug)}</dd>
							</div>
							<div class="min-w-0">
								<dt class="text-muted-foreground">Price</dt>
								<dd class="truncate font-semibold">{price || 'On request'}</dd>
							</div>
							<div class="min-w-0">
								<dt class="text-muted-foreground">MOQ</dt>
								<dd class="truncate">{p.moq || '—'}</dd>
							</div>
							<div class="min-w-0">
								<dt class="text-muted-foreground">Cert</dt>
								<dd class="truncate">{certLabel(p.certStatus)}</dd>
							</div>
						</dl>
						{#if p.status === 'active'}
							<div class="mt-2 flex gap-2">
								<Button
									size="sm"
									variant="outline"
									class="min-w-0 flex-1 gap-1"
									onclick={() => void goto(publicHref(p.slug))}
								>
									<ExternalLink class="size-3.5" />
									View listing
								</Button>
								<Button
									size="sm"
									variant="ghost"
									class="min-w-0 flex-1 gap-1"
									onclick={() => void copyPublicLink(p.slug)}
								>
									<Link2 class="size-3.5" />
									Copy link
								</Button>
							</div>
						{:else}
							<p class="mt-2 flex items-center gap-1 text-2xs text-muted-foreground">
								<Lock class="size-3" />
								Not public while {p.status ?? 'unpublished'}
							</p>
						{/if}
					</article>
				{/each}
			</div>
			<div class="hidden overflow-x-auto sm:block">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead class="text-2xs">Product</TableHead>
							<TableHead class="text-2xs">Category</TableHead>
							<TableHead class="text-2xs">Price</TableHead>
							<TableHead class="text-2xs">MOQ</TableHead>
							<TableHead class="text-2xs">Cert</TableHead>
							<TableHead class="text-2xs">Status</TableHead>
							<TableHead class="text-2xs"><span class="sr-only">Actions</span></TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{#each items as p (p.slug)}
							{@const price = formatPriceRange(p.priceMin, p.priceMax, p.priceUnit)}
							<TableRow>
								<TableCell class="font-medium">
									<span class="block truncate" title={p.name}>{p.name}</span>
									<span class="block truncate text-2xs text-muted-foreground">{p.slug}</span>
								</TableCell>
								<TableCell class="text-muted-foreground">{categoryLabel(p.categorySlug)}</TableCell>
								<TableCell class="font-semibold">{price || 'On request'}</TableCell>
								<TableCell class="text-muted-foreground">{p.moq || '—'}</TableCell>
								<TableCell class="text-muted-foreground">{certLabel(p.certStatus)}</TableCell>
								<TableCell>
									<Badge
										variant={p.status === 'active' ? 'default' : 'secondary'}
										class="capitalize"
									>
										{p.status ?? 'unknown'}
									</Badge>
								</TableCell>
								<TableCell class="text-end">
									<DropdownMenu>
										<DropdownMenuTrigger>
											{#snippet child({ props })}
												<Button
													{...props}
													variant="ghost"
													size="icon"
													class="size-8"
													aria-label="Actions for {p.name}"
												>
													<MoreHorizontal class="size-4" />
												</Button>
											{/snippet}
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end" class="w-52">
											<DropdownMenuLabel class="truncate">{p.name}</DropdownMenuLabel>
											<DropdownMenuSeparator />
											{#if p.status === 'active'}
												<DropdownMenuItem onclick={() => void goto(publicHref(p.slug))}>
													<ExternalLink class="size-4" />
													View public listing
												</DropdownMenuItem>
												<DropdownMenuItem onclick={() => void copyPublicLink(p.slug)}>
													<Link2 class="size-4" />
													Copy listing link
												</DropdownMenuItem>
											{:else}
												<DropdownMenuItem disabled>
													<Lock class="size-4" />
													Not public while {p.status ?? 'unpublished'}
												</DropdownMenuItem>
											{/if}
										</DropdownMenuContent>
									</DropdownMenu>
								</TableCell>
							</TableRow>
						{/each}
					</TableBody>
				</Table>
			</div>
		{/if}
	</div>

	<Paginator bind:page {totalPages} />

	<p
		class="mt-4 rounded-xl border border-dashed border-border/60 px-4 py-3 text-xs text-muted-foreground"
	>
		Adding, editing and unpublishing listings is applied by the HalalNeo catalogue team from the
		supplier's source data — the products API is admin-guarded, so this page is read-only.
		<a href={localizeHref('/contact')} class="font-medium text-primary hover:underline">
			Contact us
		</a>
		to request a new listing or a change to an existing one.
	</p>
{/if}
