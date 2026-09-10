<script lang="ts">
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import {
		Select,
		SelectContent,
		SelectItem,
		SelectTrigger
	} from '#lib/components/ui/select/index.js';
	import Breadcrumb from '#lib/components/site/breadcrumb.svelte';
	import Paginator from '#lib/components/site/paginator.svelte';
	import { Checkbox } from '#lib/components/ui/checkbox/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import * as ToggleGroup from '#lib/components/ui/toggle-group/index.js';
	import MessageCircle from '@lucide/svelte/icons/message-circle';
	import Star from '@lucide/svelte/icons/star';
	import Eye from '@lucide/svelte/icons/eye';
	import SearchIcon from '@lucide/svelte/icons/search';
	import X from '@lucide/svelte/icons/x';

	let { data } = $props();

	type ProviderType =
		'certification' | 'logistics' | 'finance' | 'payment' | 'insurance' | 'consulting';

	const types: ProviderType[] = [
		'certification',
		'logistics',
		'finance',
		'payment',
		'insurance',
		'consulting'
	];

	let selectedTypes = $state<Set<ProviderType>>(new Set());
	let selectedLocation = $state('all');
	let selectedRating = $state('');
	let searchQuery = $state('');

	// Location options derived from fetched providers — sorted unique countries with counts, 'all' first
	const locationOptions = $derived([
		{ value: 'all', label: 'All Locations' },
		...Array.from(
			new Set((data.providers ?? []).map((p: any) => p.country).filter((c): c is string => !!c))
		)
			.sort()
			.map((c) => ({
				value: c,
				label: c,
				count: (data.providers ?? []).filter((p: any) => p.country === c).length
			}))
	]);

	// Real counts computed from data
	const providerCount = $derived((data.providers ?? []).length);
	const countryCount = $derived(
		new Set((data.providers ?? []).map((p: any) => p.country).filter(Boolean)).size
	);
	const typeCount = $derived(
		new Set((data.providers ?? []).map((p: any) => p.type).filter(Boolean)).size
	);
	const countryPeerCount = (country: string): number =>
		(data.providers ?? []).filter((p: any) => p.country === country).length;
	const typePeerCount = (type: string): number =>
		(data.providers ?? []).filter((p: any) => p.type === type).length;

	function toggleType(type: ProviderType) {
		if (selectedTypes.has(type)) {
			selectedTypes.delete(type);
			selectedTypes = new Set(selectedTypes);
		} else {
			selectedTypes = new Set([...selectedTypes, type]);
		}
	}

	function clearAll() {
		selectedTypes = new Set();
		selectedLocation = 'all';
		selectedRating = '';
		searchQuery = '';
	}

	const filtered = $derived(
		(data.providers ?? []).filter((p: any) => {
			if (selectedTypes.size > 0 && !selectedTypes.has(p.type)) return false;
			if (selectedLocation !== 'all' && p.country !== selectedLocation) return false;
			if (selectedRating) {
				const min = parseFloat(selectedRating);
				if (!p.rating || p.rating < min) return false;
			}
			const q = searchQuery.trim().toLowerCase();
			if (q && !(p.name ?? '').toLowerCase().includes(q)) return false;
			return true;
		})
	);

	function typeLabel(type: ProviderType): string {
		const labels: Record<ProviderType, string> = {
			certification: 'Certification',
			logistics: 'Logistics',
			finance: 'Finance',
			payment: 'Payment',
			insurance: 'Insurance',
			consulting: 'Consulting'
		};
		return labels[type];
	}

	function typeColor(type: ProviderType): string {
		const colors: Record<ProviderType, string> = {
			certification: 'bg-primary/10 text-primary',
			logistics: 'bg-success/10 text-success',
			finance: 'bg-warn/10 text-warn',
			payment: 'bg-accent-purple/10 text-accent-purple',
			insurance: 'bg-accent-rose/10 text-accent-rose',
			consulting: 'bg-info/10 text-info'
		};
		return colors[type];
	}

	function initials(name: string): string {
		return name
			.split(' ')
			.map((w) => w[0])
			.slice(0, 2)
			.join('');
	}

	let currentPage = $state(1);
	const perPage = 6;
	const totalPages = $derived(Math.max(1, Math.ceil(filtered.length / perPage)));
	const paged = $derived(filtered.slice((currentPage - 1) * perPage, currentPage * perPage));

	$effect(() => {
		void selectedTypes;
		void selectedLocation;
		void selectedRating;
		void searchQuery;
		currentPage = 1;
	});
