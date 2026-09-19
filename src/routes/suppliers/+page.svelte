<script lang="ts">
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Card } from '#lib/components/ui/card/index.js';
	import SearchIcon from '@lucide/svelte/icons/search';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import MapPin from '@lucide/svelte/icons/map-pin';
	import Package from '@lucide/svelte/icons/package';
	import Breadcrumb from '#lib/components/site/breadcrumb.svelte';
	import Paginator from '#lib/components/site/paginator.svelte';
	import FilterPills from '#lib/components/site/filter-pills.svelte';
	import { Input } from '#lib/components/ui/input/index.js';
	import {
		Empty,
		EmptyHeader,
		EmptyMedia,
		EmptyTitle,
		EmptyDescription,
		EmptyContent
	} from '#lib/components/ui/empty/index.js';
	import ErrorRetry from '#lib/components/site/error-retry.svelte';
	import SeoMeta from '#lib/components/seo-meta.svelte';

	let { data } = $props();

	type SupplierRow = {
		slug: string;
		name: string;
		country?: string | null;
		businessType?: string | null;
		isBrand?: boolean | null;
		status?: string | null;
		logoInitials?: string | null;
		description?: string | null;
	};

	const allSuppliers = $derived((data.suppliers ?? []) as SupplierRow[]);
	const businessTypes = $derived((data.businessTypes ?? []) as string[]);

	const typeOptions = $derived([
		{ value: 'all', label: 'All suppliers', count: allSuppliers.length },
		...businessTypes.map((t: string) => ({
			value: t,
			label: t,
			count: allSuppliers.filter((s) => s.businessType === t).length
		}))
	]);
	let activeType = $state('all');
	let query = $state('');
	const filtered = $derived(
		allSuppliers.filter((s) => {
			if (activeType !== 'all' && s.businessType !== activeType) return false;
			const q = query.trim().toLowerCase();
			if (q && !(s.name ?? '').toLowerCase().includes(q)) return false;
			return true;
		})
	);

	const PAGE_SIZE = 12;
	let page = $state(1);
	const totalPages = $derived(Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)));
	const paged = $derived(filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE));
	$effect(() => {
		if (!activeType) activeType = 'all';
		void activeType;
		void query;
		page = 1;
	});

	const markets = [
		{
			region: 'ASEAN',
			countries: 'Malaysia, Indonesia, Singapore, Thailand, Philippines',
			cls: 'bg-info/10 text-info'
		},
		{
			region: 'GCC',
			countries: 'Saudi Arabia, UAE, Qatar, Kuwait, Bahrain, Oman',
			cls: 'bg-warn/10 text-warn'
		},
		{
			region: 'Türkiye & Central Asia',
			countries: 'Türkiye, Azerbaijan, Kazakhstan, Uzbekistan',
			cls: 'bg-accent-rose/10 text-accent-rose'
		},
		{
			region: 'South Asia',
			countries: 'Pakistan, Bangladesh, India, Sri Lanka',
			cls: 'bg-accent-purple/10 text-accent-purple'
		},
		{
			region: 'Africa',
			countries: 'South Africa, Nigeria, Kenya, Egypt, Morocco',
			cls: 'bg-success/10 text-success'
		},
		{
			region: 'Western Markets',
			countries: 'United States, Canada, EU, UK, Australia',
			cls: 'bg-primary/10 text-primary'
		}
	];
</script>

<!-- SEO Meta Tags -->
<SeoMeta
	title="Halal Suppliers Database - Verified Halal Manufacturers & Importers Worldwide"
	description="Find certified halal suppliers, manufacturers, and importers globally. Verified by JAKIM, MUI, GSO. Connect with trusted halal businesses."
	ogTitle="HalalNeo - Global Halal Suppliers Directory"
	ogDescription="Search 500+ verified halal suppliers. Filter by business type, location, and certification. Direct connection for global halal trade."
	keywords="halal suppliers, halal manufacturers, halal importers, halal distributors, certified halal suppliers, halal food suppliers, halal certification bodies, halal business directory, halal trade suppliers, halal exporters"
	canonical="/suppliers"
/>

<Breadcrumb items={[{ label: 'Suppliers', href: '/suppliers' }]} />

