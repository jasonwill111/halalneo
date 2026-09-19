<script lang="ts">
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { Card, CardContent, CardTitle } from '#lib/components/ui/card/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { ToggleGroup, ToggleGroupItem } from '#lib/components/ui/toggle-group/index.js';
	import Breadcrumb from '#lib/components/site/breadcrumb.svelte';
	import FilterPills from '#lib/components/site/filter-pills.svelte';
	import { cn } from '#lib/utils.js';
	import CalendarIcon from '@lucide/svelte/icons/calendar';
	import MapPinIcon from '@lucide/svelte/icons/map-pin';
	import GlobeIcon from '@lucide/svelte/icons/globe';
	import CalendarDaysIcon from '@lucide/svelte/icons/calendar-days';
	import ExternalLinkIcon from '@lucide/svelte/icons/external-link';
	import LayoutGridIcon from '@lucide/svelte/icons/layout-grid';
	import MapIcon from '@lucide/svelte/icons/map';
	import SearchIcon from '@lucide/svelte/icons/search';
	import { Input } from '#lib/components/ui/input/index.js';
	import Paginator from '#lib/components/site/paginator.svelte';
	import ErrorRetry from '#lib/components/site/error-retry.svelte';
	import {
		Empty,
		EmptyHeader,
		EmptyMedia,
		EmptyTitle,
		EmptyDescription,
		EmptyContent
	} from '#lib/components/ui/empty/index.js';

	import type { TradeShowDto } from '#lib/schemas/trade-shows.js';

	let { data } = $props();

	/** `TradeShowDto` plus the optional coordinates the static seed rows carry. */
	type TradeShowRow = TradeShowDto & { lat?: number; lng?: number };

	let selectedRegion = $state('all');
	let viewMode = $state<'list' | 'map'>('list');

	/** Single assertion point: seed rows add optional coordinates to the projected DTO. */
	const rows = $derived((data.shows ?? []) as TradeShowRow[]);

	// Regions derived from data — sorted unique region values with counts, 'all' first
	const regionOptions = $derived.by<{ value: string; label: string; count: number }[]>(() => {
		const shows = (data.shows ?? []) as Array<{ region?: string | null }>;
		const regions = Array.from(new Set(shows.map((s) => String(s.region ?? '')).filter((r) => r.length > 0)))
			.sort()
			.map((r) => ({
				value: r,
				label: r,
				count: shows.filter((s) => s.region === r).length
			}));
		return [{ value: 'all', label: 'All Regions', count: shows.length }, ...regions];
	});

	const jsonLd = $derived(JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'ItemList',
		name: 'Global Halal Trade Shows & Exhibitions',
		description:
			'Calendar of halal trade shows, exhibitions, and industry events worldwide — MIHAS, Gulfood, Halal Expo Istanbul and more.',
		itemListElement: rows.map((s: TradeShowRow, i: number) => ({
			'@type': 'ListItem',
			position: i + 1,
			item: {
				'@type': 'Event',
				name: s.name,
				startDate: s.startDate,
				endDate: s.endDate,
				eventStatus: 'https://schema.org/EventScheduled',
				eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
				location: {
					'@type': 'Place',
					name: s.venue,
					address: {
						'@type': 'PostalAddress',
						addressLocality: s.city,
						addressCountry: s.country
					}
				},
				url: s.website
			}
		}))
	}));
	let search = $state('');

	const PAGE_SIZE = 9;
	let page = $state(1);

	const filtered = $derived(
		rows
			.filter((s: TradeShowRow) => (selectedRegion === 'all' || s.region === selectedRegion))
			.filter((s: TradeShowRow) =>
				search.trim()
					? s.name.toLowerCase().includes(search.toLowerCase()) ||
						s.city?.toLowerCase().includes(search.toLowerCase()) ||
						s.country?.toLowerCase().includes(search.toLowerCase())
					: true
			)
			.sort((a: TradeShowRow, b: TradeShowRow) => new Date(a.startDate ?? 0).getTime() - new Date(b.startDate ?? 0).getTime())
	);

	const totalPages = $derived(Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)));
	const paged = $derived(filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE));

	$effect(() => {
		void selectedRegion;
		void search;
		page = 1;
	});

	const now = new Date();

	function formatDateRange(start: string | null, end: string | null): string {
		const s = new Date(start ?? 0);
		const e = new Date(end ?? 0);
		const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
		const sameMonth = s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear();
		if (sameMonth) {
			return `${s.toLocaleDateString('en-US', opts)}–${e.getDate()}, ${s.getFullYear()}`;
		}
		return `${s.toLocaleDateString('en-US', opts)} – ${e.toLocaleDateString('en-US', { ...opts, year: 'numeric' })}`;
	}

	function isPast(endDate: string | null): boolean {
		return new Date(endDate ?? 0) < now;
	}

	function isUpcoming(startDate: string | null): boolean {
		return new Date(startDate ?? 0) > now;
	}

	function isOngoing(start: string | null, end: string | null): boolean {
		const s = new Date(start ?? 0);
		const e = new Date(end ?? 0);
		return s <= now && e >= now;
	}

	const scaleColors: Record<string, string> = {
		mega: 'bg-primary/15 text-primary',
		large: 'bg-info/15 text-info',
		medium: 'bg-muted text-muted-foreground',
		regional: 'bg-accent-rose/15 text-accent-rose'
	};

	const regionIcons: Record<string, string> = {
		Asia: '🌏',
		Europe: '🌍',
		'Middle East': '🏜️',
		'North America': '🌎',
		Africa: '🌍',
		Oceania: '🌏'
	};

	// Convert lat/lng to SVG map coordinates (world map)
	function latLngToXY(lat: number, lng: number): { x: number; y: number } {
		const mapWidth = 480;
		const mapHeight = 280;
		const x = ((lng + 180) / 360) * mapWidth;
		const y = ((90 - lat) / 180) * mapHeight;
		return { x, y };
	}
	
	// Shows with coordinates for map view
	const mappedShows = $derived(
		(filtered ?? []).filter(
			(s): s is TradeShowRow & { lat: number; lng: number } => !!(s.lat && s.lng)
		)
	);
