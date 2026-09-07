<script lang="ts">
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import {
		Select,
		SelectContent,
		SelectItem,
		SelectTrigger
	} from '#lib/components/ui/select/index.js';
	import Breadcrumb from '#lib/components/site/breadcrumb.svelte';
	import { Checkbox } from '#lib/components/ui/checkbox/index.js';
	import * as ToggleGroup from '#lib/components/ui/toggle-group/index.js';
	import MessageCircle from '@lucide/svelte/icons/message-circle';
	import Star from '@lucide/svelte/icons/star';
	import Eye from '@lucide/svelte/icons/eye';
	import X from '@lucide/svelte/icons/x';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';

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

	const locations = [
		'Malaysia',
		'Indonesia',
		'Singapore',
		'UAE',
		'Saudi Arabia',
		'Turkey',
		'United Kingdom'
	];

	let selectedTypes = $state<Set<ProviderType>>(new Set());
	let selectedLocation = $state('');
	let selectedRating = $state('');

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
		selectedLocation = '';
		selectedRating = '';
	}

	const filtered = $derived(
		(data.providers ?? []).filter((p: any) => {
			if (selectedTypes.size > 0 && !selectedTypes.has(p.type)) return false;
			if (selectedLocation && p.country !== selectedLocation) return false;
			if (selectedRating) {
				const min = parseFloat(selectedRating);
				if (!p.rating || p.rating < min) return false;
			}
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
					{#each types as type}
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
						<SelectItem value="">All Locations</SelectItem>
						{#each locations as loc}
							<SelectItem value={loc}>{loc}</SelectItem>
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
					{#each [{ val: '4.5', label: '4.5 & up' }, { val: '4.0', label: '4.0 & up' }, { val: '3.5', label: '3.5 & up' }] as r}
						<ToggleGroup.Item value={r.val} class="justify-start text-xs">{r.label}</ToggleGroup.Item>
					{/each}
				</ToggleGroup.Root>
			</div>
		</div>
	</aside>

	<div class="min-w-0 flex-1">
		{#if selectedTypes.size > 0 || selectedLocation || selectedRating}
			<div class="mb-4 flex flex-wrap items-center gap-2">
				{#each [...selectedTypes] as type}
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
				<Button
					variant="ghost"
					size="sm"
					class="text-xs text-muted-foreground hover:text-foreground"
					onclick={clearAll}>Clear all</Button
				>
			</div>
		{/if}

		<div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
			{#each paged as provider}
				<article
					class="group rounded-xl bg-card p-4 ring-1 ring-foreground/10 transition-all hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-md"
				>
					<div class="mb-4 flex items-start gap-3.5">
						<div
							class="flex size-14 shrink-0 items-center justify-center rounded-xl text-lg font-bold {typeColor(
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
					<div class="mb-4 flex flex-wrap gap-1.5">
						<span
							class="rounded-full {typeColor(provider.type)} px-2.5 py-1 text-[10px] font-medium"
							>{typeLabel(provider.type)}</span
						>
					</div>
					<div class="mb-3 grid grid-cols-3 gap-2 rounded-xl bg-muted/50 p-3 text-center">
						<div>
							<div class="text-base font-bold">{provider.rating ?? '–'}</div>
							<div class="text-[10px] text-muted-foreground">Rating</div>
						</div>
						<div>
							<div class="text-base font-bold">
								{provider.type === 'certification'
									? '320+'
									: provider.type === 'logistics'
										? '15'
										: provider.type === 'finance'
											? '$2B+'
											: provider.type === 'payment'
												? '50K+'
												: provider.type === 'insurance'
													? '8K+'
													: '180+'}
							</div>
							<div class="text-[10px] text-muted-foreground">
								{provider.type === 'certification'
									? 'Certified'
									: provider.type === 'logistics'
										? 'Countries'
										: provider.type === 'finance'
											? 'Financed'
											: provider.type === 'payment'
												? 'Merchants'
												: provider.type === 'insurance'
													? 'Policies'
													: 'Certified'}
							</div>
						</div>
						<div>
							<div class="text-base font-bold">
								{provider.type === 'certification'
									? '12yr'
									: provider.type === 'logistics'
										? '8yr'
										: provider.type === 'finance'
											? '15yr'
											: provider.type === 'payment'
												? '6yr'
												: provider.type === 'insurance'
													? '10yr'
													: '18yr'}
							</div>
							<div class="text-[10px] text-muted-foreground">Experience</div>
						</div>
					</div>
					{#if provider.description}
						<p class="mb-4 line-clamp-2 text-xs text-muted-foreground">{provider.description}</p>
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

		{#if totalPages > 1}
			<div class="mt-8 flex items-center justify-center gap-1.5">
				<Button
					variant="outline"
					size="icon"
					class="size-9"
					disabled={currentPage === 1}
					onclick={() => (currentPage = Math.max(1, currentPage - 1))}
				>
					<ChevronLeft class="size-4" />
				</Button>
				{#each Array(totalPages) as _, i}
					{@const page = i + 1}
					{#if page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1}
						<Button
							variant={page === currentPage ? 'default' : 'outline'}
							size="icon"
							class="size-9"
							onclick={() => (currentPage = page)}>{page}</Button
						>
					{:else if Math.abs(page - currentPage) === 2}
						<span class="text-sm text-muted-foreground">...</span>
					{/if}
				{/each}
				<Button
					variant="outline"
					size="icon"
					class="size-9"
					disabled={currentPage === totalPages}
					onclick={() => (currentPage = Math.min(totalPages, currentPage + 1))}
				>
					<ChevronRight class="size-4" />
				</Button>
			</div>
		{/if}
	</div>
</div>