<svelte:head>
	<!-- Structured Data: Breadcrumb -->
	{@html `\u003cscript type="application/ld+json">${JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: [
			{ '@type': 'ListItem', position: 1, name: 'Home', item: 'https://halalneo.com/' },
			{
				'@type': 'ListItem',
				position: 2,
				name: 'Suppliers',
				item: 'https://halalneo.com/suppliers'
			}
		]
	})}\u003c/script>`}

	<!-- Structured Data: Organization Schema -->
	{#if allSuppliers.length > 0}
		{@html `\u003cscript type="application/ld+json">${JSON.stringify({
			'@context': 'https://schema.org',
			'@type': 'Organization',
			name: allSuppliers[0].name,
			url: `https://halalneo.com/suppliers/${allSuppliers[0].slug}`,
			description: 'Verified halal supplier on HalalNeo platform',
			image: '/logo.webp',
			contactPoint: {
				'@type': 'ContactPoint',
				telephone: '+1-800-HALAL-NEO',
				contactType: 'customer service',
				availableLanguage: ['en', 'ar', 'id', 'ms', 'tr', 'bn', 'ur']
			}
		})}\u003c/script>`}
	{/if}
</svelte:head>

<section class="space-y-4 sm:space-y-6">
	<div class="max-w-2xl space-y-2">
		<h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">Halal supplier directory</h1>
		<p class="text-muted-foreground">
			{allSuppliers.length} verified halal suppliers — filter by business type, region, and certification.
		</p>
	</div>

	<!-- Business Categories -->
	<div class="space-y-4">
		<div>
			<h2 class="text-lg font-semibold">Business types</h2>
			<p class="text-xs text-muted-foreground">
				Filter suppliers by their primary halal business activity.
			</p>
		</div>
		<FilterPills
			options={typeOptions}
			bind:value={activeType}
			ariaLabel="Filter suppliers by business type"
		/>
	</div>

	<!-- Suppliers grid -->
	<div class="space-y-4">
		<div class="flex flex-wrap items-end justify-between gap-2">
			<div>
				<h2 class="text-lg font-semibold">
					{activeType === 'all' ? 'All suppliers' : `Suppliers (${activeType})`}
				</h2>
				<p class="text-xs text-muted-foreground">
					{filtered.length} listing{filtered.length === 1 ? '' : 's'}
				</p>
			</div>
			{#if activeType !== 'all' || query.trim()}
				<Button
					variant="outline"
					size="sm"
					class="text-2xs"
					onclick={() => {
						activeType = 'all';
						query = '';
					}}
				>
					Clear filter
				</Button>
			{/if}
		</div>
		<div class="relative w-full sm:max-w-xs">
			<SearchIcon class="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
			<Input
				bind:value={query}
				type="search"
				placeholder="Search suppliers by name..."
				class="pl-9 text-xs"
			/>
		</div>

		{#if data.loadError && paged.length === 0}
			<ErrorRetry failure={data.loadError} subject="suppliers" />
		{:else if paged.length === 0}
			<Empty>
				<EmptyHeader>
					<EmptyMedia><Package class="size-6 text-muted-foreground"></Package></EmptyMedia>
					<EmptyTitle
						>{query.trim() || activeType !== 'all'
							? 'No suppliers match these filters'
							: 'No suppliers yet'}</EmptyTitle
					>
					<EmptyDescription
						>Additions continue as new suppliers join during test mode.</EmptyDescription
					>
				</EmptyHeader>
				<EmptyContent>
					{#if activeType !== 'all' || query.trim()}
						<Button
							variant="outline"
							size="sm"
							onclick={() => {
								activeType = 'all';
								query = '';
							}}
							>Clear filters</Button
						>
					{:else}
						<Button size="sm" href={localizeHref('/register')}>Join as a supplier</Button>
					{/if}
					<Button variant="link" size="sm" href={localizeHref('/products')}
						>Browse products instead</Button
					>
				</EmptyContent>
			</Empty>
		{:else}
			<div class="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
				{#each paged as s (s.slug)}
					<a
						href={localizeHref(`/supplier/${s.slug}`)}
						class="group press-scale flex h-full flex-col rounded-xl bg-card ring-1 ring-foreground/10 transition-all hover:-translate-y-0.5 hover:shadow-md"
					>
						<div
							class="flex h-24 items-center justify-center border-b border-foreground/10 bg-muted/50 p-3"
						>
							{#if s.logoInitials}
								<div
									class="flex size-12 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary"
								>
									{s.logoInitials}
								</div>
							{:else}
								<div
									class="flex size-12 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary"
								>
									{s.name.charAt(0)}
								</div>
							{/if}
						</div>
						<div class="flex flex-1 flex-col gap-1 p-2.5 sm:p-3">
							<h3 class="line-clamp-1 text-xs leading-tight font-medium sm:text-sm">{s.name}</h3>
							{#if s.country}
								<p class="text-2xs text-muted-foreground">{s.country}</p>
							{/if}
							<div class="mt-auto flex items-center justify-between gap-1 pt-1">
								<Badge variant="outline" class="text-3xs">{s.businessType}</Badge>
								{#if s.isBrand}
									<Badge variant="secondary" class="text-3xs">
										<ArrowRight class="mr-0.5 size-2" /> Brand
									</Badge>
								{/if}
							</div>
						</div>
					</a>
				{/each}
			</div>
			<Paginator bind:page {totalPages} />
		{/if}
	</div>

	<!-- Target Markets -->
	<div class="space-y-4">
		<div>
			<h2 class="text-lg font-semibold">Markets served</h2>
			<p class="text-xs text-muted-foreground">
				Suppliers shipping halal products across these regions.
			</p>
		</div>
		<div class="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3">
			{#each markets as market (market.region)}
				<Card class="p-3 sm:p-4">
					<div class="flex items-center gap-2">
						<div class="flex size-7 shrink-0 items-center justify-center rounded-lg {market.cls}">
							<MapPin class="size-3.5"></MapPin>
						</div>
						<h3 class="truncate text-xs font-semibold sm:text-sm">{market.region}</h3>
					</div>
					<p class="mt-1.5 line-clamp-2 text-2xs text-muted-foreground sm:text-xs">
						{market.countries}
					</p>
				</Card>
			{/each}
		</div>
	</div>
</section>