</script>

<Breadcrumb items={[{ label: 'Service Providers', href: '/service-providers' }]} />

<div class="relative mb-6 overflow-hidden rounded-xl">
	<img
		src="/api/media/sp-hero.webp"
		alt="Halal trade services"
		class="aspect-[5/2] w-full object-cover"
		loading="lazy"
		decoding="async"
		width="1200"
		height="480"
	/>
	<div class="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent"></div>
</div>

<div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
	<div>
		<h1 class="text-xl font-bold tracking-tight">Service Providers</h1>
		<p class="mt-0.5 text-sm text-muted-foreground">
			Certification, logistics, finance, and payment services for halal trade
		</p>
		<p class="mt-1 text-xs text-muted-foreground">
			{providerCount} providers across {countryCount} countries · {typeCount} service types
		</p>
	</div>
</div>

<div class="flex flex-col gap-5 lg:flex-row">
	<aside class="w-full shrink-0 lg:w-56">
		<div class="rounded-xl bg-card p-4 ring-1 ring-foreground/10 lg:sticky lg:top-20">
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-sm font-semibold">Filters</h2>
				<Button
					variant="ghost"
					size="sm"
					class="text-xs text-muted-foreground hover:text-foreground"
					onclick={clearAll}>Clear all</Button
				>
			</div>

			<div class="mb-5">
				<h3 class="mb-2.5 text-xs font-semibold">Service Type</h3>
				<div class="space-y-2">
					{#each types as type (type)}
						<label class="flex cursor-pointer items-center gap-2">
							<Checkbox
								checked={selectedTypes.has(type)}
								onCheckedChange={() => toggleType(type)}
							/>
							<span class="text-xs">{typeLabel(type)}</span>
						</label>
					{/each}
				</div>
			</div>

			<div class="mb-5">
				<h3 class="mb-2.5 text-xs font-semibold">Location</h3>
				<Select type="single" bind:value={selectedLocation}>
					<SelectTrigger class="w-full text-xs">All Locations</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Locations</SelectItem>
						{#each locationOptions.filter((o) => o.value !== 'all') as loc (loc.value)}
							<SelectItem value={loc.value}>{loc.label}</SelectItem>
						{/each}
					</SelectContent>
				</Select>
			</div>

		<div class="mb-2">
				<h3 class="mb-2.5 text-xs font-semibold">Rating</h3>
				<ToggleGroup.Root
					type="single"
					bind:value={selectedRating}
					variant="outline"
					spacing={2}
					orientation="vertical"
					class="w-full items-stretch"
					aria-label="Filter by minimum rating"
				>
					<ToggleGroup.Item value="" class="justify-start text-xs">Any rating</ToggleGroup.Item>
					{#each [{ val: '4.5', label: '4.5 & up' }, { val: '4.0', label: '4.0 & up' }, { val: '3.5', label: '3.5 & up' }] as r (r.val)}
						<ToggleGroup.Item value={r.val} class="justify-start text-xs">{r.label}</ToggleGroup.Item>
					{/each}
				</ToggleGroup.Root>
			</div>
		</div>
	</aside>

	<div class="min-w-0 flex-1">
		<div class="relative mb-4">
			<SearchIcon class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
			<Input
				type="search"
				placeholder="Search providers by name..."
				class="pl-9 text-xs"
				bind:value={searchQuery}
			/>
		</div>
		{#if selectedTypes.size > 0 || selectedLocation !== 'all' || selectedRating || searchQuery.trim()}
			<div class="mb-4 flex flex-wrap items-center gap-2">
				{#each [...selectedTypes] as type (type)}
					<span
						class="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary"
					>
						{typeLabel(type)}
						<Button
							variant="ghost"
							size="icon"
							class="size-4 rounded-full p-0 hover:bg-primary/20"
							onclick={() => toggleType(type)}
							aria-label="Remove {typeLabel(type)} filter"
						>
							<X class="size-3" />
						</Button>
					</span>
				{/each}
				{#if searchQuery.trim()}
					<span
						class="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary"
					>
						“{searchQuery.trim()}”
						<Button
							variant="ghost"
							size="icon"
							class="size-4 rounded-full p-0 hover:bg-primary/20"
							onclick={() => (searchQuery = '')}
							aria-label="Clear search filter"
						>
							<X class="size-3" />
						</Button>
					</span>
				{/if}
				<Button
					variant="ghost"
					size="sm"
					class="text-xs text-muted-foreground hover:text-foreground"
					onclick={clearAll}>Clear all</Button
				>
			</div>
		{/if}

		<div class="grid grid-cols-2 gap-2 sm:gap-4 xl:grid-cols-3">
			{#each paged as provider (provider.slug)}
				<article
					class="group rounded-xl bg-card p-3 ring-1 ring-foreground/10 transition-all hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-md sm:p-4"
				>
					<div class="mb-3 flex items-start gap-3 sm:mb-4 sm:gap-3.5">
						<div
							class="flex size-11 shrink-0 items-center justify-center rounded-xl text-base font-bold sm:size-14 sm:text-lg {typeColor(
								provider.type
							)}"
						>
							{initials(provider.name)}
						</div>
						<div class="min-w-0 flex-1">
							<div class="mb-0.5 flex items-center gap-2">
								<h3
									class="truncate text-sm font-semibold transition-colors group-hover:text-primary"
								>
									{provider.name}
								</h3>
								{#if provider.rating && provider.rating >= 4.7}
								<Star class="size-4 shrink-0 fill-primary text-primary" />
							{/if}
							</div>
							<p class="truncate text-xs text-muted-foreground">{provider.country}</p>
						</div>
					</div>
					<div class="mb-3 flex flex-wrap gap-1.5 sm:mb-4">
						<span
							class="rounded-full {typeColor(provider.type)} px-2.5 py-1 text-[10px] font-medium"
							>{typeLabel(provider.type)}</span
						>
					</div>
					<div class="mb-3 grid grid-cols-3 gap-1.5 rounded-xl bg-muted/50 p-2 text-center sm:mb-4 sm:gap-2 sm:p-3">
						<div>
							<div class="text-sm font-bold sm:text-base">{provider.rating ?? '–'}</div>
							<div class="text-[10px] text-muted-foreground">Rating</div>
						</div>
						<div>
							<div class="text-sm font-bold sm:text-base">{countryPeerCount(provider.country)}</div>
							<div class="text-[10px] text-muted-foreground">Same country</div>
						</div>
						<div>
							<div class="text-sm font-bold sm:text-base">{typePeerCount(provider.type)}</div>
							<div class="text-[10px] text-muted-foreground">Same type</div>
						</div>
					</div>
					{#if provider.description}
						<p class="mb-3 hidden line-clamp-2 text-xs text-muted-foreground sm:mb-4 sm:block">{provider.description}</p>
					{/if}
					<div class="flex gap-2">
						<Button
							href={localizeHref(`/service-providers/${provider.slug}`)}
							class="flex-1 text-xs"
							size="sm"
						>
							<Eye class="mr-1 size-3.5" />
							View Details
						</Button>
						{#if provider.whatsapp}
							<Button
								variant="outline"
								size="sm"
								class="size-8 shrink-0 p-0"
								href="https://wa.me/{provider.whatsapp.replace(/[^0-9]/g, '')}"
								target="_blank"
								rel="noopener"
							>
								<MessageCircle class="size-3.5" />
							</Button>
						{/if}
					</div>
				</article>
			{/each}
		</div>

		{#if filtered.length === 0}
			<p class="py-10 text-center text-sm text-muted-foreground">
				No providers match the selected filters.
			</p>
		{/if}

		<Paginator bind:page={currentPage} {totalPages} />
	</div>
</div>
