<script lang="ts">
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { Card, CardContent, CardTitle } from '#lib/components/ui/card/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import Breadcrumb from '#lib/components/site/breadcrumb.svelte';
	import FilterPills from '#lib/components/site/filter-pills.svelte';
	import { cn } from '#lib/utils.js';
	import CalendarIcon from '@lucide/svelte/icons/calendar';
	import MapPinIcon from '@lucide/svelte/icons/map-pin';
	import GlobeIcon from '@lucide/svelte/icons/globe';
	import CalendarDaysIcon from '@lucide/svelte/icons/calendar-days';
	import ExternalLinkIcon from '@lucide/svelte/icons/external-link';
	import SearchIcon from '@lucide/svelte/icons/search';
	import { Input } from '#lib/components/ui/input/index.js';
	import Paginator from '#lib/components/site/paginator.svelte';

	let { data } = $props();

	let selectedRegion = $state('all');

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
		itemListElement: (data.shows ?? []).map((s: any, i: number) => ({
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
		(data.shows ?? [])
			.filter((s: any) => (selectedRegion === 'all' || s.region === selectedRegion))
			.filter((s: any) =>
				search.trim()
					? s.name.toLowerCase().includes(search.toLowerCase()) ||
						s.city.toLowerCase().includes(search.toLowerCase()) ||
						s.country.toLowerCase().includes(search.toLowerCase())
					: true
			)
			.sort((a: any, b: any) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
	);

	const totalPages = $derived(Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)));
	const paged = $derived(filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE));

	$effect(() => {
		void selectedRegion;
		void search;
		page = 1;
	});

	const now = new Date();

	function formatDateRange(start: string, end: string): string {
		const s = new Date(start);
		const e = new Date(end);
		const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
		const sameMonth = s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear();
		if (sameMonth) {
			return `${s.toLocaleDateString('en-US', opts)}–${e.getDate()}, ${s.getFullYear()}`;
		}
		return `${s.toLocaleDateString('en-US', opts)} – ${e.toLocaleDateString('en-US', { ...opts, year: 'numeric' })}`;
	}

	function isPast(endDate: string): boolean {
		return new Date(endDate) < now;
	}

	function isUpcoming(startDate: string): boolean {
		return new Date(startDate) > now;
	}

	function isOngoing(start: string, end: string): boolean {
		const s = new Date(start);
		const e = new Date(end);
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
</script>

<svelte:head>
	<title>Halal Trade Shows & Exhibitions — HalalNeo</title>
	<meta name="description" content="Upcoming halal trade shows, exhibitions, and conferences worldwide. Find the right events to grow your halal business." />
	{@html `<script type="application/ld+json">${jsonLd}</script>`}
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
	</div>

	{#if filtered.length === 0}
		<div
			class="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground"
		>
			<CalendarDaysIcon class="mx-auto mb-3 size-10 opacity-40" />
			<p class="text-sm">No events found matching your criteria.</p>
		</div>
	{:else}
		<div class="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-3">
			{#each paged as show (show.id)}
				{@const ongoing = isOngoing(show.startDate, show.endDate)}
				{@const upcoming = isUpcoming(show.startDate)}
				{@const past = isPast(show.endDate)}
				<Card class="flex flex-col bg-card ring-1 ring-foreground/10 transition-shadow hover:shadow-md {past ? 'opacity-50' : ''}">
					<CardContent class="flex flex-1 flex-col gap-2.5 p-3 sm:p-4">
						<div class="flex items-start justify-between gap-2">
							<div class="min-w-0 flex-1 space-y-1">
								<a href={localizeHref(`/trade-shows/${show.id}`)} class="hover:text-primary">
									<CardTitle class="text-sm leading-snug sm:text-base">{show.name}</CardTitle>
								</a>
								<div class="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
									<MapPinIcon class="size-3.5 shrink-0" />
									<span class="truncate">{show.city}, {show.country}{#if show.venue} · {show.venue}{/if}</span>
								</div>
							</div>
							<span class="shrink-0 text-lg" title={show.region}>{regionIcons[show.region] ?? '🌐'}</span>
						</div>

						<p class="hidden text-xs leading-relaxed text-muted-foreground line-clamp-2 sm:block">
							{show.description}
						</p>

						<div class="flex flex-wrap gap-1.5">
							{#each show.focus.slice(0, 3) as tag, j (tag)}
								<Badge variant="secondary" class="text-[10px]">{tag}</Badge>
							{/each}
							{#if show.focus.length > 3}
								<Badge variant="secondary" class="text-[10px]">+{show.focus.length - 3}</Badge>
							{/if}
						</div>

						<div class="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
							<span class="flex items-center gap-1.5">
								<CalendarDaysIcon class="size-3.5 shrink-0" />
								{formatDateRange(show.startDate, show.endDate)}
							</span>
							<span class={cn('rounded-full px-1.5 py-0.5 text-[10px] font-medium', scaleColors[show.scale])}>
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
	{/if}
</section>