</script>

<svelte:head>
	<!-- Title + description render once via root layout from loader `seo`. -->
	{@html `\u003cscript type="application/ld+json">${jsonLd}\u003c/script>`}
</svelte:head>

<Breadcrumb items={[{ label: 'Trade Shows', href: '/trade-shows' }]} />

<section class="space-y-4 sm:space-y-6">
	<div class="max-w-2xl space-y-2">
		<div class="flex items-center gap-2 text-sm font-medium text-muted-foreground">
			<CalendarIcon class="size-4"></CalendarIcon>
			Trade Shows
		</div>
		<h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">Global halal events</h1>
		<p class="text-muted-foreground">
			Upcoming halal trade shows, exhibitions, and industry events worldwide. Plan your
			attendance and connect with buyers and suppliers.
		</p>
	</div>

	<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
		<div class="relative flex-1 sm:max-w-xs">
			<SearchIcon class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
			<Input
				type="search"
				placeholder="Search events, cities..."
				class="pl-9"
				bind:value={search}
			/>
		</div>
		<FilterPills
			options={regionOptions}
			bind:value={selectedRegion}
			ariaLabel="Filter trade shows by region"
		/>
		<ToggleGroup type="single" bind:value={viewMode} variant="outline" aria-label="View mode">
			<ToggleGroupItem value="list" aria-label="List view">
				<LayoutGridIcon class="size-4" />
			</ToggleGroupItem>
			<ToggleGroupItem value="map" aria-label="Map view">
				<MapIcon class="size-4" />
			</ToggleGroupItem>
		</ToggleGroup>
	</div>

	{#if data.loadError}
		<ErrorRetry failure={data.loadError} subject="trade shows" />
	{:else if filtered.length === 0}
		<Empty>
			<EmptyHeader>
				<EmptyMedia><CalendarDaysIcon class="size-6 text-muted-foreground"></CalendarDaysIcon></EmptyMedia>
				<EmptyTitle>No events found</EmptyTitle>
				<EmptyDescription>
					{#if search.trim() || selectedRegion !== 'all'}
						Nothing matches the current search or region. Try a shorter event name or another
						region.
					{:else}
						No trade shows are scheduled in the calendar yet.
					{/if}
				</EmptyDescription>
			</EmptyHeader>
			<EmptyContent>
				{#if search.trim() || selectedRegion !== 'all'}
					<Button
						variant="outline"
						size="sm"
						onclick={() => {
							search = '';
							selectedRegion = 'all';
						}}>Clear filters</Button
					>
				{:else}
					<Button size="sm" href={localizeHref('/suppliers')}>Browse suppliers</Button
					>
				{/if}
				<Button variant="link" size="sm" href={localizeHref('/contact')}
					>Suggest an event</Button
				>
			</EmptyContent>
		</Empty>
	{:else if viewMode === 'list'}
		<div class="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3">
			{#each paged as show (show.id)}
				{@const ongoing = isOngoing(show.startDate, show.endDate)}
				{@const upcoming = isUpcoming(show.startDate)}
				{@const past = isPast(show.endDate)}
				{@const tags = show.focus ?? []}
				<Card class="flex flex-col bg-card ring-1 ring-foreground/10 transition-shadow hover:shadow-md {past ? 'opacity-50' : ''}">
					<CardContent class="flex flex-1 flex-col gap-2.5 p-3 sm:p-4">
						<div class="flex items-start justify-between gap-2">
							<div class="min-w-0 flex-1 space-y-1">
								<a href={localizeHref(`/trade-shows/${show.id}`)} class="hover:text-primary">
									<CardTitle class="truncate text-sm leading-snug sm:text-base">{show.name}</CardTitle>
								</a>
								<div class="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
									<MapPinIcon class="size-3.5 shrink-0" />
									<span class="truncate">{show.city}, {show.country}{#if show.venue} · {show.venue}{/if}</span>
								</div>
							</div>
							<span class="shrink-0 text-lg" title={show.region}>{regionIcons[show.region ?? ''] ?? '🌐'}</span>
						</div>

						<p class="hidden text-xs leading-relaxed text-muted-foreground line-clamp-2 sm:block">
							{show.description}
						</p>

						<div class="flex flex-wrap gap-1.5">
							{#each tags.slice(0, 3) as tag (tag)}
								<Badge variant="secondary" class="text-2xs">{tag}</Badge>
							{/each}
							{#if tags.length > 3}
								<Badge variant="secondary" class="text-2xs">+{tags.length - 3}</Badge>
							{/if}
						</div>

						<div class="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
							<span class="flex items-center gap-1.5">
								<CalendarDaysIcon class="size-3.5 shrink-0" />
								{formatDateRange(show.startDate, show.endDate)}
							</span>
							<span class={cn('rounded-full px-1.5 py-0.5 text-2xs font-medium', scaleColors[show.scale ?? ''])}>
								{show.scale}
							</span>
							{#if show.exhibitors}
								<span>· {show.exhibitors} exhibitors</span>
							{/if}
							{#if show.visitors}
								<span>· {show.visitors} visitors</span>
							{/if}
						</div>

						<div class="mt-auto flex items-center gap-2 pt-1">
							{#if ongoing}
								<Badge class="bg-success/15 text-success">Happening Now</Badge>
							{:else if upcoming}
								<Badge class="bg-info/15 text-info">Upcoming</Badge>
							{:else if past}
								<Badge variant="secondary">Past</Badge>
							{/if}
							<Button href={show.website} target="_blank" rel="noopener" variant="outline" size="sm" class="ml-auto h-7 text-xs">
								Website
								<ExternalLinkIcon class="size-3" />
							</Button>
						</div>
					</CardContent>
				</Card>
			{/each}
		</div>
		<Paginator bind:page {totalPages} />
	{:else}
		<!-- MAP VIEW -->
		<div class="relative mb-4 overflow-x-auto pb-4">
			<div class="flex flex-wrap gap-2 mb-3">
				{#each mappedShows as show (show.id)}
					{@const ongoing = isOngoing(show.startDate, show.endDate)}
					{@const upcoming = isUpcoming(show.startDate)}
					<Card class="w-64 max-w-xs cursor-pointer p-3 text-xs hover:shadow-md" onclick={() => (viewMode = 'list')}>
						<div class="flex items-center gap-1.5 mb-1">
							<span class={cn('h-2.5 w-2.5 flex-shrink-0 rounded-full', ongoing ? 'bg-success' : upcoming ? 'bg-info' : 'bg-muted-foreground/40')}></span>
							<CardTitle class="text-xs font-medium">{show.name}</CardTitle>
						</div>
						<p class="text-xs text-muted-foreground truncate">{show.city}, {show.country}</p>
						<div class="mt-1 flex items-center gap-1.5">
							<CalendarDaysIcon class="size-3" />
							<span class="text-xs">{formatDateRange(show.startDate, show.endDate)}</span>
						</div>
					</Card>
				{/each}
			</div>
			{#if mappedShows.length === 0}
				<Empty>
					<EmptyHeader>
						<EmptyMedia><GlobeIcon class="size-6 text-muted-foreground"></GlobeIcon></EmptyMedia>
						<EmptyTitle>No mapped events</EmptyTitle>
						<EmptyDescription>The map only shows events with coordinates. Switch to list view for full details.</EmptyDescription>
					</EmptyHeader>
					<EmptyContent>
						<Button variant="outline" size="sm" onclick={() => (viewMode = 'list')}
							><LayoutGridIcon class="size-3.5" data-icon="inline-start" />Show list view</Button
						>
					</EmptyContent>
				</Empty>
			{:else}
				<div class="mx-auto overflow-hidden rounded-xl border border-border bg-card">
					<svg
						viewBox="0 0 480 280"
						class="block h-auto w-full"
						role="img"
						aria-label="World map showing halal trade show locations"
					>
						<rect width="480" height="280" class="fill-muted/20" />
						<!-- Simplified world map outline -->
						<path
							d="M20,40 L60,35 L80,55 L120,45 L140,70 L200,65 L240,90 L280,85 L300,65 L340,75 L380,60 L420,70 L460,55 L470,80 L450,120 L420,140 L380,135 L340,155 L300,145 L260,170 L220,165 L180,190 L140,180 L100,200 L60,195 L30,180 L10,155 Z"
							class="fill-transparent stroke-border/20 stroke-[0.5]"
						/>
						<!-- Event markers -->
						{#each mappedShows as show (show.id)}
							{@const pos = latLngToXY(show.lat, show.lng)}
							{@const ongoing = isOngoing(show.startDate, show.endDate)}
							{@const upcoming = isUpcoming(show.startDate)}
							<g>
								<circle
									cx={pos.x}
									cy={pos.y}
									r={ongoing ? 6 : 4}
									class={cn(
										"stroke-background stroke-[0.5]",
										ongoing ? 'fill-success' : upcoming ? 'fill-info' : 'fill-muted-foreground/50'
									)}
								>
									<title>{show.name} — {show.city}, {show.country}</title>
								</circle>
								{#if ongoing}
									<circle cx={pos.x} cy={pos.y} r={11} class="fill-success/15" />
								{/if}
							</g>
						{/each}
					</svg>
					<div class="p-3 text-center text-xs text-muted-foreground">
						<span class="inline-block h-2.5 w-2.5 rounded-full bg-success mr-1"></span> Happening now ·
						<span class="inline-block h-2.5 w-2.5 rounded-full bg-info ml-1 mr-1"></span> Upcoming ·
						<span class="inline-block h-2.5 w-2.5 rounded-full bg-muted-foreground/50 ml-1 mr-1"></span> Past
					</div>
				</div>
			{/if}
		</div>
	{/if}
</section>
