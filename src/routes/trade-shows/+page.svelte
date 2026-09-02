<script lang="ts">
	import { Card, CardContent, CardTitle } from '#lib/components/ui/card/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import Breadcrumb from '#lib/components/site/breadcrumb.svelte';
	import CalendarIcon from '@lucide/svelte/icons/calendar';
	import MapPinIcon from '@lucide/svelte/icons/map-pin';
	import GlobeIcon from '@lucide/svelte/icons/globe';
	import CalendarDaysIcon from '@lucide/svelte/icons/calendar-days';
	import ExternalLinkIcon from '@lucide/svelte/icons/external-link';
	import FilterIcon from '@lucide/svelte/icons/filter';
	import SearchIcon from '@lucide/svelte/icons/search';
	import { Input } from '#lib/components/ui/input/index.js';

	let { data } = $props();

	let selectedRegion = $state('all');

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

	const regions = ['all', 'Asia', 'Europe', 'Middle East', 'North America', 'Africa'] as const;

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
		large: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
		medium: 'bg-muted text-muted-foreground',
		regional: 'bg-orange-500/15 text-orange-600 dark:text-orange-400'
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

<section class="space-y-8">
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
		<div class="flex items-center gap-2">
			<FilterIcon class="size-4 text-muted-foreground" />
			<div class="flex gap-1 overflow-x-auto">
				{#each regions as region}
					<button
						class="rounded-md px-2.5 py-1 text-xs font-medium transition-colors {selectedRegion ===
						region
							? 'bg-primary text-primary-foreground'
							: 'bg-muted text-muted-foreground hover:bg-muted/80'}"
						onclick={() => (selectedRegion = region)}
					>
						{region === 'all' ? 'All Regions' : region}
					</button>
				{/each}
			</div>
		</div>
	</div>

	{#if filtered.length === 0}
		<div
			class="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground"
		>
			<CalendarDaysIcon class="mx-auto mb-3 size-10 opacity-40" />
			<p class="text-sm">No events found matching your criteria.</p>
		</div>
	{:else}
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each filtered as show (show.id)}
				{@const ongoing = isOngoing(show.startDate, show.endDate)}
				{@const upcoming = isUpcoming(show.startDate)}
				{@const past = isPast(show.endDate)}
				<Card class="bg-card ring-1 ring-foreground/10 transition-shadow hover:shadow-md {past ? 'opacity-60' : ''}">
					<CardContent class="space-y-3 p-4">
						<div class="flex items-start justify-between gap-2">
							<div class="space-y-1">
								<CardTitle class="text-base leading-snug">{show.name}</CardTitle>
								<div class="flex items-center gap-1.5 text-sm text-muted-foreground">
									<MapPinIcon class="size-3.5 shrink-0" />
									<span>{show.city}, {show.country}</span>
								</div>
							</div>
							<span class="text-lg" title={show.region}>{regionIcons[show.region] ?? '🌐'}</span>
						</div>

						<p class="text-xs leading-relaxed text-muted-foreground line-clamp-2">
							{show.description}
						</p>

						<div class="flex flex-wrap gap-1.5">
							{#each show.focus.slice(0, 3) as tag}
								<Badge variant="secondary" class="text-[10px]">{tag}</Badge>
							{/each}
							{#if show.focus.length > 3}
								<Badge variant="secondary" class="text-[10px]">+{show.focus.length - 3}</Badge>
							{/if}
						</div>

						<div class="flex items-center gap-3 text-xs text-muted-foreground">
							<div class="flex items-center gap-1">
								<CalendarDaysIcon class="size-3.5" />
								{formatDateRange(show.startDate, show.endDate)}
							</div>
							<span class="rounded-md px-1.5 py-0.5 text-[10px] font-medium {scaleColors[show.scale]}">
								{show.scale}
							</span>
						</div>

						{#if show.exhibitors || show.visitors}
							<div class="flex gap-3 text-xs text-muted-foreground">
								{#if show.exhibitors}
									<span>{show.exhibitors} exhibitors</span>
								{/if}
								{#if show.visitors}
									<span>{show.visitors} visitors</span>
								{/if}
							</div>
						{/if}

						<div class="flex items-center gap-2 pt-1">
							{#if ongoing}
								<Badge class="bg-green-500/15 text-green-600 dark:text-green-400">Happening Now</Badge>
							{:else if upcoming}
								<Badge class="bg-blue-500/15 text-blue-600 dark:text-blue-400">Upcoming</Badge>
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
	{/if}
</section>
