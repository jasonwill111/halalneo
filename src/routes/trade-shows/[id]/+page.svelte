<script lang="ts">
	import { Card, CardContent, CardTitle } from '#lib/components/ui/card/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import Breadcrumb from '#lib/components/site/breadcrumb.svelte';
	import StatTile from '#lib/components/site/stat-tile.svelte';
	import { cn } from '#lib/utils.js';
	import CalendarDaysIcon from '@lucide/svelte/icons/calendar-days';
	import MapPinIcon from '@lucide/svelte/icons/map-pin';
	import GlobeIcon from '@lucide/svelte/icons/globe';
	import ExternalLinkIcon from '@lucide/svelte/icons/external-link';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';

	let { data } = $props();
	const show = $derived(data.show);
	const related = $derived(data.related ?? []);

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

	const ongoing = $derived(isOngoing(show.startDate, show.endDate));
	const upcoming = $derived(isUpcoming(show.startDate));
	const past = $derived(isPast(show.endDate));

	const scaleColors: Record<string, string> = {
		mega: 'bg-primary/15 text-primary',
		large: 'bg-info/15 text-info',
		medium: 'bg-muted text-muted-foreground',
		regional: 'bg-gold/15 text-gold'
	};

	const jsonLd = $derived(
		JSON.stringify({
			'@context': 'https://schema.org',
			'@type': 'Event',
			name: show.name,
			description: show.description,
			startDate: show.startDate,
			endDate: show.endDate,
			eventStatus: 'https://schema.org/EventScheduled',
			eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
			location: {
				'@type': 'Place',
				name: show.venue,
				address: {
					'@type': 'PostalAddress',
					addressLocality: show.city,
					addressCountry: show.country
				}
			},
			url: show.website
		})
	);
</script>

<svelte:head>
	<!-- Title + description render once via root layout from loader `seo`
	     (which prefers show.metaTitle/metaDescription). -->
	{@html `\u003cscript type="application/ld+json">${jsonLd}\u003c/script>`}
</svelte:head>

<Breadcrumb items={[{ label: 'Trade Shows', href: '/trade-shows' }, { label: show.name }]} />

<div class="mx-auto w-full max-w-6xl space-y-4 sm:space-y-6">
	<div class="max-w-2xl space-y-2">
		<h1 class="line-clamp-2 text-xl font-semibold tracking-tight sm:text-2xl">{show.name}</h1>
		<div class="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground sm:text-sm">
			<MapPinIcon class="size-4 shrink-0" />
			<span class="truncate">{show.city}, {show.country}</span>
		</div>
		<div class="flex min-w-0 flex-wrap items-center gap-2">
			{#if ongoing}
				<Badge class="max-w-full truncate bg-success/15 text-success">Happening Now</Badge>
			{:else if upcoming}
				<Badge class="max-w-full truncate bg-info/15 text-info">Upcoming</Badge>
			{:else if past}
				<Badge variant="secondary" class="max-w-full truncate">Past</Badge>
			{/if}
			{#if show.scale}
				<span
					class={cn(
						'max-w-full truncate rounded-full px-2 py-0.5 text-xs font-medium',
						scaleColors[show.scale ?? '']
					)}
				>
					{show.scale}
				</span>
			{/if}
			{#if show.region}
				<Badge variant="secondary" class="max-w-full truncate">{show.region}</Badge>
			{/if}
		</div>
	</div>

	<div class="grid gap-2 sm:grid-cols-3 sm:gap-3">
		<StatTile value={show.scale ?? '—'} label="Scale" tone="primary" />
		<StatTile value={show.exhibitors ?? '—'} label="Exhibitors" tone="info" />
		<StatTile value={show.visitors ?? '—'} label="Visitors" tone="success" />
	</div>

	<div class="grid gap-3 sm:gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
		<div class="max-w-2xl min-w-0 space-y-4 sm:space-y-6">
			<Card class="bg-card">
				<CardContent class="space-y-3 p-4 sm:p-5">
					<CardTitle class="text-sm sm:text-base">About this event</CardTitle>
					<p class="max-w-[65ch] text-sm leading-relaxed text-foreground/80">{show.description}</p>
					{#if (show.focus ?? []).length > 0}
						<div class="flex flex-wrap gap-1.5">
							{#each show.focus ?? [] as tag (tag)}
								<Badge variant="secondary" class="text-2xs">{tag}</Badge>
							{/each}
						</div>
					{/if}
				</CardContent>
			</Card>

			<Card class="bg-card">
				<CardContent class="space-y-3 p-4 sm:p-5">
					<CardTitle class="text-sm sm:text-base">Event details</CardTitle>
					<dl class="space-y-1.5 text-sm">
						<div class="flex items-center justify-between gap-3 rounded-lg bg-muted/40 px-3 py-2">
							<dt class="text-xs text-muted-foreground">Dates</dt>
							<dd class="flex min-w-0 items-center gap-1.5 text-end font-medium tabular-nums">
								<CalendarDaysIcon class="size-3.5 shrink-0 text-muted-foreground" />
								<span class="truncate">{formatDateRange(show.startDate, show.endDate)}</span>
							</dd>
						</div>
						<div class="flex items-center justify-between gap-3 rounded-lg bg-muted/40 px-3 py-2">
							<dt class="text-xs text-muted-foreground">Venue</dt>
							<dd class="min-w-0 truncate text-end font-medium">{show.venue || '—'}</dd>
						</div>
						<div class="flex items-center justify-between gap-3 rounded-lg bg-muted/40 px-3 py-2">
							<dt class="text-xs text-muted-foreground">Location</dt>
							<dd class="min-w-0 truncate text-end font-medium">{show.city}, {show.country}</dd>
						</div>
						<div class="flex items-center justify-between gap-3 rounded-lg bg-muted/40 px-3 py-2">
							<dt class="text-xs text-muted-foreground">Region</dt>
							<dd class="min-w-0 truncate text-end font-medium">{show.region || '—'}</dd>
						</div>
					</dl>
				</CardContent>
			</Card>

			{#if related.length > 0}
				<div class="space-y-3">
					<h2 class="text-sm font-semibold tracking-tight sm:text-base">Related shows</h2>
					<div class="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3">
						{#each related as rel (rel.id)}
							<Card class="min-w-0 bg-card transition-shadow hover:shadow-md">
								<CardContent class="space-y-2 p-2.5 sm:p-4">
									<a href="/trade-shows/{rel.id}" class="block min-w-0 hover:text-primary">
										<CardTitle class="line-clamp-2 min-w-0 text-sm leading-snug"
											>{rel.name}</CardTitle
										>
									</a>
									<p class="flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
										<MapPinIcon class="size-3 shrink-0" />
										<span class="truncate">{rel.city}, {rel.country}</span>
									</p>
									<Button
										href="/trade-shows/{rel.id}"
										variant="outline"
										size="sm"
										class="h-7 w-full min-w-0 px-2 text-xs"
									>
										<span class="truncate">View details</span>
										<ArrowRightIcon class="size-3 shrink-0" />
									</Button>
								</CardContent>
							</Card>
						{/each}
					</div>
				</div>
			{/if}
		</div>

		<aside class="min-w-0 lg:sticky lg:top-24 lg:self-start">
			<Card class="bg-card">
				<CardContent class="space-y-3 p-4 sm:p-5">
					<CardTitle class="text-sm sm:text-base">Attend</CardTitle>
					<div class="space-y-2 text-sm">
						<p class="flex items-center gap-1.5 text-muted-foreground tabular-nums">
							<CalendarDaysIcon class="size-4 shrink-0" />
							{formatDateRange(show.startDate, show.endDate)}
						</p>
						<p class="flex items-center gap-1.5 text-muted-foreground">
							<MapPinIcon class="size-4 shrink-0" />
							{show.venue || `${show.city}, ${show.country}`}
						</p>
						{#if show.website}
							<p class="flex items-center gap-1.5 text-muted-foreground">
								<GlobeIcon class="size-4 shrink-0" />
								<span class="truncate">{show.website}</span>
							</p>
						{/if}
					</div>
					{#if show.website}
						<Button href={show.website} target="_blank" rel="noopener" class="w-full" size="sm">
							Official website
							<ExternalLinkIcon class="size-3" />
						</Button>
					{/if}
					<Button href="/trade-shows" variant="outline" size="sm" class="w-full">
						All trade shows
					</Button>
				</CardContent>
			</Card>
		</aside>
	</div>
</div>
